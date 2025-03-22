import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { ThumbsDownIcon, ThumbsUpIcon } from "lucide-react";

// VideoReactions - Displays like and dislike buttons for video reactions
// TODO: Implement functionality for user reactions
export const VideoReactions = () => {
  const viewerReaction = "like"; // Placeholder for user reaction state

  return (
    <div className="flex items-center flex-none">
      {/* Like button */}
      <Button
        variant={"secondary"}
        className="rounded-l-full rounded-r-none gap-2 pr-4"
      >
        <ThumbsUpIcon
          className={cn("size-5", viewerReaction === "like" && "fill-black")}
        />
        {1}
      </Button>

      {/* Separator between like and dislike buttons */}
      <Separator orientation="vertical" className="h-7" />

      {/* Dislike button */}
      <Button
        variant={"secondary"}
        className="rounded-l-none rounded-r-full pl-3"
      >
        <ThumbsDownIcon
          className={cn("size-5", viewerReaction !== "like" && "fill-black")}
        />
        {0}
      </Button>
    </div>
  );
};
