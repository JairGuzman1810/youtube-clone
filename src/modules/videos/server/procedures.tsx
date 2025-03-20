import { db } from "@/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import { workflow } from "@/lib/workflow";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

// Define the TRPC router for handling video-related API endpoints
export const videosRouter = createTRPCRouter({
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
  generateThumbnail: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.user;
      const { workflowRunId } = await workflow.trigger({
        url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
        body: { userId, videoId: input.id },
      });

      return workflowRunId;
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
