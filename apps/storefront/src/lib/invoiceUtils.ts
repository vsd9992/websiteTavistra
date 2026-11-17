/**
 * Indian GST Tax Invoice Utilities (CGST Rules, 2017 · Rule 46)
 * Standards benchmarked against Amazon India & Flipkart.
 */

export interface GstTaxBreakdown {
  isInterState: boolean;
  stateCode: string;
  stateName: string;
  totalTaxableValuePaise: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalTaxPaise: number;
  totalAmountPaise: number;
}

export interface InvoiceLineItem {
  slNo: number;
  title: string;
  variantTitle?: string;
  sku: string;
  hsnCode: string;
  quantity: number;
  unitPricePaise: number; // Tax-inclusive
  taxableValuePaise: number;
  gstRatePercent: number;
  cgstPaise: number;
  sgstPaise: number;
  igstPaise: number;
  totalPaise: number;
}

export const DEFAULT_SELLER_DETAILS = {
  legalEntityName: "VDesign",
  brandName: "Tavistra",
  businessUnitLine: "A business unit of VDesign",
  tagline: "Design-led lifestyle & architectural décor",
  registeredAddressLine1: "New Delhi Design Studio, Okhla Industrial Area Phase III",
  city: "New Delhi",
  state: "Delhi",
  stateCode: "07",
  pincode: "110045",
  country: "India",
  gstin: "07AAAFV1234A1Z5",
  pan: "AAAFV1234A",
  supportEmail: "support@tavistra.com",
  deskHours: "Mon – Fri, 10:00 AM – 5:00 PM IST",
};

export const SELLER_DETAILS = DEFAULT_SELLER_DETAILS;

/**
 * Resolves legal seller details with database SystemSetting overrides if configured in backend.
 */
export function resolveSellerDetails(overrideJson?: string | null): typeof DEFAULT_SELLER_DETAILS {
  if (!overrideJson) return DEFAULT_SELLER_DETAILS;
  try {
    const parsed = JSON.parse(overrideJson);
    return {
      ...DEFAULT_SELLER_DETAILS,
      ...parsed,
    };
  } catch {
    return DEFAULT_SELLER_DETAILS;
  }
}

/**
 * Generates official statutory reference numbers
 */
export function deriveDocumentNumbers(orderNumber: string, date: Date | string) {
  const d = new Date(date);
  const year = isNaN(d.getFullYear()) ? new Date().getFullYear() : d.getFullYear();
  const digits = orderNumber.replace(/\D/g, "");
  const suffix = digits.slice(-4) || orderNumber;

  return {
    invoiceNumber: `TAV-INV-${year}-${suffix}`,
    creditNoteNumber: `TAV-CN-${year}-${suffix}`,
    receiptVoucherNumber: `TAV-RCV-${year}-${suffix}`,
  };
}

/**
 * Resolves standard 4-digit or 6-digit HSN code based on product attributes
 */
export function resolveHsnCode(categorySlug?: string, subcategory?: string, productName?: string): string {
  const combined = `${categorySlug || ""} ${subcategory || ""} ${productName || ""}`.toLowerCase();

  if (combined.includes("clock") || combined.includes("timepiece")) {
    return "9105"; // Clocks, watches and parts
  }
  if (combined.includes("mirror")) {
    return "7009"; // Glass mirrors, whether or not framed
  }
  if (combined.includes("light") || combined.includes("lamp") || combined.includes("luminaire") || combined.includes("sconce")) {
    return "9405"; // Lamps and lighting fittings
  }
  if (combined.includes("desk") || combined.includes("organis") || combined.includes("storage") || combined.includes("stand")) {
    return "9403"; // Furniture and parts thereof
  }
  if (combined.includes("sculpture") || combined.includes("art") || combined.includes("monolith") || combined.includes("brass") || combined.includes("stone")) {
    return "6815"; // Articles of stone or of other mineral substances / Art
  }

  return "9403"; // Default furniture & architectural lifestyle objects
}

export const FREIGHT_SAC_CODE = "996812"; // Courier & insured cargo freight services

/**
 * Converts numeric amount in Rupees into standard Indian English words
 * e.g. 8450 -> "Eight Thousand Four Hundred Fifty Indian Rupees Only"
 */
export function numberToIndianRupeesWords(amountRupees: number): string {
  const rounded = Math.round(Math.abs(amountRupees));
  if (rounded === 0) return "Zero Indian Rupees Only";

  const singleDigits = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const twoDigits = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tensMultiple = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertBelowThousand(n: number): string {
    let str = "";
    if (n >= 100) {
      str += singleDigits[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 10 && n <= 19) {
      str += twoDigits[n - 10] + " ";
    } else if (n >= 20) {
      str += tensMultiple[Math.floor(n / 10)] + " ";
      if (n % 10 > 0) {
        str += singleDigits[n % 10] + " ";
      }
    } else if (n > 0) {
      str += singleDigits[n] + " ";
    }
    return str;
  }

  let words = "";

  const crore = Math.floor(rounded / 10000000);
  let remainder = rounded % 10000000;

  const lakh = Math.floor(remainder / 100000);
  remainder = remainder % 100000;

  const thousand = Math.floor(remainder / 1000);
  remainder = remainder % 1000;

  const hundredAndBelow = remainder;

  if (crore > 0) {
    words += convertBelowThousand(crore).trim() + " Crore ";
  }
  if (lakh > 0) {
    words += convertBelowThousand(lakh).trim() + " Lakh ";
  }
  if (thousand > 0) {
    words += convertBelowThousand(thousand).trim() + " Thousand ";
  }
  if (hundredAndBelow > 0) {
    words += convertBelowThousand(hundredAndBelow).trim() + " ";
  }

  return `${words.trim()} Indian Rupees Only`;
}

/**
 * Derives Indian State code and whether delivery is intra-state (Delhi) vs inter-state
 */
export function deriveGstStateDetails(destinationState: string): {
  isInterState: boolean;
  stateCode: string;
  stateName: string;
} {
  const clean = destinationState.trim().toLowerCase();
  const isDelhi = clean === "delhi" || clean === "new delhi" || clean === "dl" || clean === "07";

  // Standard Indian State Codes
  const STATE_CODE_MAP: Record<string, string> = {
    "delhi": "07",
    "new delhi": "07",
    "haryana": "06",
    "punjab": "03",
    "uttar pradesh": "09",
    "rajasthan": "08",
    "maharashtra": "27",
    "karnataka": "29",
    "tamil nadu": "33",
    "telangana": "36",
    "gujarat": "24",
    "west bengal": "19",
    "kerala": "32",
    "madhya pradesh": "23",
    "bihar": "10",
    "odisha": "21",
    "andhra pradesh": "37",
    "assam": "18",
    "chandigarh": "04",
    "goa": "30",
    "himachal pradesh": "02",
    "jammu and kashmir": "01",
    "jharkhand": "20",
    "uttarakhand": "05",
  };

  const stateCode = STATE_CODE_MAP[clean] || (isDelhi ? "07" : "99");

  return {
    isInterState: !isDelhi,
    stateCode,
    stateName: isDelhi ? "Delhi" : destinationState,
  };
}
