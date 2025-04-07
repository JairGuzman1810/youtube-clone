import { PlaylistGetManyOutput } from "@/modules/playlists/types";
import { THUMBNAIL_FALLBACK } from "@/modules/videos/constants";
import Link from "next/link";
import { PlaylistInfo, PlaylistInfoSkeleton } from "./playlist-info";
import {
  PlaylistThumbnail,
  PlaylistThumbnailSkeleton,
} from "./playlist-thumbnail";

// PlaylistGridCardProps - Defines the properties for the PlaylistGridCard component
interface PlaylistGridCardProps {
  data: PlaylistGetManyOutput["items"][number]; // Playlist data fetched from the server
}

// PlaylistGridCardSkeleton - Displays a loading skeleton for a playlist card
export const PlaylistGridCardSkeleton = () => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <PlaylistThumbnailSkeleton />
      <PlaylistInfoSkeleton />
    </div>
  );
};

// PlaylistGridCard - Renders a clickable playlist card with a thumbnail and details
export const PlaylistGridCard = ({ data }: PlaylistGridCardProps) => {
  return (
    <Link prefetch href={`/playlists/${data.id}`}>
      <div className="flex flex-col gap-2 w-full group">
        {/* Displays the playlist thumbnail */}
        <PlaylistThumbnail
          imageUrl={data.thumbnailUrl || THUMBNAIL_FALLBACK} // Uses fallback if no thumbnail
          title={data.name} // Playlist name for accessibility
          videoCount={data.videoCount} // Number of videos in the playlist
        />
        {/* Playlist metadata including title and creator info */}
        <PlaylistInfo data={data} />
      </div>
    </Link>
  );
};
