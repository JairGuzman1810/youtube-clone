import { relations } from "drizzle-orm";
import {
  foreignKey,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";

// Enum defining possible reaction types
export const reactionType = pgEnum("reaction_type", ["like", "dislike"]);

// ========================
// PLAYLIST VIDEOS TABLE DEFINITION
// ========================
export const playlistVideos = pgTable(
  "playlist_videos", // Table name: "playlist_videos"
  {
    playlistId: uuid("playlist_id")
      .references(() => playlists.id, {
        onDelete: "cascade",
      }) // Foreign key linking to the associated playlist
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, {
        onDelete: "cascade",
      }) // Foreign key linking to the associated video
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(), // Auto-filled timestamp on creation
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Auto-filled timestamp on update
  },
  (t) => [
    primaryKey({
      name: "playlist_videos_pk",
      columns: [t.playlistId, t.videoId], // Composite primary key (playlistId, videoId) ensures unique video entries in a playlist
    }),
  ]
);

// Define relationships for playlist videos
export const playlistVideoRelations = relations(playlistVideos, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistVideos.playlistId],
    references: [playlists.id],
  }), // A playlist video entry belongs to one playlist
  video: one(videos, {
    fields: [playlistVideos.videoId],
    references: [videos.id],
  }), // A playlist video entry is associated with one video
}));

// ========================
// PLAYLISTS TABLE DEFINITION
// ========================
export const playlists = pgTable(
  "playlists", // Table name: "playlists"
  {
    id: uuid("id").primaryKey().defaultRandom(), // Primary key with a random UUID
    name: text("name").notNull(), // Playlist name
    description: text("description"), // Optional playlist description
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" }) // Foreign key linking to the user who owns the playlist
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(), // Auto-filled timestamp on creation
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Auto-filled timestamp on update
  }
);

// Define relationships for playlists
export const playlistRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }), // A playlist belongs to one user
  playlistVideos: many(playlistVideos), // A playlist can contain multiple videos
}));

// ========================
// USERS TABLE DEFINITION
// ========================
export const users = pgTable(
  "users", // Table name: "users"
  {
    id: uuid("id").primaryKey().defaultRandom(), // Primary key with a random UUID
    clerkId: text("clerk_id").unique().notNull(), // Unique Clerk ID for authentication
    name: text("name").notNull(), // User's name
    bannerUrl: text("banner_url"), // Public URL of the user's banner image
    bannerKey: text("banner_key"), // UploadThing file identifier for the stored banner image
    imageUrl: text("image_url").notNull(), // URL to user's profile image
    createdAt: timestamp("created_at").defaultNow().notNull(), // Auto-filled timestamp on creation
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Auto-filled timestamp on update
  },
  (t) => [uniqueIndex("clerk_id_index").on(t.clerkId)] // Unique index for Clerk ID
);

// Define relationships for users
export const userRelations = relations(users, ({ many }) => ({
  videos: many(videos), // One user can upload multiple videos
  videoViews: many(videoViews), // One user can view multiple videos
  videoReactions: many(videoReactions), // One user can react to multiple videos (likes/dislikes)
  subscriptions: many(subscriptions, {
    relationName: "subscriptions_viewer_id_fkey", // User as a subscriber (viewer)
  }),
  subscribers: many(subscriptions, {
    relationName: "subscriptions_creator_id_fkey", // User as a creator being subscribed to
  }),
  comments: many(comments), // One user can post multiple comments
  commentReactions: many(commentReactions), // One user can react to multiple comments (likes/dislikes)
  playlists: many(playlists), // One user can create multiple playlists
}));

// ========================
// SUBSCRIPTIONS TABLE DEFINITION
// ========================
export const subscriptions = pgTable(
  "subscriptions", // Table name: "subscriptions"
  {
    viewerId: uuid("viewer_id")
      .references(() => users.id, { onDelete: "cascade" }) // Foreign key linking to the subscribing user
      .notNull(),
    creatorId: uuid("creator_id")
      .references(() => users.id, { onDelete: "cascade" }) // Foreign key linking to the subscribed creator
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(), // Auto-filled timestamp on creation
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Auto-filled timestamp on update
  },
  (t) => [
    primaryKey({
      name: "subscriptions_pk",
      columns: [t.viewerId, t.creatorId], // Composite primary key (viewerId, creatorId) ensures unique subscriptions
    }),
  ]
);

