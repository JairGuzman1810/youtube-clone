import { db } from "@/db";
import { categories } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

// Define the TRPC router for category-related API endpoints
export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async () => {
    // Fetch all categories from the database
    const data = await db.select().from(categories);

    // Return the list of categories
    return data;
  }),
});
