import { relations } from "drizzle-orm";
import {
  integer,
  pgEnum,
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

// Enum type to define video visibility options
export const videoVisibility = pgEnum("video_visibility", [
  "private",
  "public",
]);

// ========================
// VIDEOS TABLE DEFINITION
// ========================
export const videos = pgTable("videos", {
  id: uuid("id").primaryKey().defaultRandom(), // Unique video identifier (UUID)

  title: text("title").notNull(), // Video title (required)
  description: text("description"), // Optional video description

  muxStatus: text("mux_status"), // Status of the video on Mux (e.g., "waiting", "ready", "errored")
  muxAssetId: text("mux_asset_id").unique(), // Unique Mux asset ID, used to manage videos on Mux
  muxUploadId: text("mux_upload_id").unique(), // Unique Mux upload ID, associated with the video upload process
  muxPlaybackId: text("mux_playback_id").unique(), // Unique Mux playback ID for streaming access
  muxTrackId: text("mux_track_id").unique(), // Unique Mux track ID (e.g., for subtitles or alternate audio tracks)
  muxTrackStatus: text("mux_track_status"), // Status of the associated Mux track

  thumbnailUrl: text("thumbnail_url"), // URL of the video's thumbnail image
  previewUrl: text("preview_url"), // URL for a short preview animation (e.g., GIF)

  duration: integer("duration").default(0).notNull(), // Video duration in milliseconds (default is 0)

  visibility: videoVisibility("visibility").default("private").notNull(), // Video visibility (default: private)

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" }) // Links video to user; deletes videos if user is removed
    .notNull(),

  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null", // If category is deleted, video remains but category is set to null
  }),

  createdAt: timestamp("created_at").defaultNow().notNull(), // Timestamp when the video is created
  updatedAt: timestamp("updated_at").defaultNow().notNull(), // Timestamp when the video is last updated
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
