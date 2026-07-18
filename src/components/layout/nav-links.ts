export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/stories", label: "Stories" },
  { href: "/books", label: "Books" },
  { href: "/community", label: "Community" },
  { href: "/ai-guide", label: "AI Guide" },
];
