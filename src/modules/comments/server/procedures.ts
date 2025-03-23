import { db } from "@/db";
import { comments, users } from "@/db/schema";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import { eq, getTableColumns } from "drizzle-orm";
import { z } from "zod";

// Define the TRPC router for handling video comments
export const commentsRouter = createTRPCRouter({
  // Create a new comment on a video
  create: protectedProcedure
    .input(z.object({ videoId: z.string().uuid(), value: z.string() })) // Validate input to ensure a UUID is provided for videoId
    .mutation(async ({ ctx, input }) => {
      const { videoId, value } = input;
      const { id: userId } = ctx.user; // Get the authenticated user's ID

      // Insert the new comment into the database
      const [createdComment] = await db
        .insert(comments)
        .values({ userId, videoId, value })
        .returning();

      return createdComment; // Return the newly created comment
    }),

  // Retrieve comments for a specific video
  getMany: baseProcedure
    .input(
      z.object({
        videoId: z.string().uuid(), // Validate input to ensure a UUID is provided for videoId
      })
    )
    .query(async ({ input }) => {
      const { videoId } = input;

      // Fetch all comments for the given video, including user details
      const data = await db
        .select({
          ...getTableColumns(comments), // Select all columns from the "comments" table
          user: users, // Include user details for each comment
        })
        .from(comments)
        .where(eq(comments.videoId, videoId)) // Filter comments by video ID
        .innerJoin(users, eq(comments.userId, users.id)); // Join with the "users" table to get user details

      return data; // Return the retrieved comments
    }),
});
