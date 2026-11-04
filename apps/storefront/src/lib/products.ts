import { PurchaseMode } from "@tavistra/shared";

export interface MockProduct {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  subcategory: string;
  mode: PurchaseMode;
  pricePaise: number; // Integer minor units (INR Paise)
  shortDescription: string;
  materials: string[];
  dimensions: string;
  estimatedLeadTime: string;
  returnPolicyText: string;
  features: string[];
}

export const MOCK_PRODUCTS: MockProduct[] = [
  // 1. Home Décor & Objects - Wall Clocks (Ready Stock)
  {
    id: "tav-clk-001",
    slug: "monolith-minimalist-wall-clock",
    name: "Monolith Minimalist Wall Clock",
    categorySlug: "home-decor-objects",
    categoryName: "Home Décor & Objects",
    subcategory: "Clocks",
    mode: "READY_STOCK",
    pricePaise: 1450000, // ₹14,500
    shortDescription:
      "Precision-milled aerospace aluminium body with an unlacquered brushed brass dial and silent German quartz movement.",
    materials: ["Milled Solid Aluminium", "Brushed Brass", "Silent Movement"],
    dimensions: "320mm Dia × 38mm D",
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
    name: "Arc Sculptural Brass Wall Mirror",
    categorySlug: "home-decor-objects",
    categoryName: "Home Décor & Objects",
    subcategory: "Mirrors",
    mode: "MADE_TO_ORDER",
    pricePaise: 3800000, // ₹38,000
    shortDescription:
      "Hand-rolled architectural brass frame cradling high-definition distortion-free silvered float mirror glass.",
    materials: ["Solid Architect's Brass", "HD Silvered Float Glass", "Wood Backing"],
    dimensions: "600mm W × 900mm H × 30mm D",
    estimatedLeadTime: "18–24 business days workshop crafting",
    returnPolicyText: "Made to Order: 7-day pre-production grace cancellation with 100% advance refund",
    features: [
      "Hand-finished warm aged patina or mirror-polished raw brass",
      "Reinforced heavy-gauge Z-bar wall cleat mounting",
      "Custom crate with dense high-density foam containment",
    ],
  },
  // 3. Desk & Workspace - Organisers (Ready Stock)
  {
    id: "tav-dsk-003",
    slug: "strata-modular-desk-organiser",
    name: "Strata Modular Desk Organiser",
    categorySlug: "desk-workspace",
    categoryName: "Desk & Workspace",
    subcategory: "Desk Organisation",
    mode: "READY_STOCK",
    pricePaise: 820000, // ₹8,200
    shortDescription:
      "Weighted cast composite stone with integrated anodised bronze pen channels and felt-lined smartphone tray.",
    materials: ["Cast Mineral Stone", "Anodised Bronze Aluminium", "Natural Wool Felt"],
    dimensions: "280mm L × 140mm W × 45mm H",
    estimatedLeadTime: "Dispatches in 24–48 hours",
    returnPolicyText: "Standard non-returnable unless defective on arrival",
    features: [
      "Substantial 1.8kg weighted base prevents desk slippage",
      "Precision-milled grooves fit standard fountain and drawing pens",
      "Integrated micro-catchment for stationery clips and memory drives",
    ],
  },
  // 4. Lighting & Ambience - Table Lamps (Made to Order)
  {
    id: "tav-lgt-004",
    slug: "aether-kinetic-desk-lamp",
    name: "Aether Architectural Desk Lamp",
    categorySlug: "lighting-ambience",
    categoryName: "Lighting & Ambience",
    subcategory: "Table & Desk Lighting",
    mode: "MADE_TO_ORDER",
    pricePaise: 4250000, // ₹42,500
    shortDescription:
      "Counterbalanced articulated arm in gunmetal stainless steel with warm 2700K integrated dimmable LED optic engine.",
    materials: ["Gunmetal Stainless Steel", "Counterweight Brass", "High-CRI LED 2700K"],
    dimensions: "520mm Reach × 480mm Max Height",
    estimatedLeadTime: "21–28 business days workshop crafting",
    returnPolicyText: "Made to Order: 7-day pre-production grace cancellation with 100% advance refund",
    features: [
      "Fluid counterbalance movement with zero spring backlash",
      "Precision knurled rotary dimmer switch on lamp base",
      "High CRI 95+ warm architectural light output",
    ],
  },
  // 5. Personal Accessories - Personal Carry (Ready Stock)
  {
    id: "tav-acc-005",
    slug: "torus-sculptural-brass-key-tag",
    name: "Torus Sculptural Brass Key Tag",
    categorySlug: "personal-accessories",
    categoryName: "Personal Accessories",
    subcategory: "Key Accessories",
    mode: "READY_STOCK",
    pricePaise: 340000, // ₹3,400
    shortDescription:
      "Hand-finished lost-wax cast solid brass pocket talisman with screw-locking titanium wire cable.",
    materials: ["Cast Solid Brass", "Grade 5 Titanium Wire"],
    dimensions: "42mm Dia × 8mm Thickness",
    estimatedLeadTime: "Dispatches in 24–48 hours",
    returnPolicyText: "Standard non-returnable unless defective on arrival",
    features: [
      "Smooth organic contour shaped for tactile pocket carry",
      "Gradual natural oxidation forms an authentic individual patina",
      "Heavy-duty threaded titanium cable withstands 30kg pull force",
    ],
  },
  // 6. Art & Collectibles - Sculptures (Quote Only)
  {
    id: "tav-art-006",
    slug: "oblique-kinetic-wind-sculpture",
    name: "Oblique Site-Specific Art Sculpture",
    categorySlug: "art-collectibles",
    categoryName: "Art & Collectibles",
    subcategory: "Sculptures & Art Objects",
    mode: "QUOTE_ONLY",
    pricePaise: 12000000, // ₹1,20,000 estimate baseline
    shortDescription:
      "Bespoke balance-weighted kinetic sculpture for indoor lobbies, private courtyards, or architectural atriums.",
    materials: ["Hand-Beaten Bronze", "Black Granite Plinth", "Precision Ceramic Bearings"],
    dimensions: "Custom Scaled (1.2m to 2.4m Height Options)",
    estimatedLeadTime: "6–8 weeks bespoke fabrication & testing",
    returnPolicyText: "Bespoke commission: governed strictly by accepted proposal terms",
    features: [
      "Custom architectural sizing tailored to client floorplans",
      "Independently numbered and studio-signed edition certificate",
      "Includes dedicated crate delivery and studio installation guidance",
    ],
  },
];

