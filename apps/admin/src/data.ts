export interface AdminOrderRefund {
  amountRupees: number;
  status: string;
  gateway?: string;
  reference?: string;
  verifiedAt?: string | null;
  notes?: string | null;
}

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
    | "CONFIRMED"
    | "GRACE_PERIOD_ACTIVE"
    | "IN_PRODUCTION"
    | "WORKSHOP_CRAFTING"
    | "QC_INSPECTION"
    | "PRODUCTION_COMPLETED"
    | "AWAITING_DISPATCH"
    | "DISPATCHED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  carrierName: string;
  awbNumber?: string;
  graceDaysRemaining?: number;
  isGraceActive?: boolean;
  releaseEligibleDate?: string | null;
  isFullyPaid?: boolean;
  paymentStatusLabel?: string;
  qcNotes?: string;
  qcImages?: string[];
  refund?: AdminOrderRefund | null;
  cancelledAt?: string | null;
  quoteNumber?: string | null;
  placedAt: string;
}

export interface BulkInquiry {
  id: string;
  inquiryNumber?: string;
  clientName: string;
  practiceOrStudio: string;
  email: string;
  phone: string;
  destinationCity: string;
  destinationPincode: string;
  requestedEditions: string;
  quantityUnits: number;
  specifications: string;
  lineItemsJson?: string | null;
  lineItems?: Array<{
    name: string;
    finish?: string;
    quantity: number;
    unitPriceRupees: number;
  }>;
  quoteNumber?: string | null;
  quoteStatus?: string | null;
  orderNumber?: string | null;
  orderStatus?: string | null;
  orderId?: string | null;
  status: "NEW" | "IN_REVIEW" | "QUOTE_ISSUED" | "ORDER_CONFIRMED" | "ORDER_CANCELLED" | "CLOSED" | string;
  submittedAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  orderNumber?: string;
  customerName: string;
  email: string;
  phone: string;
  subject: string;
  category:
    | "ORDER_INQUIRY"
    | "SPEC_ALTERATION"
    | "DELIVERY_SCHEDULE"
    | "DAMAGE_REPORT"
    | "CANCELLATION"
    | "GENERAL_ASSISTANCE"
    | (string & {});
  priority: "NORMAL" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED";
  createdAt: string;
  messages: {
    id: string;
    sender: "CUSTOMER" | "STAFF";
    authorName: string;
    text: string;
    timestamp: string;
  }[];
}

export interface CustomerProfileAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  practiceOrStudio?: string;
  gstin?: string;
  emailVerified?: boolean;
  isRegistered: boolean;
  totalOrders: number;
  lifetimeSpendRupees: number;
  city: string;
  state: string;
  pincode: string;
  addresses?: CustomerProfileAddress[];
  createdAt: string;
  notes?: string;
}

export interface CatalogueVariantItem {
  id: string;
  sku: string;
  title: string;
  materialFinish?: string;
  color?: string;
  imageUrl?: string | null;
  priceRupees: number;
  stock: number;
  description?: string;
  dimensions?: string;
  weightGrams?: number;
  isPublished?: boolean;
}

export interface CatalogueItem {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  category: string;
  categorySlug?: string;
  subcategory?: string | null;
  productType?: string | null;
  mode: "READY_STOCK" | "MADE_TO_ORDER" | "QUOTE_ONLY";
  priceRupees: number;
  minPriceRupees?: number;
  maxPriceRupees?: number;
  isVariablePrice?: boolean;
  availableStock: number;
  reservedStock: number;
  isPublished: boolean;
  primaryImageUrl?: string | null;
  imageUrls?: string[];
  variants?: CatalogueVariantItem[];
  shortDescription: string;
  fullDescription: string;
  materials: string[];
  dimensions: string;
  weightGrams: number;
  packedWeightKg: number;
  packedVolumetricKg: number;
  returnPolicy: string;
  markdownFile: string;
  allowedDeliveryZones?: string[];
}

export interface DeliveryZoneConfig {
  code: "ZONE_A" | "ZONE_B" | "ZONE_C" | "ZONE_D" | "ZONE_E";
  letter: "A" | "B" | "C" | "D" | "E";
  name: string;
  label: string;
  description: string;
}

export const DELIVERY_ZONES_CONFIG: DeliveryZoneConfig[] = [
  { code: "ZONE_A", letter: "A", name: "Zone A", label: "Intra-City Metro (NCR Hub)", description: "Origin hub local radius (<50km) with expedited ground courier" },
  { code: "ZONE_B", letter: "B", name: "Zone B", label: "Regional Tier-1 Metros", description: "Direct arterial air & express surface freight (Mumbai, Bengaluru, etc.)" },
  { code: "ZONE_C", letter: "C", name: "Zone C", label: "Rest of India Tier-2", description: "Secondary urban logistics lanes & major district headquarters" },
  { code: "ZONE_D", letter: "D", name: "Zone D", label: "Special Terrains & Remote", description: "Hills, Northeast, island territories & extended transit corridors" },
  { code: "ZONE_E", letter: "E", name: "Zone E", label: "Heavy Freight / White-Glove", description: "Crated oversized haulage (>20kg) requiring scheduled two-person uncrating" },
];

export interface PincodeEntry {
  id: string;
  pincode: string;
  city: string;
  state: string;
  zoneCode: "ZONE_A" | "ZONE_B" | "ZONE_C" | "ZONE_D";
  zoneLabel: string;
  isServiceable: boolean;
  carrierAccepted: boolean;
  verifiedDate: string;
}

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "COMMERCE_ADMIN" | "PRODUCTION_STAFF" | "SUPPORT_STAFF";
  roleLabel: string;
  avatarInitials: string;
}

