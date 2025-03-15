import "server-only"; // <-- ensure this file cannot be imported from the client

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { cache } from "react";
import { createCallerFactory, createTRPCContext } from "./init";
import { makeQueryClient } from "./query-client";
import { appRouter } from "./routers/_app";

// Create a stable QueryClient instance that persists throughout the request lifecycle.
export const getQueryClient = cache(makeQueryClient);

// Create a TRPC caller instance for executing API calls server-side.
const caller = createCallerFactory(appRouter)(createTRPCContext);

// Generate TRPC hydration helpers for React Server Components (RSC).
export const { trpc, HydrateClient } = createHydrationHelpers<typeof appRouter>(
  caller,
  getQueryClient
);
