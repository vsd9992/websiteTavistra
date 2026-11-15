export interface CategoryNav {
  slug: string;
  name: string;
  description?: string;
  subcategories?: string[];
}

export const APPROVED_CATEGORIES: CategoryNav[] = [
  {
    slug: "personal-accessories",
    name: "Personal Accessories",
    description: "Refined pocket items, key architecture, and personal carry objects.",
  },
  {
    slug: "home-decor-objects",
    name: "Home Décor & Objects",
    description: "Minimalist clocks, sculptural mirrors, and functional vessels.",
  },
  {
    slug: "desk-workspace",
    name: "Desk & Workspace",
    description: "Precision desk trays, organisation systems, and tactile objects.",
  },
  {
    slug: "lighting-ambience",
    name: "Lighting & Ambience",
    description: "Solid brass desk lamps, ambient luminaires, and architectural sconces.",
  },
  {
    slug: "outdoor-balcony",
    name: "Outdoor & Balcony",
    description: "Weathered planters, architectural fixtures, and exterior editions.",
  },
  {
    slug: "art-collectibles",
    name: "Art & Collectibles",
    description: "Limited studio sculptures, tactile monuments, and artistic objects.",
  },
];
