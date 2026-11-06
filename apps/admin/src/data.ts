export interface AdminOrder {
  id: string;
  orderNumber: string;
  mode: "READY_STOCK" | "MADE_TO_ORDER";
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: { name: string; quantity: number; priceRupees: number }[];
  itemsSubtotalRupees: number;
  deliveryFeeRupees: number;
  totalAmountRupees: number;
  amountPaidRupees: number;
  balanceDueRupees: number;
  status:
    | "PAYMENT_CONFIRMED"
    | "GRACE_PERIOD_ACTIVE"
    | "WORKSHOP_CRAFTING"
    | "QC_INSPECTION"
    | "DISPATCHED"
    | "DELIVERED"
    | "CANCELLED";
  carrierName: string;
  awbNumber?: string;
  graceDaysRemaining?: number;
  placedAt: string;
}

export interface BulkInquiry {
  id: string;
  clientName: string;
  practiceOrStudio: string;
  email: string;
  phone: string;
  destinationCity: string;
  destinationPincode: string;
  requestedEditions: string;
  quantityUnits: number;
  specifications: string;
  status: "NEW" | "IN_REVIEW" | "QUOTE_ISSUED" | "CLOSED";
  submittedAt: string;
}

export const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: "ord_1001",
    orderNumber: "TAV-RS-2026-1001",
    mode: "READY_STOCK",
    customerName: "Ar. Vikramaditya Sharma",
    email: "vikramaditya@studiovishnu.in",
    phone: "+91 98765 43210",
    address: "Penthouse 4B, Signature Towers, Golf Course Road",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    items: [
      { name: "Monolith Minimalist Wall Clock", quantity: 1, priceRupees: 14500 },
      { name: "Strata Modular Desk Organiser", quantity: 2, priceRupees: 8200 },
    ],
    itemsSubtotalRupees: 30900,
    deliveryFeeRupees: 500,
    totalAmountRupees: 31400,
    amountPaidRupees: 31400, // 100% full verified payment
    balanceDueRupees: 0,
    status: "DISPATCHED",
    carrierName: "Blue Dart Fragile Surface",
    awbNumber: "BD-DEL-89472911",
    placedAt: "Nov 4, 2026",
  },
  {
    id: "ord_2002",
    orderNumber: "TAV-MTO-2026-2002",
    mode: "MADE_TO_ORDER",
    customerName: "Ar. Vikramaditya Sharma",
    email: "vikramaditya@studiovishnu.in",
    phone: "+91 98765 43210",
    address: "14 Barakhamba Road, Connaught Place",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    items: [
      { name: "Arc Sculptural Brass Wall Mirror", quantity: 1, priceRupees: 38000 },
    ],
    itemsSubtotalRupees: 38000,
    deliveryFeeRupees: 1000,
    totalAmountRupees: 39000,
    amountPaidRupees: 9750, // 25% verified advance
    balanceDueRupees: 29250, // 75% remaining
    status: "GRACE_PERIOD_ACTIVE",
    carrierName: "Safeexpress Caged Freight",
    graceDaysRemaining: 4,
    placedAt: "Nov 5, 2026",
  },
  {
    id: "ord_2003",
    orderNumber: "TAV-MTO-2026-2003",
    mode: "MADE_TO_ORDER",
    customerName: "Siddharth Nambiar",
    email: "snambiar@archdesign.co",
    phone: "+91 98111 22334",
    address: "Bespoke Residence, Defence Colony",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110024",
    items: [
      { name: "Aether Architectural Desk Lamp", quantity: 2, priceRupees: 42500 },
    ],
    itemsSubtotalRupees: 85000,
    deliveryFeeRupees: 1500,
    totalAmountRupees: 86500,
    amountPaidRupees: 21625, // 25% verified advance
    balanceDueRupees: 64875,
    status: "WORKSHOP_CRAFTING",
    carrierName: "Blue Dart Express",
    placedAt: "Oct 28, 2026",
  },
];

export const INITIAL_BULK_INQUIRIES: BulkInquiry[] = [
  {
    id: "inq_501",
    clientName: "Meera Krishnan",
    practiceOrStudio: "Studio Vayu Architecture",
    email: "meera@studiovayu.in",
    phone: "+91 98450 11223",
    destinationCity: "Bengaluru",
    destinationPincode: "560001",
    requestedEditions: "Monolith Wall Clock & Strata Desk Organisers",
    quantityUnits: 25,
    specifications: "Corporate suite gifting and boardroom installation for luxury boutique hotel.",
    status: "NEW",
    submittedAt: "Nov 6, 2026",
  },
  {
    id: "inq_502",
    clientName: "Rajiv Sethi",
    practiceOrStudio: "Sethi Hospitality Projects",
    email: "rajiv@sethidesign.com",
    phone: "+91 98100 44556",
    destinationCity: "Jaipur",
    destinationPincode: "302001",
    requestedEditions: "Arc Sculptural Brass Wall Mirrors",
    quantityUnits: 12,
    specifications: "Heritage haveli restoration suites with aged antique brass patina finish.",
    status: "IN_REVIEW",
    submittedAt: "Nov 5, 2026",
  },
];