export interface AuditEntry {
  id: string;
  staffName: string;
  action: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details: string;
}

export interface ReturnRmaItem {
  id: string;
  rmaNumber: string; // e.g. RMA-2026-0042
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  productTitle: string;
  sku: string;
  amountRupees: number;
  trackType: "GRACE_COOLING" | "TRANSIT_DAMAGE" | "STATUTORY_DEFECT";
  status: "REQUESTED" | "REVERSE_AWB_ISSUED" | "INTAKE_INSPECTED" | "REFUND_PROCESSED" | "REJECTED";
  reverseCarrier?: string;
  reverseAwbNumber?: string;
  inspectionVerdict?: "RESTOCK_TO_INVENTORY" | "RE_MACHINE_OR_POLISH" | "SCRAP_TO_FOUNDRY";
  inspectionNotes?: string;
  creditNoteNumber?: string; // Statutory Rule 53 e.g. CN-2026-0012
  refundUtr?: string;
  gatewayRefundId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface InventoryItem {
  id: string;
  variantId: string;
  productId: string;
  productName: string;
  variantTitle: string;
  sku: string;
  finishName: string;
  category: string;
  onHandStock: number;
  reservedStock: number;
  availableStock: number; // onHandStock - reservedStock
  lowStockThreshold: number;
  warehouseLocation: string; // e.g. "Delhi Hub (110062) - Bay A3"
  priceRupees: number;
  imageUrl?: string;
}

export interface StockMovementRecord {
  id: string;
  inventoryId: string;
  sku: string;
  productName: string;
  type: "INITIAL_STOCK" | "RESTOCK" | "ORDER_FULFILLED" | "RETURN_RESTOCK" | "MANUAL_ADJUSTMENT" | "FOUNDRY_RECEIPT" | "SCRAP_DISCREPANCY" | "COMMITTED_RESERVE";
  quantity: number; // positive for addition, negative for deduction
  balanceAfter: number;
  referenceId?: string; // Order #, RMA #, or Adjustment Ticket
  notes: string;
  staffName: string;
  timestamp: string;
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
    amountPaidRupees: 31400,
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
    amountPaidRupees: 9750,
    balanceDueRupees: 29250,
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
    amountPaidRupees: 21625,
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

export const INITIAL_SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "tck_801",
    ticketNumber: "TCK-2026-801",
    orderNumber: "TAV-MTO-2026-2002",
    customerName: "Ar. Vikramaditya Sharma",
    email: "vikramaditya@studiovishnu.in",
    phone: "+91 98765 43210",
    subject: "Requesting Satin Finish Alteration within 7-Day Grace",
    category: "SPEC_ALTERATION",
    priority: "HIGH",
    status: "OPEN",
    createdAt: "Nov 6, 2026 14:20 IST",
    messages: [
      {
        id: "msg_1",
        sender: "CUSTOMER",
        authorName: "Ar. Vikramaditya Sharma",
        text: "Greetings. My order TAV-MTO-2026-2002 is currently in its Day 4 grace window. Could the frame patina for the Arc Mirror be adjusted from Aged Antique to Raw Satin Brushed before Day 8 workshop machining begins?",
        timestamp: "Nov 6, 2026 14:20 IST",
      },
    ],
  },
  {
    id: "tck_802",
    ticketNumber: "TCK-2026-802",
    orderNumber: "TAV-RS-2026-1001",
    customerName: "Ar. Vikramaditya Sharma",
    email: "vikramaditya@studiovishnu.in",
    phone: "+91 98765 43210",
    subject: "Delivery Appointment Scheduling with Blue Dart",
    category: "DELIVERY_SCHEDULE",
    priority: "NORMAL",
    status: "IN_PROGRESS",
    createdAt: "Nov 5, 2026 10:15 IST",
    messages: [
      {
        id: "msg_2",
        sender: "CUSTOMER",
        authorName: "Ar. Vikramaditya Sharma",
        text: "Please request the courier partner to arrange delivery after 2 PM on Monday when the studio concierge is on duty.",
        timestamp: "Nov 5, 2026 10:15 IST",
      },
      {
        id: "msg_3",
        sender: "STAFF",
        authorName: "Kavita (Fulfilment Desk)",
        text: "Acknowledged, Vikramaditya. Special handling instruction has been logged with Blue Dart hub under AWB BD-DEL-89472911 for afternoon delivery appointment.",
        timestamp: "Nov 5, 2026 11:30 IST",
      },
    ],
  },
];

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: "cust_01",
    name: "Ar. Vikramaditya Sharma",
    email: "vikramaditya@studiovishnu.in",
    phone: "+91 98765 43210",
    practiceOrStudio: "Studio Vishnu Architecture",
    gstin: "07AAAAA0000A1Z5",
    isRegistered: true,
    totalOrders: 2,
    lifetimeSpendRupees: 70400,
    city: "Gurugram",
    state: "Haryana",
    pincode: "122002",
    createdAt: "October 2026",
    notes: "Principal architect. High-value repeat acquisitions.",
  },
  {
    id: "cust_02",
    name: "Siddharth Nambiar",
    email: "snambiar@archdesign.co",
    phone: "+91 98111 22334",
    practiceOrStudio: "Nambiar Design Associates",
    gstin: "07BBBBB1111B2Z6",
    isRegistered: true,
    totalOrders: 1,
    lifetimeSpendRupees: 86500,
    city: "New Delhi",
    state: "Delhi",
    pincode: "110024",
    createdAt: "October 2026",
    notes: "Specializes in luxury residential fit-outs.",
  },
  {
    id: "cust_03",
    name: "Meera Krishnan",
    email: "meera@studiovayu.in",
    phone: "+91 98450 11223",
    practiceOrStudio: "Studio Vayu Architecture",
    isRegistered: false,
    totalOrders: 0,
    lifetimeSpendRupees: 0,
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560001",
    createdAt: "November 2026",
    notes: "Commercial inquiry lead (25 units).",
  },
];

