import { db } from "@/db";
import { users } from "@/db/schema";
import { ratelimit } from "@/lib/ratelimit";
import { auth } from "@clerk/nextjs/server";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { cache } from "react";
import superjson from "superjson";

// Create TRPC context with authentication information
export const createTRPCContext = cache(async () => {
  const { userId } = await auth(); // Get the authenticated user's ID from Clerk
  return { clerkUserId: userId }; // Return context with the Clerk user ID
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>; // Define the TRPC context type

// Initialize TRPC with context
const t = initTRPC.context<Context>().create({
  transformer: superjson, // Enable data transformation with SuperJSON
});

// Base router and procedure helpers
export const createTRPCRouter = t.router; // Create a TRPC router
export const createCallerFactory = t.createCallerFactory; // Factory for TRPC caller
export const baseProcedure = t.procedure; // Base procedure for TRPC operations

// Protected procedure middleware to enforce authentication
export const protectedProcedure = t.procedure.use(async function isAuthed(
  opts
) {
  const { ctx } = opts;

  if (!ctx.clerkUserId) {
    throw new TRPCError({ code: "UNAUTHORIZED" }); // Reject if user is not authenticated
  }

  // Fetch user from the database using Clerk ID
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, ctx.clerkUserId))
    .limit(1);

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED" }); // Reject if user not found in the database
  }

  // Apply rate limiting based on user ID
  const { success } = await ratelimit.limit(user.id);

  if (!success) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS" }); // Reject if rate limit is exceeded
  }

  return opts.next({
    ctx: { ...ctx, user }, // Pass user data into the request context
  });
});
