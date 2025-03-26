import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import { useMemo } from "react";
import { VideoGetManyOutput } from "../../types";
import { VideoMenu } from "./video-menu";
import { VideoThumbnail } from "./video-thumbnail";

// videoRowCardVariants - Defines styles for different video row card sizes
const videoRowCardVariants = cva("group flex min-w-0", {
  variants: {
    size: {
      default: "gap-4",
      compact: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// thumbnailVariants - Defines styles for video thumbnails based on size
const thumbnailVariants = cva("relative flex-none", {
  variants: {
    size: {
      default: "w-[38%]",
      compact: "w-[168px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

// VideoRowCardProps - Props for the VideoRowCard component
interface VideoRowCardProps extends VariantProps<typeof videoRowCardVariants> {
  data: VideoGetManyOutput["items"][number]; // Video data
  onRemove?: () => void; // Callback when the video is removed
}

// VideoRowCardSkeleton - Skeleton loader for the video row card
export const VideoRowCardSkeleton = () => {
  return (
    <div>
      <Skeleton />
    </div>
  );
};

// VideoRowCard - Displays a video suggestion row with metadata and actions
export const VideoRowCard = ({
  data,
  size = "default",
  onRemove,
}: VideoRowCardProps) => {
  // Formats the number of views in a compact notation (e.g., 1K)
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount);
  }, [data.viewCount]);

  // Formats the number of likes in a compact notation (e.g., 1K)
  const compactLikes = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.likeCount);
  }, [data.likeCount]);

  return (
    <div className={videoRowCardVariants({ size })}>
      {/* Video thumbnail */}
      <Link href={`/videos/${data.id}`} className={thumbnailVariants({ size })}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>
      {/* Video details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-x-2">
          <Link href={`/videos/${data.id}`} className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium line-clamp-2",
                size === "compact" ? "text-sm" : "text-base"
              )}
            >
              {data.title}
            </h3>
            {size === "default" && (
              <p className="mt-1 text-xs text-muted-foreground">
                {compactViews} views • {compactLikes} likes
              </p>
            )}
            {size === "default" && (
              <>
                {/* Video uploader info */}
                <div className="flex items-center gap-2 my-3">
                  <UserAvatar
                    size={"sm"}
                    imageUrl={data.user.imageUrl}
                    name={data.user.name}
                  />
                  <UserInfo size={"sm"} name={data.user.name} />
                </div>
                {/* Video description with tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-xs text-muted-foreground w-fit line-clamp-2">
                      {data.description ?? "No description"}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent
                    side={"bottom"}
                    align={"center"}
                    className="bg-black/70"
                  >
                    <p>From the video description</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            {size === "compact" && (
              <UserInfo size={"sm"} name={data.user.name} />
            )}
            {size === "compact" && (
              <p className="mt-1 text-xs text-muted-foreground">
                {compactViews} views • {compactLikes} likes
              </p>
            )}
          </Link>
          {/* Video menu options */}
          <div className="flex-none">
            <VideoMenu videoId={data.id} onRemove={onRemove} />
          </div>
        </div>
      </div>
    </div>
  );
};
