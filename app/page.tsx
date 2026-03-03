import { PrismaClient } from "@prisma/client";
import { HomeClient } from "./HomeClient";

const prisma = new PrismaClient();

export const revalidate = 3600;

export default async function Home() {
  const settings = await prisma.homeSettings.findFirst();

  return <HomeClient settings={settings} />;
}
