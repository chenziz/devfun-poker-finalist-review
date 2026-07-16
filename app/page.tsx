import type { Metadata } from "next";
import { headers } from "next/headers";
import { Investigator } from "./Investigator";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const imageUrl = `${protocol}://${host}/og.jpg`;

  return {
    title: "Final Table Clip Investigator",
    description: "Internal scouting board for eight AI poker agents and 80 replay clips.",
    openGraph: {
      title: "Final Table Clip Investigator",
      description: "Eight agents. Eighty hands. One internal scouting board.",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "Final Table Clip Investigator",
      description: "Eight agents. Eighty hands. One internal scouting board.",
      images: [imageUrl],
    },
  };
}

export default function Home() {
  return <Investigator />;
}
