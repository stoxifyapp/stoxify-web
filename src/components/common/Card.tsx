import { cn } from '@/lib/utils'

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(
      'bg-[#03060F] border border-[#162444] rounded-[8px] p-4',
      className
    )}>
      {children}
    </div>
  )
}