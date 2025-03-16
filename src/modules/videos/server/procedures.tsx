import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

// Define the TRPC router for video-related API endpoints
export const videosRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async ({ ctx }) => {
    const { id: userId } = ctx.user; // Get the authenticated user's ID

    // Create a new Mux video upload
    const upload = await mux.video.uploads.create({
      new_asset_settings: {
        passthrough: userId, // Store user ID as passthrough metadata for tracking
        playback_policy: ["public"], // Set video playback policy to public
        //mp4_support: "standard", // Uncomment if MP4 support is needed
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
      cors_origin: "*", // TODO: Set allowed URL in production to enhance security
    });

    // Insert a new video with a default title and associate it with the user
    const [video] = await db
      .insert(videos)
      .values({
        userId, // Assign the video to the authenticated user
        title: "Untitled", // Default title for the new video
        muxStatus: "waiting", // Set initial Mux status to "waiting" until processing is complete
        muxUploadId: upload.id, // Store the Mux upload ID for tracking
      })
      .returning(); // Return the newly created video

    return { video, url: upload.url }; // Return the created video and Mux upload URL to the client
  }),
});
