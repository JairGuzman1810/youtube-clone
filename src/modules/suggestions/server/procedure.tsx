// Import necessary database and TRPC modules
import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import z from "zod";

// Define the TRPC router for fetching video suggestions
export const suggestionsRouter = createTRPCRouter({
  // Fetch similar videos based on the current video
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(), // ID of the video the user is watching
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID (UUID format) for pagination
            updatedAt: z.date(), // Timestamp of the last fetched video
          })
          .nullish(), // Cursor can be null (first page)
        limit: z.number().min(1).max(100), // Limit number of videos per request
      })
    )
    .query(async ({ input }) => {
      const { videoId, cursor, limit } = input;

      // Check if the requested video exists
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Query database to fetch videos from the same category as the current video
      const data = await db
        .select({
          ...getTableColumns(videos), // Fetch all columns from the videos table
          user: users, // Include user details of the video owner
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)), // Count total views
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "like")
            )
          ), // Count likes
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id),
              eq(videoReactions.type, "dislike")
            )
          ), // Count dislikes
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id)) // Join videos with users table
        .where(
          and(
            existingVideo.categoryId
              ? eq(videos.categoryId, existingVideo.categoryId) // Filter videos by category
              : undefined,
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
