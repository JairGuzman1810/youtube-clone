"use client"; // Indicates this component runs on the client side

import MuxPlayer from "@mux/mux-player-react";

// Props definition for the VideoPlayer component
interface VideoPlayerProps {
  playbackId?: string | null | undefined; // Mux playback ID for the video
  thumbnailUrl?: string | null | undefined; // URL for the video thumbnail
  autoPlay?: boolean; // Determines whether the video should autoplay
  onPlay?: () => void; // Callback function triggered when the video starts playing
}

// VideoPlayer component - Renders a video player using MuxPlayer
export const VideoPlayer = ({
  playbackId,
  thumbnailUrl,
  autoPlay,
  onPlay,
}: VideoPlayerProps) => {
  return (
    <MuxPlayer
      playbackId={playbackId || ""} // Provide a fallback empty string if playbackId is undefined
      poster={thumbnailUrl || "/placeholder.svg"} // Default poster image if no thumbnail is provided
      playerInitTime={0} // Initialize the player at the start of the video
      autoPlay={autoPlay} // Set autoplay behavior based on the provided prop
      thumbnailTime={0} // Set thumbnail display time at the beginning of the video
      className="size-full object-contain"
      accentColor="#FF2056" // Set the player’s accent color
      onPlay={onPlay} // Attach the play event callback function
    />
  );
};
