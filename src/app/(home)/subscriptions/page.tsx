import { DEFAULT_LIMIT } from "@/constants";
import { SubscriptionsView } from "@/modules/subscriptions/views/subscriptions-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Force dynamic rendering for this page (no static generation)
export const dynamic = "force-dynamic";

// Async page component that fetches and renders the list of user subscriptions
const Page = async () => {
  // Pre-fetch the subscription data for faster client-side rendering
  void trpc.subscriptions.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT, // Limit the number of subscriptions per request
  });

  return (
    // Hydrate the client to ensure TRPC data is available on the client-side
    <HydrateClient>
      {/* Render the subscriptions view with the list of followed users */}
      <SubscriptionsView />
    </HydrateClient>
  );
};

export default Page;
