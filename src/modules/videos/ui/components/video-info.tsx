import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/user-avatar";
import { UserInfo } from "@/modules/users/ui/components/user-info";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useMemo } from "react";
import { VideoGetManyOutput } from "../../types";
import { VideoMenu } from "./video-menu";

// VideoInfoProps - Interface defining the props for the VideoInfo component
interface VideoInfoProps {
  data: VideoGetManyOutput["items"][number]; // Video data
  onRemove?: () => void; // Callback for removing the video (optional)
}

// VideoInfoSkeleton - Placeholder skeleton for loading video metadata
export const VideoInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <Skeleton className="size-10 flex-shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-[90%]" />
        <Skeleton className="h-5 w-[70%]" />
      </div>
    </div>
  );
};

// VideoInfo - Displays video metadata including title, uploader, views, and upload time
export const VideoInfo = ({ data, onRemove }: VideoInfoProps) => {
  // Formats the number of views in a compact notation (e.g., 1K)
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(data.viewCount);
  }, [data.viewCount]);

  // Computes a relative timestamp for when the video was uploaded (e.g., "2 days ago")
  const compactDate = useMemo(() => {
    return formatDistanceToNow(data.createdAt, { addSuffix: true });
  }, [data.createdAt]);

  return (
    // Container for video information
    <div className="flex gap-3">
      {/* Uploader's avatar */}
      <Link href={`/users/${data.user.id}`}>
        <UserAvatar imageUrl={data.user.imageUrl} name={data.user.name} />
      </Link>
      {/* Video details */}
      <div className="min-w-0 flex-1">
        {/* Video title */}
        <Link href={`/videos/${data.id}`}>
          <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-base break-words">
            {data.title}
          </h3>
        </Link>
        {/* Uploader's name */}
        <Link href={`/users/${data.user.id}`}>
          <UserInfo name={data.user.name} />
        </Link>
        {/* Video views and upload time */}
        <Link href={`/videos/${data.id}`}>
          <p className="line-clamp-1 text-sm text-gray-600">
            {compactViews} views • {compactDate}
          </p>
        </Link>
      </div>
      {/* Video menu actions */}
      <div className="flex-shrink-0">
        <VideoMenu videoId={data.id} onRemove={onRemove} />
      </div>
    </div>
  );
};
