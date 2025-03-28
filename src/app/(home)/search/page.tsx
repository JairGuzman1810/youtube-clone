import { DEFAULT_LIMIT } from "@/constants";
import { SearchView } from "@/modules/search/ui/views/search-view";
import { HydrateClient, trpc } from "@/trpc/server";

// Force dynamic rendering for this page (no static generation)
export const dynamic = "force-dynamic";

// Defines the expected structure of search parameters
interface PageProps {
  searchParams: Promise<{
    query: string | undefined; // Search query provided by the user
    categoryId: string | undefined; // Category ID for filtering search results (optional)
  }>;
}

// Async page component that fetches and renders search results based on the provided query and category ID
const Page = async ({ searchParams }: PageProps) => {
  const { query, categoryId } = await searchParams; // Extracts query and categoryId from the route parameters

  // Pre-fetch the categories data for faster client-side rendering
  void trpc.categories.getMany.prefetch(); // Fetches the available categories to display in the search filter

  // Pre-fetch the search results data for faster client-side rendering
  void trpc.search.getMany.prefetchInfinite({
    query, // The search query for fetching relevant results
    categoryId, // Optional category filter to refine the search results
    limit: DEFAULT_LIMIT, // Limit the number of results per request
  });

  return (
    // Hydrate the client to ensure TRPC data is available on the client-side
    <HydrateClient>
      {/* Render the search view with the query and categoryId */}
      <SearchView query={query} categoryId={categoryId} />
    </HydrateClient>
  );
};

export default Page;
