"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { useIsMobile } from "@/hooks/use-mobile";
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

// ResultSectionProps - Defines the expected structure for the query and categoryId props
interface ResultSectionProps {
  query: string | undefined; // The search query used for filtering results
  categoryId: string | undefined; // The category ID used for filtering search results (optional)
}

// ResultsSection - Main component for rendering search results with infinite scroll
export const ResultsSection = (props: ResultSectionProps) => {
  return (
    <Suspense
      key={`${props.query}-${props.categoryId}`}
      fallback={<ResultsSectionSkeleton />}
    >
      <ErrorBoundary fallback={<p>Error...</p>}>
        <ResultsSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

// ResultsSectionSkeleton - Displays loading skeletons while search results are fetching
const ResultsSectionSkeleton = () => {
  return (
    <>
      {/* Skeleton loaders for larger screens (row layout) */}
      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 5 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} />
        ))}
      </div>
      {/* Skeleton loaders for mobile screens (grid layout) */}
      <div className="flex flex-col gap-4 p-4 gap-y-10 pt-6 md:hidden">
        {Array.from({ length: 5 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
    </>
  );
};

// ResultsSectionSuspense - Handles fetching and rendering of search results
const ResultsSectionSuspense = ({ query, categoryId }: ResultSectionProps) => {
  const isMobile = useIsMobile(); // Determines if the user is on a mobile device

  // Fetching search results using TRPC infinite query
  const [results, resultsQuery] = trpc.search.getMany.useSuspenseInfiniteQuery(
    { query, categoryId, limit: DEFAULT_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor } // Defines the logic to fetch the next page of results
  );

  return (
    <>
      {/* Renders search results in a grid layout for mobile users */}
      {isMobile ? (
        <div className="flex flex-col gap-4 gap-y-10">
          {results.pages
            .flatMap((page) => page.items) // Flattens paginated results into a single array
            .map((video) => (
              <VideoGridCard key={video.id} data={video} /> // Renders each video as a grid card
            ))}
        </div>
      ) : (
        // Renders search results in a row layout for non-mobile users
        <div className="flex flex-col gap-4">
          {results.pages
            .flatMap((page) => page.items) // Flattens paginated results into a single array
            .map((video) => (
              <VideoRowCard key={video.id} data={video} /> // Renders each video as a row card
            ))}
        </div>
      )}
      {/* Infinite scroll component to load more results */}
      <InfiniteScroll
        hasNextPage={resultsQuery.hasNextPage} // Checks if there are more pages to load
        isFetchingNextPage={resultsQuery.isFetchingNextPage} // Shows loading state while fetching the next page
        fetchNextPage={resultsQuery.fetchNextPage} // Function to fetch the next page of results
      />
    </>
  );
};
