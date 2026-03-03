import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";
import { OrderDetailClient } from "./OrderDetailClient";

export const metadata: Metadata = { title: "Order Detail" };
export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  // @ts-expect-error - extended session type
  const userId = session.user.id as string;

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      product: {
        select: {
          title: true,
          slug: true,
          price: true,
          images: { select: { url: true, isPrimary: true } }
        }
      }
    }
  });

  // Must exist and belong to this user
  if (!order || order.userId !== userId) {
    notFound();
  }

  return <OrderDetailClient order={order} />;
}
