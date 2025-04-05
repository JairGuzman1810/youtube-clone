import { db } from "@/db";
import { users } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

// GET - Fetches user data based on authentication and redirects accordingly
export const GET = async () => {
  // Auth - Retrieves userId from authentication session
  const { userId } = await auth();

  // Check if userId is not found, then redirects to sign-in page
  if (!userId) {
    return redirect("/sign-in");
  }

  // Query the database to check if the user exists based on clerkId
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId));

  // If no user is found in the database, redirect to sign-in page
  if (!existingUser) {
    return redirect("/sign-in");
  }

  // Redirect to the user's profile page if the user is authenticated and exists
  return redirect(`/users/${existingUser.id}`);
};
