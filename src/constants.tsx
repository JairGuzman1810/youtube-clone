// Define the default pagination limit for fetching studio data
export const DEFAULT_LIMIT = 5; // Limits the number of results per request to improve performance

// Define the base application URL, sourced from environment variables
// Crucial to modify in .env to production domain (including protocol)
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
