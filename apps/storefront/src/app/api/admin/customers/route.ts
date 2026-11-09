import { NextResponse } from "next/server";
import { prisma } from "@tavistra/db";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        addresses: true,
        orders: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      customers: users.map((u) => {
        const defaultAddr = u.addresses.find((a) => a.isDefault) || u.addresses[0];
        const totalSpent = u.orders.reduce(
          (sum, o) => sum + Number(o.totalAmount),
          0
        );

        return {
          id: u.id,
          name: u.name || "Client",
          email: u.email,
          phone: u.phone || (defaultAddr?.phone ?? "N/A"),
          city: defaultAddr?.city || "New Delhi",
          state: defaultAddr?.state || "Delhi",
          totalOrders: u.orders.length,
          totalSpentRupees: totalSpent,
          isRegistered: true,
          joinedAt: u.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        };
      }),
    });
  } catch (error) {
    console.error("GET /api/admin/customers error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
