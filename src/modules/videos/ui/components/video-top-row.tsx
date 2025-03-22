import { format, formatDistanceToNow } from "date-fns";
import { useMemo } from "react";
import { VideoGetOneOutput } from "../../server/types";
import { VideoDescription } from "./video-description";
import { VideoMenu } from "./video-menu";
import { VideoOwner } from "./video-owner";
import { VideoReactions } from "./video-reactions";

// VideoTopRowProps - Defines the props for the VideoTopRow component
interface VideoTopRowProps {
  video: VideoGetOneOutput; // Video data including metadata, owner, and reactions
}

// VideoTopRow component - Displays video title, owner, reactions, and description
export const VideoTopRow = ({ video }: VideoTopRowProps) => {
  // Formats the number of views in a compact notation (e.g., 1K)
  const compactViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "compact",
    }).format(1000);
  }, []);

  // Formats the number of views in a standard notation (e.g., 1,000)
  const expandedViews = useMemo(() => {
    return Intl.NumberFormat("en", {
      notation: "standard",
    }).format(1000);
  }, []);

  // Computes a relative timestamp for when the video was uploaded (e.g., "2 days ago")
  const compactDate = useMemo(() => {
    return formatDistanceToNow(video.createdAt, { addSuffix: true });
  }, [video.createdAt]);

  // Formats the upload date in a standard readable format (e.g., "10 Mar 2025")
  const expandedDate = useMemo(() => {
    return format(video.createdAt, "d MMM yyyy");
  }, [video.createdAt]);

  return (
    <div className="flex flex-col gap-4 mt-4">
      {/* Video title */}
      <h1 className="text-xl font-semibold">{video.title}</h1>

      {/* Video owner and reaction section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <VideoOwner user={video.user} videoId={video.id} />
        <div className="flex overflow-x-auto sm:min-w-[calc(50%-6px)] sm:justify-end sm:overflow-visible pb-2 -mb-2 sm:pb-0 sm:mb-0 gap-2">
          <VideoReactions />
          <VideoMenu videoId={video.id} variant="secondary" />
        </div>
      </div>

      {/* Video description with formatted views and dates */}
      <VideoDescription
        compactViews={compactViews}
        expandedViews={expandedViews}
        compactDate={compactDate}
        expandedDate={expandedDate}
        description={video.description}
      />
    </div>
  );
};
