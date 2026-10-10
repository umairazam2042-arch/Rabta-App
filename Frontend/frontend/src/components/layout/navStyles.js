// Sidebar ke saare buttons ek jaisi styling use karte hain.
// Choti screen: neeche wali bar mein icon ke neeche naam. Bari screen (lg): left sidebar ki row.
export const navItemBase =
  'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[11px] leading-tight transition-colors lg:flex-none lg:flex-row lg:justify-start lg:gap-3 lg:px-3 lg:py-2.5 lg:text-base'

export const navActive = 'bg-brand-soft font-bold text-brand-dark'
export const navIdle = 'font-semibold text-slate-700 hover:bg-slate-100'

// Bohot choti screen par naam chhupa do (icon kaafi hai)
export const navLabel = 'hidden truncate sm:inline'