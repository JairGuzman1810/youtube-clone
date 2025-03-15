import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

// ========================
// USERS TABLE DEFINITION
// ========================
export const users = pgTable(
  "users", // Table name: "users"
  {
    id: uuid("id").primaryKey().defaultRandom(), // Primary key with a random UUID
    clerkId: text("clerk_id").unique().notNull(), // Unique Clerk ID for authentication
    name: text("name").notNull(), // User's name
    // TODO: Add banner fields (for future expansion)
    imageUrl: text("image_url").notNull(), // URL to user's profile image
    createdAt: timestamp("created_at").defaultNow().notNull(), // Auto-filled timestamp on creation
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Auto-filled timestamp on update
  },
  (t) => [uniqueIndex("clerk_id_index").on(t.clerkId)] // Unique index for Clerk ID
);

// Define relationships for users
export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos), // One user can have many videos
}));

// ========================
// CATEGORIES TABLE DEFINITION
// ========================
export const categories = pgTable(
  "categories", // Table name: "categories"
  {
    id: uuid("id").primaryKey().defaultRandom(), // Primary key with a random UUID
    name: text("name").notNull().unique(), // Unique category name
    description: text("description"), // Optional category description
    createdAt: timestamp("created_at").defaultNow().notNull(), // Timestamp when category is created
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Timestamp when category is updated
  },
  (t) => [uniqueIndex("name_index").on(t.name)] // Unique index for category name
);

// Define relationships for categories
export const categoryRelations = relations(categories, ({ many }) => ({
  videos: many(videos), // One category can have many videos
}));

// ========================
// VIDEOS TABLE DEFINITION
// ========================
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(), // Primary key with a random UUID
  title: text("title").notNull(), // Video title
  description: text("description"), // Video description
  muxStatus: text("mux_status"), // Status of the video on Mux (e.g., waiting)
  muxAssetId: text("mux_asset_id").unique(), // Unique Mux asset ID for the video
  muxUploadId: text("mux_upload_id").unique(), // Unique Mux upload ID associated with the video
  muxPlaybackId: text("mux_playback_id").unique(), // Unique Mux playback ID for streaming the video
  muxTrackId: text("mux_track_id").unique(), // Unique ID for the Mux track (e.g., subtitles or alternate audio)
  muxTrackStatus: text("mux_track_status"), // Status of the Mux track
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }) // Foreign key: if user is deleted, delete their videos
    .notNull(),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null", // If category is deleted, keep videos but set category to null
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(), // Timestamp when video is created
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Timestamp when video is updated
});

// Define relationships for videos
export const videoRelations = relations(videos, ({ one }) => ({
  user: one(users, {
    fields: [videos.userId], // Foreign key field in "videos"
    references: [users.id], // References "users.id"
  }),
  category: one(categories, {
    fields: [videos.categoryId], // Foreign key field in "videos"
    references: [categories.id], // References "categories.id"
  }),
}));
