import { formatDuration } from "@/lib/utils";
import Image from "next/image";

// Define the props interface for the VideoThumbnail component
interface VideoThumbnailProps {
  imageUrl?: string | null; // URL of the video's thumbnail image (if available)
  previewUrl?: string | null; // URL of the animated preview (if available)
  title: string; // Title of the video, used for accessibility (alt text)
  duration: number; // Duration of the video in milliseconds
}

// VideoThumbnail component displays a video's thumbnail and preview on hover
export const VideoThumbnail = ({
  imageUrl,
  previewUrl,
  title,
  duration,
}: VideoThumbnailProps) => {
  return (
    <div className="relative group">
      {/* Thumbnail wrapper with hover effect */}
      <div className="relative w-full overflow-hidden rounded-xl aspect-video">
        {/* Static thumbnail image */}
        <Image
          src={imageUrl ?? "/placeholder.svg"} // Fallback to placeholder if no image is provided
          alt={title} // Accessibility: Describe the image using the video title
          fill
          className="size-full object-cover group-hover:opacity-0" // Hides on hover to reveal preview
        />
        {/* Animated preview image (visible on hover) */}
        <Image
          unoptimized={!!previewUrl} // Avoids Next.js optimization for dynamic preview URLs
          src={previewUrl ?? "/placeholder.svg"} // Fallback image if preview is unavailable
          alt={title}
          fill
          className="size-full object-cover opacity-0 group-hover:opacity-100" // Visible only on hover
        />
      </div>
      {/* Video duration displayed in the bottom-right corner */}
      <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
        {formatDuration(duration)} {/* Formats duration into mm:ss format */}
      </div>
    </div>
  );
};
