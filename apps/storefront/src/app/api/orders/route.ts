import { NextRequest, NextResponse } from "next/server";
import { prisma, PurchaseMode, OrderStatus, Prisma } from "@tavistra/db";
import {
  checkBulkOrderCeiling,
  validateEmail,
  validateGstin,
  validateIndianMobile,
} from "@tavistra/shared";
import { sendOrderConfirmationEmail } from "@/lib/email";
import {
  calculateAuthoritativeShipping,
  ShippingCalcItemInput,
} from "@/lib/logisticsEngine";
import { getAuthenticatedUser } from "@/lib/auth";
import { deriveOrderStatusPresentation, safeParseQcImages } from "@/lib/orderStatus";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  const contact = searchParams.get("contact");
  const email = searchParams.get("email");

  try {
    const sessionUser = await getAuthenticatedUser(req);

    // 1. Single order lookup (e.g. Guest Tracking /track)
    if (orderId) {
      const cleanId = orderId.trim().toUpperCase();
      const order = await prisma.order.findFirst({
        where: {
          orderNumber: cleanId,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
          payments: true,
        },
      });

      if (!order) {
        return NextResponse.json({ found: false, order: null });
      }

      const isAuthenticatedOwner = Boolean(sessionUser && order.userId === sessionUser.id);

      // Verify contact if supplied; require contact unless authenticated owner
      if (!isAuthenticatedOwner) {
        if (!contact || !contact.trim()) {
          return NextResponse.json(
            {
              found: false,
              order: null,
              message: "Please enter the email or mobile number associated with this order.",
            },
            { status: 401 }
          );
        }

        const cleanContact = contact.trim().toLowerCase().replace(/[\s\-()]/g, "");
        const emailMatches = order.customerEmail.toLowerCase() === cleanContact;
        const cleanPhone = order.customerPhone.replace(/[\s\-()]/g, "");
        const phoneMatches =
          cleanContact.length >= 6 &&
          (cleanPhone.includes(cleanContact) || cleanContact.includes(cleanPhone));

        if (!emailMatches && !phoneMatches) {
          return NextResponse.json(
            {
              found: false,
              order: null,
              message: "Order reference or contact details did not match.",
            },
            { status: 403 }
          );
        }
      }

      const qcImagesArray = safeParseQcImages(order.qcImages);
      const presentation = deriveOrderStatusPresentation(order);

      return NextResponse.json({
        found: true,
        order: {
          id: order.orderNumber,
          orderNumber: order.orderNumber,
          mode: order.purchaseMode,
          customerName: order.shippingAddress.fullName,
          email: order.customerEmail,
          phone: order.customerPhone,
          addressLine1: order.shippingAddress.addressLine1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          destinationPin: order.shippingAddress.pincode,
          items: order.items.map((i) => ({
            name: i.product?.title || "Architectural Edition",
            quantity: i.quantity,
            pricePaise: Math.round(Number(i.unitPrice) * 100),
            priceRupees: Number(i.unitPrice),
          })),
          itemsSubtotalRupees: Number(order.itemsSubtotal),
          deliveryFeeRupees: Number(order.shippingCharge),
          totalAmountRupees: Number(order.totalAmount),
          amountPaidRupees: Number(order.amountPaid),
          balanceDueRupees: Number(order.balanceAmount),
          carrierName: order.carrierName || "Pending Carrier Assignment",
          awbNumber: order.trackingNumber || undefined,
          transitEstimate: "2–4 business days",
          status: order.status,
          ...presentation,
          qcNotes: order.qcNotes || undefined,
          qcImages: qcImagesArray,
          cancelledAt: order.cancelledAt
            ? order.cancelledAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : null,
          createdAt: order.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        },
      });
    }

    // 2. Lookup by customer email -> strictly require authenticated matching session
    if (email) {
      if (!sessionUser || sessionUser.email.toLowerCase() !== email.toLowerCase().trim()) {
        return NextResponse.json(
          { error: "Authentication required to query account orders." },
          { status: 401 }
        );
      }

      const orders = await prisma.order.findMany({
        where: {
          userId: sessionUser.id,
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          shippingAddress: true,
          payments: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        orders: orders.map((order) => ({
          id: order.orderNumber,
          orderNumber: order.orderNumber,
          mode: order.purchaseMode,
          customerName: order.shippingAddress.fullName,
          email: order.customerEmail,
          phone: order.customerPhone,
          addressLine1: order.shippingAddress.addressLine1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          destinationPin: order.shippingAddress.pincode,
          items: order.items.map((i) => ({
            name: i.product?.title || "Architectural Edition",
            quantity: i.quantity,
            pricePaise: Math.round(Number(i.unitPrice) * 100),
            priceRupees: Number(i.unitPrice),
          })),
          itemsSubtotalRupees: Number(order.itemsSubtotal),
          deliveryFeeRupees: Number(order.shippingCharge),
          totalAmountRupees: Number(order.totalAmount),
          amountPaidRupees: Number(order.amountPaid),
          balanceDueRupees: Number(order.balanceAmount),
          carrierName: order.carrierName || "Pending Carrier Assignment",
          awbNumber: order.trackingNumber || undefined,
          status: order.status,
          ...deriveOrderStatusPresentation(order),
          qcNotes: order.qcNotes || undefined,
          qcImages: safeParseQcImages(order.qcImages),
          cancelledAt: order.cancelledAt
            ? order.cancelledAt.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : null,
          createdAt: order.createdAt.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
        })),
      });
    }

    // 3. Admin all orders list
    const allOrders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      orders: allOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        mode: order.purchaseMode,
        customerName: order.shippingAddress.fullName,
        email: order.customerEmail,
        phone: order.customerPhone,
        address: order.shippingAddress.addressLine1,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
        items: order.items.map((i) => ({
          name: i.product?.title || "Architectural Edition",
          quantity: i.quantity,
          priceRupees: Number(i.unitPrice),
        })),
        itemsSubtotalRupees: Number(order.itemsSubtotal),
        deliveryFeeRupees: Number(order.shippingCharge),
        totalAmountRupees: Number(order.totalAmount),
        amountPaidRupees: Number(order.amountPaid),
        balanceDueRupees: Number(order.balanceAmount),
        carrierName: order.carrierName || "Pending Carrier Assignment",
        awbNumber: order.trackingNumber || undefined,
        status: order.status,
        ...deriveOrderStatusPresentation(order),
        qcNotes: order.qcNotes || undefined,
        qcImages: safeParseQcImages(order.qcImages),
        cancelledAt: order.cancelledAt
          ? order.cancelledAt.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : null,
        placedAt: order.createdAt.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      })),
    });
  } catch (error) {
    console.error("API GET /api/orders error:", error);
    return NextResponse.json(
      { error: "Internal Server Error fetching orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // 1. Studio Maintenance Mode Server Gate (CHK-09)
    const maintenanceSetting = await prisma.systemSetting.findUnique({
      where: { key: "MAINTENANCE_MODE" },
    });
    if (maintenanceSetting?.value === "true") {
      return NextResponse.json(
        {
          success: false,
          code: "MAINTENANCE_MODE",
          error:
            "Our checkout is temporarily paused for routine studio system maintenance.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();

    const {
      id,
      mode,
      customerName,
      email,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      destinationPin,
      gstin,
      items,
    } = body as {
      id?: string;
      mode?: string;
      customerName?: string;
      email?: string;
      phone?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      destinationPin?: string;
      gstin?: string;
      items?: Array<{
        productId?: string;
        variantId?: string;
        sku?: string;
        slug?: string;
        name?: string;
        quantity?: number;
        pricePaise?: number;
        priceRupees?: number;
      }>;
    };

    // 2. Contact & Destination Field Validations
    const cleanName = String(customerName || "").trim();
    const cleanAddress1 = String(addressLine1 || "").trim();
    const cleanAddress2 = addressLine2 ? String(addressLine2).trim() : null;
    const cleanPin = String(destinationPin || "").replace(/\s+/g, "");

    if (cleanName.length < 2) {
      return NextResponse.json(
        { success: false, error: "Full legal name (at least 2 characters) is required." },
        { status: 400 }
      );
    }

    if (cleanAddress1.length < 5) {
      return NextResponse.json(
        { success: false, error: "Complete delivery address line 1 is required." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(cleanPin)) {
      return NextResponse.json(
        { success: false, error: "A valid 6-digit Indian PIN code is required." },
        { status: 400 }
      );
    }

    const emailCheck = validateEmail(String(email || ""));
    if (!emailCheck.isValid) {
      return NextResponse.json(
        { success: false, error: emailCheck.error || "Please provide a valid permanent email address." },
        { status: 400 }
      );
    }

    const mobileCheck = validateIndianMobile(String(phone || ""));
    if (!mobileCheck.isValid) {
      return NextResponse.json(
        { success: false, error: mobileCheck.error || "Please provide a valid 10-digit Indian mobile number." },
        { status: 400 }
      );
    }

    const cleanEmail = emailCheck.normalizedEmail || String(email || "").toLowerCase().trim();
    const cleanPhone = mobileCheck.normalizedPhone || String(phone || "").trim();

    if (gstin && String(gstin).trim()) {
      const gstinCheck = validateGstin(String(gstin));
      if (!gstinCheck.isValid) {
        return NextResponse.json(
          { success: false, error: gstinCheck.error || "Invalid GSTIN format." },
          { status: 400 }
        );
      }
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order must include at least one valid product." },
        { status: 400 }
      );
    }

    const requestedMode =
      mode === "MADE_TO_ORDER" ? PurchaseMode.MADE_TO_ORDER : PurchaseMode.READY_STOCK;

    // 3. Resolve Authoritative Products, Variants, Prices & Purchase Mode Separation
    interface ResolvedOrderLine {
      productId: string;
      slug: string;
      title: string;
      displayName: string;
      variantId: string;
      variantTitle: string;
      sku: string;
      quantity: number;
      unitPriceRupees: number;
      weightGrams: number;
      lengthMm: number;
      widthMm: number;
      heightMm: number;
    }

    const resolvedLines: ResolvedOrderLine[] = [];

    for (const rawItem of items) {
      const qty = Math.max(1, Math.floor(Number(rawItem.quantity) || 1));

      let matchedVariant = null as (Prisma.ProductVariantGetPayload<{
        include: { product: true; inventoryLedger: true };
      }> | null);

      if (rawItem.variantId) {
        matchedVariant = await prisma.productVariant.findUnique({
          where: { id: String(rawItem.variantId) },
          include: { product: true, inventoryLedger: true },
        });
      }

      if (!matchedVariant && rawItem.sku) {
        matchedVariant = await prisma.productVariant.findUnique({
          where: { sku: String(rawItem.sku) },
          include: { product: true, inventoryLedger: true },
        });
      }

      let product = matchedVariant?.product || null;

      if (!product && rawItem.productId) {
        product = await prisma.product.findUnique({
          where: { id: String(rawItem.productId) },
        });
      }

      if (!product && rawItem.slug) {
        product = await prisma.product.findUnique({
          where: { slug: String(rawItem.slug) },
        });
      }

      if (!product && rawItem.name) {
        const cleanItemName = String(rawItem.name).trim();
        product = await prisma.product.findFirst({
          where: {
            OR: [
              { title: { equals: cleanItemName, mode: "insensitive" } },
              { title: { contains: cleanItemName, mode: "insensitive" } },
            ],
          },
        });
      }

      if (!product || !product.isPublished) {
        return NextResponse.json(
          {
            success: false,
            error: `One or more selected products ("${rawItem.name || rawItem.slug || "Item"}") could not be verified in the live catalogue.`,
          },
          { status: 400 }
        );
      }

      if (product.primaryMode === PurchaseMode.QUOTE_ONLY) {
        return NextResponse.json(
          {
            success: false,
            error: `${product.title} is Quote Only and must be requested via architectural proposal.`,
          },
          { status: 400 }
        );
      }

      if (product.primaryMode !== requestedMode) {
        return NextResponse.json(
          {
            success: false,
            code: "MIXED_PURCHASE_MODE",
            error: `${product.title} belongs to ${
              product.primaryMode === PurchaseMode.MADE_TO_ORDER ? "Made to Order" : "Ready Stock"
            } and cannot be checked out inside a ${
              requestedMode === PurchaseMode.MADE_TO_ORDER ? "Made to Order" : "Ready Stock"
            } order.`,
          },
          { status: 400 }
        );
      }

      if (!matchedVariant || matchedVariant.productId !== product.id) {
        matchedVariant = await prisma.productVariant.findFirst({
          where: { productId: product.id, isPublished: true },
          orderBy: { createdAt: "asc" },
          include: { product: true, inventoryLedger: true },
        });
      }

      if (!matchedVariant) {
        return NextResponse.json(
          {
            success: false,
            error: `No active edition variant available for ${product.title}.`,
          },
          { status: 400 }
        );
      }

      const unitPriceRupees = Number(
        matchedVariant.taxInclusivePrice ?? product.taxInclusivePrice
      );

      resolvedLines.push({
        productId: product.id,
        slug: product.slug,
        title: product.title,
        displayName: `${product.title} — ${matchedVariant.title}`,
        variantId: matchedVariant.id,
        variantTitle: matchedVariant.title,
        sku: matchedVariant.sku,
        quantity: qty,
        unitPriceRupees,
        weightGrams: matchedVariant.weightGrams ?? product.weightGrams,
        lengthMm: matchedVariant.lengthMm ?? product.lengthMm,
        widthMm: matchedVariant.widthMm ?? product.widthMm,
        heightMm: matchedVariant.heightMm ?? product.heightMm,
      });
    }

    // 4. Authoritative Bulk Boundary Gate (<= 10 total units AND <= 10 lines)
    const bulkCheck = checkBulkOrderCeiling(
      resolvedLines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
      }))
    );

    if (bulkCheck.isBulkEnquiryRequired) {
      return NextResponse.json(
        {
          success: false,
          code: "BULK_ORDER_REQUIRED",
          reason: bulkCheck.reason,
          error: bulkCheck.message,
        },
        { status: 400 }
      );
    }

    // 5. Authoritative PIN Serviceability & 12-Slab DB Delivery Calculation
    const calcInputs: ShippingCalcItemInput[] = resolvedLines.map((line) => ({
      productId: line.productId,
      slug: line.slug,
      title: line.title,
      quantity: line.quantity,
      priceRupees: line.unitPriceRupees,
      weightGrams: line.weightGrams,
      lengthMm: line.lengthMm,
      widthMm: line.widthMm,
      heightMm: line.heightMm,
    }));

    const shippingCalc = await calculateAuthoritativeShipping(cleanPin, calcInputs);
    if (!shippingCalc.pincodeResult.isServiceable) {
      return NextResponse.json(
        {
          success: false,
          code: "PIN_UNSERVICEABLE",
          error:
            shippingCalc.pincodeResult.unserviceableReason ||
            `PIN code ${cleanPin} is currently unserviceable.`,
        },
        { status: 400 }
      );
    }

    // 6. Compute Authoritative Server Financials
    const serverItemsSubtotalRupees = resolvedLines.reduce(
      (sum, line) => sum + line.unitPriceRupees * line.quantity,
      0
    );
    const serverDeliveryFeeRupees = shippingCalc.totalDeliveryFeeRupees;
    const serverTotalAmountRupees = serverItemsSubtotalRupees + serverDeliveryFeeRupees;

    const serverRequiredAdvanceRupees =
      requestedMode === PurchaseMode.MADE_TO_ORDER
        ? Math.round(serverTotalAmountRupees * 0.25)
        : serverTotalAmountRupees;
    const serverAmountPaidRupees = serverRequiredAdvanceRupees;
    const serverBalanceDueRupees = serverTotalAmountRupees - serverAmountPaidRupees;

    const resolvedCity =
      shippingCalc.pincodeResult.city || String(city || "").trim() || "India";
    const resolvedState =
      shippingCalc.pincodeResult.state || String(state || "").trim() || "India";

    const sessionUser = await getAuthenticatedUser(req);

    // 7. Atomic Transaction: Stock Verification & Deduction + Order & Ledger Creation
    const requestedOrderNumber = id ? String(id).trim().toUpperCase() : "";
    const existingNumberMatch = requestedOrderNumber
      ? await prisma.order.findUnique({
          where: { orderNumber: requestedOrderNumber },
          select: { id: true },
        })
      : null;

    const orderNumber =
      requestedOrderNumber && !existingNumberMatch
        ? requestedOrderNumber
        : `${requestedMode === PurchaseMode.MADE_TO_ORDER ? "TAV-MTO" : "TAV-RS"}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-3)}`;

    const txResult = await prisma.$transaction(async (tx) => {
      if (requestedMode === PurchaseMode.READY_STOCK) {
        // Group required quantities per variantId in case same variant appears twice
        const qtyByVariant = new Map<string, { qty: number; label: string }>();
        for (const line of resolvedLines) {
          const prev = qtyByVariant.get(line.variantId);
          qtyByVariant.set(line.variantId, {
            qty: (prev?.qty || 0) + line.quantity,
            label: line.displayName,
          });
        }

        for (const [variantId, reqInfo] of qtyByVariant.entries()) {
          const updatedCount = await tx.inventoryLedger.updateMany({
            where: {
              variantId,
              availableStock: { gte: reqInfo.qty },
            },
            data: {
              availableStock: { decrement: reqInfo.qty },
            },
          });

          if (updatedCount.count === 0) {
            const currentLedger = await tx.inventoryLedger.findUnique({
              where: { variantId },
              select: { availableStock: true },
            });
            const remaining = currentLedger?.availableStock ?? 0;
            throw Object.assign(
              new Error(
                `Insufficient Ready Stock for ${reqInfo.label}. Available units: ${remaining}, requested: ${reqInfo.qty}.`
              ),
              { statusCode: 409, code: "INSUFFICIENT_STOCK" }
            );
          }

          const ledger = await tx.inventoryLedger.findUnique({
            where: { variantId },
            select: { id: true },
          });
          if (ledger) {
            await tx.stockMovement.create({
              data: {
                inventoryLedgerId: ledger.id,
                type: "ORDER_FULFILLED",
                quantity: -reqInfo.qty,
                referenceId: orderNumber,
                notes: `Ready Stock checkout deduction (${orderNumber})`,
              },
            });
          }
        }
      }

      const existingSavedAddress = sessionUser
        ? await tx.customerAddress.findFirst({
            where: {
              userId: sessionUser.id,
              pincode: cleanPin,
              addressLine1: cleanAddress1,
              fullName: cleanName,
            },
          })
        : null;

      const address =
        existingSavedAddress ||
        (await tx.customerAddress.create({
          data: {
            userId: sessionUser ? sessionUser.id : null,
            guestEmail: sessionUser ? null : cleanEmail,
            fullName: cleanName,
            phone: cleanPhone,
            addressLine1: cleanAddress1,
            addressLine2: cleanAddress2,
            city: resolvedCity,
            state: resolvedState,
            pincode: cleanPin,
          },
        }));

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: sessionUser ? sessionUser.id : null,
          customerEmail: cleanEmail,
          customerPhone: cleanPhone,
          shippingAddressId: address.id,
          purchaseMode: requestedMode,
          itemsSubtotal: serverItemsSubtotalRupees,
          shippingCharge: serverDeliveryFeeRupees,
          totalAmount: serverTotalAmountRupees,
          requiredAdvanceAmount: serverRequiredAdvanceRupees,
          amountPaid: serverAmountPaidRupees,
          balanceAmount: serverBalanceDueRupees,
          status: OrderStatus.CONFIRMED,
          confirmedAt: new Date(),
          carrierName: shippingCalc.carrierName,
          items: {
            create: resolvedLines.map((line) => ({
              productId: line.productId,
              variantId: line.variantId,
              quantity: line.quantity,
              unitPrice: line.unitPriceRupees,
              subtotal: line.unitPriceRupees * line.quantity,
            })),
          },
          payments: {
            create: {
              paymentType:
                requestedMode === PurchaseMode.MADE_TO_ORDER
                  ? "ADVANCE_25"
                  : "FULL_PAYMENT",
              amount: serverAmountPaidRupees,
              status: "COMPLETED",
              gateway: "PHONEPE",
              gatewayTransactionId: `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              verifiedAt: new Date(),
            },
          },
        },
      });

      return createdOrder;
    });

    // 8. Dispatch asynchronous order confirmation email with server-verified numbers
    sendOrderConfirmationEmail({
      orderNumber: txResult.orderNumber,
      customerName: cleanName,
      customerEmail: cleanEmail,
      mode: requestedMode,
      items: resolvedLines.map((line) => ({
        name: line.displayName,
        quantity: line.quantity,
        priceRupees: line.unitPriceRupees,
      })),
      itemsSubtotalRupees: serverItemsSubtotalRupees,
      deliveryFeeRupees: serverDeliveryFeeRupees,
      totalAmountRupees: serverTotalAmountRupees,
      amountPaidRupees: serverAmountPaidRupees,
      balanceDueRupees: serverBalanceDueRupees,
      city: resolvedCity,
      state: resolvedState,
      pincode: cleanPin,
    }).catch((err) => console.warn("Order confirmation email dispatch failed:", err));

    return NextResponse.json({
      success: true,
      orderNumber: txResult.orderNumber,
      persistedToDatabase: true,
      order: {
        orderNumber: txResult.orderNumber,
        mode: requestedMode,
        itemsSubtotalRupees: serverItemsSubtotalRupees,
        deliveryFeeRupees: serverDeliveryFeeRupees,
        totalAmountRupees: serverTotalAmountRupees,
        amountPaidRupees: serverAmountPaidRupees,
        balanceDueRupees: serverBalanceDueRupees,
        carrierName: shippingCalc.carrierName,
        transitEstimate: shippingCalc.pincodeResult.transitDaysEstimate,
        items: resolvedLines.map((line) => ({
          name: line.displayName,
          quantity: line.quantity,
          pricePaise: Math.round(line.unitPriceRupees * 100),
        })),
      },
    });
  } catch (error) {
    const typedErr = error as Error & { statusCode?: number; code?: string };
    if (typedErr.statusCode && typedErr.statusCode < 500) {
      return NextResponse.json(
        {
          success: false,
          code: typedErr.code || "ORDER_REJECTED",
          error: typedErr.message,
        },
        { status: typedErr.statusCode }
      );
    }

    console.error("Database persistence error in POST /api/orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to persist order to database",
      },
      { status: 500 }
    );
  }
}
