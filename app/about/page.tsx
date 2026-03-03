import { prisma } from "@/lib/prisma";
import { AboutClient } from "./AboutClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manifesto",
  description: "Our philosophy — exploring the space between being and nothingness through refined garments.",
};

// Revalidate every hour or on-demand
export const revalidate = 3600;

export default async function About() {
  const manifesto = await prisma.manifesto.findFirst();

  return <AboutClient manifesto={manifesto} />;
}
