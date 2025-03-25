import { db } from "@/db";
import { comments, users } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling video comments
export const commentsRouter = createTRPCRouter({
  // Create a new comment on a video
  create: protectedProcedure
    .input(z.object({ videoId: z.string().uuid(), value: z.string() })) // Validate input to ensure videoId is a UUID
    .mutation(async ({ ctx, input }) => {
      const { videoId, value } = input;
      const { id: userId } = ctx.user; // Get the authenticated user's ID

      // Insert the new comment into the database
      const [createdComment] = await db
        .insert(comments)
        .values({ userId, videoId, value })
        .returning();

      return createdComment; // Return the newly created comment
    }),

  // Retrieve comments for a specific video with pagination support
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(), // Validate input to ensure videoId is a UUID
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID for pagination
            updatedAt: z.date(), // Timestamp for pagination
          })
          .nullish(), // Cursor can be null for the first page
        limit: z.number().min(1).max(100), // Limit the number of comments per request
      })
    )
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input;

      // Fetch total count of comments and the paginated comments list
      const [totalData, data] = await Promise.all([
        db
          .select({
            count: count(),
          })
          .from(comments)
          .where(eq(comments.videoId, videoId)), // Count total comments for the video

        db
          .select({
            ...getTableColumns(comments), // Select all columns from the "comments" table
            user: users, // Include user details for each comment
          })
          .from(comments)
          .where(
            and(
              eq(comments.videoId, videoId), // Filter by videoId
              cursor
                ? or(
                    lt(comments.updatedAt, cursor.updatedAt), // Fetch older comments
                    and(
                      eq(comments.updatedAt, cursor.updatedAt), // If timestamps match, use ID as a tiebreaker
                      lt(comments.id, cursor.id)
                    )
                  )
                : undefined // If no cursor, fetch the latest comments
            )
          )
          .innerJoin(users, eq(comments.userId, users.id)) // Join with the "users" table to get user details
          .orderBy(desc(comments.updatedAt), desc(comments.id)) // Order by newest first
          .limit(limit + 1), // Fetch one extra record to determine if there's more data
      ]);

      const hasMore = data.length > limit; // Check if more data is available
      const items = hasMore ? data.slice(0, -1) : data; // Remove the extra record if needed

      // Determine the next cursor for pagination
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return {
        totalCount: totalData[0].count, // Return total comment count
        items, // Return fetched comments
        nextCursor, // Return next pagination cursor
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
