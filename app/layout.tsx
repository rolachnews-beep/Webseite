import type { Metadata } from "next";
import "./globals.css";
import { ClientLayout } from "@/components/layout/client-layout";

export const metadata: Metadata = {
  title: "Obsidian Dashboard",
  description: "Linear-style project management dashboard for Obsidian",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-linear-bg">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
