"use client";

import { CommentForm } from "@/modules/comments/ui/components/comment-form";
import { CommentItem } from "@/modules/comments/ui/components/comment-item";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

// CommentsSectionsProps - Defines the props required for the CommentsSections component
interface CommentsSectionsProps {
  videoId: string; // Unique identifier for the video
}

// CommentsSections component - Handles comment rendering with suspense and error boundaries
export const CommentsSections = ({ videoId }: CommentsSectionsProps) => {
  return (
    <Suspense fallback={"Loading..."}>
      <ErrorBoundary fallback={"Error..."}>
        <CommentsSectionsSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// CommentsSectionsSuspense component - Fetches and displays comments for a video
const CommentsSectionsSuspense = ({ videoId }: CommentsSectionsProps) => {
  // Fetch comments using suspense query
  const [comments] = trpc.comments.getMany.useSuspenseQuery({ videoId });

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-6">
        <h1>0 Comments</h1>

        {/* Comment Form - Allows users to add new comments */}
        <CommentForm videoId={videoId} />

        {/* Comment List - Displays fetched comments */}
        <div className="flex flex-col gap-4 mt-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      </div>
    </div>
  );
};
