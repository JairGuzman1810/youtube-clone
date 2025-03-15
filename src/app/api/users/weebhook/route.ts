import { db } from "@/db";
import { users } from "@/db/schema";
import { WebhookEvent } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { Webhook } from "svix";

const SIGNING_SECRET = process.env.SIGNING_SECRET; // Retrieves the webhook signing secret from environment variables

export async function POST(req: Request) {
  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env"
    ); // Throws an error if the signing secret is missing
  }

  // Creates a new Svix instance to verify webhook signatures
  const wh = new Webhook(SIGNING_SECRET);

  // Retrieves headers from the request
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id"); // Unique identifier for the webhook event
  const svix_timestamp = headerPayload.get("svix-timestamp"); // Timestamp of the webhook event
  const svix_signature = headerPayload.get("svix-signature"); // Signature to verify webhook authenticity

  // Returns an error response if any required headers are missing
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Parses the incoming JSON payload
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verifies the webhook payload against the signature to ensure authenticity
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err); // Logs verification failure
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Extracts the event type from the verified webhook
  const eventType = evt.type;

  // Handles user creation event by inserting new user data into the database
  if (eventType === "user.created") {
    const { data } = evt;

    await db.insert(users).values({
      clerkId: data.id, // Stores Clerk user ID
      name: `${data.first_name} ${data.last_name}`, // Combines first and last name
      imageUrl: data.image_url, // Stores user's profile image URL
    });
  }

  // Handles user deletion event by removing the user from the database
  if (eventType === "user.deleted") {
    const { data } = evt;
    if (!data.id) {
      return new Response("Missing user ID", { status: 400 }); // Ensures a valid user ID is provided
    }
    await db.delete(users).where(eq(users.clerkId, data.id)); // Deletes the user by Clerk ID
  }

  // Handles user update event by modifying existing user data in the database
  if (eventType === "user.updated") {
    const { data } = evt;
    await db
      .update(users)
      .set({
        name: `${data.first_name} ${data.last_name}`, // Updates user's name
        imageUrl: data.image_url, // Updates user's profile image URL
      })
      .where(eq(users.clerkId, data.id)); // Finds the user by Clerk ID
  }

  return new Response("Webhook received", { status: 200 }); // Responds with success after processing the webhook
}
