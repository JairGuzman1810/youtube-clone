import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

// Defines the structure of the request payload for the workflow
interface InputType {
  userId: string;
  videoId: string;
}

// System prompt instructing AI on how to summarize the transcript
const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines:
- Be brief. Condense the content into a summary that captures the key points and main ideas without losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 sentences long and no more than 200 characters.`;

// Define the POST handler for the Upstash Workflow
export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType; // Extract request payload
  const { videoId, userId } = input; // Destructure videoId and userId from input

  // Fetch video details from the database
  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId))); // Query database for video

    if (!existingVideo) throw new Error("Not found"); // Ensure the video exists

    return existingVideo; // Return video details
  });

  // Retrieve the transcript from Mux
  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`; // Construct Mux transcript URL
    const response = await fetch(trackUrl); // Fetch transcript text
    const text = response.text(); // Extract text from response

    if (!text) throw new Error("Bad request"); // Ensure transcript retrieval success

    return text; // Return transcript content
  });

  // Send the transcript to OpenAI via OpenRouter API for description generation
  const { body } = await context.api.openai.call("generate-description", {
    baseURL: "https://openrouter.ai/api", // API base URL
    token: process.env.OPEN_ROUTER_API_KEY!, // API authentication token
    operation: "chat.completions.create", // OpenAI operation for text generation
    body: {
      model: "deepseek/deepseek-r1:free", // AI model for text generation
      messages: [
        { role: "system", content: DESCRIPTION_SYSTEM_PROMPT }, // System instructions
        { role: "user", content: transcript }, // Transcript as user input
      ],
    },
  });

  const description = body.choices[0]?.message.content; // Extract AI-generated description
  if (!description) throw new Error("Bad request"); // Ensure AI returns a valid description

  // Update the video record with the generated description
  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({ description }) // Update video description field
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId))); // Match the correct video entry
  });
});
