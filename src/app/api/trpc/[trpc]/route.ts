import { createTRPCContext } from "@/trpc/init";
import { appRouter } from "@/trpc/routers/_app";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// Define a request handler for TRPC API requests
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc", // API endpoint for TRPC
    req, // Incoming request
    router: appRouter, // The main TRPC router that defines all API routes
    createContext: createTRPCContext, // Function to create the request context (e.g., auth, DB connections)
  });

// Export the handler for both GET and POST requests
export { handler as GET, handler as POST };
