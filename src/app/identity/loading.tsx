import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { IdentitySkeleton } from "@/features/identity/components/IdentitySkeleton";

export default function IdentityLoading() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#1c1c1c] selection:text-[#f3f3f4]">
      <Navbar />
      <main className="flex-1 w-full max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        <IdentitySkeleton />
      </main>
    </div>
  );
}
