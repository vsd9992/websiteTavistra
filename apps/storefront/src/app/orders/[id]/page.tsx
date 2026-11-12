import Link from "next/link";
import { Suspense } from "react";
import { connection } from "next/server";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@tavistra/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

async function DirectOrderContent({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const cleanRef = (id || "").trim();
  if (!cleanRef) {
    notFound();
  }

  const order = await prisma.order.findFirst({
    where: {
      OR: [{ id: cleanRef }, { orderNumber: cleanRef.toUpperCase() }],
    },
    select: {
      orderNumber: true,
      userId: true,
    },
  });

  if (!order) {
    notFound();
  }

  const sessionUser = await getAuthenticatedUser();
  if (sessionUser && order.userId === sessionUser.id) {
    redirect(`/track?orderId=${encodeURIComponent(order.orderNumber)}`);
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center space-y-6">
      <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-bronze)] block">
        Order Reference Verification
      </span>
      <h1 className="font-editorial text-3xl sm:text-4xl text-[var(--color-ink)]">
        Verify Contact for {order.orderNumber}
      </h1>
      <p className="text-xs text-[var(--color-muted-light)] leading-relaxed">
        To protect client privacy and billing information, please verify the registered billing email or mobile number on the order tracking desk, or sign in to your Tavistra account.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link
          href={`/track?orderId=${encodeURIComponent(order.orderNumber)}`}
          className="rounded-full bg-[var(--color-ink)] px-7 py-3 text-xs font-semibold text-[var(--color-canvas)] hover:bg-[var(--color-charcoal)] transition-colors"
        >
          Continue to Order Tracker
        </Link>
        <Link
          href={`/account/login?next=${encodeURIComponent(`/orders/${order.orderNumber}`)}`}
          className="rounded-full border border-[var(--color-control-border)] px-7 py-3 text-xs font-semibold text-[var(--color-ink)] hover:bg-[var(--color-stone)] transition-colors"
        >
          Sign In to Account
        </Link>
      </div>
    </div>
  );
}

export default function DirectOrderLookupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
      <Header />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 text-center text-xs text-[var(--color-muted-light)]">
              Verifying consignment reference...
            </div>
          }
        >
          <DirectOrderContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