// Define relationships for subscriptions
export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
  viewer: one(users, {
    fields: [subscriptions.viewerId], // Foreign key field in "subscriptions"
    references: [users.id], // References "users.id"
    relationName: "subscriptions_viewer_id_fkey",
  }),
  creator: one(users, {
    fields: [subscriptions.creatorId], // Foreign key field in "subscriptions"
    references: [users.id], // References "users.id"
    relationName: "subscriptions_creator_id_fkey",
  }),
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

  thumbnailKey: text("thumbnail_key"), // UploadThing file identifier for the stored thumbnail image
  thumbnailUrl: text("thumbnail_url"), // Public URL of the video's thumbnail image
  previewKey: text("preview_key"), // UploadThing file identifier for the stored preview animation
  previewUrl: text("preview_url"), // Public URL for a short preview animation (e.g., GIF)

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

// Schemas for video operations
export const videoInsertSchema = createInsertSchema(videos); // Schema for inserting a new video
export const videoUpdateSchema = createUpdateSchema(videos); // Schema for updating an existing video
export const videosSelectSchema = createSelectSchema(videos); // Schema for selecting video data

// Define relationships for videos
export const videoRelations = relations(videos, ({ one, many }) => ({
  user: one(users, {
    fields: [videos.userId], // Foreign key field in "videos"
    references: [users.id], // References "users.id"
  }),
  category: one(categories, {
    fields: [videos.categoryId], // Foreign key field in "videos"
    references: [categories.id], // References "categories.id"
  }),
  views: many(videoViews), // A video can have multiple views
  reactions: many(videoReactions), // A video can have multiple reactions
  comments: many(comments), // A video can have multiple comments
  playlistVideos: many(playlistVideos), // A video can be added to multiple playlists
}));

// ========================
// COMMENTS TABLE DEFINITION
// ========================
export const comments = pgTable(
  "comments", // Table name: "comments"
  {
    id: uuid("id").primaryKey().defaultRandom(), // Unique identifier for the comment
    parentId: uuid("parent_id"), // If null, it's a main comment; if set, it's a reply to another comment
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" }) // Links comment to user; deletes comments if user is removed
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" }) // Links comment to video; deletes comments if video is removed
      .notNull(),
    value: text("value").notNull(), // Text content of the comment
    createdAt: timestamp("created_at").defaultNow().notNull(), // Timestamp when the comment is created
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Timestamp when the comment is last updated
  },
  (t) => {
    return [
      foreignKey({
        columns: [t.parentId], // Foreign key referencing the parent comment
        foreignColumns: [t.id], // Links to another comment in the same table
        name: "comments_parent_id_fkey",
      }).onDelete("cascade"), // If a parent comment is deleted, its replies are also deleted
    ];
  }
);

// Define relationships for comments
export const commentRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId], // Foreign key field in "comments"
    references: [users.id], // References "users.id"
  }),
  video: one(videos, {
    fields: [comments.videoId], // Foreign key field in "comments"
    references: [videos.id], // References "videos.id"
  }),
  parent: one(comments, {
    fields: [comments.parentId], // References the parent comment (if it's a reply)
    references: [comments.id], // Links back to the comment ID
    relationName: "comments_parent_id_fkey",
  }),
  reactions: many(commentReactions), // A comment can have multiple reactions (likes/dislikes)
  replies: many(comments, { relationName: "comments_parent_id_fkey" }), // A comment can have multiple replies
}));

// Schemas for comment operations
export const commentSelectSchema = createSelectSchema(comments); // Schema for selecting comment data
export const commentInsertSchema = createInsertSchema(comments); // Schema for inserting a new comment
export const commentUpdateSchema = createUpdateSchema(comments); // Schema for updating an existing comment