export const INITIAL_CATALOGUE: CatalogueItem[] = [
  {
    id: "cat_01",
    slug: "monolith-minimalist-wall-clock",
    sku: "TAV-CLK-001",
    name: "Monolith Minimalist Wall Clock",
    category: "Home Décor & Objects",
    mode: "READY_STOCK",
    priceRupees: 14500,
    minPriceRupees: 14500,
    maxPriceRupees: 16200,
    isVariablePrice: true,
    availableStock: 8,
    reservedStock: 1,
    isPublished: true,
    primaryImageUrl: "/uploads/products/monolith-minimalist-wall-clock/monolith-obsidian-hero.svg",
    imageUrls: [
      "/uploads/products/monolith-minimalist-wall-clock/monolith-obsidian-hero.svg",
      "/uploads/products/monolith-minimalist-wall-clock/monolith-obsidian-detail.svg",
      "/uploads/products/monolith-minimalist-wall-clock/monolith-raw-hero.svg",
      "/uploads/products/monolith-minimalist-wall-clock/monolith-raw-detail.svg",
    ],
    variants: [
      {
        id: "var_01_ob",
        sku: "TAV-CLK-001-OB",
        title: "Matte Obsidian & Brushed Brass",
        materialFinish: "Anodised Matte Obsidian Body with Unlacquered Brushed Brass Hands",
        imageUrl: "/uploads/products/monolith-minimalist-wall-clock/monolith-obsidian-hero.svg",
        priceRupees: 14500,
        stock: 4,
        description: "Precision-milled aerospace aluminium chassis in deep non-reflective matte obsidian, contrasted with living satin brushed brass hands.",
        dimensions: "320mm Dia × 38mm D",
        weightGrams: 2400,
        isPublished: true,
      },
      {
        id: "var_01_raw",
        sku: "TAV-CLK-001-RAW",
        title: "Raw Brushed Aluminium & Natural Brass",
        materialFinish: "Raw Monolithic Aluminium with Satin Directional Brush",
        imageUrl: "/uploads/products/monolith-minimalist-wall-clock/monolith-raw-hero.svg",
        priceRupees: 16200,
        stock: 4,
        description: "Machine-finished monolithic aerospace aluminium displaying continuous radial grain toolpaths and natural metallic luster.",
        dimensions: "320mm Dia × 38mm D",
        weightGrams: 2400,
        isPublished: true,
      },
    ],
    allowedDeliveryZones: ["ZONE_A", "ZONE_B", "ZONE_C", "ZONE_D", "ZONE_E"],
    shortDescription: "Precision-milled aerospace aluminium body with an unlacquered brushed brass dial.",
    fullDescription: "Machined from a single block of aerospace aluminium with brushed brass hands and silent German quartz movement. Concealed flush wall mounting system included.",
    materials: ["Milled Solid Aluminium", "Brushed Brass", "Silent German Quartz Movement"],
    dimensions: "320mm Dia × 38mm D",
    weightGrams: 2400,
    packedWeightKg: 3.2,
    packedVolumetricKg: 1.8,
    returnPolicy: "7-Day Return Guarantee eligible",
    markdownFile: "docs/products/monolith-minimalist-wall-clock/monolith-minimalist-wall-clock.md",
  },
  {
    id: "cat_02",
    slug: "arc-solid-brass-wall-mirror",
    sku: "TAV-MIR-002",
    name: "Arc Sculptural Brass Wall Mirror",
    category: "Home Décor & Objects",
    mode: "MADE_TO_ORDER",
    priceRupees: 38000,
    minPriceRupees: 38000,
    maxPriceRupees: 52000,
    isVariablePrice: true,
    availableStock: 0,
    reservedStock: 0,
    isPublished: true,
    primaryImageUrl: "/uploads/products/arc-solid-brass-wall-mirror/arc-mirror-hero.svg",
    imageUrls: [
      "/uploads/products/arc-solid-brass-wall-mirror/arc-mirror-hero.svg",
      "/uploads/products/arc-solid-brass-wall-mirror/arc-mirror-detail.svg",
      "/uploads/products/arc-solid-brass-wall-mirror/arc-mirror-grand-hero.svg",
      "/uploads/products/arc-solid-brass-wall-mirror/arc-mirror-grand-detail.svg",
    ],
    variants: [
      {
        id: "var_02_std",
        sku: "TAV-MIR-002-STD",
        title: "Standard Edition (600 × 900 mm)",
        materialFinish: "Hand-Rolled Architectural Solid Brass with Satin Mitred Joinery",
        imageUrl: "/uploads/products/arc-solid-brass-wall-mirror/arc-mirror-hero.svg",
        priceRupees: 38000,
        stock: 0,
        description: "Balanced residential proportion featuring heavy-gauge brass frame and French cleat mounting bracket.",
        dimensions: "600mm W × 900mm H × 30mm D",
        weightGrams: 8500,
        isPublished: true,
      },
      {
        id: "var_02_grd",
        sku: "TAV-MIR-002-GRD",
        title: "Grand Vanity Edition (800 × 1200 mm)",
        materialFinish: "Heavy-Gauge Crated Architectural Solid Brass",
        imageUrl: "/uploads/products/arc-solid-brass-wall-mirror/arc-mirror-grand-hero.svg",
        priceRupees: 52000,
        stock: 0,
        description: "Architectural focal mirror for grand master suites and hotel suites with reinforced internal steel bracing.",
        dimensions: "800mm W × 1200mm H × 35mm D",
        weightGrams: 14200,
        isPublished: true,
      },
    ],
    allowedDeliveryZones: ["ZONE_A", "ZONE_B", "ZONE_C"],
    shortDescription: "Hand-rolled architectural brass frame cradling high-definition distortion-free float glass.",
    fullDescription: "Solid architectural brass frame cradling high-definition distortion-free silvered float mirror glass. Reinforced heavy-gauge Z-bar wall cleat mounting.",
    materials: ["Solid Architect's Brass", "HD Silvered Float Glass", "Engineered Wood Backing"],
    dimensions: "600mm W × 900mm H × 30mm D",
    weightGrams: 8500,
    packedWeightKg: 12.5,
    packedVolumetricKg: 10.6,
    returnPolicy: "Made to Order: 7-day pre-production grace cancellation with 100% advance refund",
    markdownFile: "docs/products/arc-solid-brass-wall-mirror/arc-solid-brass-wall-mirror.md",
  },
  {
    id: "cat_03",
    slug: "strata-modular-desk-organiser",
    sku: "TAV-DSK-003",
    name: "Strata Modular Desk Organiser",
    category: "Desk & Workspace",
    mode: "READY_STOCK",
    priceRupees: 8200,
    minPriceRupees: 8200,
    maxPriceRupees: 8200,
    isVariablePrice: false,
    availableStock: 22,
    reservedStock: 2,
    isPublished: true,
    primaryImageUrl: "/uploads/products/strata-modular-desk-organiser/strata-hero.svg",
    imageUrls: [
      "/uploads/products/strata-modular-desk-organiser/strata-hero.svg",
      "/uploads/products/strata-modular-desk-organiser/strata-detail.svg",
      "/uploads/products/strata-modular-desk-organiser/strata-sand-macro.svg",
    ],
    variants: [
      {
        id: "var_03_chr",
        sku: "TAV-DSK-003-CHR",
        title: "Warm Charcoal Mineral Stone & Bronze",
        materialFinish: "Weighted Mineral Composite with Hard-Anodised Bronze Channel",
        imageUrl: "/uploads/products/strata-modular-desk-organiser/strata-hero.svg",
        priceRupees: 8200,
        stock: 12,
        description: "Deep architectural charcoal stone base with natural anti-scratch wool felt underside.",
        dimensions: "280mm L × 140mm W × 45mm H",
        weightGrams: 1800,
        isPublished: true,
      },
      {
        id: "var_03_snd",
        sku: "TAV-DSK-003-SND",
        title: "Natural Sand Stone & Raw Aluminium",
        materialFinish: "Fine Cast Mineral Sand Stone with Clear Anodised Aluminium",
        imageUrl: "/uploads/products/strata-modular-desk-organiser/strata-detail.svg",
        priceRupees: 8200,
        stock: 10,
        description: "Warm sandstone textured body echoing desert rammed-earth architecture.",
        dimensions: "280mm L × 140mm W × 45mm H",
        weightGrams: 1800,
        isPublished: true,
      },
    ],
    allowedDeliveryZones: ["ZONE_A", "ZONE_B", "ZONE_C", "ZONE_D", "ZONE_E"],
    shortDescription: "Weighted cast composite stone with integrated anodised bronze pen channels.",
    fullDescription: "Substantial 1.8kg weighted base prevents desk slippage with natural wool felt smartphone tray and micro-catchment for stationery clips.",
    materials: ["Cast Mineral Stone", "Anodised Bronze Aluminium", "Natural Wool Felt"],
    dimensions: "280mm L × 140mm W × 45mm H",
    weightGrams: 1800,
    packedWeightKg: 2.3,
    packedVolumetricKg: 0.7,
    returnPolicy: "Standard non-returnable unless defective on arrival",
    markdownFile: "docs/products/strata-modular-desk-organiser/strata-modular-desk-organiser.md",
  },
  {
    id: "cat_04",
    slug: "aether-kinetic-desk-lamp",
    sku: "TAV-LGT-004",
    name: "Aether Architectural Desk Lamp",
    category: "Lighting & Ambience",
    mode: "MADE_TO_ORDER",
    priceRupees: 42500,
    minPriceRupees: 42500,
    maxPriceRupees: 46000,
    isVariablePrice: true,
    availableStock: 0,
    reservedStock: 0,
    isPublished: true,
    primaryImageUrl: "/uploads/products/aether-kinetic-desk-lamp/aether-hero.svg",
    imageUrls: [
      "/uploads/products/aether-kinetic-desk-lamp/aether-hero.svg",
      "/uploads/products/aether-kinetic-desk-lamp/aether-detail.svg",
      "/uploads/products/aether-kinetic-desk-lamp/aether-brass-hero.svg",
    ],
    variants: [
      {
        id: "var_04_gm",
        sku: "TAV-LGT-004-GM",
        title: "Gunmetal & Brushed Brass",
        materialFinish: "Gunmetal Stainless Steel Counterweight Arm with Living Brass Details",
        imageUrl: "/uploads/products/aether-kinetic-desk-lamp/aether-hero.svg",
        priceRupees: 42500,
        stock: 0,
        description: "Dynamic mechanical counterbalance mechanism with calibrated rotational brass dimmer.",
        dimensions: "520mm Reach × 480mm Max Height",
        weightGrams: 4200,
        isPublished: true,
      },
      {
        id: "var_04_br",
        sku: "TAV-LGT-004-BR",
        title: "Monolithic Patinated Brass",
        materialFinish: "Living Raw Brass with Micro-Crystalline Studio Wax",
        imageUrl: "/uploads/products/aether-kinetic-desk-lamp/aether-brass-hero.svg",
        priceRupees: 46000,
        stock: 0,
        description: "All-brass kinetic luminaire intended to develop rich natural golden and antique patina over decades.",
        dimensions: "520mm Reach × 480mm Max Height",
        weightGrams: 4400,
        isPublished: true,
      },
    ],
    allowedDeliveryZones: ["ZONE_A", "ZONE_B", "ZONE_C", "ZONE_D", "ZONE_E"],
    shortDescription: "Counterbalanced articulated arm in gunmetal stainless steel with warm 2700K LED optic engine.",
    fullDescription: "Fluid counterbalance movement with zero spring backlash, precision rotary dimmer switch, and CRI 95+ warm architectural light.",
    materials: ["Gunmetal Stainless Steel", "Counterweight Brass", "High-CRI LED 2700K"],
    dimensions: "520mm Reach × 480mm Max Height",
    weightGrams: 4200,
    packedWeightKg: 5.6,
    packedVolumetricKg: 4.8,
    returnPolicy: "Made to Order: 7-day pre-production grace cancellation with 100% advance refund",
    markdownFile: "docs/products/aether-kinetic-desk-lamp/aether-kinetic-desk-lamp.md",
  },
  {
    id: "cat_05",
    slug: "torus-sculptural-brass-key-tag",
    sku: "TAV-ACC-005",
    name: "Torus Sculptural Brass Key Tag",
    category: "Personal Accessories",
    mode: "READY_STOCK",
    priceRupees: 3400,
    minPriceRupees: 3400,
    maxPriceRupees: 3800,
    isVariablePrice: true,
    availableStock: 35,
    reservedStock: 0,
    isPublished: true,
    primaryImageUrl: "/uploads/products/torus-sculptural-brass-key-tag/torus-hero.svg",
    imageUrls: [
      "/uploads/products/torus-sculptural-brass-key-tag/torus-hero.svg",
      "/uploads/products/torus-sculptural-brass-key-tag/torus-detail.svg",
      "/uploads/products/torus-sculptural-brass-key-tag/torus-natural-detail.svg",
    ],
    variants: [
      {
        id: "var_05_nat",
        sku: "TAV-ACC-005-NAT",
        title: "Natural Raw Brushed Brass",
        materialFinish: "Lost-Wax Cast Solid Brass with Directional Satin Linishing",
        imageUrl: "/uploads/products/torus-sculptural-brass-key-tag/torus-hero.svg",
        priceRupees: 3400,
        stock: 20,
        description: "Warm tactile pocket pebble with threaded grade-5 titanium wire cable.",
        dimensions: "42mm Dia × 8mm Thickness",
        weightGrams: 140,
        isPublished: true,
      },
      {
        id: "var_05_pat",
        sku: "TAV-ACC-005-PAT",
        title: "Studio Smoked Patina Brass",
        materialFinish: "Hand-Torched Chemical Dark Patina with Sealed Matte Wax",
        imageUrl: "/uploads/products/torus-sculptural-brass-key-tag/torus-detail.svg",
        priceRupees: 3800,
        stock: 15,
        description: "Antique bronze smoked finish providing high contrast with engraved numbering.",
        dimensions: "42mm Dia × 8mm Thickness",
        weightGrams: 140,
        isPublished: true,
      },
    ],
    allowedDeliveryZones: ["ZONE_A", "ZONE_B", "ZONE_C", "ZONE_D", "ZONE_E"],
    shortDescription: "Hand-finished lost-wax cast solid brass pocket talisman with screw-locking titanium wire.",
    fullDescription: "Smooth organic contour shaped for tactile pocket carry with heavy-duty threaded Grade 5 titanium cable.",
    materials: ["Cast Solid Brass", "Grade 5 Titanium Wire"],
    dimensions: "42mm Dia × 8mm Thickness",
    weightGrams: 140,
    packedWeightKg: 0.3,
    packedVolumetricKg: 0.1,
    returnPolicy: "Standard non-returnable unless defective on arrival",
    markdownFile: "docs/products/torus-sculptural-brass-key-tag/torus-sculptural-brass-key-tag.md",
  },
  {
    id: "cat_06",
    slug: "oblique-kinetic-wind-sculpture",
    sku: "TAV-ART-006",
    name: "Oblique Site-Specific Art Sculpture",
    category: "Art & Collectibles",
    mode: "QUOTE_ONLY",
    priceRupees: 120000,
    minPriceRupees: 120000,
    maxPriceRupees: 120000,
    isVariablePrice: false,
    availableStock: 0,
    reservedStock: 0,
    isPublished: true,
    primaryImageUrl: null,
    imageUrls: [],
    variants: [
      {
        id: "var_06_brz",
        sku: "TAV-ART-006-VAR1",
        title: "Hand-Beaten Patinated Bronze",
        materialFinish: "Architectural Heavy Bronze on Absolute Black Granite Plinth",
        imageUrl: null,
        priceRupees: 120000,
        stock: 0,
        description: "Site-specific monumental kinetic piece calibrated to ambient wind drafts.",
        dimensions: "1.8m Height × 400mm Base",
        weightGrams: 35000,
        isPublished: true,
      },
    ],
    allowedDeliveryZones: ["ZONE_A", "ZONE_B"],
    shortDescription: "Bespoke balance-weighted kinetic sculpture for indoor lobbies or private courtyards.",
    fullDescription: "Custom architectural sizing tailored to client floorplans with independently numbered and studio-signed edition certificate.",
    materials: ["Hand-Beaten Bronze", "Black Granite Plinth", "Precision Ceramic Bearings"],
    dimensions: "Custom Scaled (1.2m to 2.4m Height Options)",
    weightGrams: 35000,
    packedWeightKg: 48.0,
    packedVolumetricKg: 38.0,
    returnPolicy: "Bespoke commission: governed by approved quotation terms",
    markdownFile: "docs/products/oblique-kinetic-wind-sculpture/oblique-kinetic-wind-sculpture.md",
  },
];

