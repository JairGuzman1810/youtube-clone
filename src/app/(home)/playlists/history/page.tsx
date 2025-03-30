import { DEFAULT_LIMIT } from "@/constants";
import { HistoryView } from "@/modules/playlists/ui/views/history-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Force dynamic rendering for this page (no static generation)
export const dynamic = "force-dynamic";

// Async page component that fetches and renders the video watch history
const Page = async () => {
  // Pre-fetch the video history data for faster client-side rendering
  void trpc.playlists.getHistory.prefetchInfinite({
    limit: DEFAULT_LIMIT, // Limit the number of history videos per request
  });

  return (
    // Hydrate the client to ensure TRPC data is available on the client-side
    <HydrateClient>
      {/* Render the history view with the user's watched videos */}
      <HistoryView />
    </HydrateClient>
  );
};

export default Page;
