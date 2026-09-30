import type { Metadata } from "next";
import "lenis/dist/lenis.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "Wang Yudi — Portfolio 2026",
  description: "Wang Yudi — Creative Technologist. Immersive / Interactive.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
