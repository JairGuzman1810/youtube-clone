import { DEFAULT_LIMIT } from "@/constants";
import { HomeView } from "@/modules/home/ui/views/home-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Force dynamic rendering for this page (no static generation)
export const dynamic = "force-dynamic";

// Defines the expected structure of search parameters
interface PageProps {
  searchParams: Promise<{ categoryId?: string }>; // Optional categoryId parameter for filtering videos by category
}

// Async page component that fetches and renders video data on the home page based on the provided category ID
const Page = async ({ searchParams }: PageProps) => {
  const { categoryId } = await searchParams; // Extracts the categoryId from the search parameters

  // Pre-fetch the categories data for faster client-side rendering
  void trpc.categories.getMany.prefetch(); // Fetches available categories for potential use in the view

  // Pre-fetch the video data for faster client-side rendering
  void trpc.videos.getMany.prefetchInfinite({
    categoryId, // Optional category filter to fetch videos within a specific category
    limit: DEFAULT_LIMIT, // Limit the number of results per request
  });

  return (
    // Hydrate the client to ensure TRPC data is available on the client-side
    <HydrateClient>
      {/* Render the home view with the categoryId as a prop */}
      <HomeView categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;
