import { db } from "@/db";
import { commentReactions, comments, users } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  count,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  isNull,
  lt,
  or,
} from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling video comments
export const commentsRouter = createTRPCRouter({
  // Create a new comment on a video
  create: protectedProcedure
    .input(
      z.object({
        parentId: z.string().uuid().nullish(), // Optional parent comment ID (for replies)
        videoId: z.string().uuid(), // Required video ID to associate the comment with a video
        value: z.string(), // The actual text content of the comment
      })
    ) // Ensure `videoId` is a valid UUID and `value` is a string
    .mutation(async ({ ctx, input }) => {
      const { parentId, videoId, value } = input;
      const { id: userId } = ctx.user; // Get the authenticated user's ID

      // Check if the parent comment exists (if this is a reply)
      const [existingComment] = await db
        .select()
        .from(comments)
        .where(inArray(comments.id, parentId ? [parentId] : []));

      // If parentId is provided but the referenced comment doesn't exist, throw an error
      if (!existingComment && parentId) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Prevent replies to replies (only allow replies to top-level comments)
      if (existingComment?.parentId && parentId) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      // Insert the new comment into the database
      const [createdComment] = await db
        .insert(comments)
        .values({ userId, videoId, parentId, value }) // Save comment with user ID, video ID, and optional parent ID
        .returning(); // Return the newly created comment

      return createdComment;
    }),

  // Retrieve comments for a specific video with pagination support
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(), // Validate videoId as a UUID
        parentId: z.string().uuid().nullish(), // Optional parent ID for replies
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID for pagination (last comment ID)
            updatedAt: z.date(), // Timestamp of last comment (used for pagination)
          })
          .nullish(), // Cursor can be null for fetching the first page
        limit: z.number().min(1).max(100), // Limit the number of comments per request
      })
    )
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx; // Get the Clerk user ID from the request context
      const { parentId, videoId, cursor, limit } = input; // Extract input parameters

      let userId; // Initialize userId variable

      // Fetch the corresponding user from the database using the Clerk user ID
      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : [])); // Match Clerk ID with stored users

      if (user) {
        userId = user.id; // Assign the database user ID if the user exists
      }

      // Create a temporary table to store the current user's reactions to comments
      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            commentId: commentReactions.commentId, // ID of the comment reacted to
            type: commentReactions.type, // Reaction type (like/dislike)
          })
          .from(commentReactions)
          .where(inArray(commentReactions.userId, userId ? [userId] : [])) // Filter reactions by the current user
      );

      // Create a temporary table to count replies for each comment
      const replies = db.$with("replies").as(
        db
          .select({
            parentId: comments.parentId, // Parent comment ID
            count: count(comments.id).as("count"), // Count replies for each parent comment
          })
          .from(comments)
          .where(isNotNull(comments.parentId)) // Only count replies (comments with a parent)
          .groupBy(comments.parentId) // Group by parent ID
      );

      // Fetch total count of comments and the paginated comments list
      const [totalData, data] = await Promise.all([
        // Query to count the total number of comments for the given video
        db
          .select({
            count: count(), // Count all comments
          })
          .from(comments)
          .where(eq(comments.videoId, videoId)),

        // Query to fetch paginated comments along with user and reaction details
        db
          .with(viewerReactions, replies) // Use the temporary tables for reactions and replies
          .select({
            ...getTableColumns(comments), // Select all columns from the "comments" table
            user: users, // Include user details for each comment
            viewerReaction: viewerReactions.type, // Get the current user's reaction to each comment
            replyCount: replies.count, // Count of replies for each comment
            likeCount: db.$count(
              commentReactions,
              and(
                eq(commentReactions.type, "like"), // Count only "like" reactions
                eq(commentReactions.commentId, comments.id) // Match with comment ID
              )
            ),
            dislikeCount: db.$count(
              commentReactions,
              and(
                eq(commentReactions.type, "dislike"), // Count only "dislike" reactions
                eq(commentReactions.commentId, comments.id) // Match with comment ID
              )
            ),
          })
          .from(comments)
          .where(
            and(
              eq(comments.videoId, videoId), // Filter by videoId to get only relevant comments
              parentId
                ? eq(comments.parentId, parentId) // If fetching replies, match parentId
                : isNull(comments.parentId), // Otherwise, fetch top-level comments
              cursor
                ? or(
                    lt(comments.updatedAt, cursor.updatedAt), // Fetch comments older than the cursor's timestamp
                    and(
                      eq(comments.updatedAt, cursor.updatedAt), // If timestamps match, use ID as a tiebreaker
                      lt(comments.id, cursor.id) // Fetch comments with smaller IDs
                    )
                  )
                : undefined // If no cursor is provided, fetch the most recent comments
            )
          )
          .innerJoin(users, eq(comments.userId, users.id)) // Join with the "users" table to get user details
          .leftJoin(viewerReactions, eq(comments.id, viewerReactions.commentId)) // Left join to get the user's reaction for each comment
          .leftJoin(replies, eq(comments.id, replies.parentId)) // Left join to get the reply count for each comment
          .orderBy(desc(comments.updatedAt), desc(comments.id)) // Order by latest comments first
          .limit(limit + 1), // Fetch one extra record to check if there’s more data
      ]);

      const hasMore = data.length > limit; // Check if more data is available
      const items = hasMore ? data.slice(0, -1) : data; // Remove the extra record if needed

      // Determine the next cursor for pagination
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id, // Set the next cursor ID to the last item’s ID
            updatedAt: lastItem.updatedAt, // Store the timestamp of the last item
          }
        : null; // If there's no more data, return null

      return {
        totalCount: totalData[0].count, // Return total number of comments
        items, // Return fetched comments
        nextCursor, // Return next cursor for pagination
      };
    }),

  // Remove a comment if the authenticated user owns it
  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() })) // Validate input to ensure comment ID is a UUID
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const { id: userId } = ctx.user; // Get the authenticated user's ID

      // Delete the comment from the database if it belongs to the user
      const [deletedComment] = await db
        .delete(comments)
        .where(and(eq(comments.id, id), eq(comments.userId, userId)))
        .returning();

      if (!deletedComment) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Throw error if the comment was not found
      }

      return deletedComment; // Return the deleted comment
    }),
});
