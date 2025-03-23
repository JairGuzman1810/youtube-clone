import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling user subscriptions (follow/unfollow creators)
export const subscriptionsRouter = createTRPCRouter({
  // Create a subscription to follow a creator
  create: protectedProcedure
    .input(z.object({ userId: z.string().uuid() })) // Validate input to ensure a UUID is provided for userId
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      if (userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST" }); // Prevent users from subscribing to themselves
      }

      // Insert a new subscription record linking the viewer and the creator
      const [createdSubscription] = await db
        .insert(subscriptions)
        .values({ viewerId: ctx.user.id, creatorId: userId })
        .returning();

      return createdSubscription; // Return the newly created subscription record
    }),

  // Remove a subscription (unfollow a creator)
  remove: protectedProcedure
    .input(z.object({ userId: z.string().uuid() })) // Validate input to ensure a UUID is provided for userId
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      if (userId === ctx.user.id) {
        throw new TRPCError({ code: "BAD_REQUEST" }); // Prevent users from unsubscribing from themselves
      }

      // Delete the subscription record that links the viewer and the creator
      const [deletedSubscription] = await db
        .delete(subscriptions)
        .where(
          and(
            eq(subscriptions.viewerId, ctx.user.id), // Match the viewer ID
            eq(subscriptions.creatorId, userId) // Match the creator ID
          )
        )
        .returning();

      return deletedSubscription; // Return the deleted subscription record
    }),
});
