"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";
import { Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

// PlaylistHeaderSectionProps - Defines the properties for the PlaylistHeaderSection component
interface PlaylistHeaderSectionProps {
  playlistId: string; // ID of the playlist to fetch details for
}

// PlaylistHeaderSection - Displays the playlist title and delete button
export const PlaylistHeaderSection = ({
  playlistId,
}: PlaylistHeaderSectionProps) => {
  return (
    <Suspense fallback={<PlaylistHeaderSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <PlaylistHeaderSectionSuspense playlistId={playlistId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// PlaylistHeaderSectionSkeleton - Loading skeleton for the playlist header
const PlaylistHeaderSectionSkeleton = () => {
  return (
    <div className="flex flex-col gap-y-2">
      <Skeleton className="h-6 w-24" />
      <Skeleton className="h-6 w-32" />
    </div>
  );
};

// PlaylistHeaderSectionSuspense - Fetches and displays the playlist details
const PlaylistHeaderSectionSuspense = ({
  playlistId,
}: PlaylistHeaderSectionProps) => {
  // Fetch playlist details
  const [playlist] = trpc.playlists.getOne.useSuspenseQuery({
    id: playlistId,
  });

  const router = useRouter(); // Router for navigation
  const utils = trpc.useUtils(); // Utility functions for cache management

  // Mutation for deleting the playlist
  const remove = trpc.playlists.remove.useMutation({
    onSuccess: () => {
      toast.success("Playlist removed"); // Show success notification
      utils.playlists.getMany.invalidate(); // Invalidate cached playlists
      router.push("/playlists"); // Redirect to the playlists page
    },
    onError: () => {
      toast.success("Something went wrong"); // Show error notification
    },
  });

  return (
    <div className="flex justify-between items-center">
      {/* Display playlist title and description */}
      <div>
        <h1 className="text-2xl font-bold">{playlist.name}</h1>
        <p className="text-xs text-muted-foreground">
          Videos from the playlist
        </p>
      </div>
      {/* Button to delete the playlist */}
      <Button
        onClick={() => remove.mutate({ id: playlistId })}
        variant={"outline"}
        size={"icon"}
        className="rounded-full"
        disabled={remove.isPending}
      >
        <Trash2Icon />
      </Button>
    </div>
  );
};
