import { prisma } from "@/lib/prisma";
import { AboutClient } from "./AboutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifesto",
  description: "Our philosophy — exploring the space between being and nothingness through refined garments.",
};

// Prevent static generation database connection bugs on Vercel
export const dynamic = "force-dynamic";

export default async function About() {
  const manifesto = await prisma.manifesto.findFirst();

  return <AboutClient manifesto={manifesto} />;
}
