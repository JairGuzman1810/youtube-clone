// Ensures this component runs on the client side
"use client";

import { InfiniteScroll } from "@/components/infinite-scroll";
import { DEFAULT_LIMIT } from "@/constants";
import {
  VideoGridCard,
  VideoGridCardSkeleton,
} from "@/modules/videos/ui/components/video-grid-card";
import {
  VideoRowCard,
  VideoRowCardSkeleton,
} from "@/modules/videos/ui/components/video-row-card";
import { trpc } from "@/trpc/client";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { toast } from "sonner";

// VideosSectionProps - Defines the properties for the VideosSection component
interface VideosSectionProps {
  playlistId: string; // ID of the playlist to fetch videos from
}

// VideosSection - Handles rendering videos from a playlist with suspense and error boundaries
export const VideosSection = (props: VideosSectionProps) => {
  return (
    <Suspense fallback={<VideosSectionSkeleton />}>
      <ErrorBoundary fallback={<p>Error...</p>}>
        <VideosSectionSuspense {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

// VideosSectionSkeleton - Displays a loading skeleton while playlist videos are being fetched
const VideosSectionSkeleton = () => {
  return (
    <div>
      {/* Grid layout for small screens */}
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoGridCardSkeleton key={index} />
        ))}
      </div>
      {/* Row layout for larger screens */}
      <div className="hidden flex-col gap-4 md:flex">
        {Array.from({ length: 18 }).map((_, index) => (
          <VideoRowCardSkeleton key={index} size="compact" />
        ))}
      </div>
    </div>
  );
};

// VideosSectionSuspense - Fetches and renders videos from a playlist with infinite scroll support
const VideosSectionSuspense = ({ playlistId }: VideosSectionProps) => {
  // Fetch playlist videos using suspense-enabled infinite query
  const [videos, query] = trpc.playlists.getVideos.useSuspenseInfiniteQuery(
    { playlistId, limit: DEFAULT_LIMIT },
    {
      // Determines the next page cursor for pagination
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const utils = trpc.useUtils(); // Utility functions for cache management
  // Mutation to remove a video from a playlist
  const removeVideo = trpc.playlists.removeVideo.useMutation({
    onSuccess: (data) => {
      toast.success("Video removed from playlist");

      // Invalidate related TRPC queries to refresh playlist data
      utils.playlists.getMany.invalidate();
      utils.playlists.getManyForVideo.invalidate({ videoId: data.videoId });
      utils.playlists.getOne.invalidate({ id: data.playlistId });
      utils.playlists.getVideos.invalidate({ playlistId: data.playlistId });
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  return (
    <div>
      {/* Grid layout for small screens */}
      <div className="flex flex-col gap-4 gap-y-10 md:hidden">
        {videos.pages
          .flatMap((page) => page.items) // Flatten paginated results into a single array
          .map((video) => (
            <VideoGridCard
              key={video.id}
              data={video}
              onRemove={() =>
                removeVideo.mutate({
                  playlistId,
                  videoId: video.id,
                })
              }
            />
          ))}
      </div>
      {/* Row layout for larger screens */}
      <div className="hidden flex-col gap-4 md:flex">
        {videos.pages
          .flatMap((page) => page.items) // Flatten paginated results into a single array
          .map((video) => (
            <VideoRowCard
              key={video.id}
              data={video}
              size={"compact"}
              onRemove={() =>
                removeVideo.mutate({
                  playlistId,
                  videoId: video.id,
                })
              }
            />
          ))}
      </div>
      {/* Infinite scrolling component to load more playlist videos */}
      <InfiniteScroll
        hasNextPage={query.hasNextPage} // Checks if there are more videos to fetch
        isFetchingNextPage={query.isFetchingNextPage} // Indicates if the next page is currently being fetched
        fetchNextPage={query.fetchNextPage} // Fetches the next page of videos
      />
    </div>
  );
};
