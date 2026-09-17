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
        className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#8E9CA8] hover:text-[#F5F5F5] transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#8FB996] py-1 cursor-pointer group"
      >
        <ArrowLeft
          size={14}
          className="transition-transform duration-200 group-hover:-translate-x-1 text-[#8E9CA8] group-hover:text-[#F5F5F5]"
        />
        <span>{label}</span>
      </Link>
    </div>
  );
};
