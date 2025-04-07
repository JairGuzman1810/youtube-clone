import Link from "next/link";
import { VideoGetManyOutput } from "../../types";
import { VideoInfo, VideoInfoSkeleton } from "./video-info";
import { VideoThumbnail, VideoThumbnailSkeleton } from "./video-thumbnail";

// VideoGridCardProps - Props for the VideoGridCard component
interface VideoGridCardProps {
  data: VideoGetManyOutput["items"][number]; // Video data
  onRemove?: () => void; // Callback when the video is removed
}

// VideoGridCard - Displays a video in a grid format with its thumbnail and metadata
export const VideoGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <VideoThumbnailSkeleton />
      <VideoInfoSkeleton />
    </div>
  );
};

// VideoGridCard - Displays a video suggestion in a grid format
export const VideoGridCard = ({ data, onRemove }: VideoGridCardProps) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      {/* Video thumbnail */}
      <Link prefetch href={`/videos/${data.id}`}>
        <VideoThumbnail
          imageUrl={data.thumbnailUrl}
          previewUrl={data.previewUrl}
          title={data.title}
          duration={data.duration}
        />
      </Link>
      {/* Video metadata */}
      <VideoInfo data={data} onRemove={onRemove} />
    </div>
  );
};
