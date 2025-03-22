"use client";

import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/client";
import { useAuth } from "@clerk/nextjs";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { VideoBanner } from "../components/video-banner";
import { VideoPlayer } from "../components/video-player";
import { VideoTopRow } from "../components/video-top-row";

// VideoSectionProps - Defines the props required for the VideoSection component
interface VideoSectionProps {
  videoId: string; // Unique identifier for the video
}

// VideoSection component - Handles video rendering with suspense and error boundaries
export const VideoSection = ({ videoId }: VideoSectionProps) => {
  return (
    <Suspense fallback={<p>loading...</p>}>
      <ErrorBoundary fallback={<p>Error..</p>}>
        <VideoSectionSuspense videoId={videoId} />
      </ErrorBoundary>
    </Suspense>
  );
};

// VideoSectionSuspense component - Fetches video data and renders the video player
const VideoSectionSuspense = ({ videoId }: VideoSectionProps) => {
  const { isSignedIn } = useAuth(); // Check if the user is signed in
  const utils = trpc.useUtils(); // Utility functions for cache invalidation

  // Fetch video details using suspense query
  const [video] = trpc.videos.getOne.useSuspenseQuery({ id: videoId });

  // Mutation to create a video view when the video is played
  const createView = trpc.videoViews.create.useMutation({
    onSuccess: () => {
      utils.videos.getOne.invalidate({ id: videoId }); // Invalidate cache to update view count
    },
  });

  // Registers a new view if the user is signed in
  const handlePlay = () => {
    if (!isSignedIn) return;

    createView.mutate({ videoId }); // Send request to create a new video view
  };

  return (
    <>
      {/* Video Player Container */}
      <div
        className={cn(
          "aspect-video bg-black rounded-xl overflow-hidden relative",
          video.muxStatus !== "ready" && "rounded-b-none"
        )}
      >
        {/* Video Player */}
        <VideoPlayer
          autoPlay
          onPlay={handlePlay} // Trigger view creation on play
          playbackId={video.muxPlaybackId}
          thumbnailUrl={video.thumbnailUrl}
        />
      </div>

      {/* Video Status Banner */}
      <VideoBanner status={video.muxStatus} />

      {/* Video Details (Title, Actions, etc.) */}
      <VideoTopRow video={video} />
    </>
  );
};
