import "dotenv/config"; // tsx does not auto-load .env
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";
import {
  authors,
  bookCollectionBooks,
  bookCollections,
  books,
  categories,
  reviews,
  stories,
  storyRelatedBooks,
} from "./schema";

// Standalone client (does not import db/index.ts, which is guarded by
// `server-only` and would throw when run from a plain Node/tsx script).
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

/* -------------------------------------------------------------------------- */
/* Seed content                                                               */
/* -------------------------------------------------------------------------- */

const CATEGORIES = [
  { slug: "personal-growth", name: "Personal Growth", sortOrder: 1, description: "Becoming a truer, steadier version of yourself." },
  { slug: "success-stories", name: "Success Stories", sortOrder: 2, description: "Hard-won journeys worth learning from." },
  { slug: "spiritual-wisdom", name: "Spiritual Wisdom", sortOrder: 3, description: "Stillness, meaning, and the inner life." },
  { slug: "leadership", name: "Leadership", sortOrder: 4, description: "Serving, guiding, and lifting others." },
  { slug: "creativity", name: "Creativity", sortOrder: 5, description: "Making things, and the courage it takes." },
  { slug: "overcoming-challenges", name: "Overcoming Challenges", sortOrder: 6, description: "Finding a way through the hardest seasons." },
] as const;

const AUTHORS = [
  { slug: "amara-okafor", name: "Amara Okafor", bio: "Writer and quiet-mornings enthusiast exploring how small shifts reshape a life." },
  { slug: "daniel-reyes", name: "Daniel Reyes", bio: "Founder-turned-storyteller. Two failed companies, one that stuck, endless lessons." },
  { slug: "mei-lin", name: "Mei Lin", bio: "Painter and teacher writing about stillness, attention, and the creative life." },
  { slug: "jonah-abrams", name: "Jonah Abrams", bio: "Recovering perfectionist writing about leadership that begins with listening." },
] as const;

const q = (s: string) => s.trim();

