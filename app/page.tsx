import { prisma } from "@/lib/prisma";
import { HomeClient } from "./HomeClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const settings = await prisma.homeSettings.findFirst();

  return <HomeClient settings={settings} />;
}
