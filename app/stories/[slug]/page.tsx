import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStoryBySlug } from "@/lib/queries/stories";
import { StoryReader } from "@/components/stories/StoryReader";

export async function generateMetadata({
  params,
}: PageProps<"/stories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return { title: "Story not found" };
  return {
    title: story.title,
    description: story.excerpt,
  };
}

export default async function StoryPage({
  params,
}: PageProps<"/stories/[slug]">) {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);

  if (!story) notFound();

  return <StoryReader story={story} />;
}