const STORIES = [
  {
    slug: "the-morning-i-stopped-running",
    title: "The Morning I Stopped Running",
    category: "personal-growth",
    author: "amara-okafor",
    cover: "/covers/c01.svg",
    readingTimeMin: 6,
    likes: 428,
    comments: 37,
    featured: true,
    excerpt: "For years I mistook motion for progress. Then one ordinary Tuesday, I simply stopped — and everything I'd been outrunning finally caught up, gently.",
    body: q(`For years I mistook motion for progress. I woke before the sun, answered messages before my feet touched the floor, and filled every silence with something urgent. Busyness felt like proof that I mattered.

Then one ordinary Tuesday, my body refused. I sat on the edge of the bed and did nothing. No list, no plan, no next thing. And in that stillness, all the feelings I'd been outrunning finally caught up with me — not as a flood, but as a quiet visitor waiting patiently at the door.

> Rest is not the absence of purpose. It is the ground where purpose becomes clear.

What I learned that morning is that clarity does not arrive when we are moving fastest. It arrives when we finally stand still long enough to hear it. I began, slowly, to build mornings around presence instead of pressure.

Months later, I do more that matters and less that merely feels urgent. The running never got me anywhere I actually wanted to be. Sitting down did.`),
  },
  {
    slug: "from-failure-to-foundation",
    title: "From Failure to Foundation",
    category: "success-stories",
    author: "daniel-reyes",
    cover: "/covers/c02.svg",
    readingTimeMin: 8,
    likes: 512,
    comments: 54,
    featured: true,
    excerpt: "My first two companies collapsed in public. What looked like the end turned out to be the only foundation strong enough to build on.",
    body: q(`My first company died slowly; my second died all at once. Both were public enough to be humiliating. For a while I believed the story everyone else seemed to be telling: that I simply wasn't built for this.

But failure, I discovered, is not a verdict. It is data. Painful, expensive, unforgettable data. Each collapse taught me something no success ever could — how to tell the truth early, how to spend carefully, how to build something people actually needed rather than something I merely wanted to be admired for.

When I started again, I built on that data instead of pretending it didn't exist. The third company grew slowly and stubbornly, rooted in every lesson the first two had carved into me.

> You do not build on your wins. You build on what your losses taught you.

If you are standing in the wreckage of something you gave everything to, I won't tell you it doesn't hurt. It does. But the ground you're standing on may be the most solid you'll ever find.`),
  },
  {
    slug: "the-silence-that-taught-me-to-listen",
    title: "The Silence That Taught Me to Listen",
    category: "spiritual-wisdom",
    author: "mei-lin",
    cover: "/covers/c03.svg",
    readingTimeMin: 5,
    likes: 389,
    comments: 29,
    featured: true,
    excerpt: "I went on a silent retreat to fix my restlessness. Instead, the silence introduced me to a self I'd been talking over my whole life.",
    body: q(`I signed up for the silent retreat the way I did most things — to fix a problem. My mind was loud, my days were fractured, and I wanted someone to hand me a quieter version of myself.

The first day was unbearable. Without conversation to fill it, my mind narrated everything, judged everyone, rehearsed old arguments. I realized I had never actually been alone with my own thoughts; I had only ever kept them company with noise.

By the third day, something loosened. The narration slowed. And underneath it I found a quieter voice — patient, unhurried, easy to miss. It had been there all along, waiting for me to stop talking over it.

Silence did not fix me. It did something better. It introduced me to the part of myself worth listening to.`),
  },
  {
    slug: "leading-without-a-title",
    title: "Leading Without a Title",
    category: "leadership",
    author: "jonah-abrams",
    cover: "/covers/c04.svg",
    readingTimeMin: 7,
    likes: 301,
    comments: 22,
    featured: false,
    excerpt: "The best leader I ever worked with had no title, no direct reports, and no authority. She had something rarer: everyone's trust.",
    body: q(`The best leader I ever worked with was not a manager. She had no title, no direct reports, no budget. What she had was rarer: everyone trusted her completely.

When two teams were at war, they both came to her — not because she could decide, but because she would listen without taking sides. When someone was struggling, she noticed before they said a word. She led by paying attention, which turns out to be the most underrated leadership skill there is.

> Authority is given by an org chart. Trust is earned one honest moment at a time.

I spent years believing leadership was about being in charge. She taught me it was about being reliable — the person whose word means something, whose attention is real, whose care isn't performance.

You do not need permission to lead like that. You only need to begin.`),
  },
  {
    slug: "the-blank-page-is-not-your-enemy",
    title: "The Blank Page Is Not Your Enemy",
    category: "creativity",
    author: "amara-okafor",
    cover: "/covers/c05.svg",
    readingTimeMin: 5,
    likes: 276,
    comments: 18,
    featured: false,
    excerpt: "The blank page had terrified me for a decade. Then I learned it wasn't asking for a masterpiece — only for a beginning.",
    body: q(`For a decade the blank page terrified me. I treated it like a judge, certain that whatever I wrote first would be measured against everything I hoped it could become.

The fear had a logic to it, but the logic was wrong. The blank page is not asking for a masterpiece. It is asking for a beginning — a single honest sentence that gives the next one somewhere to stand.

I started writing badly on purpose. Small, ugly drafts nobody would see. And a strange thing happened: the fear had nowhere to grip. You cannot ruin what you never promised to make perfect.

The page was never my enemy. My expectations were. Once I let the first draft be small, the work could finally be brave.`),
  },
  {
    slug: "climbing-back-from-zero",
    title: "Climbing Back From Zero",
    category: "overcoming-challenges",
    author: "daniel-reyes",
    cover: "/covers/c06.svg",
    readingTimeMin: 9,
    likes: 447,
    comments: 41,
    featured: false,
    excerpt: "At thirty-four I lost the job, the savings, and the certainty all in one season. Here is what starting from zero actually taught me.",
    body: q(`At thirty-four I lost the job, the savings, and the certainty all in a single season. There is a particular silence to starting over with nothing — the phone stops ringing, and you are left with only yourself.

I learned that zero is not empty. Zero is a floor. And a floor, however low, is something you can push off from. The first month I did one small, useful thing each day. Not to fix everything — just to prove to myself that I could still move.

Small proofs accumulate. One good day becomes a week. A week becomes a habit. A habit becomes a foothold, and footholds are how anyone climbs anything.

> You don't climb out of the pit in one leap. You climb one honest handhold at a time.

I am not going to pretend the fall didn't mark me. It did. But I know something now that I didn't before: I can begin again from nothing. That knowledge is worth more than the savings I lost.`),
  },
  {
    slug: "small-habits-quiet-revolutions",
    title: "Small Habits, Quiet Revolutions",
    category: "personal-growth",
    author: "mei-lin",
    cover: "/covers/c07.svg",
    readingTimeMin: 6,
    likes: 358,
    comments: 26,
    featured: false,
    excerpt: "I wanted a dramatic transformation. What changed my life instead was almost too small to notice — a single glass of water each morning.",
    body: q(`I wanted a dramatic transformation. A new me, arriving all at once, announced with fanfare. What actually changed my life was almost too small to notice.

It began with a single glass of water each morning. Not a diet, not a program — just one small act I could not fail at. But the glass of water was never really about hydration. It was a daily vote for the kind of person I was becoming: someone who kept a promise to themselves.

The votes added up. The water led to a walk. The walk led to an earlier bedtime. None of it was dramatic. All of it was revolutionary.

We overestimate what a single grand gesture can do and badly underestimate what a small, repeated one can. Quiet revolutions are still revolutions.`),
  },
  {
    slug: "the-customer-who-changed-my-company",
    title: "The Customer Who Changed My Company",
    category: "success-stories",
    author: "jonah-abrams",
    cover: "/covers/c08.svg",
    readingTimeMin: 7,
    likes: 294,
    comments: 19,
    featured: false,
    excerpt: "One furious email nearly ended our startup. Reading it honestly, instead of defending ourselves, saved it.",
    body: q(`The email was three paragraphs of pure fury, and it was completely justified. We had let this customer down in every way a young company can. My first instinct was to defend, to explain, to soften.

Instead, we read it honestly. We printed it out. We asked ourselves, without flinching, which parts were true. Almost all of them were.

That email became the most valuable document in our company's history. We rebuilt our onboarding around it. We changed how we made promises. We called the customer, not to save the account, but to thank them.

> Your angriest customer is often your most honest advisor.

We survived because one person cared enough to be furious, and we cared enough to listen. Praise is pleasant, but it rarely teaches you anything. The hard feedback is the gift.`),
  },
  {
    slug: "finding-stillness-in-a-loud-world",
    title: "Finding Stillness in a Loud World",
    category: "spiritual-wisdom",
    author: "amara-okafor",
    cover: "/covers/c09.svg",
    readingTimeMin: 5,
    likes: 333,
    comments: 24,
    featured: false,
    excerpt: "Stillness, I assumed, required a mountain and a month. It turned out to fit inside ten unhurried minutes and a cup of tea.",
    body: q(`Stillness, I assumed, required a mountain and a month — some grand withdrawal from ordinary life. So I never pursued it, because I never had the mountain or the month.

Then a friend showed me stillness could fit inside ten unhurried minutes and a cup of tea. No app, no incense, no achievement. Just the radical act of doing one thing at a time and letting it be enough.

The loud world does not quiet down. That was my mistake — waiting for silence to arrive from outside. Stillness is not a condition of the world. It is a decision you make within it.

Now I keep small pockets of quiet through the day, like windows opened in a stuffy room. The noise is still there. But so, now, is the air.`),
  },
  {
    slug: "the-team-that-trusted-first",
    title: "The Team That Trusted First",
    category: "leadership",
    author: "daniel-reyes",
    cover: "/covers/c10.svg",
    readingTimeMin: 6,
    likes: 267,
    comments: 15,
    featured: false,
    excerpt: "We tried every process to make our team faster. The thing that finally worked wasn't a process at all — it was choosing to trust before it was earned.",
    body: q(`We tried every process to make the team faster. Stand-ups, trackers, reviews, dashboards. Each helped a little and none fixed the real problem, which was that no one felt safe to be honest.

The turning point was a decision, not a tool. We chose to trust each other before it was fully earned — to assume good intent, to admit mistakes early, to ask for help without shame.

Productivity followed trust; it never led it. When people stopped protecting themselves, they started building together. The processes we'd fought over became almost unnecessary.

> A team moves at the speed of its trust, not its tools.

You can install a new tool tomorrow. Trust takes longer, and it is the only thing that actually works.`),
  },
  {
    slug: "why-i-paint-before-dawn",
    title: "Why I Paint Before Dawn",
    category: "creativity",
    author: "mei-lin",
    cover: "/covers/c11.svg",
    readingTimeMin: 4,
    likes: 241,
    comments: 12,
    featured: false,
    excerpt: "Before the world wakes and the doubts arrive, there is a single hour that belongs entirely to the work. I guard it like something sacred.",
    body: q(`I paint before dawn because that hour belongs to no one else. Before the messages, before the news, before the small avalanche of other people's needs, there is a quiet that the work can grow in.

The doubts sleep late. In the early dark they haven't yet arrived to tell me the painting is wrong, the color is off, the whole effort is foolish. For one uninterrupted hour, I get to make without being watched — even by myself.

I don't always love what I make in that hour. But I always love that I made it. The habit protects the work from the part of me that would rather it stayed safely imagined.

Guard your best hour. Give it to the thing that matters most. The world can have all the rest.`),
  },
  {
    slug: "the-year-everything-broke-open",
    title: "The Year Everything Broke Open",
    category: "overcoming-challenges",
    author: "jonah-abrams",
    cover: "/covers/c12.svg",
    readingTimeMin: 8,
    likes: 476,
    comments: 48,
    featured: false,
    excerpt: "I called it the year everything fell apart. Only later did I understand it was the year everything finally broke open.",
    body: q(`I called it the year everything fell apart. The relationship, the plan, the version of the future I had been so certain of — all of it came undone within a few months.

For a long time I could only see the breaking. But grief, I've come to believe, is a strange kind of teacher. It strips away everything that isn't essential and leaves you holding only what is real. In the wreckage, I found out who I actually was when the roles were gone.

Meaning, as one book put it, is not something we find lying around. It is something we make, especially in suffering — by how we choose to respond when we cannot choose what happens.

> The thing that breaks you open is often the thing that lets the light in.

I would not wish that year on anyone. And I would not trade what it taught me. It was not the year everything fell apart. It was the year everything finally broke open.`),
  },
] as const;

