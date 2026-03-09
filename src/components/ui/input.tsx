interface Props {
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
}

export function Input({ placeholder, value, onChange, type = 'text' }: Props) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2 rounded-stx bg-stx-surface border border-stx-primary text-stx-text placeholder:text-stx-text/40 focus:outline-none focus:ring-1 focus:ring-stx-gold text-sm font-[DM_Mono]"
    />
  )
}