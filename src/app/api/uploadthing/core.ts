import { db } from "@/db";
import { users, videos } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
import { z } from "zod";

const f = createUploadthing(); // Initialize UploadThing instance

// Define a file upload router for handling different file uploads in the app
export const ourFileRouter = {
  // Define a route for uploading banner images
  bannerUploader: f({
    image: {
      maxFileSize: "4MB", // Limit maximum file size to 4MB
      maxFileCount: 1, // Allow only one file per upload
    },
  })
    .middleware(async () => {
      const { userId: clerkUserId } = await auth(); // Get the authenticated user ID from Clerk

      if (!clerkUserId) throw new UploadThingError("Unauthorized"); // Throw error if user is not authenticated

      // Fetch user from the database based on Clerk ID
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));

      if (!existingUser) throw new UploadThingError("Unauthorized"); // Throw error if user is not found in the database

      // If a thumbnail already exists, delete the old file before uploading a new one
      if (existingUser.bannerKey) {
        const utapi = new UTApi(); // Initialize UploadThing API instance

        await utapi.deleteFiles(existingUser.bannerKey); // Delete the old thumbnail from storage
        await db
          .update(users)
          .set({ bannerKey: null, bannerUrl: null }) // Reset thumbnail fields in the database
          .where(eq(users.id, existingUser.id));
      }

      return { userId: existingUser.id }; // Return user data along with input metadata for further processing
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update the database with the new thumbnail file's URL and key
      await db
        .update(users)
        .set({ bannerUrl: file.url, bannerKey: file.key })
        .where(eq(users.id, metadata.userId));

      return { uploadedBy: metadata.userId }; // Return the ID of the user who uploaded the thumbnail
    }),

  // Define a route for uploading thumbnail images
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB", // Limit maximum file size to 4MB
      maxFileCount: 1, // Allow only one file per upload
    },
  })
    .input(z.object({ videoId: z.string().uuid() })) // Validate input to ensure `videoId` is a valid UUID
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth(); // Get the authenticated user ID from Clerk

      if (!clerkUserId) throw new UploadThingError("Unauthorized"); // Throw error if user is not authenticated

      // Fetch user from the database based on Clerk ID
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));

      if (!user) throw new UploadThingError("Unauthorized"); // Throw error if user is not found in the database

      // Fetch the existing video and check if a thumbnail already exists
      const [existingVideo] = await db
        .select({ thumbnailKey: videos.thumbnailKey })
        .from(videos)
        .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));

      if (!existingVideo) throw new UploadThingError("Not found"); // Throw error if video is not found

      // If a thumbnail already exists, delete the old file before uploading a new one
      if (existingVideo.thumbnailKey) {
        const utapi = new UTApi(); // Initialize UploadThing API instance

        await utapi.deleteFiles(existingVideo.thumbnailKey); // Delete the old thumbnail from storage
        await db
          .update(videos)
          .set({ thumbnailKey: null, thumbnailUrl: null }) // Reset thumbnail fields in the database
          .where(and(eq(videos.id, input.videoId), eq(videos.userId, user.id)));
      }

      return { user, ...input }; // Return user data along with input metadata for further processing
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // Update the database with the new thumbnail file's URL and key
      await db
        .update(videos)
        .set({ thumbnailUrl: file.url, thumbnailKey: file.key })
        .where(
          and(
            eq(videos.id, metadata.videoId), // Ensure update is for the correct video
            eq(videos.userId, metadata.user.id) // Ensure update is for the correct user
          )
        );

      return { uploadedBy: metadata.user.id }; // Return the ID of the user who uploaded the thumbnail
    }),
} satisfies FileRouter; // Ensure the object conforms to the FileRouter type

// Export the type definition of the file router
export type OurFileRouter = typeof ourFileRouter;
