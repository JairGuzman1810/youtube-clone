"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "../components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "../components/video-row-card";

// SuggestionsSection - Displays a list of video suggestions with infinite scroll
interface SuggestionsSectionProps {
  videoId: string; // ID of the current video to fetch suggestions for
  isManual?: boolean; // Whether the user needs to manually trigger loading more suggestions
}

// SuggestionsSection - Main component for fetching and displaying video suggestions
export const SuggestionsSection = ({
  videoId,
  isManual,
}: SuggestionsSectionProps) => {
  return (
    <Suspense fallback={<SuggestionsSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <SuggestionsSectionSuspense videoId={videoId} isManual={isManual} />
      </ErrorBoundary>
    </Suspense>
  );
};

// SuggestionsSectionSkeleton - Displays loading skeletons while the content is fetching
const SuggestionsSectionSkeleton = () => {
  return (
    <>
      {/* Skeletons for larger screens (row layout) */}
      <div className="hidden md:block space-y-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size="compact" />
        ))}
      </div>
      {/* Skeletons for smaller screens (grid layout) */}
      <div className="block md:hidden space-y-10">
        {Array.from({ length: 6 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
};

// SuggestionsSectionSuspense - Handles the actual fetching and rendering of video suggestions
const SuggestionsSectionSuspense = ({
  videoId,
  isManual,
}: SuggestionsSectionProps) => {
  // Fetching suggestions using TRPC infinite query
  const [suggestions, query] =
    trpc.suggestions.getMany.useSuspenseInfiniteQuery(
      {
        videoId: videoId, // Pass current video ID for fetching related suggestions
        limit: DEFAULT_LIMIT, // Set default limit for the number of suggestions per request
      },
      {
        // Determines the next page cursor for pagination
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <>
      {/* Video suggestions displayed in a row layout for larger screens */}
      <div className="hidden md:block space-y-3">
        {suggestions.pages
          .flatMap((page) => page.items) // Flattens paginated results into a single array
          .map((video) => (
            <VideoRowCard key={video.id} data={video} size="compact" />
          ))}
      </div>

      {/* Video suggestions displayed in a grid layout for smaller screens */}
      <div className="block md:hidden space-y-10">
        {suggestions.pages
          .flatMap((page) => page.items) // Flattens paginated results into a single array
          .map((video) => (
            <VideoGridCard key={video.id} data={video} />
          ))}
      </div>

      {/* Infinite scrolling component for loading more suggestions */}
      <InfiniteScroll
        isManual={isManual} // Requires user action to load more results
        hasNextPage={query.hasNextPage} // Determines if more suggestions are available
        isFetchingNextPage={query.isFetchingNextPage} // Indicates if more suggestions are being fetched
        fetchNextPage={query.fetchNextPage} // Function to load the next page
      />
    </>
  );
};
