import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Connect WordPress — ThinkGraph AI",
};

/** Onboarding gets its own bare layout — no Shell, no sidebar. */
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
