import { DEFAULT_LIMIT } from "@/constants";
import { SubscribedView } from "@/modules/home/ui/views/subscribed-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Force dynamic rendering for this page (no static generation)
export const dynamic = "force-dynamic";

// Async page component that fetches and renders subscribed videos
const Page = async () => {
  // Pre-fetch the subscribed video data for faster client-side rendering
  void trpc.videos.getManySubscribed.prefetchInfinite({
    limit: DEFAULT_LIMIT, // Limit the number of subscribed videos per request
  });

  return (
    // Hydrate the client to ensure TRPC data is available on the client-side
    <HydrateClient>
      {/* Render the subscribed view with the user's subscribed videos */}
      <SubscribedView />
    </HydrateClient>
  );
};

export default Page;
