import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost'
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-[8px] font-syne text-sm font-medium transition-all',
        variant === 'primary' && 'bg-[#F0B429] text-[#010206] hover:opacity-90',
        variant === 'outline' && 'border border-[#F0B429] text-[#F0B429] hover:bg-[#F0B429]/10',
        variant === 'ghost'   && 'text-[#FFFEF8] hover:bg-[#05091A]',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}