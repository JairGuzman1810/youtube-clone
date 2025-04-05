import { db } from "@/db";
import { subscriptions, users, videos } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import { eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling user-related API endpoints
export const usersRouter = createTRPCRouter({
  // Fetch a single user by their ID, including associated metadata
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

      // Create a temporary view for the authenticated user's subscriptions
      const viewerSubscriptions = db.$with("viewer_subscriptions").as(
        db
          .select()
          .from(subscriptions)
          .where(inArray(subscriptions.viewerId, userId ? [userId] : [])) // Filter subscriptions by the authenticated user
      );

      // Retrieve the user along with associated metadata
      const [existingUser] = await db
        .with(viewerSubscriptions) // Include temporary views
        .select({
          ...getTableColumns(users), // Select all columns from the users table
          viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(
            Boolean
          ), // Check if the viewer is subscribed to the requested user
          videoCount: db.$count(videos, eq(videos.userId, users.id)), // Count the number of videos uploaded by the user
          subscriberCount: db.$count(
            subscriptions,
            eq(subscriptions.creatorId, users.id)
          ), // Count the number of subscribers the user has
        })
        .from(users)
        .leftJoin(
          viewerSubscriptions,
          eq(viewerSubscriptions.creatorId, users.id)
        ) // Join with viewer subscriptions
        .where(eq(users.id, input.id)); // Filter by the provided user ID

      if (!existingUser) throw new TRPCError({ code: "NOT_FOUND" }); // Return an error if the user is not found

      return existingUser; // Return the fetched user details
    }),
});
