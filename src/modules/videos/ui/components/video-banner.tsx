import { AlertTriangleIcon } from "lucide-react";
import { VideoGetOneOutput } from "../../server/types";

// VideoBannerProps - Defines the props required for the VideoBanner component
interface VideoBannerProps {
  status: VideoGetOneOutput["muxStatus"]; // Video processing status from Mux
}

// VideoBanner component - Displays a warning banner if the video is still processing
export const VideoBanner = ({ status }: VideoBannerProps) => {
  if (status === "ready") return null; // No banner if the video is ready

  return (
    <div className="flex items-center gap-2 rounded-b-xl bg-yellow-500 px-4 py-3">
      <AlertTriangleIcon className="size-4 shrink-0 text-black" />
      <p className="line-clamp-1 text-xs font-medium text-black md:text-sm">
        This video is still being processed.
      </p>
    </div>
  );
};
