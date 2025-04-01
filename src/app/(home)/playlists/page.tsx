import { DEFAULT_LIMIT } from "@/constants";
import { PlaylistsView } from "@/modules/playlists/ui/views/playlists-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Async page component that fetches and renders playlists
const Page = async () => {
  // Pre-fetch playlist data for faster client-side rendering
  void trpc.playlists.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT, // Limit the number of playlists per request
  });

  return (
    // Hydrate the client to ensure TRPC data is available on the client-side
    <HydrateClient>
      {/* Render the playlist view with available playlists */}
      <PlaylistsView />
    </HydrateClient>
  );
};

export default Page;
