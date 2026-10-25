import { db } from './index.ts';
import { userNotes, userBookmarks } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';

export interface CreateNoteInput {
  userId: string;
  videoId: string;
  timestampSeconds: number;
  timestampFormatted: string;
  text: string;
}

export async function getUserNotes(userId: string, videoId?: string) {
  try {
    if (videoId) {
      return await db
        .select()
        .from(userNotes)
        .where(and(eq(userNotes.userId, userId), eq(userNotes.videoId, videoId)))
        .orderBy(desc(userNotes.createdAt));
    }
    return await db
      .select()
      .from(userNotes)
      .where(eq(userNotes.userId, userId))
      .orderBy(desc(userNotes.createdAt));
  } catch (error) {
    console.error('Failed to query user notes:', error);
    throw new Error('Database query for notes failed.', { cause: error });
  }
}

export async function createNote(input: CreateNoteInput) {
  try {
    const result = await db
      .insert(userNotes)
      .values({
        userId: input.userId,
        videoId: input.videoId,
        timestampSeconds: input.timestampSeconds,
        timestampFormatted: input.timestampFormatted,
        text: input.text,
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Failed to create note in database:', error);
    throw new Error('Database insertion for note failed.', { cause: error });
  }
}

export async function getUserBookmarks(userId: string) {
  try {
    return await db
      .select()
      .from(userBookmarks)
      .where(eq(userBookmarks.userId, userId))
      .orderBy(desc(userBookmarks.createdAt));
  } catch (error) {
    console.error('Failed to query user bookmarks:', error);
    throw new Error('Database query for bookmarks failed.', { cause: error });
  }
}

export async function toggleBookmark(userId: string, resourceId: string) {
  try {
    const existing = await db
      .select()
      .from(userBookmarks)
      .where(and(eq(userBookmarks.userId, userId), eq(userBookmarks.resourceId, resourceId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .delete(userBookmarks)
        .where(and(eq(userBookmarks.userId, userId), eq(userBookmarks.resourceId, resourceId)));
      return { bookmarked: false, resourceId };
    } else {
      await db.insert(userBookmarks).values({ userId, resourceId });
      return { bookmarked: true, resourceId };
    }
  } catch (error) {
    console.error('Failed to toggle bookmark in database:', error);
    throw new Error('Database toggle bookmark failed.', { cause: error });
  }
}
