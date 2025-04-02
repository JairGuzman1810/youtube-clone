import { DEFAULT_LIMIT } from "@/constants";
import { VideosView } from "@/modules/playlists/ui/views/videos-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Defines the properties for the playlist videos page
interface PageProps {
  params: Promise<{ playlistId: string }>; // Contains the playlist ID from the URL
}

// Force dynamic rendering for this page (no static generation)
export const dynamic = "force-dynamic";

// Page component for viewing videos from a specific playlist
const Page = async ({ params }: PageProps) => {
  const { playlistId } = await params;

  // Pre-fetch playlist details for faster client-side rendering
  void trpc.playlists.getOne.prefetch({
    id: playlistId,
  });

  // Pre-fetch videos from the playlist with pagination support
  void trpc.playlists.getVideos.prefetchInfinite({
    playlistId,
    limit: DEFAULT_LIMIT, // Limit the number of videos per request
  });

  return (
    // Hydrate the client to ensure TRPC data is available for client-side components
    <HydrateClient>
      {/* Render the VideosView component to display videos from the playlist */}
      <VideosView playlistId={playlistId} />
    </HydrateClient>
  );
};

export default Page;
