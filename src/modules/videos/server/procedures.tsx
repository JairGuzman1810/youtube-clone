import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

// Define the TRPC router for video-related API endpoints
export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user; // Get the authenticated user's ID

    // Insert a new video with a default title and associate it with the user
    const [video] = await db
      .insert(videos)
      .values({
        userId, // Assign the video to the authenticated user
        title: "Untitled", // Default title for the new video
      })
      .returning(); // Return the newly created video

    return { video }; // Return the created video to the client
  }),
});
