import { Navbar } from "@/components/layout/Navbar";
import { IdentitySkeleton } from "@/features/identity";

export default function IdentityLoading() {
  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-[#f3f3f4] relative selection:bg-[#202020] selection:text-[#f3f3f4]">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area with Skeleton Loading Screen */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-12 py-16 sm:py-24 relative z-10">
        <IdentitySkeleton />
      </main>
    </div>
  );
}
