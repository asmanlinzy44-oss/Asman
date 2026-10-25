import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').default('student'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'user_notes' table with foreign key to users.uid
export const userNotes = pgTable('user_notes', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid)
    .notNull(),
  videoId: text('video_id').notNull(),
  timestampSeconds: integer('timestamp_seconds').notNull(),
  timestampFormatted: text('timestamp_formatted').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'user_bookmarks' table with foreign key to users.uid
export const userBookmarks = pgTable('user_bookmarks', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.uid)
    .notNull(),
  resourceId: text('resource_id').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define relationships for the 'users' table.
export const usersRelations = relations(users, ({ many }) => ({
  notes: many(userNotes),
  bookmarks: many(userBookmarks),
}));

// Define relationships for the 'user_notes' table.
export const userNotesRelations = relations(userNotes, ({ one }) => ({
  user: one(users, {
    fields: [userNotes.userId],
    references: [users.uid],
  }),
}));

// Define relationships for the 'user_bookmarks' table.
export const userBookmarksRelations = relations(userBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [userBookmarks.userId],
    references: [users.uid],
  }),
}));
