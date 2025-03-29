import { DEFAULT_LIMIT } from "@/constants";
import { TrendingView } from "@/modules/home/ui/views/trending-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Force dynamic rendering for this page (no static generation)
export const dynamic = "force-dynamic";

// Async page component that fetches and renders trending videos
const Page = async () => {
  // Pre-fetch the trending video data for faster client-side rendering
  void trpc.videos.getManyTrending.prefetchInfinite({
    limit: DEFAULT_LIMIT, // Limit the number of trending videos per request
  });

  return (
    // Hydrate the client to ensure TRPC data is available on the client-side
    <HydrateClient>
      {/* Render the trending view with the most watched videos */}
      <TrendingView />
    </HydrateClient>
  );
};

export default Page;
