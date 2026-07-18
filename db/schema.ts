import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

/* -------------------------------------------------------------------------- */
/* Phase 1 — created, seeded, and used                                        */
/* -------------------------------------------------------------------------- */

export const authors = pgTable("authors", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const stories = pgTable(
  "stories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    title: varchar("title", { length: 240 }).notNull(),
    excerpt: text("excerpt").notNull(),
    body: text("body").notNull(),
    coverImage: text("cover_image").notNull(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => authors.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    readingTimeMin: integer("reading_time_min").notNull().default(5),
    likesCount: integer("likes_count").notNull().default(0),
    commentsCount: integer("comments_count").notNull().default(0),
    featured: boolean("featured").notNull().default(false),
    publishedAt: timestamp("published_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("stories_category_idx").on(t.categoryId),
    index("stories_author_idx").on(t.authorId),
    index("stories_published_idx").on(t.publishedAt),
  ],
);

export const bookCollections = pgTable("book_collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: text("description"),
  emotionGoal: varchar("emotion_goal", { length: 160 }),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const books = pgTable("books", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  title: varchar("title", { length: 240 }).notNull(),
  author: varchar("author", { length: 200 }).notNull(),
  coverImage: text("cover_image").notNull(),
  description: text("description").notNull(),
  keyLessons: jsonb("key_lessons").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const bookCollectionBooks = pgTable(
  "book_collection_books",
  {
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => bookCollections.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.bookId, t.collectionId] })],
);

export const storyRelatedBooks = pgTable(
  "story_related_books",
  {
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.storyId, t.bookId] })],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    reviewerName: varchar("reviewer_name", { length: 160 }).notNull(),
    rating: integer("rating").notNull().default(5),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("reviews_book_idx").on(t.bookId)],
);

/* -------------------------------------------------------------------------- */
/* Roadmap — defined for forward-compatibility, NOT seeded/used in Phase 1    */
/* -------------------------------------------------------------------------- */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  // null for OAuth-only accounts (e.g. Google sign-in)
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  role: varchar("role", { length: 20 }).notNull().default("user"), // 'user' | 'admin'
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    // opaque random token, stored directly and referenced by the cookie
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("comments_story_idx").on(t.storyId)],
);

export const likes = pgTable(
  "likes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.storyId] })],
);

export const follows = pgTable(
  "follows",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    followingId: uuid("following_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followingId] })],
);

export const savedStories = pgTable(
  "saved_stories",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.storyId] })],
);

export const favoriteBooks = pgTable(
  "favorite_books",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    bookId: uuid("book_id")
      .notNull()
      .references(() => books.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.bookId] })],
);

export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 200 }).notNull().default("New chat"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("ai_conversations_user_idx").on(t.userId, t.updatedAt)],
);

export const aiMessages = pgTable(
  "ai_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => aiConversations.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 12 }).notNull(), // 'user' | 'assistant'
    content: text("content").notNull(),
    storySlugs: jsonb("story_slugs").$type<string[]>().notNull().default([]),
    bookSlugs: jsonb("book_slugs").$type<string[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("ai_messages_conversation_idx").on(t.conversationId)],
);

export const readingJourney = pgTable(
  "reading_journey",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    storyId: uuid("story_id")
      .notNull()
      .references(() => stories.id, { onDelete: "cascade" }),
    progress: integer("progress").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("reading_journey_user_idx").on(t.userId)],
);

/* -------------------------------------------------------------------------- */
/* Relations — REQUIRED for db.query.<table>.findMany({ with: {...} })        */
/* -------------------------------------------------------------------------- */

export const authorsRelations = relations(authors, ({ many }) => ({
  stories: many(stories),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  stories: many(stories),
}));

export const storiesRelations = relations(stories, ({ one, many }) => ({
  author: one(authors, {
    fields: [stories.authorId],
    references: [authors.id],
  }),
  category: one(categories, {
    fields: [stories.categoryId],
    references: [categories.id],
  }),
  relatedBooks: many(storyRelatedBooks),
}));

export const booksRelations = relations(books, ({ many }) => ({
  reviews: many(reviews),
  collections: many(bookCollectionBooks),
  relatedStories: many(storyRelatedBooks),
}));

export const bookCollectionsRelations = relations(
  bookCollections,
  ({ many }) => ({
    books: many(bookCollectionBooks),
  }),
);

export const bookCollectionBooksRelations = relations(
  bookCollectionBooks,
  ({ one }) => ({
    book: one(books, {
      fields: [bookCollectionBooks.bookId],
      references: [books.id],
    }),
    collection: one(bookCollections, {
      fields: [bookCollectionBooks.collectionId],
      references: [bookCollections.id],
    }),
  }),
);

export const storyRelatedBooksRelations = relations(
  storyRelatedBooks,
  ({ one }) => ({
    story: one(stories, {
      fields: [storyRelatedBooks.storyId],
      references: [stories.id],
    }),
    book: one(books, {
      fields: [storyRelatedBooks.bookId],
      references: [books.id],
    }),
  }),
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  book: one(books, {
    fields: [reviews.bookId],
    references: [books.id],
  }),
}));

export const aiConversationsRelations = relations(
  aiConversations,
  ({ many }) => ({
    messages: many(aiMessages),
  }),
);

export const aiMessagesRelations = relations(aiMessages, ({ one }) => ({
  conversation: one(aiConversations, {
    fields: [aiMessages.conversationId],
    references: [aiConversations.id],
  }),
}));

/* -------------------------------------------------------------------------- */
/* Inferred types                                                             */
/* -------------------------------------------------------------------------- */

export type Author = typeof authors.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type NewStory = typeof stories.$inferInsert;
export type Book = typeof books.$inferSelect;
export type BookCollection = typeof bookCollections.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type UserRole = "user" | "admin";
export type AiConversation = typeof aiConversations.$inferSelect;
export type AiMessage = typeof aiMessages.$inferSelect;
