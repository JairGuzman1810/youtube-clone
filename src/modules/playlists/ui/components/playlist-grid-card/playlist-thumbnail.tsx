import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import { ListVideoIcon, PlayIcon } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

// PlaylistThumbnailProps - Defines the properties for the PlaylistThumbnail component
interface PlaylistThumbnailProps {
  title: string; // Title of the playlist
  videoCount: number; // Number of videos in the playlist
  className?: string; // Optional class name for styling
  imageUrl?: string | null; // URL of the playlist thumbnail image (nullable)
}

// PlaylistThumbnailSkeleton - Displays a loading skeleton for the playlist thumbnail
export const PlaylistThumbnailSkeleton = () => {
  return (
    <div className="relative w-full overflow-hidden rounded-xl aspect-video">
      <Skeleton className="size-full" />
    </div>
  );
};

// PlaylistThumbnail - Renders the playlist thumbnail with overlay effects and video count
export const PlaylistThumbnail = ({
  title,
  videoCount,
  className,
  imageUrl,
}: PlaylistThumbnailProps) => {
  // Formats the number of videos in a compact notation (e.g., 1K)
  const compactVideoCount = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(videoCount);
  }, [videoCount]);

  return (
    <div className={cn("relative pt-3", className)}>
      {/* Layered stack effect for thumbnail background */}
      <div className="relative">
        {/* Background shadow layers for depth effect */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-[97%] overflow-hidden rounded-xl bg-black/20 aspect-video" />
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-[98.5%] overflow-hidden rounded-xl bg-black/25 aspect-video" />

        {/* Main playlist thumbnail image */}
        <div className="relative overflow-hidden w-full rounded-xl aspect-video">
          <Image
            src={imageUrl || THUMBNAIL_FALLBACK} // Use fallback image if none is provided
            alt={title}
            className="w-full h-full object-cover"
            fill
          />

          {/* Hover overlay with "Play all" button */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex items-center gap-x-2">
              <PlayIcon className="size-4 text-white fill-white" />
              <span className="text-white font-medium">Play all</span>
            </div>
          </div>
        </div>
      </div>

      {/* Video count badge at the bottom-right */}
      <div className="absolute bottom-2 right-2 px-1 py-0.5 rounded bg-black/50 text-white text-xs font-medium flex items-center gap-x-1">
        <ListVideoIcon />
        {compactVideoCount} videos
      </div>
    </div>
  );
};
