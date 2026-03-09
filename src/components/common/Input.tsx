import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full px-3 py-2 rounded-[8px] bg-[#03060F] border border-[#162444]',
        'text-[#FFFEF8] font-dm-mono text-sm placeholder:text-[#FFFEF8]/30',
        'focus:outline-none focus:border-[#F0B429] transition-colors',
        className
      )}
      {...props}
    />
  )
}