const COLLECTIONS = [
  { slug: "finding-purpose", name: "Books for Finding Purpose", emotionGoal: "When you feel lost or adrift", sortOrder: 1, description: "For the seasons when you're searching for direction and meaning." },
  { slug: "building-discipline", name: "Books for Building Discipline", emotionGoal: "When you want to follow through", sortOrder: 2, description: "For turning intention into consistent, quiet action." },
  { slug: "for-entrepreneurs", name: "Books for Entrepreneurs", emotionGoal: "When you're building something new", sortOrder: 3, description: "For the makers, founders, and first-time builders." },
  { slug: "personal-growth", name: "Books for Personal Growth", emotionGoal: "When you want to become truer", sortOrder: 4, description: "For becoming a steadier, wiser version of yourself." },
  { slug: "creativity", name: "Books for Creativity", emotionGoal: "When you're afraid to begin", sortOrder: 5, description: "For anyone wrestling with the work and the resistance to it." },
] as const;

const BOOKS = [
  { slug: "atomic-habits", title: "Atomic Habits", author: "James Clear", cover: "/covers/c01.svg", description: "A practical framework for improving one percent every day through tiny, compounding changes to your systems and identity.", keyLessons: ["You do not rise to your goals; you fall to your systems.", "Small habits are votes for the person you want to become.", "Make good habits obvious, attractive, easy, and satisfying."], collections: ["building-discipline", "personal-growth"] },
  { slug: "mans-search-for-meaning", title: "Man's Search for Meaning", author: "Viktor E. Frankl", cover: "/covers/c02.svg", description: "A psychiatrist's account of surviving the concentration camps and his conclusion that meaning is what sustains us through suffering.", keyLessons: ["Meaning can be found even in unavoidable suffering.", "The last human freedom is to choose your response.", "Those who have a 'why' can bear almost any 'how'."], collections: ["finding-purpose", "personal-growth"] },
  { slug: "the-war-of-art", title: "The War of Art", author: "Steven Pressfield", cover: "/covers/c03.svg", description: "A bracing look at Resistance — the force that stops us from doing our creative work — and how to defeat it by turning pro.", keyLessons: ["Resistance is strongest just before a breakthrough.", "Turn pro: show up every day regardless of mood.", "The work is the reward; results are not in your control."], collections: ["building-discipline", "creativity"] },
  { slug: "deep-work", title: "Deep Work", author: "Cal Newport", cover: "/covers/c04.svg", description: "An argument for the rare and valuable skill of focusing without distraction on cognitively demanding tasks.", keyLessons: ["Deep work is increasingly rare and increasingly valuable.", "Attention is a muscle; train it by embracing boredom.", "Ritualize focus and ruthlessly protect it."], collections: ["building-discipline", "for-entrepreneurs"] },
  { slug: "start-with-why", title: "Start With Why", author: "Simon Sinek", cover: "/covers/c05.svg", description: "Why the most influential leaders and organizations think, act, and communicate starting from their purpose.", keyLessons: ["People don't buy what you do; they buy why you do it.", "Clarity of purpose precedes lasting influence.", "The Golden Circle: why, then how, then what."], collections: ["finding-purpose", "for-entrepreneurs"] },
  { slug: "the-artists-way", title: "The Artist's Way", author: "Julia Cameron", cover: "/covers/c06.svg", description: "A twelve-week course for recovering your creativity, built around morning pages and the artist date.", keyLessons: ["Write three morning pages to clear the mind.", "Take yourself on a weekly artist date.", "Creativity is a spiritual practice, not a talent."], collections: ["creativity"] },
  { slug: "grit", title: "Grit", author: "Angela Duckworth", cover: "/covers/c07.svg", description: "Research showing that passion and sustained perseverance matter more than raw talent for long-term achievement.", keyLessons: ["Effort counts twice: it builds skill and applies it.", "Grit is passion plus perseverance over years.", "Cultivate interest, practice, purpose, and hope."], collections: ["building-discipline", "personal-growth"] },
  { slug: "the-alchemist", title: "The Alchemist", author: "Paulo Coelho", cover: "/covers/c08.svg", description: "A fable about a shepherd who journeys in pursuit of his Personal Legend and learns to read the language of the world.", keyLessons: ["When you want something, the universe conspires to help.", "The treasure is often near where you began.", "Fear of suffering is worse than suffering itself."], collections: ["finding-purpose"] },
  { slug: "mindset", title: "Mindset", author: "Carol S. Dweck", cover: "/covers/c09.svg", description: "How a fixed versus growth mindset shapes learning, resilience, relationships, and achievement.", keyLessons: ["Abilities can be developed, not just inherited.", "Praise effort and strategy, not talent.", "Failure is information, not a verdict on your worth."], collections: ["personal-growth"] },
  { slug: "zero-to-one", title: "Zero to One", author: "Peter Thiel", cover: "/covers/c10.svg", description: "Notes on startups and how to build the future by creating something genuinely new rather than copying what works.", keyLessons: ["Going from zero to one beats going from one to many.", "Every great business is built on a secret.", "Competition is for losers; aim to be singular."], collections: ["for-entrepreneurs"] },
] as const;

