import { db } from "@/db";
import { videos } from "@/db/schema";
import { mux } from "@/lib/mux";
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetDeletedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
} from "@mux/mux-node/resources/webhooks";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { UTApi } from "uploadthing/server";

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET; // Retrieves the Mux webhook secret from environment variables

// Defines the possible webhook events that can be received from Mux
type WebhookEvent =
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent;

// Handles incoming POST requests for Mux webhooks
export const POST = async (request: Request) => {
  if (!SIGNING_SECRET) throw new Error("MUX_WEBHOOK_SECRET is not set"); // Ensure the signing secret is configured

  const headersPayload = await headers(); // Retrieve request headers
  const muxSignature = headersPayload.get("mux-signature"); // Extract the Mux signature from headers

  if (!muxSignature) return new Response("No signature found", { status: 401 }); // Reject request if no signature is provided

  const payload = await request.json(); // Parse the incoming JSON payload
  const body = JSON.stringify(payload); // Convert the payload to a string for signature verification

  // Verify the webhook signature to ensure the request is legitimate
  mux.webhooks.verifySignature(
    body,
    { "mux-signature": muxSignature },
    SIGNING_SECRET
  );

  // Process the webhook event based on its type
  switch (payload.type as WebhookEvent["type"]) {
    case "video.asset.created": {
      // Handle event when a new video asset is created in Mux
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"];

      if (!data.upload_id) {
        return new Response("No upload ID found", { status: 400 }); // Return error if upload ID is missing
      }

      // Update the video record in the database with the Mux asset ID and status
      await db
        .update(videos)
        .set({ muxAssetId: data.id, muxStatus: data.status })
        .where(eq(videos.muxUploadId, data.upload_id));

      break;
    }

    case "video.asset.ready": {
      // Handle event when a video asset is fully processed and ready to stream
      const data = payload.data as VideoAssetReadyWebhookEvent["data"];

      // Extract the playback ID from the Mux webhook data
      const playbackId = data.playback_ids?.[0].id;

      // Ensure the upload ID is present in the webhook data
      if (!data.upload_id)
        return new Response("No upload ID found", { status: 400 });

      // Ensure a playback ID exists before proceeding
      if (!playbackId)
        return new Response("Missing playback ID", { status: 400 });

      // Construct temporary URLs for the video thumbnail and animated preview
      const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`;
      const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`;

      // Convert the video duration from seconds to milliseconds (if available)
      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      // Initialize the UploadThing API instance
      const utapi = new UTApi();

      // Upload the generated thumbnail and preview images from Mux to UploadThing
      const [uploadedThumbnail, uploadedPreview] =
        await utapi.uploadFilesFromUrl([tempThumbnailUrl, tempPreviewUrl]);

      // Ensure both thumbnail and preview were successfully uploaded
      if (!uploadedThumbnail.data || !uploadedPreview.data)
        return new Response("Failed to upload thumbnail or preview", {
          status: 500,
        });

      // Extract the file keys and URLs from the uploaded assets
      const { key: thumbnailKey, url: thumbnailUrl } = uploadedThumbnail.data;
      const { key: previewKey, url: previewUrl } = uploadedPreview.data;

      // Update the video record in the database with Mux playback details, thumbnail, preview, and duration
      await db
        .update(videos)
        .set({
          muxStatus: data.status, // Update the video processing status
          muxPlaybackId: playbackId, // Store the playback ID for streaming
          muxAssetId: data.id, // Store the Mux asset ID
          thumbnailUrl, // Save the new thumbnail URL
          thumbnailKey, // Save the UploadThing key for the thumbnail
          previewUrl, // Save the preview animation URL
          previewKey, // Save the UploadThing key for the preview
          duration, // Store the processed video duration
        })
        .where(eq(videos.muxUploadId, data.upload_id)); // Match the record using the original upload ID

      break;
    }

    case "video.asset.errored": {
      // Handle event when an error occurs during video processing
      const data = payload.data as VideoAssetErroredWebhookEvent["data"];

      if (!data.upload_id) {
        return new Response("Missing upload ID", { status: 400 });
      }

      // Update the database to reflect the error status
      await db
        .update(videos)
        .set({ muxStatus: data.status })
        .where(eq(videos.muxUploadId, data.upload_id));

      break;
    }

    case "video.asset.deleted": {
      // Handle event when a video asset is deleted from Mux
      const data = payload.data as VideoAssetDeletedWebhookEvent["data"];

      if (!data.upload_id) {
        return new Response("Missing upload ID", { status: 400 });
      }

      // Remove the corresponding video record from the database
      await db.delete(videos).where(eq(videos.muxUploadId, data.upload_id));

      break;
    }

    case "video.asset.track.ready": {
      // Handle event when an additional track (e.g., subtitles) is ready for a video asset
      const data = payload.data as VideoAssetTrackReadyWebhookEvent["data"] & {
        asset_id: string;
      };

      const assetId = data.asset_id;
      const trackId = data.id;
      const status = data.status;

      if (!assetId) return new Response("Missing asset ID", { status: 400 });

      // Update the database with the track details
      await db
        .update(videos)
        .set({ muxTrackId: trackId, muxTrackStatus: status })
        .where(eq(videos.muxAssetId, assetId));

      break;
    }
  }

  return new Response("Webhook received", { status: 200 }); // Send a success response after processing the webhook
};