export const INITIAL_PINCODES: PincodeEntry[] = [
  {
    id: "pin_1",
    pincode: "110001",
    city: "New Delhi",
    state: "Delhi",
    zoneCode: "ZONE_A",
    zoneLabel: "Zone A (Delhi NCR Local)",
    isServiceable: true,
    carrierAccepted: true,
    verifiedDate: "2026-11-06",
  },
  {
    id: "pin_2",
    pincode: "122002",
    city: "Gurugram",
    state: "Haryana",
    zoneCode: "ZONE_A",
    zoneLabel: "Zone A (Delhi NCR Local)",
    isServiceable: true,
    carrierAccepted: true,
    verifiedDate: "2026-11-06",
  },
  {
    id: "pin_3",
    pincode: "201301",
    city: "Noida",
    state: "Uttar Pradesh",
    zoneCode: "ZONE_A",
    zoneLabel: "Zone A (Delhi NCR Local)",
    isServiceable: true,
    carrierAccepted: true,
    verifiedDate: "2026-11-06",
  },
  {
    id: "pin_4",
    pincode: "160017",
    city: "Chandigarh",
    state: "Chandigarh",
    zoneCode: "ZONE_B",
    zoneLabel: "Zone B (Regional North)",
    isServiceable: true,
    carrierAccepted: true,
    verifiedDate: "2026-11-06",
  },
  {
    id: "pin_5",
    pincode: "302001",
    city: "Jaipur",
    state: "Rajasthan",
    zoneCode: "ZONE_B",
    zoneLabel: "Zone B (Regional North)",
    isServiceable: true,
    carrierAccepted: true,
    verifiedDate: "2026-11-06",
  },
  {
    id: "pin_6",
    pincode: "400001",
    city: "Mumbai",
    state: "Maharashtra",
    zoneCode: "ZONE_C",
    zoneLabel: "Zone C (National Metros)",
    isServiceable: true,
    carrierAccepted: true,
    verifiedDate: "2026-11-06",
  },
  {
    id: "pin_7",
    pincode: "560001",
    city: "Bengaluru",
    state: "Karnataka",
    zoneCode: "ZONE_C",
    zoneLabel: "Zone C (National Metros)",
    isServiceable: true,
    carrierAccepted: true,
    verifiedDate: "2026-11-06",
  },
  {
    id: "pin_8",
    pincode: "190001",
    city: "Srinagar",
    state: "Jammu & Kashmir",
    zoneCode: "ZONE_D",
    zoneLabel: "Zone D (Special Terrain)",
    isServiceable: true,
    carrierAccepted: true,
    verifiedDate: "2026-11-06",
  },
  {
    id: "pin_9",
    pincode: "194101",
    city: "Leh",
    state: "Ladakh",
    zoneCode: "ZONE_D",
    zoneLabel: "Zone D (Special Terrain)",
    isServiceable: false,
    carrierAccepted: false,
    verifiedDate: "2026-11-06",
  },
];

