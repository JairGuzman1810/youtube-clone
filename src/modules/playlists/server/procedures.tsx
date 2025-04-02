import { db } from "@/db";
import {
  playlists,
  playlistVideos,
  users,
  videoReactions,
  videos,
  videoViews,
} from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling video playlists
export const playlistsRouter = createTRPCRouter({
  // Remove a playlist owned by the authenticated user
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(), // Playlist ID to be removed
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input; // Extract playlist ID from input
      const { id: userId } = ctx.user; // Extract user ID from request context

      // Delete the playlist if it belongs to the authenticated user
      const [deletedPlaylist] = await db
        .delete(playlists)
        .where(and(eq(playlists.id, id), eq(playlists.userId, userId)))
        .returning();

      if (!deletedPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Return an error if the playlist is not found
      }

      return deletedPlaylist; // Return the deleted playlist details
    }),

  // Fetch a single playlist by ID for the authenticated user
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(), // Playlist ID to retrieve
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = input; // Extract playlist ID from input
      const { id: userId } = ctx.user; // Extract user ID from request context

      // Query the database to find the playlist belonging to the user
      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, id), eq(playlists.userId, userId)));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Return an error if the playlist is not found
      }

      return existingPlaylist; // Return the retrieved playlist details
    }),

  // Fetch videos from a playlist with pagination support
  getVideos: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(), // ID of the playlist to fetch videos from
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID (UUID format) for pagination
            updatedAt: z.date(), // Timestamp of the last fetched video for pagination
          })
          .nullish(), // Cursor can be null (first page)
        limit: z.number().min(1).max(100), // Number of videos to fetch per request
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user; // Extract user ID from request context
      const { playlistId, cursor, limit } = input; // Extract input parameters

      // Verify that the playlist exists and belongs to the authenticated user
      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Return an error if the playlist is not found
      }

      // Define a temporary table to store video IDs in the playlist
      const videosFromPlaylist = db.$with("playlist_videos").as(
        db
          .select({
            videoId: playlistVideos.videoId,
          })
          .from(playlistVideos)
          .where(eq(playlistVideos.playlistId, playlistId))
      );

      // Query database to fetch videos from the playlist along with metadata
      const data = await db
        .with(videosFromPlaylist) // Include the temporary table of playlist videos
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
        .innerJoin(users, eq(videos.userId, users.id)) // Join videos with users table to get owner details
        .innerJoin(
          videosFromPlaylist,
          eq(videos.id, videosFromPlaylist.videoId) // Join with the playlist videos table
        )
        .where(
          and(
            eq(videos.visibility, "public"), // Ensure the video is publicly visible
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt), // Fetch older videos based on updatedAt timestamp
                  and(
                    eq(videos.updatedAt, cursor.updatedAt), // If same timestamp, use ID as tiebreaker
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined // If no cursor, fetch the most recent videos
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id)) // Order by most recent updates first
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

      // Return the fetched videos along with the next cursor
      return {
        items,
        nextCursor,
      };
    }),

  // Remove a video from an existing playlist for the authenticated user
  removeVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(), // ID of the playlist from which the video should be removed
        videoId: z.string().uuid(), // ID of the video to be removed
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input; // Extract playlist and video IDs from input
      const { id: userId } = ctx.user; // Extract user ID from request context

      // Check if the playlist exists and belongs to the authenticated user
      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Return an error if the playlist is not found
      }

      // Check if the video exists in the database
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Return an error if the video is not found
      }

      // Check if the video is actually in the playlist before attempting to remove it
      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        );

      if (!existingPlaylistVideo) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Return an error if the video is not in the playlist
      }

      // Remove the video from the playlist
      const [deletedPlaylistVideo] = await db
        .delete(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        )
        .returning();

      return deletedPlaylistVideo; // Return the deleted playlist-video relationship
    }),

  // Add a video to an existing playlist for the authenticated user
  addVideo: protectedProcedure
    .input(
      z.object({
        playlistId: z.string().uuid(), // ID of the playlist where the video should be added
        videoId: z.string().uuid(), // ID of the video to be added to the playlist
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { playlistId, videoId } = input; // Extract playlist and video IDs from input
      const { id: userId } = ctx.user; // Extract user ID from request context

      // Check if the playlist exists and belongs to the authenticated user
      const [existingPlaylist] = await db
        .select()
        .from(playlists)
        .where(and(eq(playlists.id, playlistId), eq(playlists.userId, userId)));

      if (!existingPlaylist) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Return an error if the playlist is not found
      }

      // Check if the video exists in the database
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(eq(videos.id, videoId));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Return an error if the video is not found
      }

      // Check if the video is already in the playlist to prevent duplicates
      const [existingPlaylistVideo] = await db
        .select()
        .from(playlistVideos)
        .where(
          and(
            eq(playlistVideos.playlistId, playlistId),
            eq(playlistVideos.videoId, videoId)
          )
        );

      if (existingPlaylistVideo) {
        throw new TRPCError({ code: "CONFLICT" }); // Return an error if the video is already in the playlist
      }

      // Add the video to the playlist
      const [createdPlaylistVideo] = await db
        .insert(playlistVideos)
        .values({ playlistId, videoId })
        .returning();

      return createdPlaylistVideo; // Return the newly added playlist-video relationship
    }),

  // Fetch all playlists created by the user that may contain a specific video, with pagination support
  getManyForVideo: protectedProcedure
    .input(
      z.object({
        videoId: z.string().uuid(), // ID of the video to check for inclusion in playlists
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID (UUID format) for pagination
            updatedAt: z.date(), // Timestamp of the last fetched playlist for pagination
          })
          .nullish(), // Cursor can be null (first page)
        limit: z.number().min(1).max(100), // Number of playlists to fetch per request
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user; // Extract user ID from request context
      const { videoId, cursor, limit } = input; // Extract video ID and pagination parameters from input

      // Query the database to fetch user playlists along with metadata
      const data = await db
        .select({
          ...getTableColumns(playlists), // Fetch all columns from the playlists table
          videoCount: db.$count(
            playlistVideos,
            eq(playlists.id, playlistVideos.playlistId)
          ), // Count the number of videos in each playlist
          user: users, // Fetch the user who owns the playlist
          containsVideo: videoId
            ? sql<boolean>`(
            SELECT EXISTS (
              SELECT 1 
              FROM ${playlistVideos} pv 
              WHERE pv.playlist_id = ${playlists.id} AND pv.video_id = ${videoId}
            )
          )` // Check if the playlist contains the specified video
            : sql<boolean>`false`, // Default to false if no video ID is provided
        })
        .from(playlists)
        .innerJoin(users, eq(playlists.userId, users.id)) // Join playlists with the users table to get owner details
        .where(
          and(
            eq(playlists.userId, userId), // Filter playlists to only those owned by the current user
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt), // Fetch older playlists based on updatedAt timestamp
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt), // If timestamps match, use ID as a tiebreaker
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined // If no cursor is provided, fetch the most recent playlists
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id)) // Order by most recent updates first, using ID as a tiebreaker
        .limit(limit + 1); // Fetch one extra record to determine if there are more pages available

      const hasMore = data.length > limit; // Determine if more data is available

      // Remove the extra record if more data is available
      const items = hasMore ? data.slice(0, -1) : data;

      // Determine the next cursor for pagination
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      // Return the fetched playlists along with the pagination cursor
      return {
        items,
        nextCursor,
      };
    }),

  // Fetch all playlists created by the user with pagination support
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID (UUID format) for pagination
            updatedAt: z.date(), // Timestamp of the last fetched playlist for pagination
          })
          .nullish(), // Cursor can be null (first page)
        limit: z.number().min(1).max(100), // Limit number of playlists per request
      })
    )
    .query(async ({ input, ctx }) => {
      const { id: userId } = ctx.user; // Extract user ID from request context
      const { cursor, limit } = input; // Extract pagination parameters from input

      // Query database to fetch user playlists along with metadata
      const data = await db
        .select({
          ...getTableColumns(playlists), // Fetch all columns from the playlists table
          videoCount: db.$count(
            playlistVideos,
            eq(playlists.id, playlistVideos.playlistId)
          ), // Count the number of videos in each playlist
          user: users, // Fetch the user who owns the playlist
          thumbnailUrl: sql<string | null>`(
          SELECT v.thumbnail_url
          FROM ${playlistVideos} pv
          JOIN ${videos} v ON v.id = pv.video_id
          WHERE pv.playlist_id = ${playlists.id}
          ORDER BY pv.updated_at DESC
          LIMIT 1
        )`, // Fetch the most recent video's thumbnail from the playlist
        })
        .from(playlists)
        .innerJoin(users, eq(playlists.userId, users.id)) // Join playlists with users table to get owner details
        .where(
          and(
            eq(playlists.userId, userId), // Filter by the current user's playlists
            cursor
              ? or(
                  lt(playlists.updatedAt, cursor.updatedAt), // Fetch older playlists based on updatedAt timestamp
                  and(
                    eq(playlists.updatedAt, cursor.updatedAt), // If same timestamp, use ID as tiebreaker
                    lt(playlists.id, cursor.id)
                  )
                )
              : undefined // If no cursor, fetch the most recent playlists
          )
        )
        .orderBy(desc(playlists.updatedAt), desc(playlists.id)) // Order by most recent updates first, using ID as tiebreaker
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

  // Create a new playlist for the authenticated user
  create: protectedProcedure
    .input(z.object({ name: z.string().min(1) })) // Validate that the playlist name is provided
    .mutation(async ({ input, ctx }) => {
      const { name } = input; // Extract playlist name from input
      const { id: userId } = ctx.user; // Extract user ID from request context

      // Insert the new playlist into the database
      const [createdPlaylist] = await db
        .insert(playlists)
        .values({
          userId, // Assign the playlist to the authenticated user
          name, // Set the provided playlist name
        })
        .returning(); // Return the created playlist

      // Throw an error if the playlist creation failed
      if (!createdPlaylist) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      return createdPlaylist; // Return the successfully created playlist
    }),

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
