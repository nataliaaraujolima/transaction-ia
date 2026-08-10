import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ptBR } from "@clerk/localizations";
import NavBar from "./shared/_components/common/nav-bar";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Transaction IA",
  description: "Transaction IA - Boilerplate",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
          <div className="space-y-4  overflow-hidden p-6">
            <NavBar />
          </div>

          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
