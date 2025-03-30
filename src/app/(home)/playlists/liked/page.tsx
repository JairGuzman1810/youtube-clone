import { DEFAULT_LIMIT } from "@/constants";
import { LikedView } from "@/modules/playlists/ui/views/liked-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Force dynamic rendering for this page (no static generation)
export const dynamic = "force-dynamic";

// Async page component that fetches and renders the user's liked videos
const Page = async () => {
  // Pre-fetch the liked video data for faster client-side rendering
  void trpc.playlists.getLiked.prefetchInfinite({
    limit: DEFAULT_LIMIT, // Limit the number of liked videos per request
  });

  return (
    // Hydrate the client to ensure TRPC data is available on the client-side
    <HydrateClient>
      {/* Render the liked view with the user's liked videos */}
      <LikedView />
    </HydrateClient>
  );
};

export default Page;
