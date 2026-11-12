import type { Metadata } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { OrderProvider } from "@/context/OrderContext";
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
  title: "Tavistra — Design-Led Lifestyle & Décor",
  description:
    "Contemporary design-led lifestyle, objects, and architectural décor by Tavistra. Master-crafted ready stock, made to order, and bespoke editions.",
  icons: {
    icon: "/logo-mark.png",
    shortcut: "/logo-mark.png",
    apple: "/logo-mark.png",
  },
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
      <body className="min-h-full flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-[family-name:var(--font-ui)]">
        <AuthProvider>
          <OrderProvider>
            <CartProvider>{children}</CartProvider>
          </OrderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
