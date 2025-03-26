import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { CornerDownRightIcon, Loader2Icon } from "lucide-react";
import { CommentItem } from "./comment-item";

// CommentRepliesProps - Defines the props required for the CommentReplies component
interface CommentRepliesProps {
  parentId: string; // ID of the parent comment (comment being replied to)
  videoId: string; // ID of the video the comments belong to
}

// CommentReplies - Displays replies to a specific comment with pagination
export const CommentReplies = ({ parentId, videoId }: CommentRepliesProps) => {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    trpc.comments.getMany.useInfiniteQuery(
      {
        limit: DEFAULT_LIMIT, // Limit the number of replies fetched per request
        videoId, // Filter by video ID
        parentId, // Filter by parent comment ID to fetch replies
      },
      {
        // Determines the next page cursor for pagination
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  return (
    <div className="pl-14">
      {/* Replies List */}
      <div className="flex flex-col gap-4 mt-2">
        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-center justify-center">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Render replies when loaded */}
        {!isLoading &&
          data?.pages
            .flatMap((page) => page.items) // Flatten pages to get all comments
            .map((comment) => (
              <CommentItem key={comment.id} comment={comment} variant="reply" />
            ))}
      </div>

      {/* Load More Replies Button */}
      {hasNextPage && (
        <Button
          disabled={isFetchingNextPage} // Disable button while fetching more replies
          variant={"tertiary"}
          size={"sm"}
          onClick={() => fetchNextPage()} // Fetch next page of replies
        >
          <CornerDownRightIcon />
          Show more replies
        </Button>
      )}
    </div>
  );
};
