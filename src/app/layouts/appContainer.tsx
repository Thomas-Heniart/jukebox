import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function AppContainer({
  children,
  currentPage,
}: Readonly<{
  children: React.ReactNode;
  currentPage?: string;
}>) {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <header className="flex gap-6 flex-wrap items-center justify-center font-bold text-1xl">
        <Link
          href="/tracks-queue"
          className={`flex items-center gap-2 hover:underline hover:underline-offset-4 ${currentPage === "tracks-queue" ? "underline underline-offset-4" : ""}`}
        >
          <Image
            aria-hidden
            src="/tracks-queue.svg"
            alt="Tracks Queue"
            width={32}
            height={32}
          />
          Tracks Queue
        </Link>
        <Link
          href="/search"
          className={`flex items-center gap-2 hover:underline hover:underline-offset-4 ${currentPage === "search" ? "underline underline-offset-4" : ""}`}
        >
          <Image
            aria-hidden
            src="/loop.svg"
            alt="Search Icon"
            width={32}
            height={32}
          />
          Search
        </Link>
      </header>
      <main className="flex flex-col gap-8 row-start-2 items-start">
        {children}
      </main>
    </div>
  );
}
