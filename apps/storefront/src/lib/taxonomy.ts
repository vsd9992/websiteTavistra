export interface CategoryNav {
  slug: string;
  name: string;
  subcategories: string[];
}

export const APPROVED_CATEGORIES: CategoryNav[] = [
  {
    slug: "personal-accessories",
    name: "Personal Accessories",
    subcategories: ["Key Accessories", "Personal Carry", "Wearable & Personal Objects"],
  },
  {
    slug: "home-decor-objects",
    name: "Home Décor & Objects",
    subcategories: ["Clocks", "Mirrors", "Wall Décor", "Organisation & Storage", "Vases & Planters"],
  },
  {
    slug: "desk-workspace",
    name: "Desk & Workspace",
    subcategories: ["Desk Organisation", "Stands & Holders", "Desk Décor & Objects"],
  },
  {
    slug: "lighting-ambience",
    name: "Lighting & Ambience",
    subcategories: ["Table & Desk Lighting", "Floor Lighting", "Wall Lighting", "Ambient & Decorative Lighting"],
  },
  {
    slug: "outdoor-balcony",
    name: "Outdoor & Balcony",
    subcategories: ["Planters & Plant Accessories", "Outdoor Décor"],
  },
  {
    slug: "art-collectibles",
    name: "Art & Collectibles",
    subcategories: ["Sculptures & Art Objects", "Wall Art"],
  },
];
