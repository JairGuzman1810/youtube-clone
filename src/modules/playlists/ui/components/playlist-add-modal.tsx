import { InfiniteScroll } from "@/components/infinite-scroll";
import { ResponsiveModal } from "@/components/responsive-modal";
import { Button } from "@/components/ui/button";
import { DEFAULT_LIMIT } from "@/constants";
import { trpc } from "@/trpc/client";
import { Loader2Icon, SquareCheckIcon, SquareIcon } from "lucide-react";
import { toast } from "sonner";

// PlaylistAddModalProps - Defines the props for the PlaylistAddModal component
interface PlaylistAddModalProps {
  open: boolean; // Controls whether the modal is open or closed
  onOpenChange: (open: boolean) => void; // Callback function to handle modal state changes
  videoId: string; // ID of the video being added or removed from playlists
}

// PlaylistAddModal - Modal for adding/removing a video from playlists
export const PlaylistAddModal = ({
  open,
  onOpenChange,
  videoId,
}: PlaylistAddModalProps) => {
  const utils = trpc.useUtils();

  // Fetches the user's playlists with pagination support, checking if the video is already in them
  const {
    data: playlists,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = trpc.playlists.getManyForVideo.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT, // Number of playlists per request
      videoId,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor, // Determines the next page cursor for pagination
      enabled: !!videoId && open, // Only fetch data when videoId exists and modal is open
    }
  );

  // Mutation to add a video to a playlist
  const addVideo = trpc.playlists.addVideo.useMutation({
    onSuccess: () => {
      toast.success("Video added to playlist");
      utils.playlists.getMany.invalidate(); // Invalidate cached playlist data
      utils.playlists.getManyForVideo.invalidate({ videoId });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  // Mutation to remove a video from a playlist
  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: () => {
      toast.success("Video removed from playlist");
      utils.playlists.getMany.invalidate(); // Invalidate cached playlist data
      utils.playlists.getManyForVideo.invalidate({ videoId });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <ResponsiveModal
      title="Add to playlist" // Modal title
      open={open}
      onOpenChange={onOpenChange}
    >
      <div className="flex flex-col gap-2">
        {/* Show loading indicator when playlists are being fetched */}
        {isLoading && (
          <div className="flex justify-center p-4">
            <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Render playlist list if data is available */}
        {!isLoading &&
          playlists?.pages
            .flatMap((page) => page.items) // Flatten pages to get all playlists
            .map((playlist) => (
              <Button
                variant="ghost"
                className="w-full justify-start px-2 [&_svg]:size-5"
                size="lg"
                key={playlist.id}
                onClick={() => {
                  if (playlist.containsVideo) {
                    removeVideo.mutate({ playlistId: playlist.id, videoId }); // Remove video if already in playlist
                  } else {
                    addVideo.mutate({ playlistId: playlist.id, videoId }); // Add video if not in playlist
                  }
                }}
                disabled={removeVideo.isPending || addVideo.isPending} // Disable button while mutation is in progress
              >
                {/* Show check icon if video is in playlist, otherwise show empty square */}
                {playlist.containsVideo ? (
                  <SquareCheckIcon className="mr-2" />
                ) : (
                  <SquareIcon className="mr-2" />
                )}
                {playlist.name}
              </Button>
            ))}

        {/* Infinite scrolling component to load more playlists when scrolling */}
        {!isLoading && (
          <InfiniteScroll
            isManual
            hasNextPage={hasNextPage} // Checks if there are more playlists to load
            isFetchingNextPage={isFetchingNextPage} // Indicates if the next page is being fetched
            fetchNextPage={fetchNextPage} // Fetches the next set of playlists
          />
        )}
      </div>
    </ResponsiveModal>
  );
};
