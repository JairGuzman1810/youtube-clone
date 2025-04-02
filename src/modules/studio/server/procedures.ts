import { db } from "@/db";
import {
  comments,
  users,
  videoReactions,
  videos,
  videoViews,
} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import z from "zod";

// Define the TRPC router for the studio-related API endpoints
export const studioRouter = createTRPCRouter({
  // Fetch a single video by ID
  getOne: protectedProcedure
    .input(z.object({ id: z.string().uuid() })) // Validate input as a UUID string
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user; // Get authenticated user's ID
      const { id } = input; // Extract video ID from input

      // Query database for the video owned by the authenticated user
      const [video] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, id), eq(videos.userId, userId)));

      if (!video) throw new TRPCError({ code: "NOT_FOUND" }); // Throw error if video is not found

      return video; // Return the found video
    }),

  // Fetch multiple videos with pagination
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID (UUID format) for pagination
            updatedAt: z.date(), // Timestamp of the last fetched video
          })
          .nullish(), // Cursor can be null (first page)
        limit: z.number().min(1).max(100), // Limit number of videos per request
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user; // Get authenticated user's ID

      // Query database to fetch videos for the authenticated user
      const data = await db
        .select({
          ...getTableColumns(videos), // Fetch all columns from the videos table
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)), // Count total views per video
          commentCount: db.$count(comments, eq(comments.videoId, videos.id)), // Count total comments per video
          likeCount: db.$count(
            videoReactions,
            eq(videoReactions.videoId, videos.id)
          ), // Count total likes per video
          user: users, // Include user details of the video owner
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id)) // Join videos with users table to get owner details
        .where(
          and(
            eq(videos.userId, userId), // Filter videos by user ID
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt), // Get videos with an older update timestamp
                  and(
                    eq(videos.updatedAt, cursor.updatedAt), // If same timestamp, use ID as tiebreaker
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined // If no cursor, fetch the most recent videos
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id)) // Order by most recent first, using ID as tiebreaker
        .limit(limit + 1); // Fetch one extra record to check if there's more data

      const hasMore = data.length > limit; // Determine if more data is available

      // Remove the extra record if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      // Determine the next cursor for pagination
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      // Return the fetched items along with the next cursor
      return {
        items,
        nextCursor,
      };
    }),
});
