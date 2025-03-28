import { categoriesRouter } from "@/modules/categories/server/procedures";
import { commentReactionsRouter } from "@/modules/comment-reactions/server/procedures";
import { commentsRouter } from "@/modules/comments/server/procedures";
import { searchRouter } from "@/modules/search/server/procedures";
import { studioRouter } from "@/modules/studio/server/procedures";
import { subscriptionsRouter } from "@/modules/subscriptions/server/procedures";
import { suggestionsRouter } from "@/modules/suggestions/server/procedure";
import { videoReactionsRouter } from "@/modules/video-reactions/server/procedures";
import { videoViewsRouter } from "@/modules/video-views/server/procedures";
import { videosRouter } from "@/modules/videos/server/procedures";
import { createTRPCRouter } from "../init";

// Create the main TRPC router that combines all sub-routers
export const appRouter = createTRPCRouter({
  studio: studioRouter, // Handles studio-related API procedures
  videos: videosRouter, // Handles video-related API procedures
  comments: commentsRouter, // Handles comment-related API procedures
  categories: categoriesRouter, // Handles category-related API procedures
  videoViews: videoViewsRouter, // Handles video view tracking API procedures
  suggestions: suggestionsRouter, // Handles video suggestion API procedures
  search: searchRouter, // Handles video search API procedures
  subscriptions: subscriptionsRouter, // Handles user subscription API procedures
  videoReactions: videoReactionsRouter, // Handles video reaction API procedures
  commentReactions: commentReactionsRouter, // Handles comment reaction API procedures
});

// Export the type definition of the API for use in frontend and backend
export type AppRouter = typeof appRouter;
