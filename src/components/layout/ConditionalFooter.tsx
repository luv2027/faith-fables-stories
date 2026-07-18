"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

// Routes that render a full-height, app-like experience without the site footer.
const HIDE_ON = ["/ai-guide"];

export function ConditionalFooter() {
  const pathname = usePathname();
  if (HIDE_ON.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return null;
  }
  return <Footer />;
}
