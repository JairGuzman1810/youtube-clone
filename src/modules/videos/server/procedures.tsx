import { db } from "@/db";
import { videos, videoUpdateSchema } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling video-related API endpoints
export const videosRouter = createTRPCRouter({
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
