import { Skeleton } from "@/components/ui/skeleton";
import { PlaylistGetManyOutput } from "@/modules/playlists/types";

// PlaylistInfoProps - Defines the properties for the PlaylistInfo component
interface PlaylistInfoProps {
  data: PlaylistGetManyOutput["items"][number]; // Playlist data containing name and metadata
}

// PlaylistInfoSkeleton - Displays a loading skeleton for the playlist information
export const PlaylistInfoSkeleton = () => {
  return (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-5 w-[90%]" />
        <Skeleton className="h-5 w-[70%]" />
        <Skeleton className="h-5 w-[50%]" />
      </div>
    </div>
  );
};

// PlaylistInfo - Renders the playlist details including title and navigation link
export const PlaylistInfo = ({ data }: PlaylistInfoProps) => {
  return (
    <div className="flex gap-3">
      <div className="min-w-0 flex-1">
        {/* Playlist name */}
        <h3 className="font-medium line-clamp-1 lg:line-clamp-2 text-sm break-words">
          {data.name}
        </h3>
        {/* Playlist label */}
        <p className="text-sm text-muted-foreground">Playlist</p>
        {/* Link to view the full playlist */}
        <p className="text-sm text-muted-foreground font-semibold hover:text-primary">
          View full playlist
        </p>
      </div>
    </div>
  );
};
