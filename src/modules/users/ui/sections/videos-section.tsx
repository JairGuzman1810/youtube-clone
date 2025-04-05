// Ensures this component runs on the client side
"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// VideosSectionProps - Defines the props required for the VideosSection component
interface VideosSectionProps {
  userId?: string; // userId - Optional user ID to filter the videos by user
}

// VideosSection component - Handles video grid rendering with suspense and error boundaries for user's videos
export const VideosSection = (props: VideosSectionProps) => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <VideosSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

// VideosSectionSkeleton - Displays a loading skeleton while user's videos are being fetched
const VideosSectionSkeleton = () => {
  return (
    <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 18 }).map((_, index) => (
        <VideoGridCardSkeleton key={index} />
      ))}
    </div>
  );
};

// VideosSectionSuspense - Fetches and renders the user's video grid with infinite scroll support
const VideosSectionSuspense = ({ userId }: VideosSectionProps) => {
  // Fetch user's videos using suspense-enabled infinite query
  const [videos, query] = trpc.videos.getMany.useSuspenseInfiniteQuery(
    { userId, limit: DEFAULT_LIMIT },
    {
      // Determines the next page cursor for pagination
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div>
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
        {videos.pages
          .flatMap((page) => page.items) // Flattens paginated results into a single array
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))}
      </div>
      {/* Infinite scrolling component to load more videos when scrolling */}
      <InfiniteScroll
        hasNextPage={query.hasNextPage} // Checks if there are more pages of user's videos
        isFetchingNextPage={query.isFetchingNextPage} // Indicates if the next page is currently being fetched
        fetchNextPage={query.fetchNextPage} // Fetches the next page of user's videos
      />
    </div>
  );
};
