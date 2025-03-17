import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";

// Create and export route handlers for file uploads in Next.js App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter, // Use the defined file router for handling uploads
});
