import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { and, desc, eq, getTableColumns, ilike, lt, or } from "drizzle-orm";
import z from "zod";

// Define the TRPC router for searching videos by category or query (both optional)
export const searchRouter = createTRPCRouter({
  // Fetch multiple videos with pagination, filtering by optional query or category
  getMany: baseProcedure
    .input(
      z.object({
        query: z.string().nullish(), // Search query to filter video titles (optional)
        categoryId: z.string().uuid().nullish(), // Category ID to filter videos by category (optional)
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID (UUID format) for pagination
            updatedAt: z.date(), // Timestamp of the last fetched video for pagination
          })
          .nullish(), // Cursor can be null (first page)
        limit: z.number().min(1).max(100), // Limit number of videos per request
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit, query, categoryId } = input;

      // Query database to fetch videos with optional search query and category filter
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
            eq(videos.visibility, "public"), // Ensure the video is publicly visible
            query ? ilike(videos.title, `%${query}%`) : undefined, // Filter videos by search query (if provided)
            categoryId ? eq(videos.categoryId, categoryId) : undefined, // Filter videos by category (if provided)
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
