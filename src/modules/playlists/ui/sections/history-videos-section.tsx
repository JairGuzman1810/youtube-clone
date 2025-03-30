// Ensures this component runs on the client side
"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// HistoryVideosSection component - Handles rendering the user's video history grid with suspense and error boundaries
export const HistoryVideosSection = () => {
  return (
    <Suspense fallback={<HistoryVideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <HistoryVideosSectionSuspense />
      </ErrorBoundary>
    </Suspense>
  );
};

// HistoryVideosSectionSkeleton - Displays a loading skeleton while the user's video history is being fetched
const HistoryVideosSectionSkeleton = () => {
  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size="compact" />
        ))}
      </div>
    </div>
  );
};

// HistoryVideosSectionSuspense - Fetches and renders the user's video history grid with infinite scroll support
const HistoryVideosSectionSuspense = () => {
  // Fetch history videos using suspense-enabled infinite query
  const [videos, query] = trpc.playlists.getHistory.useSuspenseInfiniteQuery(
    { limit: DEFAULT_LIMIT },
    {
      // Determines the next page cursor for pagination
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div>
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.pages
          .flatMap((page) => page.items) // Flattens paginated results into a single array
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))}
      </div>
      <div className="hidden flex-col gap-4 md:flex">
        {videos.pages
          .flatMap((page) => page.items) // Flattens paginated results into a single array
          .map((video) => (
            <VideoRowCard key={video.id} data={video} size={"compact"} />
          ))}
      </div>
      {/* Infinite scrolling component to load more history videos when scrolling */}
      <InfiniteScroll
        hasNextPage={query.hasNextPage} // Checks if there are more pages of history videos
        isFetchingNextPage={query.isFetchingNextPage} // Indicates if the next page is currently being fetched
        fetchNextPage={query.fetchNextPage} // Fetches the next page of history videos
      />
    </div>
  );
};
