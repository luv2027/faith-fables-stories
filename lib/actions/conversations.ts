"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { aiConversations } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";

export async function deleteConversation(id: string): Promise<void> {
  const user = await requireUser("/ai-guide");
  await db
    .delete(aiConversations)
    .where(
      and(eq(aiConversations.id, id), eq(aiConversations.userId, user.id)),
    );
  revalidatePath("/ai-guide");
}
