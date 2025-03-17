import { DEFAULT_LIMIT } from "@/constants";
import { StudioView } from "@/modules/studio/ui/views/studio-view";
import { HydrateClient, trpc } from "@/trpc/server";
// Define the Studio page component
const Page = async () => {
  // Prefetch studio data with infinite pagination for better performance
  void trpc.studio.getMany.prefetchInfinite({
    limit: DEFAULT_LIMIT, // Use the default limit for fetching data
  });

  return (
    <HydrateClient>
      {/* Hydrates the client with preloaded server data */}
      <StudioView /> {/* Render the studio view component */}
    </HydrateClient>
  );
};

export default Page;
