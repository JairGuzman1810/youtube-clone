import { categoriesRouter } from "@/modules/categories/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";
import { createTRPCRouter } from "../init";

// Create the main TRPC router that combines all sub-routers
export const appRouter = createTRPCRouter({
  studio: studioRouter, // Handles studio-related API procedures
  categories: categoriesRouter, // Handles category-related API procedures
  videos: videosRouter, // Handles video-related API procedures
  videoViews: videoViewsRouter, // Handles video view tracking API procedures
});

// Export the type definition of the API for use in frontend and backend
export type AppRouter = typeof appRouter;
