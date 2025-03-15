import { HomeView } from "@/modules/home/ui/views/home-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Enforce dynamic rendering for this page
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ categoryId?: string }>; // Defines the expected structure of search parameters
}

// Async page component that fetches data based on search parameters
const Page = async ({ searchParams }: PageProps) => {
  const { categoryId } = await searchParams; // Await search parameters to extract categoryId

  // Prefetch category data for better performance and hydration
  void trpc.categories.getMany.prefetch();

  return (
    <HydrateClient>
      {/* Ensures server-fetched data is available on the client */}
      <HomeView categoryId={categoryId} />
      {/* Render the home view with the selected category */}
    </HydrateClient>
  );
};

export default Page;
