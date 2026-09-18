import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const VARIANTS = {
  default: 'bg-key text-pit hover:bg-key/85',
  outline: 'border border-edge bg-transparent text-paper hover:border-haze/60',
  ghost: 'bg-transparent text-haze hover:bg-riser hover:text-paper',
} as const

const SIZES = {
  default: 'h-9 px-4 text-sm',
  sm: 'h-8 px-3 text-sm',
  icon: 'h-9 w-9',
} as const

export interface ButtonProps extends React.ComponentProps<'button'> {
  variant?: keyof typeof VARIANTS
  size?: keyof typeof SIZES
  asChild?: boolean
}

function Button({ className, variant = 'default', size = 'default', asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-back disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  )
}

export { Button }