export const STAFF_USERS: StaffUser[] = [
  {
    id: "usr_admin_1",
    name: "Ar. Vikramaditya (Admin)",
    email: "admin@vdesign.in",
    role: "SUPER_ADMIN",
    roleLabel: "Super Administrator · Executive Control",
    avatarInitials: "AV",
  },
  {
    id: "usr_prod_2",
    name: "Rajesh Sharma (Workshop Head)",
    email: "workshop@vdesign.in",
    role: "PRODUCTION_STAFF",
    roleLabel: "Production Staff · Workshop Machining Release",
    avatarInitials: "RS",
  },
  {
    id: "usr_comm_3",
    name: "Kavita Rao (Client Desk)",
    email: "clientdesk@tavistra.in",
    role: "SUPPORT_STAFF",
    roleLabel: "Support Specialist · Courier & Ticket Resolution",
    avatarInitials: "KR",
  },
  {
    id: "usr_comm_4",
    name: "Pooja Mehta (Commerce Director)",
    email: "commerce@tavistra.in",
    role: "COMMERCE_ADMIN",
    roleLabel: "Commerce Admin · Catalogue, Quotes & Logistics",
    avatarInitials: "PM",
  },
];

export const INITIAL_AUDIT_LOGS: AuditEntry[] = [
  {
    id: "aud_01",
    staffName: "Ar. Vikramaditya (Admin)",
    action: "AWB_ASSIGNED",
    entityType: "Order",
    entityId: "TAV-RS-2026-1001",
    timestamp: "Nov 5, 2026 16:45 IST",
    details: "Assigned Blue Dart carrier AWB BD-DEL-89472911 to consignment.",
  },
  {
    id: "aud_02",
    staffName: "Rajesh Sharma",
    action: "PRODUCTION_RELEASE",
    entityType: "Order",
    entityId: "TAV-MTO-2026-2003",
    timestamp: "Nov 5, 2026 09:30 IST",
    details: "Day 8 confirmation grace elapsed. Released 2x Aether Lamps to CNC brass milling.",
  },
  {
    id: "aud_03",
    staffName: "Kavita Rao",
    action: "TICKET_NOTE_ADDED",
    entityType: "SupportTicket",
    entityId: "TCK-2026-802",
    timestamp: "Nov 5, 2026 11:30 IST",
    details: "Logged concierge afternoon delivery instruction for Blue Dart courier.",
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "inv_01",
    variantId: "var_01_a",
    productId: "cat_01",
    productName: "Monolith Minimalist Wall Clock",
    variantTitle: "Brushed Brass Dial",
    sku: "TAV-CLK-01-BRS",
    finishName: "Unlacquered Brushed Brass",
    category: "Home Décor & Objects",
    onHandStock: 8,
    reservedStock: 1,
    availableStock: 7,
    lowStockThreshold: 3,
    warehouseLocation: "Delhi Studio Hub (110062) - Bay A1",
    priceRupees: 14500,
    imageUrl: "/products/monolith-wall-clock.png",
  },
  {
    id: "inv_02",
    variantId: "var_01_b",
    productId: "cat_01",
    productName: "Monolith Minimalist Wall Clock",
    variantTitle: "Aero Black Aluminium",
    sku: "TAV-CLK-01-BLK",
    finishName: "Matte Anodised Black",
    category: "Home Décor & Objects",
    onHandStock: 5,
    reservedStock: 0,
    availableStock: 5,
    lowStockThreshold: 2,
    warehouseLocation: "Delhi Studio Hub (110062) - Bay A2",
    priceRupees: 14500,
    imageUrl: "/products/monolith-wall-clock.png",
  },
  {
    id: "inv_03",
    variantId: "var_02_a",
    productId: "cat_02",
    productName: "Aether Solid Brass Pendant Lamp",
    variantTitle: "Hand-Spun Raw Brass",
    sku: "TAV-LGT-02-RAW",
    finishName: "Natural Living Patina",
    category: "Lighting & Luminaires",
    onHandStock: 3,
    reservedStock: 2,
    availableStock: 1,
    lowStockThreshold: 2,
    warehouseLocation: "Delhi Studio Hub (110062) - Lighting Cage L1",
    priceRupees: 28000,
    imageUrl: "/products/aether-pendant.png",
  },
  {
    id: "inv_04",
    variantId: "var_02_b",
    productId: "cat_02",
    productName: "Aether Solid Brass Pendant Lamp",
    variantTitle: "Antique Smoked Bronze",
    sku: "TAV-LGT-02-SMK",
    finishName: "Oxidized Charcoal Patina",
    category: "Lighting & Luminaires",
    onHandStock: 1,
    reservedStock: 1,
    availableStock: 0,
    lowStockThreshold: 2,
    warehouseLocation: "Delhi Studio Hub (110062) - Lighting Cage L2",
    priceRupees: 31500,
    imageUrl: "/products/aether-pendant.png",
  },
  {
    id: "inv_05",
    variantId: "var_03_a",
    productId: "cat_03",
    productName: "Strata Modular Desk Organiser",
    variantTitle: "Solid Sand-Cast Brass",
    sku: "TAV-DSK-03-BRS",
    finishName: "Hand-Rubbed Micro-Crystalline Wax",
    category: "Objects & Sculptures",
    onHandStock: 14,
    reservedStock: 2,
    availableStock: 12,
    lowStockThreshold: 4,
    warehouseLocation: "Delhi Studio Hub (110062) - Shelf S3",
    priceRupees: 8200,
    imageUrl: "/products/strata-desk.png",
  },
  {
    id: "inv_06",
    variantId: "var_04_a",
    productId: "cat_04",
    productName: "Kroma Architectural Lever Handle",
    variantTitle: "Pair · Satin Gold Finish",
    sku: "TAV-HRD-04-SAT",
    finishName: "Satin Brushed Lacquered",
    category: "Architectural Hardware",
    onHandStock: 22,
    reservedStock: 0,
    availableStock: 22,
    lowStockThreshold: 5,
    warehouseLocation: "Delhi Studio Hub (110062) - Hardware Bin H1",
    priceRupees: 6400,
    imageUrl: "/products/kroma-lever.png",
  },
  {
    id: "inv_07",
    variantId: "var_05_a",
    productId: "cat_05",
    productName: "Voxel Solid Teak & Brass Stool",
    variantTitle: "CP Teak & Brass Dowels",
    sku: "TAV-FUR-05-TEK",
    finishName: "Hand-Polished Linseed Oil",
    category: "Furniture & Seating",
    onHandStock: 2,
    reservedStock: 0,
    availableStock: 2,
    lowStockThreshold: 2,
    warehouseLocation: "Delhi Studio Hub (110062) - Furniture Mezzanine",
    priceRupees: 42000,
    imageUrl: "/products/voxel-stool.png",
  },
];

