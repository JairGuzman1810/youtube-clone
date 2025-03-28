"use client";
// Ensures this file runs in a client component

import { APP_URL } from "@/constants";
import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { useState } from "react";
import superjson from "superjson";
import { makeQueryClient } from "./query-client";
import type { AppRouter } from "./routers/_app";

// Create TRPC instance for React Query
export const trpc = createTRPCReact<AppRouter>();

let clientQueryClientSingleton: QueryClient;

/**
 * Retrieves a QueryClient instance.
 * - On the server: Creates a new instance for each request.
 * - On the client: Uses a singleton to persist cache across renders.
 */
function getQueryClient() {
  if (typeof window === "undefined") {
    return makeQueryClient(); // Always create a new query client on the server
  }
  return (clientQueryClientSingleton ??= makeQueryClient()); // Use a singleton in the browser
}

/**
 * Constructs the TRPC API URL dynamically.
 * - Uses `window` for client-side requests.
 * - Uses environment variables for server-side requests.
 */
function getUrl() {
  const base = (() => {
    if (typeof window !== "undefined") return ""; // Use relative URL in browser
    if (APP_URL) return `https://${APP_URL}`; // Use Vercel deployment URL
    return "http://localhost:3000"; // Fallback for local development
  })();
  return `${base}/api/trpc`; // Append TRPC endpoint
}

/**
 * TRPCProvider component that wraps the application with TRPC and React Query providers.
 * Ensures proper query management and API communication.
 */
export function TRPCProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>
) {
  // Initialize Query Client (avoid useState unless necessary to prevent resets)
  const queryClient = getQueryClient();

  // Create TRPC client (memoized with useState to prevent re-creation)
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          transformer: superjson, // Enable SuperJSON for data serialization
          url: getUrl(), // Set TRPC API URL
          async headers() {
            const headers = new Headers();
            headers.set("x-trpc-source", "nextjs-react"); // Custom header to track requests
            return headers;
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
