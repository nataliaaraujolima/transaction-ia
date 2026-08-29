import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ptBR } from "@clerk/localizations";
import type { ReactNode } from "react";
import { Toaster } from "./shared/_components/ui/sonner";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Transaction IA",
  description: "Transaction IA",
  other: {
    "google-adsense-account": "ca-pub-9247492374195257",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${jetbrainsMono.variable} dark h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          localization={ptBR}
          appearance={{
            theme: dark,
            elements: {
              userButtonPopoverActionButton__manageAccount: "hidden!",
            },
          }}
        >
          <div className="flex h-full flex-col overflow-hidden">{children}</div>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
