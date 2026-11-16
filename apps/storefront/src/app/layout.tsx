import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { OrderProvider } from "@/context/OrderContext";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { CustomCursor } from "@/components/CustomCursor";
import { SiteLoader } from "@/components/SiteLoader";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-editorial",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-ui",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://tavistra.com"),
  title: {
    default: "Tavistra — Design-Led Lifestyle & Décor",
    template: "%s | Tavistra",
  },
  description:
    "Contemporary design-led lifestyle, objects, and architectural décor by Tavistra. Master-crafted ready stock, made to order, and bespoke editions.",
  keywords: [
    "Tavistra",
    "design-led lifestyle",
    "architectural décor",
    "luxury home décor India",
    "contemporary craft",
    "bespoke design",
    "ready stock objects",
    "made to order furniture",
    "curated home accessories",
    "Indian artisanal design",
  ],
  authors: [{ name: "Tavistra Studio", url: "https://tavistra.com" }],
  creator: "VDesign / Tavistra",
  publisher: "Tavistra",
  alternates: {
    canonical: "https://tavistra.com",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://tavistra.com",
    siteName: "Tavistra",
    title: "Tavistra — Design-Led Lifestyle & Décor",
    description:
      "Contemporary design-led lifestyle, objects, and architectural décor by Tavistra. Master-crafted ready stock, made to order, and bespoke editions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tavistra — Design-Led Lifestyle & Décor",
    description:
      "Contemporary design-led lifestyle, objects, and architectural décor by Tavistra. Master-crafted ready stock, made to order, and bespoke editions.",
  },
  verification: {
    other: {
      "p:domain_verify": "ac8d41ea0a23e3c1d319fd22fd67d96f",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo-mark.png",
    shortcut: "/logo-mark.png",
    apple: "/logo-mark.png",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://tavistra.com/#organization",
      name: "Tavistra",
      legalName: "VDesign",
      url: "https://tavistra.com",
      logo: "https://tavistra.com/logo-mark.png",
      email: "support@tavistra.com",
      contactPoint: [
        {
          "@type": "ContactPoint",
          email: "support@tavistra.com",
          contactType: "Customer Support",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi"],
        },
      ],
      sameAs: ["https://in.pinterest.com/tavistrastudio/"],
    },
    {
      "@type": "WebSite",
      "@id": "https://tavistra.com/#website",
      url: "https://tavistra.com",
      name: "Tavistra",
      publisher: {
        "@id": "https://tavistra.com/#organization",
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://tavistra.com/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://tavistra.com/#localbusiness",
      name: "Tavistra Studio",
      description:
        "Design-led lifestyle, architectural décor, and contemporary editions master-crafted in India.",
      url: "https://tavistra.com",
      email: "support@tavistra.com",
      priceRange: "₹₹₹",
      address: {
        "@type": "PostalAddress",
        streetAddress: "New Delhi Design Studio",
        addressLocality: "New Delhi",
        addressRegion: "Delhi",
        postalCode: "110045",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 28.6139,
        longitude: 77.209,
      },
      areaServed: {
        "@type": "Country",
        name: "India",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://tavistra.com/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Tavistra's payment milestone policy for Made to Order pieces?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "For Made to Order creations, Tavistra requires a 25% upfront booking advance to initiate production. The remaining 75% balance is payable only after photographic Quality Check (QC) inspection prior to dispatch.",
          },
        },
        {
          "@type": "Question",
          name: "Does Tavistra ship across all of India?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Tavistra provides insured crated delivery to serviceable pincodes throughout India, with real-time transit and fee calculations at checkout.",
          },
        },
        {
          "@type": "Question",
          name: "What is the cancellation and refund policy for Made to Order items?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Made to Order pieces offer a 7-day grace window after order placement during which customers may request alterations or a 100% full refund before workshop fabrication begins.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${manrope.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-[family-name:var(--font-ui)]">
        <CookieConsentProvider>
          <CustomCursor />
          <SiteLoader />
          <AuthProvider>
            <OrderProvider>
              <CartProvider>
                {children}
                <CookieConsentBanner />
              </CartProvider>
            </OrderProvider>
          </AuthProvider>
        </CookieConsentProvider>
      </body>
    </html>
  );
}
