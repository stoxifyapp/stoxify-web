import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ className, label, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-[#FFFEF8]/70">{label}</label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 rounded-[8px] bg-[#03060F] border border-[#162444]',
          'text-[#FFFEF8] font-dm-mono text-sm placeholder:text-[#FFFEF8]/30',
          'focus:outline-none focus:border-[#F0B429] transition-colors',
          error && 'border-[#F87171]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-[#F87171]">{error}</p>}
    </div>
  )
}