// ============================
// COMMENT REACTIONS TABLE DEFINITION
// ============================
export const commentReactions = pgTable(
  "comment_reactions", // Table name: "comment_reactions"
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" }) // Links reaction to user; deletes reactions if user is removed
      .notNull(),
    commentId: uuid("comment_id")
      .references(() => comments.id, { onDelete: "cascade" }) // Links reaction to comment; deletes reactions if comment is removed
      .notNull(),
    type: reactionType("type").notNull(), // Specifies the type of reaction (like/dislike)
    createdAt: timestamp("created_at").defaultNow().notNull(), // Timestamp when the reaction is created
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Timestamp when the reaction is updated
  },
  (t) => [
    primaryKey({
      name: "comment_reactions_pk",
      columns: [t.userId, t.commentId], // Composite primary key (userId, commentId)
    }),
  ]
);

// Define relationships for comment reactions
export const commentReactionRelations = relations(
  commentReactions,
  ({ one }) => ({
    user: one(users, {
      fields: [commentReactions.userId], // Foreign key field in "comment_reactions"
      references: [users.id], // References "users.id"
    }),
    comment: one(comments, {
      fields: [commentReactions.commentId], // Foreign key field in "comment_reactions"
      references: [comments.id], // References "comments.id"
    }),
  })
);

// ========================
// VIDEO VIEWS TABLE DEFINITION
// ========================
export const videoViews = pgTable(
  "video_views", // Table name: "video_views"
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" }) // Links view to user; deletes views if user is removed
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" }) // Links view to video; deletes views if video is removed
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(), // Timestamp when the view is created
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Timestamp when the view is updated
  },
  (t) => [
    primaryKey({ name: "video_views_pk", columns: [t.userId, t.videoId] }), // Composite primary key (userId, videoId)
  ]
);

// Define relationships for video views
export const videoViewRelations = relations(videoViews, ({ one }) => ({
  user: one(users, {
    fields: [videoViews.userId], // Foreign key field in "video_views"
    references: [users.id], // References "users.id"
  }),
  video: one(videos, {
    fields: [videoViews.videoId], // Foreign key field in "video_views"
    references: [videos.id], // References "videos.id"
  }),
}));

// Schemas for video view operations
export const videoViewSelectSchema = createSelectSchema(videoViews); // Schema for selecting video view data
export const videoViewInsertSchema = createInsertSchema(videoViews); // Schema for inserting a new video view
export const videoViewUpdateSchema = createUpdateSchema(videoViews); // Schema for updating an existing video view

// ========================
// VIDEO REACTIONS TABLE DEFINITION
// ========================
export const videoReactions = pgTable(
  "video_reactions", // Table name: "video_reactions"
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" }) // Links reaction to user; deletes reactions if user is removed
      .notNull(),
    videoId: uuid("video_id")
      .references(() => videos.id, { onDelete: "cascade" }) // Links reaction to video; deletes reactions if video is removed
      .notNull(),
    type: reactionType("type").notNull(), // Specifies the type of reaction (like/dislike)
    createdAt: timestamp("created_at").defaultNow().notNull(), // Timestamp when the reaction is created
    updatedAt: timestamp("updated_at").defaultNow().notNull(), // Timestamp when the reaction is updated
  },
  (t) => [
    primaryKey({ name: "video_reactions_pk", columns: [t.userId, t.videoId] }), // Composite primary key (userId, videoId)
  ]
);

// Define relationships for video reactions
export const videoReactionRelations = relations(videoReactions, ({ one }) => ({
  user: one(users, {
    fields: [videoReactions.userId], // Foreign key field in "video_reactions"
    references: [users.id], // References "users.id"
  }),
  video: one(videos, {
    fields: [videoReactions.videoId], // Foreign key field in "video_reactions"
    references: [videos.id], // References "videos.id"
  }),
}));

// Schemas for video reaction operations
export const videoReactionSelectSchema = createSelectSchema(videoReactions); // Schema for selecting video reaction data
export const videoReactionInsertSchema = createInsertSchema(videoReactions); // Schema for inserting a new video reaction
export const videoReactionUpdateSchema = createUpdateSchema(videoReactions); // Schema for updating an existing video reaction