// bookSlug -> reviews
const REVIEWS: Record<string, { reviewer: string; rating: number; body: string }[]> = {
  "atomic-habits": [
    { reviewer: "Priya N.", rating: 5, body: "The one book that actually changed my daily behavior. The systems-over-goals idea reframed everything." },
    { reviewer: "Marcus T.", rating: 4, body: "Practical and repeatable. A little repetitive, but the core ideas stick." },
  ],
  "mans-search-for-meaning": [
    { reviewer: "Elena R.", rating: 5, body: "I return to this every year. It rearranges what you think you know about hardship." },
    { reviewer: "David K.", rating: 5, body: "Short, devastating, and quietly hopeful. Essential reading." },
  ],
  "the-war-of-art": [
    { reviewer: "Sam O.", rating: 5, body: "Read it in one sitting before starting my novel. Named the enemy I'd been fighting for years." },
    { reviewer: "Lena F.", rating: 4, body: "A kick in the pants when you need one. Blunt in the best way." },
  ],
  "deep-work": [
    { reviewer: "Ravi S.", rating: 5, body: "Reclaimed my mornings after reading this. Focus really is trainable." },
    { reviewer: "Grace L.", rating: 4, body: "Some advice is hard to apply with a busy team, but the principles hold up." },
  ],
  "start-with-why": [
    { reviewer: "Tomás A.", rating: 4, body: "Reframed how I pitch our company. The Golden Circle is genuinely useful." },
    { reviewer: "Nadia H.", rating: 4, body: "One big idea, well told. Worth it for the clarity alone." },
  ],
  "the-artists-way": [
    { reviewer: "Chloe M.", rating: 5, body: "Morning pages unlocked something I'd blocked for a decade. Life-changing course." },
    { reviewer: "Ben W.", rating: 4, body: "Woo-adjacent at times, but the practices absolutely work." },
  ],
  grit: [
    { reviewer: "Ibrahim K.", rating: 4, body: "Made me kinder to my kids about effort and process. Solid research, warm writing." },
    { reviewer: "Sofia D.", rating: 5, body: "The 'effort counts twice' idea alone was worth the read." },
  ],
  "the-alchemist": [
    { reviewer: "Marco V.", rating: 5, body: "Simple on the surface, deep underneath. I gift it constantly." },
    { reviewer: "Aisha B.", rating: 4, body: "A gentle, hopeful parable. Read it at the right moment and it lands hard." },
  ],
  mindset: [
    { reviewer: "Hana P.", rating: 5, body: "Changed how I talk to my students and to myself. Growth mindset is real." },
    { reviewer: "Leo G.", rating: 4, body: "The core idea is powerful; the examples get repetitive. Still recommend." },
  ],
  "zero-to-one": [
    { reviewer: "Yuki T.", rating: 4, body: "Contrarian and sharp. Made me question assumptions about competition." },
    { reviewer: "Owen C.", rating: 4, body: "Not a how-to, but a way of thinking. Great for early founders." },
  ],
};

