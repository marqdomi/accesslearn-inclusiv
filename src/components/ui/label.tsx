import { ComponentProps } from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

function Label({
  className,
  children,
  ...props
}: ComponentProps<typeof LabelPrimitive.Root> & { children?: React.ReactNode }) {
  const isRequired = className?.includes('required') || props['data-required'] === 'true'
  
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      {isRequired && <span className="text-red-500">*</span>}
    </LabelPrimitive.Root>
  )
}

export { Label }
