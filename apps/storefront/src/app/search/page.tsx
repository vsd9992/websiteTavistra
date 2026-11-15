import { Suspense } from "react";
import { connection } from "next/server";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getPublishedProducts } from "@/lib/catalogueService";
import { SearchResultsView } from "./SearchResultsView";

export const metadata = {
  title: "Search Catalogue — Tavistra",
  description:
    "Search Tavistra's collection of architectural décor, lighting, timepieces, and crafted editions.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sub?: string;
    mode?: string;
    sort?: string;
  }>;
}

async function SearchPageContent({ searchParams }: SearchPageProps) {
  await connection();
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "all";
  const subcategory = params.sub || "all";
  const mode = params.mode || "all";
  const sort = params.sort || "relevance";

  const allProducts = await getPublishedProducts();

  return (
    <SearchResultsView
      key={`${q}-${category}-${subcategory}-${mode}-${sort}`}
      initialQuery={q}
      initialCategory={category}
      initialSubcategory={subcategory}
      initialMode={mode}
      initialSort={sort}
      allProducts={allProducts}
    />
  );
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12 px-6 bg-[var(--color-canvas)]">
        <div className="mx-auto max-w-7xl">
          <Suspense
            fallback={
              <div className="py-24 text-center text-xs text-[var(--color-muted-light)]">
                Loading catalogue results...
              </div>
            }
          >
            <SearchPageContent searchParams={searchParams} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
