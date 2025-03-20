import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

// Defines the structure of the request payload for the workflow
interface InputType {
  userId: string; // ID of the user requesting the title generation
  videoId: string; // ID of the video for which the title is being generated
}

// System prompt instructing AI on how to generate an SEO-friendly title
const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting.`;

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

  // Send the transcript to OpenAI via OpenRouter API for title generation
  const { body } = await context.api.openai.call("generate-title", {
    baseURL: "https://openrouter.ai/api", // API base URL
    token: process.env.OPEN_ROUTER_API_KEY!, // API authentication token
    operation: "chat.completions.create", // OpenAI operation for text generation
    body: {
      model: "deepseek/deepseek-r1:free", // AI model for text generation
      messages: [
        { role: "system", content: TITLE_SYSTEM_PROMPT }, // System instructions
        { role: "user", content: transcript }, // Transcript as user input
      ],
    },
  });

  const title = body.choices?.[0]?.message?.content; // Extract AI-generated title
  if (!title) throw new Error("Bad request"); // Ensure AI returns a valid title

  // Update the video record with the generated title
  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({ title }) // Update video title field
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId))); // Match the correct video entry
  });
});
