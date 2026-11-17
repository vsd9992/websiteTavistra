import PDFDocument from "pdfkit";

export interface InvoicePdfLineItem {
  slNo: number;
  title: string;
  variantTitle?: string;
  sku: string;
  hsnCode: string;
  quantity: number;
  unitPriceGross: number;
  taxableValue: number;
  taxAmount: number;
  total: number;
}

export interface InvoicePdfData {
  documentType: "TAX_INVOICE" | "CREDIT_NOTE" | "ADVANCE_RECEIPT";
  documentNumber: string;
  documentDate: string;
  orderNumber: string;
  placeOfSupply: string;
  isInterState: boolean;
  seller: {
    brandName: string;
    businessUnitLine: string;
    legalEntityName: string;
    tagline: string;
    registeredAddressLine1: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    gstin: string;
    pan: string;
    supportEmail: string;
  };
  billedTo: {
    fullName: string;
    practiceOrStudio?: string | null;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
    phone: string;
    email: string;
    gstin?: string | null;
  };
  shippedTo: {
    fullName: string;
    addressLine1: string;
    addressLine2?: string | null;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  lineItems: InvoicePdfLineItem[];
  shippingChargeNum: number;
  freightTaxable: number;
  freightTax: number;
  totalTaxable: number;
  totalTax: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalAmountNum: number;
  amountInWords: string;
  amountPaidNum: number;
  balanceDueNum: number;
}

export async function generateInvoicePdfBuffer(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 36 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const isCancelled = data.documentType === "CREDIT_NOTE";
      const isMtoPending = data.documentType === "ADVANCE_RECEIPT";

      const docBadge = isCancelled
        ? "GST CREDIT NOTE"
        : isMtoPending
        ? "ADVANCE RECEIPT VOUCHER"
        : "TAX INVOICE";

      // 1. Header (Seller & Document Info)
      doc.font("Helvetica-Bold").fontSize(18).fillColor("#141412").text(data.seller.brandName, 36, 36);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#3e3e38").text(data.seller.businessUnitLine, 36, 58);
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#666660")
        .text(`Legal Entity: ${data.seller.legalEntityName} · ${data.seller.tagline}`, 36, 70)
        .text(`${data.seller.registeredAddressLine1}, ${data.seller.city}, ${data.seller.state} - ${data.seller.pincode}`, 36, 81)
        .text(`GSTIN: ${data.seller.gstin} | PAN: ${data.seller.pan} | Email: ${data.seller.supportEmail}`, 36, 92);

      // Top Right: Badge & Details
      const badgeColor = isCancelled ? "#9f1239" : isMtoPending ? "#92400e" : "#18181b";
      doc.rect(420, 36, 138, 22).fill(badgeColor);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#ffffff").text(docBadge, 420, 42, { width: 138, align: "center" });

      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#333333")
        .text(`Doc No: ${data.documentNumber}`, 400, 68, { align: "right", width: 158 })
        .text(`Date: ${data.documentDate}`, 400, 79, { align: "right", width: 158 })
        .text(`Order Ref: ${data.orderNumber}`, 400, 90, { align: "right", width: 158 })
        .text(`Place of Supply: ${data.placeOfSupply}`, 400, 101, { align: "right", width: 158 });

      // Horizontal separator
      doc.moveTo(36, 115).lineTo(558, 115).strokeColor("#d1d1cc").lineWidth(1).stroke();

      // 2. Billed To & Shipped To Columns
      let y = 125;
      const colWidth = 250;

      // Billed To
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#73736c").text("BILLED TO (CLIENT / STUDIO):", 36, y);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#141412").text(data.billedTo.fullName, 36, y + 12);
      let bY = y + 24;
      if (data.billedTo.practiceOrStudio) {
        doc.font("Helvetica").fontSize(8).fillColor("#555555").text(data.billedTo.practiceOrStudio, 36, bY);
        bY += 10;
      }
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#555555")
        .text(`${data.billedTo.addressLine1}${data.billedTo.addressLine2 ? `, ${data.billedTo.addressLine2}` : ""}`, 36, bY)
        .text(`${data.billedTo.city}, ${data.billedTo.state} — ${data.billedTo.pincode}`, 36, bY + 11)
        .text(`Phone: ${data.billedTo.phone} | Email: ${data.billedTo.email}`, 36, bY + 22);
      if (data.billedTo.gstin) {
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#141412").text(`Client GSTIN: ${data.billedTo.gstin}`, 36, bY + 33);
      }

      // Shipped To
      doc.font("Helvetica-Bold").fontSize(8).fillColor("#73736c").text("SHIPPED TO (CONSIGNEE):", 306, y);
      doc.font("Helvetica-Bold").fontSize(9).fillColor("#141412").text(data.shippedTo.fullName, 306, y + 12);
      doc
        .font("Helvetica")
        .fontSize(8)
        .fillColor("#555555")
        .text(`${data.shippedTo.addressLine1}${data.shippedTo.addressLine2 ? `, ${data.shippedTo.addressLine2}` : ""}`, 306, y + 24)
        .text(`${data.shippedTo.city}, ${data.shippedTo.state} — ${data.shippedTo.pincode}`, 306, y + 35)
        .text(`Destination Phone: ${data.shippedTo.phone}`, 306, y + 46)
        .text("Insured White-Glove Handover · FOV 100% Protection", 306, y + 57);

      // Horizontal separator
      y = 195;
      doc.moveTo(36, y).lineTo(558, y).strokeColor("#d1d1cc").lineWidth(1).stroke();

      // 3. Line Items Table
      y = 205;
      doc.rect(36, y, 522, 18).fill("#f4f4f2");
      doc
        .font("Helvetica-Bold")
        .fontSize(7)
        .fillColor("#333333")
        .text("#", 40, y + 5, { width: 20 })
        .text("Description of Goods / Services", 65, y + 5, { width: 175 })
        .text("HSN/SAC", 245, y + 5, { width: 45, align: "center" })
        .text("Qty", 295, y + 5, { width: 25, align: "center" })
        .text("Gross (Rs)", 325, y + 5, { width: 50, align: "right" })
        .text("Taxable (Rs)", 380, y + 5, { width: 55, align: "right" })
        .text(data.isInterState ? "IGST 18%" : "CGST+SGST", 440, y + 5, { width: 50, align: "right" })
        .text("Total (Rs)", 495, y + 5, { width: 58, align: "right" });

      y += 20;

      data.lineItems.forEach((item) => {
        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor("#333333")
          .text(String(item.slNo), 40, y, { width: 20 })
          .font("Helvetica-Bold")
          .text(item.title, 65, y, { width: 175 });

        if (item.variantTitle) {
          doc.font("Helvetica").fontSize(6.5).fillColor("#666666").text(`Finish: ${item.variantTitle}`, 65, y + 9);
        }

        doc
          .font("Helvetica")
          .fontSize(7.5)
          .fillColor("#333333")
          .text(item.hsnCode, 245, y, { width: 45, align: "center" })
          .text(String(item.quantity), 295, y, { width: 25, align: "center" })
          .text(item.unitPriceGross.toFixed(2), 325, y, { width: 50, align: "right" })
          .text(item.taxableValue.toFixed(2), 380, y, { width: 55, align: "right" })
          .text(item.taxAmount.toFixed(2), 440, y, { width: 50, align: "right" })
          .font("Helvetica-Bold")
          .text(item.total.toFixed(2), 495, y, { width: 58, align: "right" });

        y += item.variantTitle ? 22 : 16;
        doc.moveTo(36, y - 2).lineTo(558, y - 2).strokeColor("#ebebeb").lineWidth(0.5).stroke();
      });

      // Freight Line Item
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#333333")
        .text(String(data.lineItems.length + 1), 40, y, { width: 20 })
        .font("Helvetica-Bold")
        .text("Insured Crating & Courier Transport", 65, y, { width: 175 })
        .font("Helvetica")
        .fontSize(6.5)
        .fillColor("#666666")
        .text("Carrier's Risk (FOV Insurance Included)", 65, y + 9)
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#333333")
        .text("996812", 245, y, { width: 45, align: "center" })
        .text("1", 295, y, { width: 25, align: "center" })
        .text(data.shippingChargeNum.toFixed(2), 325, y, { width: 50, align: "right" })
        .text(data.freightTaxable.toFixed(2), 380, y, { width: 55, align: "right" })
        .text(data.freightTax.toFixed(2), 440, y, { width: 50, align: "right" })
        .font("Helvetica-Bold")
        .text(data.shippingChargeNum.toFixed(2), 495, y, { width: 58, align: "right" });

      y += 24;
      doc.moveTo(36, y).lineTo(558, y).strokeColor("#d1d1cc").lineWidth(1).stroke();

      // 4. Totals & Words Grid
      y += 12;

      // Left Box: Total in words & Settlement
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor("#73736c").text(isCancelled ? "CREDITED VALUE IN WORDS:" : "TOTAL AMOUNT IN WORDS:", 36, y);
      doc.font("Helvetica-Oblique").fontSize(8).fillColor("#141412").text(data.amountInWords, 36, y + 10, { width: 280 });

      const boxY = y + 32;
      doc.rect(36, boxY, 280, 52).fillAndStroke("#fafaf8", "#e5e5e0");
      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor("#333333")
        .text("Payment & Settlement:", 44, boxY + 8)
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#555555")
        .text(`Method: PhonePe Verified Electronic`, 44, boxY + 20)
        .text(`Amount Paid: Rs ${data.amountPaidNum.toFixed(2)}`, 44, boxY + 31);

      if (data.balanceDueNum > 0) {
        doc.font("Helvetica-Bold").fillColor("#92400e").text(`Balance Due at Dispatch: Rs ${data.balanceDueNum.toFixed(2)}`, 44, boxY + 42);
      } else {
        doc.font("Helvetica-Bold").fillColor("#065f46").text("Settlement Status: 100% Upfront Verified Settlement", 44, boxY + 42);
      }

      // Right Box: Tax Summary
      const rX = 340;
      doc.rect(rX, y, 218, 84).fillAndStroke("#fafaf8", "#e5e5e0");
      doc
        .font("Helvetica")
        .fontSize(7.5)
        .fillColor("#555555")
        .text("Taxable Value:", rX + 12, y + 10)
        .text(`Rs ${data.totalTaxable.toFixed(2)}`, rX + 120, y + 10, { width: 86, align: "right" });

      if (data.isInterState) {
        doc.text("IGST (18.0%):", rX + 12, y + 24).text(`Rs ${data.igstAmount.toFixed(2)}`, rX + 120, y + 24, { width: 86, align: "right" });
      } else {
        doc.text("CGST (9.0%):", rX + 12, y + 24).text(`Rs ${data.cgstAmount.toFixed(2)}`, rX + 120, y + 24, { width: 86, align: "right" });
        doc.text("SGST (9.0%):", rX + 12, y + 38).text(`Rs ${data.sgstAmount.toFixed(2)}`, rX + 120, y + 38, { width: 86, align: "right" });
      }

      doc.moveTo(rX + 8, y + 54).lineTo(rX + 210, y + 54).strokeColor("#d1d1cc").lineWidth(0.5).stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(8.5)
        .fillColor("#141412")
        .text(isCancelled ? "Credited Total:" : "Grand Total (GST Incl.):", rX + 12, y + 64)
        .text(`Rs ${data.totalAmountNum.toFixed(2)}`, rX + 120, y + 64, { width: 86, align: "right" });

      // 5. Statutory Declaration Footer (Cleaned of heavy rule citations)
      const footerY = 440;
      doc.moveTo(36, footerY).lineTo(558, footerY).strokeColor("#141412").lineWidth(1).stroke();

      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor("#141412")
        .text("Declaration:", 36, footerY + 10)
        .font("Helvetica")
        .fontSize(7)
        .fillColor("#555555")
        .text(
          isCancelled
            ? "We declare that this Credit Note shows the actual reduction in output tax liability and credit value. All credits have been verified."
            : "We declare that this invoice shows the actual price of the goods and services described and that all particulars are true and correct. All products are covered by Tavistra artisanal warranty.",
          36,
          footerY + 22,
          { width: 280 }
        );

      doc
        .font("Helvetica-Bold")
        .fontSize(7.5)
        .fillColor("#141412")
        .text(`Issued for: ${data.seller.legalEntityName} (Trade Name: ${data.seller.brandName})`, 340, footerY + 10, { width: 218, align: "right" })
        .font("Helvetica")
        .fontSize(7)
        .fillColor("#666666")
        .text("Electronic Document: This is an authoritative system-generated document. No physical signature is required.", 340, footerY + 22, {
          width: 218,
          align: "right",
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