export const INITIAL_STOCK_MOVEMENTS: StockMovementRecord[] = [
  {
    id: "sm_01",
    inventoryId: "inv_01",
    sku: "TAV-CLK-01-BRS",
    productName: "Monolith Minimalist Wall Clock (Brushed Brass)",
    type: "INITIAL_STOCK",
    quantity: 10,
    balanceAfter: 10,
    referenceId: "BATCH-2026-OCT-01",
    notes: "Initial inventory migration from foundry CNC run.",
    staffName: "Ar. Vikramaditya (Admin)",
    timestamp: "28 Oct 2026, 10:00 IST",
  },
  {
    id: "sm_02",
    inventoryId: "inv_01",
    sku: "TAV-CLK-01-BRS",
    productName: "Monolith Minimalist Wall Clock (Brushed Brass)",
    type: "ORDER_FULFILLED",
    quantity: -1,
    balanceAfter: 9,
    referenceId: "TAV-RS-2026-1001",
    notes: "Consignment allocated and dispatched via Blue Dart.",
    staffName: "System Automation",
    timestamp: "04 Nov 2026, 14:22 IST",
  },
  {
    id: "sm_03",
    inventoryId: "inv_03",
    sku: "TAV-LGT-02-RAW",
    productName: "Aether Solid Brass Pendant Lamp (Raw Brass)",
    type: "RESTOCK",
    quantity: 4,
    balanceAfter: 5,
    referenceId: "FOUNDRY-DEL-402",
    notes: "Received batch of 4 hand-spun brass shades from Moradabad workshop.",
    staffName: "Rajesh Sharma",
    timestamp: "08 Nov 2026, 11:15 IST",
  },
  {
    id: "sm_04",
    inventoryId: "inv_04",
    sku: "TAV-LGT-02-SMK",
    productName: "Aether Solid Brass Pendant Lamp (Antique Smoked)",
    type: "ORDER_FULFILLED",
    quantity: -1,
    balanceAfter: 1,
    referenceId: "TAV-RS-2026-1008",
    notes: "Allocated to residential project order.",
    staffName: "Kavita Rao",
    timestamp: "12 Nov 2026, 16:00 IST",
  },
  {
    id: "sm_05",
    inventoryId: "inv_05",
    sku: "TAV-DSK-03-BRS",
    productName: "Strata Modular Desk Organiser",
    type: "RETURN_RESTOCK",
    quantity: 1,
    balanceAfter: 14,
    referenceId: "RMA-2026-0012",
    notes: "Restocked after studio unboxing inspection; pristine condition in original crate.",
    staffName: "Grace Hopper (Workshop QC)",
    timestamp: "16 Nov 2026, 15:45 IST",
  },
];

