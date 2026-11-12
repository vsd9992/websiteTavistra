import { PurchaseMode } from "@tavistra/shared";

export interface ProductVariantView {
  id: string;
  sku: string;
  title: string;
  materialFinish?: string | null;
  color?: string | null;
  imageUrl?: string | null;
  images?: ProductImageView[];
  pricePaise: number;
  stock: number;
  // Overrides (optional, falls back to master product)
  description?: string | null;
  dimensions?: string | null;
  weightGrams?: number | null;
  lengthMm?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
}

export interface ProductImageView {
  url: string;
  altText?: string | null;
  isPrimary?: boolean;
}

export interface MockProduct {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  subcategory: string;
  productType?: string;
  mode: PurchaseMode;
  pricePaise: number; // Integer minor units (INR Paise)
  minPricePaise?: number;
  maxPricePaise?: number;
  isVariablePrice?: boolean;
  priceLabel?: string;
  primaryImageUrl?: string | null;
  images?: ProductImageView[];
  variants?: ProductVariantView[];
  shortDescription: string;
  fullDescription?: string;
  materials: string[];
  dimensions: string;
  weightGrams: number;
  lengthMm: number;
  widthMm: number;
  heightMm: number;
  estimatedLeadTime: string;
  returnPolicyText: string;
  features: string[];
  careInstructions?: string;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  // 1. Home Décor & Objects - Wall Clocks (Ready Stock)
  {
    id: "tav-clk-001",
    slug: "monolith-minimalist-wall-clock",
    sku: "TAV-CLK-001",
    name: "Monolith Minimalist Wall Clock",
    categorySlug: "home-decor-objects",
    categoryName: "Home Décor & Objects",
    subcategory: "Clocks",
    productType: "Wall Clocks",
    mode: "READY_STOCK",
    pricePaise: 1450000, // ₹14,500
    priceLabel: "₹14,500",
    shortDescription:
      "Precision-milled aerospace aluminium body with an unlacquered brushed brass dial and silent German quartz movement.",
    materials: ["Milled Solid Aluminium", "Brushed Brass", "Silent Movement"],
    dimensions: "320mm Dia × 38mm D",
    weightGrams: 2400,
    lengthMm: 360,
    widthMm: 360,
    heightMm: 70,
    estimatedLeadTime: "Dispatches in 24–48 hours",
    returnPolicyText: "7-Day Return Guarantee eligible",
    features: [
      "Machined from a single block of aerospace aluminium",
      "Brushed brass hands with anti-glare finish",
      "Concealed flush wall mounting system included",
    ],
  },
  // 2. Home Décor & Objects - Wall Mirrors (Made to Order)
  {
    id: "tav-mir-002",
    slug: "arc-solid-brass-wall-mirror",
    sku: "TAV-MIR-002",
    name: "Arc Sculptural Brass Wall Mirror",
    categorySlug: "home-decor-objects",
    categoryName: "Home Décor & Objects",
    subcategory: "Mirrors",
    productType: "Wall Mirrors",
    mode: "MADE_TO_ORDER",
    pricePaise: 3800000, // ₹38,000
    priceLabel: "₹38,000",
    shortDescription:
      "Hand-rolled architectural brass frame cradling high-definition distortion-free float glass.",
    materials: ["Solid Architectural Brass", "HD Float Glass", "Hardwood Backing"],
    dimensions: "600mm W × 900mm H × 30mm D",
    weightGrams: 8500,
    lengthMm: 950,
    widthMm: 650,
    heightMm: 80,
    estimatedLeadTime: "Handcrafted to order — 3 to 4 weeks workshop lead time",
    returnPolicyText: "Crafted to Order / Non-returnable",
    features: [
      "Continuous hand-rolled brass surround",
      "French cleat heavy-duty wall mounting system",
      "Shatter-resistant backing membrane",
    ],
  },
  // 3. Desk & Workspace - Desk Organisers (Ready Stock)
  {
    id: "tav-dsk-003",
    slug: "strata-modular-desk-organiser",
    sku: "TAV-DSK-003",
    name: "Strata Modular Desk Organiser",
    categorySlug: "desk-workspace",
    categoryName: "Desk & Workspace",
    subcategory: "Desk Organisation",
    productType: "Desk Organisers",
    mode: "READY_STOCK",
    pricePaise: 820000, // ₹8,200
    priceLabel: "₹8,200",
    shortDescription:
      "Weighted cast composite stone with integrated anodised bronze pen channels.",
    materials: ["Cast Composite Mineral Stone", "Anodised Aluminium", "Merino Felt"],
    dimensions: "280mm L × 140mm W × 45mm H",
    weightGrams: 1800,
    lengthMm: 320,
    widthMm: 180,
    heightMm: 70,
    estimatedLeadTime: "Dispatches in 24–48 hours",
    returnPolicyText: "7-Day Return Guarantee eligible",
    features: [
      "Substantial 1.8kg weighted base prevents sliding",
      "Integrated natural merino wool felt catchment",
      "Modular magnetically coupled components",
    ],
  },
  // 4. Lighting & Ambience - Desk Lamps (Made to Order)
  {
    id: "tav-lgt-004",
    slug: "aether-kinetic-desk-lamp",
    sku: "TAV-LGT-004",
    name: "Aether Architectural Desk Lamp",
    categorySlug: "lighting-ambience",
    categoryName: "Lighting & Ambience",
    subcategory: "Table & Desk Lighting",
    productType: "Desk Lamps",
    mode: "MADE_TO_ORDER",
    pricePaise: 4250000, // ₹42,500
    priceLabel: "₹42,500",
    shortDescription:
      "Counterbalanced articulated arm in gunmetal stainless steel with warm 2700K LED optic engine.",
    materials: ["Gunmetal Stainless Steel", "Counterweight Brass", "High-CRI LED"],
    dimensions: "450mm Reach × 520mm Max Height × 180mm Base Dia",
    weightGrams: 4200,
    lengthMm: 550,
    widthMm: 240,
    heightMm: 220,
    estimatedLeadTime: "Handcrafted to order — 3 to 4 weeks workshop lead time",
    returnPolicyText: "Crafted to Order / Non-returnable",
    features: [
      "Fluid counterbalance movement with zero spring backlash",
      "Precision rotary dimmer switch on lamp head",
      "CRI 95+ warm architectural illumination",
    ],
  },
  // 5. Personal Accessories - Key Accessories (Ready Stock)
  {
    id: "tav-acc-005",
    slug: "torus-sculptural-brass-key-tag",
    sku: "TAV-ACC-005",
    name: "Torus Sculptural Brass Key Tag",
    categorySlug: "personal-accessories",
    categoryName: "Personal Accessories",
    subcategory: "Key Accessories",
    productType: "Key Fobs & Tags",
    mode: "READY_STOCK",
    pricePaise: 340000, // ₹3,400
    priceLabel: "₹3,400",
    shortDescription:
      "Forged marine brass ring with chamfered geometry and threaded barrel closure.",
    materials: ["Forged Marine Brass", "Threaded Stainless Steel Core"],
    dimensions: "42mm Dia × 8mm Thickness",
    weightGrams: 85,
    lengthMm: 100,
    widthMm: 80,
    heightMm: 25,
    estimatedLeadTime: "Dispatches in 24–48 hours",
    returnPolicyText: "7-Day Return Guarantee eligible",
    features: [
      "Tactile knurled threaded closure mechanism",
      "Living finish develops natural golden patina",
      "Holds up to 8 standard mortice or cylinder keys",
    ],
  },
];
