import "server-only";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { aiConversations, aiMessages } from "@/db/schema";

/** A user's conversations, most recently updated first. */
export async function getConversations(userId: string) {
  return db.query.aiConversations.findMany({
    where: eq(aiConversations.userId, userId),
    orderBy: (c) => desc(c.updatedAt),
    columns: { id: true, title: true, updatedAt: true },
  });
}

/** A single conversation (owned by the user) with its messages in order. */
export async function getConversationWithMessages(id: string, userId: string) {
  return db.query.aiConversations.findFirst({
    where: and(eq(aiConversations.id, id), eq(aiConversations.userId, userId)),
    with: {
      messages: { orderBy: (m) => asc(m.createdAt) },
    },
  });
}

export type ConversationListItem = Awaited<
  ReturnType<typeof getConversations>
>[number];
export type MessageRow = typeof aiMessages.$inferSelect;
