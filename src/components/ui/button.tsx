import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[3px] border border-transparent font-sans text-sm font-normal normal-case tracking-normal whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:ring-1 focus-visible:ring-white/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-40 cursor-pointer [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "border border-[#2b2b2b] bg-[#000000] text-[#ffffff] hover:bg-[#111111] hover:border-[#404040] shadow-sm",
        light:
          "border border-[#e4e4e7] bg-[#ffffff] text-[#09090b] hover:bg-[#f4f4f5] hover:border-[#d4d4d8] shadow-sm font-normal",
        outline:
          "border border-[#262626] bg-transparent text-[#d4d4d8] hover:border-[#444448] hover:text-[#ffffff] hover:bg-white/[0.03]",
        secondary:
          "border border-[#222222] bg-[#0c0c0c] text-[#d4d4d8] hover:bg-[#141414] hover:border-[#333333]",
        ghost:
          "bg-transparent text-[#85858a] hover:text-[#f3f3f4] hover:bg-white/[0.04]",
        destructive:
          "border border-[#c47a7a]/40 bg-[#c47a7a]/10 text-[#c47a7a] hover:bg-[#c47a7a]/20",
        link: "text-[#f3f3f4] underline underline-offset-4 hover:text-white",
      },
      size: {
        default: "h-10 gap-2.5 px-5 py-2",
        xs: "h-6 gap-1 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-3.5 text-xs",
        lg: "h-11 gap-2.5 px-6 text-sm",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
