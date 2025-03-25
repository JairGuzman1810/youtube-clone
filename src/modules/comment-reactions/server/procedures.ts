import { db } from "@/db";
import { commentReactions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling comment reactions (like/dislike)
export const commentReactionsRouter = createTRPCRouter({
  // Like a comment or remove an existing like
  like: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() })) // Validate input to ensure a UUID is provided for commentId
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const { id: userId } = ctx.user; // Get the authenticated user's ID

      // Check if the user has already liked the comment
      const [existingCommentReactionLike] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.userId, userId),
            eq(commentReactions.type, "like")
          )
        );

      // If the user already liked the comment, remove the like
      if (existingCommentReactionLike) {
        const [deletedCommentReaction] = await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.commentId, commentId),
              eq(commentReactions.userId, userId)
            )
          )
          .returning();

        return deletedCommentReaction; // Return the removed reaction
      }

      // Insert a new like or update an existing dislike to like
      const [createdCommentReaction] = await db
        .insert(commentReactions)
        .values({ userId, commentId, type: "like" })
        .onConflictDoUpdate({
          target: [commentReactions.userId, commentReactions.commentId],
          set: { type: "like" }, // Convert an existing dislike to like
        })
        .returning();

      return createdCommentReaction; // Return the new or updated reaction
    }),

  // Dislike a comment or remove an existing dislike
  dislike: protectedProcedure
    .input(z.object({ commentId: z.string().uuid() })) // Validate input to ensure a UUID is provided for commentId
    .mutation(async ({ ctx, input }) => {
      const { commentId } = input;
      const { id: userId } = ctx.user; // Get the authenticated user's ID

      // Check if the user has already disliked the comment
      const [existingCommentReactionDislike] = await db
        .select()
        .from(commentReactions)
        .where(
          and(
            eq(commentReactions.commentId, commentId),
            eq(commentReactions.userId, userId),
            eq(commentReactions.type, "dislike")
          )
        );

      // If the user already disliked the comment, remove the dislike
      if (existingCommentReactionDislike) {
        const [deletedCommentReaction] = await db
          .delete(commentReactions)
          .where(
            and(
              eq(commentReactions.commentId, commentId),
              eq(commentReactions.userId, userId)
            )
          )
          .returning();

        return deletedCommentReaction; // Return the removed reaction
      }

      // Insert a new dislike or update an existing like to dislike
      const [createdCommentReaction] = await db
        .insert(commentReactions)
        .values({ userId, commentId, type: "dislike" })
        .onConflictDoUpdate({
          target: [commentReactions.userId, commentReactions.commentId],
          set: { type: "dislike" }, // Convert an existing like to dislike
        })
        .returning();

      return createdCommentReaction; // Return the new or updated reaction
    }),
});
