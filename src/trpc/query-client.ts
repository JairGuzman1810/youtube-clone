import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
import superjson from "superjson";

// Function to create a new QueryClient instance with custom settings
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000, // Data remains fresh for 30 seconds before refetching
      },
      dehydrate: {
        serializeData: superjson.serialize, // Use SuperJSON for data serialization
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending", // Ensure pending queries are also dehydrated
      },
      hydrate: {
        deserializeData: superjson.deserialize, // Use SuperJSON for data deserialization
      },
    },
  });
}
