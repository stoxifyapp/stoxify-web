interface Props {
  children: React.ReactNode
  className?: string
}

export function Card({ children, className = '' }: Props) {
  return (
    <div className={`bg-stx-surface rounded-stx p-4 border border-stx-primary/20 ${className}`}>
      {children}
    </div>
  )
}