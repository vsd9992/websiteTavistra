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
    | "CANCELLATION";
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
}

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
    name: "Monolith Minimalist Wall Clock",
    category: "Home Décor & Objects",
    mode: "READY_STOCK",
    priceRupees: 14500,
    availableStock: 8,
    reservedStock: 1,
    isPublished: true,
    shortDescription: "Precision-milled aerospace aluminium body with an unlacquered brushed brass dial.",
    fullDescription: "Machined from a single block of aerospace aluminium with brushed brass hands and silent German quartz movement. Concealed flush wall mounting system included.",
    materials: ["Milled Solid Aluminium", "Brushed Brass", "Silent German Quartz Movement"],
    dimensions: "320mm Dia × 38mm D",
    weightGrams: 2400,
    packedWeightKg: 3.2,
    packedVolumetricKg: 1.8,
    returnPolicy: "7-Day Return Guarantee eligible",
    markdownFile: "content/products/monolith-wall-clock.md",
  },
  {
    id: "cat_02",
    slug: "arc-solid-brass-wall-mirror",
    name: "Arc Sculptural Brass Wall Mirror",
    category: "Home Décor & Objects",
    mode: "MADE_TO_ORDER",
    priceRupees: 38000,
    availableStock: 0,
    reservedStock: 0,
    isPublished: true,
    shortDescription: "Hand-rolled architectural brass frame cradling high-definition distortion-free float glass.",
    fullDescription: "Solid architectural brass frame cradling high-definition distortion-free silvered float mirror glass. Reinforced heavy-gauge Z-bar wall cleat mounting.",
    materials: ["Solid Architect's Brass", "HD Silvered Float Glass", "Engineered Wood Backing"],
    dimensions: "600mm W × 900mm H × 30mm D",
    weightGrams: 8500,
    packedWeightKg: 12.5,
    packedVolumetricKg: 10.6,
    returnPolicy: "Made to Order: 7-day pre-production grace cancellation with 100% advance refund",
    markdownFile: "content/products/arc-wall-mirror.md",
  },
  {
    id: "cat_03",
    slug: "strata-modular-desk-organiser",
    name: "Strata Modular Desk Organiser",
    category: "Desk & Workspace",
    mode: "READY_STOCK",
    priceRupees: 8200,
    availableStock: 14,
    reservedStock: 2,
    isPublished: true,
    shortDescription: "Weighted cast composite stone with integrated anodised bronze pen channels.",
    fullDescription: "Substantial 1.8kg weighted base prevents desk slippage with natural wool felt smartphone tray and micro-catchment for stationery clips.",
    materials: ["Cast Mineral Stone", "Anodised Bronze Aluminium", "Natural Wool Felt"],
    dimensions: "280mm L × 140mm W × 45mm H",
    weightGrams: 1800,
    packedWeightKg: 2.3,
    packedVolumetricKg: 0.7,
    returnPolicy: "Standard non-returnable unless defective on arrival",
    markdownFile: "content/products/strata-desk-organiser.md",
  },
  {
    id: "cat_04",
    slug: "aether-kinetic-desk-lamp",
    name: "Aether Architectural Desk Lamp",
    category: "Lighting & Ambience",
    mode: "MADE_TO_ORDER",
    priceRupees: 42500,
    availableStock: 0,
    reservedStock: 0,
    isPublished: true,
    shortDescription: "Counterbalanced articulated arm in gunmetal stainless steel with warm 2700K LED optic engine.",
    fullDescription: "Fluid counterbalance movement with zero spring backlash, precision rotary dimmer switch, and CRI 95+ warm architectural light.",
    materials: ["Gunmetal Stainless Steel", "Counterweight Brass", "High-CRI LED 2700K"],
    dimensions: "520mm Reach × 480mm Max Height",
    weightGrams: 4200,
    packedWeightKg: 5.6,
    packedVolumetricKg: 4.8,
    returnPolicy: "Made to Order: 7-day pre-production grace cancellation with 100% advance refund",
    markdownFile: "content/products/aether-desk-lamp.md",
  },
  {
    id: "cat_05",
    slug: "torus-sculptural-brass-key-tag",
    name: "Torus Sculptural Brass Key Tag",
    category: "Personal Accessories",
    mode: "READY_STOCK",
    priceRupees: 3400,
    availableStock: 25,
    reservedStock: 0,
    isPublished: true,
    shortDescription: "Hand-finished lost-wax cast solid brass pocket talisman with screw-locking titanium wire.",
    fullDescription: "Smooth organic contour shaped for tactile pocket carry with heavy-duty threaded Grade 5 titanium cable.",
    materials: ["Cast Solid Brass", "Grade 5 Titanium Wire"],
    dimensions: "42mm Dia × 8mm Thickness",
    weightGrams: 140,
    packedWeightKg: 0.3,
    packedVolumetricKg: 0.1,
    returnPolicy: "Standard non-returnable unless defective on arrival",
    markdownFile: "content/products/torus-key-tag.md",
  },
  {
    id: "cat_06",
    slug: "oblique-kinetic-wind-sculpture",
    name: "Oblique Site-Specific Art Sculpture",
    category: "Art & Collectibles",
    mode: "QUOTE_ONLY",
    priceRupees: 120000,
    availableStock: 0,
    reservedStock: 0,
    isPublished: true,
    shortDescription: "Bespoke balance-weighted kinetic sculpture for indoor lobbies or private courtyards.",
    fullDescription: "Custom architectural sizing tailored to client floorplans with independently numbered and studio-signed edition certificate.",
    materials: ["Hand-Beaten Bronze", "Black Granite Plinth", "Precision Ceramic Bearings"],
    dimensions: "Custom Scaled (1.2m to 2.4m Height Options)",
    weightGrams: 35000,
    packedWeightKg: 48.0,
    packedVolumetricKg: 38.0,
    returnPolicy: "Bespoke commission: governed by approved quotation terms",
    markdownFile: "content/products/oblique-wind-sculpture.md",
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
