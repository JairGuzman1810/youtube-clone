import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET; // Retrieves the Mux webhook secret from environment variables

// Defines the possible webhook events that can be received from Mux
type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent;

// Handles incoming POST requests for Mux webhooks
export const POST = async (request: Request) => {
  if (!SIGNING_SECRET) throw new Error("MUX_WEBHOOK_SECRET is not set"); // Ensures the signing secret is available

  const headersPayload = await headers(); // Retrieves request headers
  const muxSignature = headersPayload.get("mux-signature"); // Extracts the Mux signature from headers

  if (!muxSignature) return new Response("No signature found", { status: 401 }); // Rejects the request if no signature is provided

  const payload = await request.json(); // Parses the incoming JSON payload
  const body = JSON.stringify(payload); // Converts the payload to a string for verification

  // Verifies the webhook signature to ensure authenticity
  mux.webhooks.verifySignature(
    body,
    {
      "mux-signature": muxSignature,
    },
    SIGNING_SECRET
  );

  // Processes the webhook event based on its type
  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

      if (!data.upload_id) {
        return new Response("No upload ID found", { status: 400 }); // Returns an error if the upload ID is missing
      }

      // Updates the database to associate the Mux asset ID with the corresponding video
      await db
        .update(videos)
        .set({ muxAssetId: data.id, muxStatus: data.status })
        .where(eq(videos.muxUploadId, data.upload_id));

      break;
    }
  }

  return new Response("Webhook received", { status: 200 }); // Sends a success response after processing the webhook
};
