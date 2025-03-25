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
  MessageSquareIcon,
  MoreVerticalIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { CommentsGetManyOutput } from "../../type";

// CommentItemProps - Defines the props required for the CommentItem component
interface CommentItemProps {
  comment: CommentsGetManyOutput["items"][number]; // Represents a single comment
}

// CommentItem component - Renders an individual comment with user details
export const CommentItem = ({ comment }: CommentItemProps) => {
  const clerk = useClerk(); // Initialize Clerk for handling authentication-related functionalities
  const { userId } = useAuth(); // Destructure userId from useAuth hook, which gives access to the authenticated user's ID
  const utils = trpc.useUtils(); // Access TRPC utilities for data invalidation and other server-related tasks

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
        <Link href={`/users/${comment.userId}`}>
          <UserAvatar
            size="lg"
            imageUrl={comment.user.imageUrl}
            name={comment.user.name}
          />
        </Link>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          {/* User name and timestamp */}
          <Link href={`/users/${comment.userId}`}>
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
            <DropdownMenuItem onClick={() => {}}>
              <MessageSquareIcon className="size-4" />
              Reply
            </DropdownMenuItem>

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
    </div>
  );
};
