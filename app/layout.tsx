import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Disaster Response Platform",
  description:
    "Incident, needs, resources, tasks, partners, maps, and situation reports for emergency response coordination.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