// storySlug -> related bookSlugs
const STORY_RELATED_BOOKS: Record<string, string[]> = {
  "small-habits-quiet-revolutions": ["atomic-habits", "grit"],
  "the-blank-page-is-not-your-enemy": ["the-war-of-art", "the-artists-way"],
  "the-year-everything-broke-open": ["mans-search-for-meaning"],
  "from-failure-to-foundation": ["zero-to-one", "start-with-why"],
  "finding-stillness-in-a-loud-world": ["deep-work"],
};

/* -------------------------------------------------------------------------- */
/* Seed runner (idempotent)                                                   */
/* -------------------------------------------------------------------------- */

async function seed() {
  console.log("Resetting seeded tables…");
  await db.execute(sql`
    TRUNCATE TABLE
      story_related_books, book_collection_books, reviews,
      stories, books, book_collections, categories, authors
    RESTART IDENTITY CASCADE
  `);

  console.log("Inserting categories, authors, collections, books…");
  const catRows = await db.insert(categories).values(CATEGORIES.map((c) => ({ ...c }))).returning();
  const catId = new Map(catRows.map((c) => [c.slug, c.id]));

  const authorRows = await db.insert(authors).values(AUTHORS.map((a) => ({ ...a }))).returning();
  const authorId = new Map(authorRows.map((a) => [a.slug, a.id]));

  const collectionRows = await db.insert(bookCollections).values(COLLECTIONS.map((c) => ({ ...c }))).returning();
  const collectionId = new Map(collectionRows.map((c) => [c.slug, c.id]));

  const bookRows = await db
    .insert(books)
    .values(
      BOOKS.map((b) => ({
        slug: b.slug,
        title: b.title,
        author: b.author,
        coverImage: b.cover,
        description: b.description,
        keyLessons: [...b.keyLessons],
      })),
    )
    .returning();
  const bookId = new Map(bookRows.map((b) => [b.slug, b.id]));

  console.log("Inserting stories…");
  const now = Date.now();
  const storyRows = await db
    .insert(stories)
    .values(
      STORIES.map((s, i) => ({
        slug: s.slug,
        title: s.title,
        excerpt: s.excerpt,
        body: s.body,
        coverImage: s.cover,
        authorId: authorId.get(s.author)!,
        categoryId: catId.get(s.category)!,
        readingTimeMin: s.readingTimeMin,
        likesCount: s.likes,
        commentsCount: s.comments,
        featured: s.featured,
        // stagger publish dates: newest first in the list
        publishedAt: new Date(now - i * 3 * 24 * 60 * 60 * 1000),
      })),
    )
    .returning();
  const storyId = new Map(storyRows.map((s) => [s.slug, s.id]));

  console.log("Inserting reviews…");
  const reviewValues = Object.entries(REVIEWS).flatMap(([slug, list]) =>
    list.map((r) => ({
      bookId: bookId.get(slug)!,
      reviewerName: r.reviewer,
      rating: r.rating,
      body: r.body,
    })),
  );
  await db.insert(reviews).values(reviewValues);

  console.log("Linking books ↔ collections…");
  const bcbValues = BOOKS.flatMap((b) =>
    b.collections.map((cslug, idx) => ({
      bookId: bookId.get(b.slug)!,
      collectionId: collectionId.get(cslug)!,
      sortOrder: idx,
    })),
  );
  await db.insert(bookCollectionBooks).values(bcbValues);

  console.log("Linking stories ↔ related books…");
  const srbValues = Object.entries(STORY_RELATED_BOOKS).flatMap(([sslug, bslugs]) =>
    bslugs.map((bslug) => ({
      storyId: storyId.get(sslug)!,
      bookId: bookId.get(bslug)!,
    })),
  );
  await db.insert(storyRelatedBooks).values(srbValues);

  console.log(
    `Seed complete: ${catRows.length} categories, ${authorRows.length} authors, ${storyRows.length} stories, ${bookRows.length} books, ${collectionRows.length} collections, ${reviewValues.length} reviews.`,
  );
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
