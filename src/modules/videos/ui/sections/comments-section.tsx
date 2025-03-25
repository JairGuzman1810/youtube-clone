"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { CommentItem } from "@/modules/comments/ui/components/comment-item";
import { trpc } from "@/trpc/client";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// CommentsSectionsProps - Defines the props required for the CommentsSections component
interface CommentsSectionsProps {
  videoId: string; // Unique identifier for the video
}

// CommentsSections component - Handles comment rendering with suspense and error boundaries
export const CommentsSections = ({ videoId }: CommentsSectionsProps) => {
  return (
    <Suspense fallback={<CommentsSectionSkeleton />}>
      <ErrorBoundary fallback={"Error..."}>
        <CommentsSectionsSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// CommentsSectionSkeleton - Displays a loading spinner while comments are being fetched
const CommentsSectionSkeleton = () => {
  return (
    <div className="mt-6 flex justify-center items-center">
      <Loader2Icon className="text-muted-foreground size-7 animate-spin" />
    </div>
  );
};

// CommentsSectionsSuspense component - Fetches and displays comments for a video
const CommentsSectionsSuspense = ({ videoId }: CommentsSectionsProps) => {
  // Fetch comments using suspense-enabled infinite query
  const [comments, query] = trpc.comments.getMany.useSuspenseInfiniteQuery(
    { videoId, limit: DEFAULT_LIMIT },
    {
      // Determines the next page cursor for pagination
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        {/* Display total comment count */}
        <h1 className="text-xl font-bold">
          {comments.pages[0].totalCount} Comments
        </h1>

        {/* Comment Form - Allows users to add new comments */}
        <CommentForm videoId={videoId} />

        {/* Comment List - Displays fetched comments */}
        <div className="flex flex-col gap-4 mt-2">
          {comments.pages
            .flatMap((page) => page.items) // Flatten comment pages into a single list
            .map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}

          {/* Infinite scrolling component for loading more comments */}
          <InfiniteScroll
            isManual // Requires user action to load more results
            hasNextPage={query.hasNextPage} // Determines if more comments are available
            isFetchingNextPage={query.isFetchingNextPage} // Indicates if more comments are being fetched
            fetchNextPage={query.fetchNextPage} // Function to load the next page
          />
        </div>
      </div>
    </div>
  );
};
