import { db } from "@/db";
import {
  subscriptions,
  users,
  videoReactions,
  videos,
  videoUpdateSchema,
  videoViews,
} from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  and,
  desc,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  lt,
  or,
} from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

// Define the TRPC router for handling video-related API endpoints
export const videosRouter = createTRPCRouter({
  // Fetch videos from channels that the user is subscribed to
  // This query retrieves videos from creators that the authenticated user is subscribed to.
  getManySubscribed: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID (UUID format) for pagination
            updatedAt: z.date(), // Timestamp of the last fetched video for pagination
          })
          .nullish(), // Cursor can be null (first page)
        limit: z.number().min(1).max(100), // Limit number of videos per request
      })
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.user; // Fetch the logged-in user's ID from the context
      const { cursor, limit } = input;

      // Create a temporary view that contains the creator IDs of all subscriptions for the logged-in user.
      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select({
            userId: subscriptions.creatorId, // Get the creator ID of the subscription
          })
          .from(subscriptions)
          .where(eq(subscriptions.viewerId, userId)) // Filter subscriptions by the logged-in user
      );

      // Query database to fetch videos with optional search query and category filter
      const data = await db
        .with(viewerSubscriptions) // Includes viewerSubscriptions view to filter by subscribed creators
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
        .innerJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.userId, users.id)
        )
        .where(
          and(
            eq(videos.visibility, "public"), // Ensure the video is publicly visible
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

  // Fetch trending videos with pagination
  // This query retrieves publicly visible videos and ranks them by view count
  getManyTrending: baseProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(), // Cursor ID (UUID format) for pagination
            viewCount: z.number(), // View count of the last fetched video for pagination
          })
          .nullish(), // Cursor can be null (first page)
        limit: z.number().min(1).max(100), // Limit number of videos per request
      })
    )
    .query(async ({ input }) => {
      const { cursor, limit } = input;

      const viewCountSubquery = db.$count(
        videoViews,
        eq(videoViews.videoId, videos.id)
      ); // Subquery to calculate total views for each video

      // Query database to fetch trending videos based on view count
      const data = await db
        .select({
          ...getTableColumns(videos), // Fetch all columns from the videos table
          user: users, // Include user details of the video owner
          viewCount: viewCountSubquery, // Count total views
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
            cursor
              ? or(
                  lt(viewCountSubquery, cursor.viewCount), // Get videos with a lower view count
                  and(
                    eq(viewCountSubquery, cursor.viewCount), // If same view count, use ID as tiebreaker
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined // If no cursor, fetch the most popular videos first
          )
        )
        .orderBy(desc(viewCountSubquery), desc(videos.id)) // Order by most viewed first, using ID as a tiebreaker
        .limit(limit + 1); // Fetch one extra record to check if there's more data

      const hasMore = data.length > limit; // Determine if more data is available

      // Remove the extra record if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      // Determine the next cursor for pagination
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            viewCount: lastItem.viewCount,
          }
        : null;

      // Return the fetched items along with the next cursor
      return {
        items,
        nextCursor,
      };
    }),

  // Fetch multiple videos with pagination, filtering by optional query or category
  // This query is used for loading home page videos. It retrieves public videos
  getMany: baseProcedure
    .input(
      z.object({
        categoryId: z.string().uuid().nullish(), // Category ID to filter videos by category (optional)
        userId: z.string().uuid().nullish(), // User ID to filter videos by user (optional)
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
      const { cursor, limit, categoryId, userId } = input;

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
            categoryId ? eq(videos.categoryId, categoryId) : undefined, // Filter videos by category (if provided)
            userId ? eq(videos.userId, userId) : undefined, // Filter videos by user (if provided)
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

  // Fetch a single video by its ID, including associated user details
  getOne: baseProcedure
    .input(z.object({ id: z.string().uuid() })) // Validate input as a UUID
    .query(async ({ input, ctx }) => {
      const { clerkUserId } = ctx; // Get the authenticated Clerk user ID

      let userId; // Initialize userId variable

      // Fetch the user from the database using their Clerk user ID
      const [user] = await db
        .select()
        .from(users)
        .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []));

      if (user) {
        userId = user.id; // Assign the user ID if a matching user is found
      }

      // Create a temporary view for the authenticated user's reactions to videos
      const viewerReactions = db.$with("viewer_reactions").as(
        db
          .select({
            videoId: videoReactions.videoId, // Select the video ID
            type: videoReactions.type, // Select the reaction type (like/dislike)
          })
          .from(videoReactions)
          .where(inArray(videoReactions.userId, userId ? [userId] : [])) // Filter reactions by the authenticated user
      );

      // Create a temporary view for the authenticated user's subscriptions
      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : [])) // Filter subscriptions by the authenticated user
      );

      // Retrieve the video along with its associated user details from the database
      const [existingVideo] = await db
        .with(viewerReactions, viewerSubscriptions) // Include temporary views
        .select({
          ...getTableColumns(videos), // Select all columns from the videos table
          user: {
            ...getTableColumns(users),
            subscriberCount: db.$count(
              subscriptions,
              eq(subscriptions.creatorId, users.id)
            ), // Count the number of subscribers for the video owner
            viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
              Boolean
            ), // Check if the authenticated user is subscribed to the video owner
          },
          viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)), // Count the number of views for this video
          likeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id), // Filter reactions by video ID
              eq(videoReactions.type, "like") // Count the number of likes
            )
          ),
          dislikeCount: db.$count(
            videoReactions,
            and(
              eq(videoReactions.videoId, videos.id), // Filter reactions by video ID
              eq(videoReactions.type, "dislike") // Count the number of dislikes
            )
          ),
          viewerReaction: viewerReactions.type, // Fetch the authenticated user's reaction
        })
        .from(videos)
        .innerJoin(users, eq(videos.userId, users.id)) // Ensure the video is linked to a user
        .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id)) // Join with viewer reactions
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, users.id)
        ) // Join with viewer subscriptions
        .where(eq(videos.id, input.id)); // Filter by the provided video ID

      if (!existingVideo) throw new TRPCError({ code: "NOT_FOUND" }); // Return an error if the video is not found

      return existingVideo; // Return the fetched video details
    }),

  // Trigger workflow to generate a video description
  generateDescription: protectedProcedure
    .input(z.object({ id: z.string().uuid() })) // Validate input as a UUID
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user; // Retrieve the authenticated user's ID

      // Trigger the Upstash Workflow for generating a video description
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`, // Workflow API URL
        body: { userId, videoId: input.id }, // Pass user and video IDs
      });

      return workflowRunId; // Return the workflow run ID
    }),

  // Trigger workflow to generate a video title
  generateTitle: protectedProcedure
    .input(z.object({ id: z.string().uuid() })) // Validate input as a UUID
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user; // Retrieve the authenticated user's ID

      // Trigger the Upstash Workflow for generating a video title
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`, // Workflow API URL
        body: { userId, videoId: input.id }, // Pass user and video IDs
      });

      return workflowRunId; // Return the workflow run ID
    }),

  // Updates the video status by revalidating its upload status from Mux
  revalidate: protectedProcedure
    .input(z.object({ id: z.string().uuid() })) // Validate input as a UUID
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user; // Retrieve the authenticated user's ID

      // Fetch the existing video that belongs to the user
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Throw error if video is not found or unauthorized
      }

      if (!existingVideo.muxUploadId) {
        throw new TRPCError({ code: "BAD_REQUEST" }); // Throw error if the video has no associated Mux upload ID
      }

      // Retrieve the upload details from Mux using the stored Mux upload ID
      const upload = await mux.video.uploads.retrieve(
        existingVideo.muxUploadId
      );

      if (!upload || !upload.asset_id) {
        throw new TRPCError({ code: "BAD_REQUEST" }); // Throw error if upload or asset ID is invalid
      }

      // Retrieve the asset details from Mux using the asset ID from the upload details
      const asset = await mux.video.assets.retrieve(upload.asset_id);

      if (!asset) {
        throw new TRPCError({ code: "BAD_REQUEST" }); // Throw error if the asset retrieval fails
      }

      // Convert Mux asset duration from seconds to milliseconds for consistency
      const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;

      // Update the video record in the database with the latest Mux details
      const [updatedVideo] = await db
        .update(videos)
        .set({
          muxStatus: asset.status, // Update the Mux processing status
          muxPlaybackId: asset.playback_ids?.[0].id, // Store the Mux playback ID if available
          muxAssetId: asset.id, // Store the Mux asset ID
          duration, // Store the converted video duration
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning(); // Return the updated video record

      return updatedVideo; // Return the updated video details
    }),

  // Restore the video's thumbnail using the Mux thumbnail
  restoreThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() })) // Validate input as a UUID
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user; // Retrieve the authenticated user's ID

      // Fetch the existing video that belongs to the user
      const [existingVideo] = await db
        .select()
        .from(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));

      if (!existingVideo) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Throw error if video is not found or unauthorized
      }

      // Delete existing thumbnail from UploadThing if available
      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi();

        await utapi.deleteFiles(existingVideo.thumbnailKey); // Remove the file from UploadThing storage

        // Remove thumbnail references from the database
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null }) // Clear stored thumbnail data
          .where(and(eq(videos.id, input.id), eq(videos.userId, userId)));
      }

      if (!existingVideo.muxPlaybackId) {
        throw new TRPCError({ code: "BAD_REQUEST" }); // Ensure the video has a valid Mux playback ID
      }

      const utapi = new UTApi();

      // Generate a temporary URL for the video thumbnail from Mux
      const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;

      // Upload the Mux-generated thumbnail to UploadThing
      const uploadedThumbnail = await utapi.uploadFilesFromUrl(
        tempThumbnailUrl
      );

      if (!uploadedThumbnail.data)
        return new TRPCError({ code: "INTERNAL_SERVER_ERROR" }); // Handle upload failure

      const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail.data; // Extract the new thumbnail key and URL

      // Update the database with the new thumbnail details
      const [updatedVideo] = await db
        .update(videos)
        .set({ thumbnailUrl, thumbnailKey }) // Store the new thumbnail in the database
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      return updatedVideo; // Return the updated video record with the new thumbnail
    }),

  // Remove a video from the database
  remove: protectedProcedure
    .input(z.object({ id: z.string().uuid() })) // Validate input as a UUID
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user; // Retrieve the authenticated user's ID

      // Delete the video that matches both the given ID and the user's ID
      const [removeVideo] = await db
        .delete(videos)
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!removeVideo) {
        throw new TRPCError({ code: "BAD_REQUEST" }); // Throw error if video is not found or unauthorized
      }

      return removeVideo; // Return the deleted video data
    }),

  // Update an existing video
  update: protectedProcedure
    .input(videoUpdateSchema) // Validate input using the video update schema
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user; // Retrieve the authenticated user's ID

      if (!input.id) {
        throw new TRPCError({ code: "BAD_REQUEST" }); // Ensure a valid ID is provided
      }

      // Update the video with new details if it belongs to the authenticated user
      const [updatedVideo] = await db
        .update(videos)
        .set({
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          visibility: input.visibility,
          updatedAt: new Date(), // Update the timestamp
        })
        .where(and(eq(videos.id, input.id), eq(videos.userId, userId)))
        .returning();

      if (!updatedVideo) {
        throw new TRPCError({ code: "NOT_FOUND" }); // Throw error if no video was updated
      }

      return updatedVideo; // Return the updated video data
    }),

  // Create a new video entry
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user; // Retrieve the authenticated user's ID

    // Create a new video upload session with Mux
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId, // Attach user ID as metadata for tracking
        playback_policy: ["public"], // Set video to be publicly viewable
        // mp4_support: "standard", // Uncomment if MP4 support is required
        input: [
          {
            generated_subtitles: [
              {
                language_code: "en", // Auto-generate English subtitles
                name: "English",
              },
            ],
          },
        ],
      },
      cors_origin: "*", // TODO: Restrict this to specific domains in production for security
    });

    // Insert a new video record into the database with default values
    const [video] = await db
      .insert(videos)
      .values({
        userId, // Assign ownership to the authenticated user
        title: "Untitled", // Default title for a new video
        muxStatus: "waiting", // Initial status set to "waiting" until Mux processes the video
        muxUploadId: upload.id, // Store the Mux upload ID for tracking purposes
      })
      .returning(); // Return the newly created video record

    return { video, url: upload.url }; // Return the new video and its Mux upload URL
  }),
});
