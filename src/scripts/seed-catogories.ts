import { db } from "@/db";
import { categories } from "@/db/schema";

// Script to seed categories into the database

// List of predefined category names
const categoryNames = [
  "Cars and vehicles",
  "Comedy",
  "Education",
  "Gaming",
  "Entertainment",
  "Film and animation",
  "How-to and style",
  "Music",
  "News and politics",
  "People and blogs",
  "Pets and animals",
  "Science and technology",
  "Sports",
  "Travel and events",
];

// Main function to insert categories into the database
async function main() {
  console.log("Seeding categories...");

  try {
    // Map category names to database insert values
    const values = categoryNames.map((name) => ({
      name,
      description: `Videos related to ${name.toLowerCase()}`, // Generate descriptions dynamically
    }));

    await db.insert(categories).values(values); // Insert categories into the database
    console.log("Categories seeded successfully!");
  } catch (error) {
    console.error("Error seeding categories: ", error);
    process.exit(1); // Exit the process with failure status if an error occurs
  }
}

main(); // Execute the seeding script
