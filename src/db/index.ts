import { drizzle } from "drizzle-orm/neon-http";
// Initialize the Drizzle ORM instance using the database URL from environment variables
export const db = drizzle(process.env.DATABASE_URL!);
