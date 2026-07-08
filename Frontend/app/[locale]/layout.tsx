import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { SearchProvider } from "@/context/SearchContext";
import { CartProvider } from "@/context/CartContext";
import { TranslationProvider } from "@/context/TranslationContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { getDictionary, Locale, locales } from "@/utils/i18n";
import { notFound } from "next/navigation";

// const inter = Inter({ subsets: ["latin"] });
const inter = { className: "" }; // Mock inter to avoid breaking usage below

export const metadata: Metadata = {
  metadataBase: new URL('https://simba-shop.rw'),
  title: {
    default: "Simba Rwanda Supermarket | Freshness Delivered",
    template: "%s | Simba Rwanda"
  },
  description: "Shop from Simba Rwanda's widest range of groceries, household essentials, and more. Quality and freshness delivered to your doorstep.",
  keywords: ["Simba Rwanda", "Supermarket", "Rwanda E-commerce", "Groceries online Kigali", "Fresh food Rwanda"],
  authors: [{ name: "Simba Rwanda Team" }],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_RW",
    url: "https://simba-shop.rw",
    siteName: "Simba Rwanda Supermarket",
    title: "Simba Rwanda Supermarket",
    description: "Your local supermarket, now online. Freshness delivered to your doorstep.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Simba Rwanda Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Simba Rwanda Supermarket",
    description: "Your local supermarket, now online.",
    images: ["/og-image.jpg"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export async function generateStaticParams() {
  return locales.map((locale: string) => ({ locale }));
}

import { AuthProvider } from "@/context/AuthContext";
import { BranchProvider } from "@/context/BranchContext";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { CartPopupProvider } from "@/context/CartPopupContext";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";
import GlobalBranchPicker from "@/components/GlobalBranchPicker";
import CartPopupModal from "@/components/CartPopupModal";

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const dictionary = await getDictionary(locale as Locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                  if (!theme && supportDarkMode) theme = 'dark';
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'system') {
                    if (supportDarkMode) document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300`}>
        <AuthProvider>
          <BranchProvider>
            <CurrencyProvider>
            <ThemeProvider>
              <TranslationProvider dictionary={dictionary}>
                <CartProvider>
                  <CartPopupProvider>
                    <SearchProvider>
                      <Navbar locale={locale as Locale} />
                      <main>
                        {children}
                      </main>
                      <Footer />
                      <ChatWidget />
                      <GlobalBranchPicker />
                      <CartPopupModal />
                    </SearchProvider>
                  </CartPopupProvider>
                </CartProvider>
              </TranslationProvider>
            </ThemeProvider>
            </CurrencyProvider>
          </BranchProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
