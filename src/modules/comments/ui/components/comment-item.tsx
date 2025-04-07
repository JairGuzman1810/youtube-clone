// Import necessary components and utilities
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useAuth, useClerk } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { CommentsGetManyOutput } from "../../type";
import { CommentForm } from "./comment-form";
import { CommentReplies } from "./comment-replies";

// CommentItemProps - Defines the props required for the CommentItem component
interface CommentItemProps {
  comment: CommentsGetManyOutput["items"][number]; // Represents a single comment
  variant?: "reply" | "comment"; // Determines if this is a top-level comment or a reply
}

// CommentItem - Renders an individual comment with user details, actions, and replies
export const CommentItem = ({
  comment,
  variant = "comment",
}: CommentItemProps) => {
  const clerk = useClerk(); // Initialize Clerk for handling authentication-related functionalities
  const { userId } = useAuth(); // Destructure userId from useAuth hook, which gives access to the authenticated user's ID

  const [isReplyOpen, setIsReplyOpen] = useState(false); // isReplyOpen - Controls whether the reply form is visible
  const [isRepliesOpen, setIsRepliesOpen] = useState(false); // isRepliesOpen - Controls whether the comment's replies are displayed

  const utils = trpc.useUtils(); // Utility functions for cache management

  // Remove comment mutation - Handles deleting a comment
  const remove = trpc.comments.remove.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted");

      // Invalidate and refetch comments after deletion
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("Something went wrong");

      // If unauthorized, prompt user to sign in
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  // Like mutation - Handles liking a comment
  const like = trpc.commentReactions.like.useMutation({
    onSuccess: () => {
      // Refresh the comments list after a successful like
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("Something went wrong");

      // If the user is not authorized, prompt them to sign in
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  // Dislike mutation - Handles disliking a comment
  const dislike = trpc.commentReactions.dislike.useMutation({
    onSuccess: () => {
      // Refresh the comments list after a successful dislike
      utils.comments.getMany.invalidate({ videoId: comment.videoId });
    },
    onError: (error) => {
      toast.error("Something went wrong");

      // If the user is not authorized, prompt them to sign in
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn();
      }
    },
  });

  return (
    <div>
      <div className="flex gap-4">
        {/* User Avatar with link to their profile */}
        <Link prefetch href={`/users/${comment.userId}`}>
          <UserAvatar
            size={variant === "comment" ? "lg" : "sm"}
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          {/* User name and timestamp */}
          <Link prefetch href={`/users/${comment.userId}`}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-medium text-sm pb-0.5">
                {comment.user.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(comment.updatedAt, {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>

          {/* Comment text */}
          <p className="text-sm">{comment.value}</p>

          {/* Like and dislike buttons */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              {/* Like button */}
              <Button
                disabled={like.isPending}
                variant={"ghost"}
                size={"icon"}
                className="size-8"
                onClick={() => like.mutate({ commentId: comment.id })}
              >
                <ThumbsUpIcon
                  className={cn(
                    comment.viewerReaction === "like" && "fill-black"
                  )}
                />
              </Button>
              {/* Like count */}
              <span className="text-xs text-muted-foreground">
                {comment.likeCount}
              </span>

              {/* Dislike button */}
              <Button
                disabled={dislike.isPending}
                variant={"ghost"}
                size={"icon"}
                className="size-8"
                onClick={() => dislike.mutate({ commentId: comment.id })}
              >
                <ThumbsDownIcon
                  className={cn(
                    comment.viewerReaction === "dislike" && "fill-black"
                  )}
                />
              </Button>
              {/* Dislike count */}
              <span className="text-xs text-muted-foreground">
                {comment.dislikeCount}
              </span>
            </div>
            {/* Reply action */}
            {variant === "comment" && (
              <Button
                variant={"ghost"}
                size={"sm"}
                className="h-8"
                onClick={() => setIsReplyOpen(true)}
              >
                Reply
              </Button>
            )}
          </div>
        </div>

        {/* Comment actions dropdown */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="size-8">
              <MoreVerticalIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Reply action */}
            {variant === "comment" && (
              <DropdownMenuItem onClick={() => setIsReplyOpen(true)}>
                <MessageSquareIcon className="size-4" />
                Reply
              </DropdownMenuItem>
            )}
            {/* Delete action (only available for comment owner) */}
            {comment.user.clerkId === userId && (
              <DropdownMenuItem
                onClick={() => remove.mutate({ id: comment.id })}
              >
                <Trash2Icon className="size-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* Reply form for adding a new reply */}
      {isReplyOpen && variant === "comment" && (
        <div className="mt-4 pl-14">
          <CommentForm
            variant="reply"
            parentId={comment.id}
            videoId={comment.videoId}
            onCancel={() => setIsReplyOpen(false)}
            onSuccess={() => {
              setIsReplyOpen(false);
              setIsRepliesOpen(true);
            }}
          />
        </div>
      )}
      {/* Replies count and toggle button */}
      {comment.replyCount > 0 && variant === "comment" && (
        <div className="pl-14">
          <Button
            variant="tertiary"
            size={"sm"}
            onClick={() => setIsRepliesOpen((current) => !current)}
          >
            {isRepliesOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
            {comment.replyCount} replies
          </Button>
        </div>
      )}
      {/* Display replies if opened */}
      {comment.replyCount > 0 && variant === "comment" && isRepliesOpen && (
        <CommentReplies parentId={comment.id} videoId={comment.videoId} />
      )}
    </div>
  );
};
