// Define the default pagination limit for fetching studio data
export const DEFAULT_LIMIT = 5; // Limits the number of results per request to improve performance

// Define the base application URL, sourced from environment variables
export const APP_URL = process.env.VERCEL_URL; // TODO: Change to a custom environment variable if deploying outside Vercel
