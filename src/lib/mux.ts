import Mux from "@mux/mux-node";

// Initializes a Mux instance for handling video processing and streaming
export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID, // Retrieves the Mux API token ID from environment variables
  tokenSecret: process.env.MUX_TOKEN_SECRET, // Retrieves the Mux API token secret from environment variables
});
