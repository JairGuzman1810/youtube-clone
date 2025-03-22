import { db } from "@/db";
import { videoViews } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling video view tracking
export const videoViewsRouter = createTRPCRouter({
  // Record a video view for a user
  create: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() })) // Validate input to ensure a UUID is provided for videoId
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user; // Get the authenticated user's ID

      // Check if the user has already viewed the video
      const [existingVideoView] = await db
        .select()
        .from(videoViews)
        .where(
          and(eq(videoViews.videoId, videoId), eq(videoViews.userId, userId)) // Ensure uniqueness of video views per user
        );

      if (existingVideoView) {
        return existingVideoView; // Return existing record if the view is already recorded
      }

      // Insert a new video view record if none exists
      const [createdVideoView] = await db
        .insert(videoViews)
        .values({ userId, videoId })
        .returning();

      return createdVideoView; // Return the newly created video view record
    }),
});
