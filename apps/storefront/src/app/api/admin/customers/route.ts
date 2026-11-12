import { NextResponse } from "next/server";
import { prisma } from "@tavistra/db";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        addresses: {
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        },
        orders: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      customers: users.map((u) => {
        const defaultAddr = u.addresses.find((a) => a.isDefault) || u.addresses[0];
        const lifetimeSpendRupees = u.orders.reduce(
          (sum, o) => sum + Number(o.totalAmount),
          0
        );

        return {
          id: u.id,
          name: u.name || "Client",
          email: u.email,
          phone: u.phone || (defaultAddr?.phone ?? "N/A"),
          gstin: u.gstin || undefined,
          practiceOrStudio: u.practiceOrStudio || undefined,
          emailVerified: Boolean(u.emailVerifiedAt),
          city: defaultAddr?.city || "—",
          state: defaultAddr?.state || "—",
          pincode: defaultAddr?.pincode || "—",
          totalOrders: u.orders.length,
          lifetimeSpendRupees,
          totalSpentRupees: lifetimeSpendRupees,
          addresses: u.addresses.map((a) => ({
            id: a.id,
            label: a.label,
            fullName: a.fullName,
            phone: a.phone,
            addressLine1: a.addressLine1,
            addressLine2: a.addressLine2 || undefined,
            city: a.city,
            state: a.state,
            pincode: a.pincode,
            isDefault: a.isDefault,
          })),
          isRegistered: Boolean(u.passwordHash || u.emailVerifiedAt),
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
