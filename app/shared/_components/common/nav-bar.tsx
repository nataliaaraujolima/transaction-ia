"use client";

import { UserButton } from "@clerk/nextjs";
import { MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "../../../_lib/utils";
import { Button } from "../ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transaction", label: "Transações" },
  { href: "/subscription", label: "Assinaturas" },
] as const;

const NavBar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkClassName = (href: string) =>
    cn(
      "hover:underline hover:text-primary",
      pathname === href ? "text-primary" : "text-gray-500"
    );

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex shrink-0 items-center gap-1 rounded-b-sm border border-purple-500 bg-gray-900 p-1">
          <Image
            src="/transaction_ia_logo.webp"
            alt="Transaction IA"
            width={38}
            height={38}
            priority
          />
          <h1 className="hidden text-2xl font-bold tracking-tight text-purple-500 sm:block">
            Transaction.IA
          </h1>
        </div>

        <nav className="hidden items-center gap-4 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={linkClassName(href)}>
              {label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden sm:block">
          <UserButton showName />
        </div>
        <div className="sm:hidden">
          <UserButton />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="md:hidden" />}
          >
            <MenuIcon />
            <span className="sr-only">Abrir menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-70">
            <SheetHeader>
              <SheetTitle className="text-purple-500">Transaction.IA</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 px-4">
              {NAV_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(linkClassName(href), "text-base")}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default NavBar;
