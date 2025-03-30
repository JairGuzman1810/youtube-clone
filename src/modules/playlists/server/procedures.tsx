import { db } from "@/db";
import { users, videoReactions, videos, videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling video playlists
export const playlistsRouter = createTRPCRouter({
  // Fetch liked videos for a user with pagination support
  getLiked: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID (UUID format) for pagination
            likedAt: z.date(), // Timestamp of the last fetched video for pagination
          })
          .nullish(), // Cursor can be null (first page)
        limit: z.number().min(1).max(100), // Limit number of videos per request
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user; // Extract user ID from request context
      const { cursor, limit } = input; // Extract pagination parameters from input

      // Define a temporary table to store liked videos by the user
      const viewerVideoReactions = db.$with("viewer_video_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId, // Video ID
            likedAt: videoReactions.updatedAt, // Timestamp of like
          })
          .from(videoReactions)
          .where(
            and(
              eq(videoReactions.userId, userId), // Filter by current user
              eq(videoReactions.type, "like") // Only include liked videos
            )
          )
      );

      // Query database to fetch liked videos along with metadata
      const data = await db
        .with(viewerVideoReactions) // Include the temporary table of viewer's video reactions (likes)
        .select({
          ...getTableColumns(videos), // Fetch all columns from the videos table
          user: users, // Include user details of the video owner
          likedAt: viewerVideoReactions.likedAt, // Timestamp when the video was liked
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
        .innerJoin(users, eq(videos.userId, users.id)) // Join videos with users table to get owner details
        .innerJoin(
          viewerVideoReactions,
          eq(videos.id, viewerVideoReactions.videoId) // Join with the liked videos table
        )
        .where(
          and(
            eq(videos.visibility, "public"), // Ensure the video is publicly visible
            cursor
              ? or(
                  lt(viewerVideoReactions.likedAt, cursor.likedAt), // Get videos with an older like timestamp
                  and(
                    eq(viewerVideoReactions.likedAt, cursor.likedAt), // If same timestamp, use ID as tiebreaker
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined // If no cursor, fetch the most recent videos
          )
        )
        .orderBy(desc(viewerVideoReactions.likedAt), desc(videos.id)) // Order by most recent likes first, using ID as tiebreaker
        .limit(limit + 1); // Fetch one extra record to check if there's more data

      const hasMore = data.length > limit; // Determine if more data is available

      // Remove the extra record if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      // Determine the next cursor for pagination
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            likedAt: lastItem.likedAt,
          }
        : null;

      // Return the fetched items along with the next cursor
      return {
        items,
        nextCursor,
      };
    }),

  // Fetch video watch history for a user with pagination support
  getHistory: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID (UUID format) for pagination
            viewedAt: z.date(), // Timestamp of the last fetched video for pagination
          })
          .nullish(), // Cursor can be null (first page)
        limit: z.number().min(1).max(100), // Limit number of videos per request
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user; // Extract user ID from request context
      const { cursor, limit } = input; // Extract pagination parameters from input

      // Define a temporary table to store viewed videos by the user
      const viewerVideoViews = db.$with("viewer_video_views").as(
        db
          .select({
            videoId: videoViews.videoId, // Video ID
            viewedAt: videoViews.updatedAt, // Timestamp of last view
          })
          .from(videoViews)
          .where(eq(videoViews.userId, userId)) // Filter by current user
      );

      // Query database to fetch watched videos along with metadata
      const data = await db
        .with(viewerVideoViews) // Include the temporary table of viewed videos
        .select({
          ...getTableColumns(videos), // Fetch all columns from the videos table
          user: users, // Include user details of the video owner
          viewedAt: viewerVideoViews.viewedAt, // Timestamp when the video was watched
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
        .innerJoin(users, eq(videos.userId, users.id)) // Join videos with users table to get owner details
        .innerJoin(
          viewerVideoViews,
          eq(videos.id, viewerVideoViews.videoId) // Join with the viewed videos table
        )
        .where(
          and(
            eq(videos.visibility, "public"), // Ensure the video is publicly visible
            cursor
              ? or(
                  lt(viewerVideoViews.viewedAt, cursor.viewedAt), // Get videos with an older view timestamp
                  and(
                    eq(viewerVideoViews.viewedAt, cursor.viewedAt), // If same timestamp, use ID as tiebreaker
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined // If no cursor, fetch the most recent videos
          )
        )
        .orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id)) // Order by most recent views first, using ID as tiebreaker
        .limit(limit + 1); // Fetch one extra record to check if there's more data

      const hasMore = data.length > limit; // Determine if more data is available

      // Remove the extra record if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      // Determine the next cursor for pagination
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            viewedAt: lastItem.viewedAt,
          }
        : null;

      // Return the fetched items along with the next cursor
      return {
        items,
        nextCursor,
      };
    }),
});
