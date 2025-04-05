import { CommentsSections } from "../sections/comments-section";
import { SuggestionsSection } from "../sections/suggestion-section";
import { VideoSection } from "../sections/video-section";

// VideoViewProps - Defines the properties for the VideoView component
interface VideoViewProps {
  videoId: string; // Unique identifier for the video being displayed
}

// VideoView - Displays the video player along with comments and suggestions
export const VideoView = ({ videoId }: VideoViewProps) => {
  return (
    <div className="flex flex-col max-w-[1700px] mx-auto pt-2.5 px-4 mb-10">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Main content area - Video player and comments */}
        <div className="flex-1 min-w-0">
          {/* Renders the video player */}
          <VideoSection videoId={videoId} />
          {/* Suggestions section (visible on small screens) */}
          <div className="xl:hidden block mt-4">
            <SuggestionsSection videoId={videoId} isManual />
          </div>
          {/* Renders the comments section */}
          <CommentsSections videoId={videoId} />
        </div>

        {/* Sidebar - Suggestions section (visible on larger screens) */}
        <div className="hidden xl:block w-full xl:w-[380px] 2xl:[460px] shrink-1">
          <SuggestionsSection videoId={videoId} />
        </div>
      </div>
    </div>
  );
};
