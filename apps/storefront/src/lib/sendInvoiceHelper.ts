import { prisma } from "@tavistra/db";
import {
  resolveSellerDetails,
  FREIGHT_SAC_CODE,
  resolveHsnCode,
  deriveGstStateDetails,
  deriveDocumentNumbers,
  numberToIndianRupeesWords,
} from "./invoiceUtils";
import { generateInvoicePdfBuffer } from "./generateInvoicePdf";
import { sendTaxInvoiceOrCreditNoteEmail } from "./email";

/**
 * Generates statutory PDF and emails it to the customer.
 */
export async function sendOrderTaxInvoiceEmailWithPdf(orderIdOrNumber: string): Promise<boolean> {
  try {
    const clean = (orderIdOrNumber || "").trim();
    if (!clean) return false;

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id: clean }, { orderNumber: clean.toUpperCase() }],
      },
      include: {
        items: {
          include: {
            product: true,
            variant: true,
          },
        },
        shippingAddress: true,
        billingAddress: true,
        user: true,
        payments: true,
      },
    });

    if (!order) return false;

    // Load backend admin overrides from SystemSetting if present
    const sellerSetting = await prisma.systemSetting.findUnique({
      where: { key: "INVOICE_SELLER_DETAILS" },
    });
    const sellerDetails = resolveSellerDetails(sellerSetting?.value);

    const isCancelled = order.status === "CANCELLED" || order.status === "REFUNDED";
    const totalAmountNum = Number(order.totalAmount);
    const itemsSubtotalNum = Number(order.itemsSubtotal);
    const shippingChargeNum = Number(order.shippingCharge);
    const amountPaidNum = Number(order.amountPaid);
    const balanceDueNum = Number(order.balanceAmount);

    const isMtoPending =
      (order.purchaseMode === "MADE_TO_ORDER" || Boolean(order.quoteNumber)) &&
      balanceDueNum > 0 &&
      !isCancelled;

    const gstState = deriveGstStateDetails(order.shippingAddress.state);
    const isInterState = gstState.isInterState;
    const docNumbers = deriveDocumentNumbers(order.orderNumber, order.createdAt);

    const documentType = isCancelled
      ? ("CREDIT_NOTE" as const)
      : isMtoPending
      ? ("ADVANCE_RECEIPT" as const)
      : ("TAX_INVOICE" as const);

    const documentNumber = isCancelled
      ? docNumbers.creditNoteNumber
      : isMtoPending
      ? docNumbers.receiptVoucherNumber
      : docNumbers.invoiceNumber;

    const invoiceDateFormatted = new Date(order.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const updatedDateFormatted = new Date(order.updatedAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const lineItems = order.items.map((item, idx) => {
      const itemTotal = Number(item.subtotal);
      const taxableValue = Math.round((itemTotal / 1.18) * 100) / 100;
      const taxAmount = Math.round((itemTotal - taxableValue) * 100) / 100;
      return {
        slNo: idx + 1,
        title: item.product.title,
        variantTitle: item.variant?.title || undefined,
        sku: item.variant?.sku || item.product.sku,
        hsnCode: resolveHsnCode(undefined, item.product.subcategory || undefined, item.product.title),
        quantity: item.quantity,
        unitPriceGross: Number(item.unitPrice),
        taxableValue,
        taxAmount,
        total: itemTotal,
      };
    });

    const freightTaxable = Math.round((shippingChargeNum / 1.18) * 100) / 100;
    const freightTax = Math.round((shippingChargeNum - freightTaxable) * 100) / 100;
    const totalTaxable = Math.round((itemsSubtotalNum / 1.18 + freightTaxable) * 100) / 100;
    const totalTax = Math.round((totalAmountNum - totalTaxable) * 100) / 100;
    const cgstAmount = isInterState ? 0 : Math.round((totalTax / 2) * 100) / 100;
    const sgstAmount = isInterState ? 0 : Math.round((totalTax / 2) * 100) / 100;
    const igstAmount = isInterState ? totalTax : 0;

    const documentTotalRupees = isCancelled ? amountPaidNum : totalAmountNum;
    const amountInWords = numberToIndianRupeesWords(documentTotalRupees);

    const billingAddr = order.billingAddress || order.shippingAddress;

    const pdfBuffer = await generateInvoicePdfBuffer({
      documentType,
      documentNumber,
      documentDate: isCancelled ? updatedDateFormatted : invoiceDateFormatted,
      orderNumber: order.orderNumber,
      placeOfSupply: `${gstState.stateName} (${gstState.stateCode})`,
      isInterState,
      seller: sellerDetails,
      billedTo: {
        fullName: billingAddr.fullName,
        practiceOrStudio: order.user?.practiceOrStudio || null,
        addressLine1: billingAddr.addressLine1,
        addressLine2: billingAddr.addressLine2 || null,
        city: billingAddr.city,
        state: billingAddr.state,
        pincode: billingAddr.pincode,
        phone: billingAddr.phone,
        email: order.customerEmail,
        gstin: order.user?.gstin || null,
      },
      shippedTo: {
        fullName: order.shippingAddress.fullName,
        addressLine1: order.shippingAddress.addressLine1,
        addressLine2: order.shippingAddress.addressLine2 || null,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        pincode: order.shippingAddress.pincode,
        phone: order.shippingAddress.phone,
      },
      lineItems,
      shippingChargeNum,
      freightTaxable,
      freightTax,
      totalTaxable,
      totalTax,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmountNum,
      amountInWords,
      amountPaidNum,
      balanceDueNum,
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://tavistra.com";
    const invoiceUrl = `${appUrl}/orders/${encodeURIComponent(order.orderNumber)}/invoice?contact=${encodeURIComponent(order.customerEmail)}`;
    const trackingUrl = `${appUrl}/track?orderId=${encodeURIComponent(order.orderNumber)}&contact=${encodeURIComponent(order.customerEmail)}`;
    const itemsSummary = order.items.map((i) => `${i.product.title} (×${i.quantity})`).join(", ");

    await sendTaxInvoiceOrCreditNoteEmail({
      orderNumber: order.orderNumber,
      customerName: billingAddr.fullName,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      documentType,
      documentNumber,
      totalAmountRupees: documentTotalRupees,
      itemsSummary,
      invoiceUrl,
      trackingUrl,
      pdfBuffer,
      pdfFileName: `${documentNumber}.pdf`,
    });

    return true;
  } catch (err) {
    console.error("sendOrderTaxInvoiceEmailWithPdf error:", err);
    return false;
  }
}
