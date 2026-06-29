import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Sign in — ThinkGraph AI",
};

/** Login page gets its own bare layout — no Shell, no sidebar. */
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
