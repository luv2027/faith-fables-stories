import "server-only";
import { asc } from "drizzle-orm";
import { db } from "@/db";

export async function getAuthors() {
  return db.query.authors.findMany({
    orderBy: (a) => asc(a.name),
  });
}

export type AuthorItem = Awaited<ReturnType<typeof getAuthors>>[number];
