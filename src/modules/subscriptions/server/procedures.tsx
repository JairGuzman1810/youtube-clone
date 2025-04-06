import { db } from "@/db";
import { subscriptions, users } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling user subscriptions (follow/unfollow creators)
export const subscriptionsRouter = createTRPCRouter({
  // Fetch multiple subscriptions with pagination
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            creatorId: z.string().uuid(), // Cursor ID (UUID format) for pagination
            updatedAt: z.date(), // Timestamp of the last fetched subscription for pagination
          })
          .nullish(), // Cursor can be null (first page)
        limit: z.number().min(1).max(100), // Limit number of subscriptions per request
      })
    )
    .query(async ({ input, ctx }) => {
      const { cursor, limit } = input;
      const { id: userId } = ctx.user;

      // Query database to fetch subscriptions with optional pagination
      const data = await db
        .select({
          ...getTableColumns(subscriptions), // Fetch all columns from the subscriptions table
          user: {
            ...getTableColumns(users), // Fetch all columns from the users table
            // Include user details of the creator
            subscriberCount: db.$count(
              subscriptions,
              and(eq(subscriptions.creatorId, users.id))
            ), // Count subscribers for each creator
          },
        })
        .from(subscriptions)
        .innerJoin(users, eq(subscriptions.creatorId, users.id)) // Join subscriptions with users table
        .where(
          and(
            eq(subscriptions.viewerId, userId),
            cursor
              ? or(
                  lt(subscriptions.updatedAt, cursor.updatedAt), // Get subscriptions with an older update timestamp
                  and(
                    eq(subscriptions.updatedAt, cursor.updatedAt), // If same timestamp, use ID as tiebreaker
                    lt(subscriptions.creatorId, cursor.creatorId)
                  )
                )
              : undefined // If no cursor, fetch the most recent subscriptions
          )
        )
        .orderBy(desc(subscriptions.updatedAt), desc(subscriptions.creatorId)) // Order by most recent first, using ID as tiebreaker
        .limit(limit + 1); // Fetch one extra record to check if there's more data

      const hasMore = data.length > limit; // Determine if more data is available

      // Remove the extra record if there is more data
      const items = hasMore ? data.slice(0, -1) : data;

      // Determine the next cursor for pagination
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            creatorId: lastItem.creatorId,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      // Return the fetched items along with the next cursor
      return {
        items,
        nextCursor,
      };
    }),

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
