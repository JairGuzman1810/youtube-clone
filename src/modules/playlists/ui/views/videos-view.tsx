import { PlaylistHeaderSection } from "../sections/playlist-header-section";
import { VideosSection } from "../sections/videos-section";

// VideosViewProps - Defines the properties for the VideosView component
interface VideosViewProps {
  playlistId: string; // ID of the playlist to fetch and display videos from
}

// VideosView - Displays the videos from a specific playlist along with the header
export const VideosView = ({ playlistId }: VideosViewProps) => {
  return (
    <div className="max-w-screen-md mx-auto mb-10 px-4 pt-2.5 flex flex-col gap-y-6">
      {/* Render the playlist header section */}
      <PlaylistHeaderSection playlistId={playlistId} />

      {/* Render the section displaying videos from the playlist */}
      <VideosSection playlistId={playlistId} />
    </div>
  );
};
