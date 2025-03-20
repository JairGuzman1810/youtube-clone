import { Client } from "@upstash/workflow";

// Initialize Upstash Workflow client with authentication token
export const workflow = new Client({ token: process.env.QSTASH_TOKEN! });
