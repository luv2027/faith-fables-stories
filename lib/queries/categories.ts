import "server-only";
import { asc } from "drizzle-orm";
import { db } from "@/db";

export async function getCategories() {
  return db.query.categories.findMany({
    orderBy: (c) => asc(c.sortOrder),
  });
}

export type CategoryItem = Awaited<ReturnType<typeof getCategories>>[number];
