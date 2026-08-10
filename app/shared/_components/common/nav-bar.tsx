"use client";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../../_lib/utils";

const NavBar = () => {
  const pathname = usePathname();

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="bg-gray-900 flex items-center gap-1 border border-purple-500 rounded-b-sm p-1">
          <Image
            src="/transaction_ia_logo.webp"
            alt="Transaction IA"
            width={38}
            height={38}
            priority
          />
          <h1 className="text-2xl font-bold tracking-tight text-purple-500">Transaction.IA</h1>
        </div>
        <Link
          href="/"
          className={cn(
            "hover:underline hover:text-primary",
            pathname === "/" ? "text-primary" : "text-gray-500"
          )}
        >
          Dashboard
        </Link>
        <Link
          href="transaction"
          className={cn(
            "hover:underline hover:text-primary",
            pathname === "/transaction" ? "text-primary" : "text-gray-500"
          )}
        >
          Transações
        </Link>
      </div>
      <div>
        <UserButton showName />
      </div>
    </div>
  );
};

export default NavBar;
