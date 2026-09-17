import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackNavigationProps {
  href?: string;
  label?: string;
  className?: string;
}

export const BackNavigation: React.FC<BackNavigationProps> = ({
  href = "/trades",
  label = "BACK TO ALL TRADES",
  className,
}) => {
  return (
    <div className={cn("flex items-center", className)}>
      <Link
        href={href}
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#85858a] hover:text-[#f3f3f4] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#6fe39a] py-1 cursor-pointer group"
      >
        <ArrowLeft
          size={14}
          className="transition-transform duration-200 group-hover:-translate-x-1 text-[#55555a] group-hover:text-[#f3f3f4]"
        />
        <span>{label}</span>
      </Link>
    </div>
  );
};
