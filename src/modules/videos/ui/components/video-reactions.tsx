import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useClerk } from "@clerk/nextjs";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";
import { toast } from "sonner";
import { VideoGetOneOutput } from "../../types";

// VideoReactionsProps - Props for the VideoReactions component
interface VideoReactionsProps {
  videoId: string; // The ID of the video
  likes: number; // The number of likes the video has
  dislikes: number; // The number of dislikes the video has
  viewerReaction: VideoGetOneOutput["viewerReaction"]; // The reaction of the current viewer (like/dislike/null)
}

// VideoReactions - Displays like and dislike buttons for video reactions
export const VideoReactions = ({
  videoId,
  likes,
  dislikes,
  viewerReaction,
}: VideoReactionsProps) => {
  const clerk = useClerk(); // Access Clerk authentication functions
  const utils = trpc.useUtils(); // Get TRPC utility functions for cache management

  // Mutation to handle liking a video
  const like = trpc.videoReactions.like.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId }); // Invalidate cached video data to refresh UI
      // TODO: Invalidate "liked" playlist
    },
    onError: (error) => {
      toast.error("Something went wrong"); // Display error toast notification
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn(); // Prompt the user to sign in if unauthorized
      }
    },
  });

  // Mutation to handle disliking a video
  const dislike = trpc.videoReactions.dislike.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId }); // Invalidate cached video data to refresh UI
      // TODO: Invalidate "liked" playlist
    },
    onError: (error) => {
      toast.error("Something went wrong"); // Display error toast notification
      if (error.data?.code === "UNAUTHORIZED") {
        clerk.openSignIn(); // Prompt the user to sign in if unauthorized
      }
    },
  });

  return (
    <div className="flex items-center flex-none">
      {/* Like button */}
      <Button
        onClick={() => like.mutate({ videoId })} // Trigger like mutation
        disabled={like.isPending || dislike.isPending} // Disable if a mutation is in progress
        variant={"secondary"}
        className="rounded-l-full rounded-r-none gap-2 pr-4"
      >
        <ThumbsUpIcon
          className={cn("size-5", viewerReaction === "like" && "fill-black")} // Highlight if user liked
        />
        {likes}
      </Button>

      {/* Separator between like and dislike buttons */}
      <Separator orientation="vertical" className="h-7" />

      {/* Dislike button */}
      <Button
        onClick={() => dislike.mutate({ videoId })} // Trigger dislike mutation
        disabled={like.isPending || dislike.isPending} // Disable if a mutation is in progress
        variant={"secondary"}
        className="rounded-l-none rounded-r-full pl-3"
      >
        <ThumbsDownIcon
          className={cn("size-5", viewerReaction === "dislike" && "fill-black")} // Highlight if user disliked
        />
        {dislikes}
      </Button>
    </div>
  );
};
