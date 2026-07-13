import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Button — sticker / neo-brutalist vocabulary, unified with the marketing site's
 * `StickerButton`: hard ink outline, solid offset shadow, press physics (hover
 * lifts up-left and grows the shadow; :active presses it into the page). The
 * solid tones carry `sticker press`; the quiet `ghost` / `link` variants opt out
 * so they stay borderless.
 */
const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-display font-semibold transition-[transform,box-shadow,background-color,color] disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'sticker press bg-brand text-white',
        destructive: 'sticker press bg-danger text-white',
        outline: 'sticker press bg-card text-ink hover:bg-secondary',
        secondary: 'sticker press bg-secondary text-ink',
        ghost: 'text-muted transition-colors hover:bg-secondary hover:text-ink',
        link: 'text-brand underline-offset-4 hover:underline',
        money: 'sticker press bg-money text-white',
        ink: 'sticker press bg-ink text-white',
        yellow: 'sticker press bg-yellow text-ink',
      },
      size: {
        default: 'h-10 px-5 py-2 text-sm',
        sm: 'h-9 px-3.5 text-[13px]',
        lg: 'h-12 px-7 text-base',
        pill: 'h-12 rounded-full px-7 text-[15px]',
        'pill-sm': 'h-10 rounded-full px-5 text-sm',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
