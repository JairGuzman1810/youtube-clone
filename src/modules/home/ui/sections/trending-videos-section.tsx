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

// TrendingVideosSection component - Handles rendering the trending videos grid with suspense and error boundaries
export const TrendingVideosSection = () => {
  return (
    <Suspense fallback={<TrendingVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <TrendingVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

// TrendingVideosSectionSkeleton - Displays a loading skeleton while the trending videos are being fetched
const TrendingVideosSectionSkeleton = () => {
  return (
    <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
      {Array.from({ length: 18 }).map((_, index) => (
        <VideoGridCardSkeleton key={index} />
      ))}
    </div>
  );
};

// TrendingVideosSectionSuspense - Fetches and renders the trending video grid with infinite scroll support
const TrendingVideosSectionSuspense = () => {
  // Fetch trending videos using suspense-enabled infinite query
  const [videos, query] = trpc.videos.getManyTrending.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    {
      // Determines the next page cursor for pagination
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div>
      <div className="gap-4 gap-y-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 [@media(min-width:1920px)]:grid-cols-5 [@media(min-width:2200px)]:grid-cols-6">
        {videos.pages
          .flatMap((page) => page.items) // Flattens paginated results into a single array
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))}
      </div>
      {/* Infinite scrolling component to load more trending videos when scrolling */}
      <InfiniteScroll
        hasNextPage={query.hasNextPage} // Checks if there are more pages of trending videos
        isFetchingNextPage={query.isFetchingNextPage} // Indicates if the next page is currently being fetched
        fetchNextPage={query.fetchNextPage} // Fetches the next page of trending videos
      />
    </div>
  );
};
