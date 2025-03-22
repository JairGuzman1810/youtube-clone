import { db } from "@/db";
import { videoReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling video reactions (like/dislike)
export const videoReactionsRouter = createTRPCRouter({
  // Like a video or remove an existing like
  like: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() })) // Validate input to ensure a UUID is provided for videoId
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user; // Get the authenticated user's ID

      // Check if the user has already liked the video
      const [existingVideoReactionLike] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "like")
          )
        );

      // If the user already liked the video, remove the like
      if (existingVideoReactionLike) {
        const [deletedViewerReaction] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.userId, userId)
            )
          )
          .returning();

        return deletedViewerReaction; // Return the removed reaction
      }

      // Insert a new like or update an existing dislike to like
      const [createdVideoReaction] = await db
        .insert(videoReactions)
        .values({ userId, videoId, type: "like" })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: { type: "like" }, // Convert an existing dislike to like
        })
        .returning();

      return createdVideoReaction; // Return the new or updated reaction
    }),

  // Dislike a video or remove an existing dislike
  dislike: protectedProcedure
    .input(z.object({ videoId: z.string().uuid() })) // Validate input to ensure a UUID is provided for videoId
    .mutation(async ({ ctx, input }) => {
      const { videoId } = input;
      const { id: userId } = ctx.user; // Get the authenticated user's ID

      // Check if the user has already disliked the video
      const [existingVideoReactionDislike] = await db
        .select()
        .from(videoReactions)
        .where(
          and(
            eq(videoReactions.videoId, videoId),
            eq(videoReactions.userId, userId),
            eq(videoReactions.type, "dislike")
          )
        );

      // If the user already disliked the video, remove the dislike
      if (existingVideoReactionDislike) {
        const [deletedViewerReaction] = await db
          .delete(videoReactions)
          .where(
            and(
              eq(videoReactions.videoId, videoId),
              eq(videoReactions.userId, userId)
            )
          )
          .returning();

        return deletedViewerReaction; // Return the removed reaction
      }

      // Insert a new dislike or update an existing like to dislike
      const [createdVideoReaction] = await db
        .insert(videoReactions)
        .values({ userId, videoId, type: "dislike" })
        .onConflictDoUpdate({
          target: [videoReactions.userId, videoReactions.videoId],
          set: { type: "dislike" }, // Convert an existing like to dislike
        })
        .returning();

      return createdVideoReaction; // Return the new or updated reaction
    }),
});