export const INITIAL_RMAS: ReturnRmaItem[] = [
  {
    id: "rma_01",
    rmaNumber: "RMA-2026-0012",
    orderId: "ord_1009",
    orderNumber: "TAV-RS-2026-1009",
    customerName: "Rohan Varma",
    customerEmail: "rohan@varma.in",
    customerPhone: "+91 99112 33445",
    productTitle: "Strata Modular Desk Organiser",
    sku: "TAV-DSK-03-BRS",
    amountRupees: 8200,
    trackType: "STATUTORY_DEFECT",
    status: "REFUND_PROCESSED",
    reverseCarrier: "Blue Dart Return Freight",
    reverseAwbNumber: "BD-RET-7749102",
    inspectionVerdict: "RESTOCK_TO_INVENTORY",
    inspectionNotes: "Inspected at Delhi Hub. Minor carton scuff but brass module is immaculate. Restocked to shelf S3.",
    creditNoteNumber: "CN-2026-0012",
    refundUtr: "CMS20261116778942",
    gatewayRefundId: "PHONEPE_RF_9812401",
    createdAt: "14 Nov 2026",
    resolvedAt: "16 Nov 2026",
  },
  {
    id: "rma_02",
    rmaNumber: "RMA-2026-0015",
    orderId: "ord_2004",
    orderNumber: "TAV-MTO-2026-2004",
    customerName: "Radhika Merchant & Associates",
    customerEmail: "rmerchant@designstudio.com",
    customerPhone: "+91 98200 44556",
    productTitle: "Voxel Teak & Brass Stool (Custom)",
    sku: "TAV-FUR-05-TEK",
    amountRupees: 31500,
    trackType: "GRACE_COOLING",
    status: "REFUND_PROCESSED",
    inspectionVerdict: "RESTOCK_TO_INVENTORY",
    inspectionNotes: "Pre-production 7-day grace cancellation. Timber milling had not commenced. 100% advance refunded per statute.",
    creditNoteNumber: "CN-2026-0015",
    refundUtr: "HDFC000123984511",
    gatewayRefundId: "PHONEPE_RF_9812402",
    createdAt: "15 Nov 2026",
    resolvedAt: "15 Nov 2026",
  },
  {
    id: "rma_03",
    rmaNumber: "RMA-2026-0018",
    orderId: "ord_1012",
    orderNumber: "TAV-RS-2026-1012",
    customerName: "Studio Lotus Interior Architecture",
    customerEmail: "procurement@studiolotus.in",
    customerPhone: "+91 98101 22334",
    productTitle: "Aether Solid Brass Pendant Lamp",
    sku: "TAV-LGT-02-SMK",
    amountRupees: 31500,
    trackType: "TRANSIT_DAMAGE",
    status: "REVERSE_AWB_ISSUED",
    reverseCarrier: "Safeexpress Surface Reverse",
    reverseAwbNumber: "SF-RET-9902144",
    inspectionNotes: "Transit crate impacted during courier transit to Bengaluru. Reverse pickup scheduled for damage assessment.",
    createdAt: "18 Nov 2026",
  },
];
