import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Middleware to protect specific routes using Clerk authentication

const isProtectedRouter = createRouteMatcher(["/studio(.*)"]); // Define protected routes (any path under /studio)

// Apply Clerk authentication middleware
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRouter(req)) await auth.protect(); // Require authentication for protected routes
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",

    // Always run middleware for API and TRPC routes
    "/(api|trpc)(.*)",
  ],
};
