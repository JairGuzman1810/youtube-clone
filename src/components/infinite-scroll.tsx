import { useIntersectionObserver } from "@/hooks/use-intersection-observer";
import { useEffect } from "react";
import { Button } from "./ui/button";

// Props interface for InfiniteScroll component
interface InfiniteScrollProps {
  isManual?: boolean; // If true, requires manual button click to load more
  hasNextPage: boolean; // Indicates if more pages are available
  isFetchingNextPage: boolean; // Indicates if next page is currently loading
  fetchNextPage: () => void; // Function to load the next page
}

// InfiniteScroll component - Handles automatic/manual infinite scrolling
export const InfiniteScroll = ({
  isManual = false, // Default to automatic loading
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: InfiniteScrollProps) => {
  // Observe when the user reaches the bottom of the list
  const { targetRef, isIntersecting } = useIntersectionObserver({
    threshold: 0.5, // Triggers when 50% of the target is visible
    rootMargin: "100px", // Starts observing when the user is 100px near the element
  });

  // Auto-fetch next page when the target is visible (unless manual mode is enabled)
  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage && !isManual) {
      fetchNextPage();
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isIntersecting,
    isManual,
  ]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Invisible target element to trigger intersection observer */}
      <div ref={targetRef} className="h-1" />

      {/* Show Load More button if there are more pages */}
      {hasNextPage ? (
        <Button
          variant="secondary"
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
        >
          {isFetchingNextPage ? "Loading..." : "Load more"}
        </Button>
      ) : (
        // Display message when all content is loaded
        <p className="text-xs text-muted-foreground">
          You have reached the end of the list
        </p>
      )}
    </div>
  );
};
