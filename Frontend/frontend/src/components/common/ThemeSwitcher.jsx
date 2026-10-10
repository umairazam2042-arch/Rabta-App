import React, { useRef } from 'react'
import { Check, Palette, X } from 'lucide-react'
import useTheme from '../../hooks/useTheme'
import { THEMES } from '../../config/themes'
import { navItemBase, navIdle, navLabel } from '../layout/navStyles'

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme()
  const dialogRef = useRef(null)

  const open = () => dialogRef.current?.showModal()
  const close = () => dialogRef.current?.close()

  return (
    <>
      {/* Sidebar / neeche wali bar mein dikhne wala button */}
      <button
        type="button"
        onClick={open}
        aria-label="Theme"
        className={`${navItemBase} ${navIdle}`}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-100">
          <Palette size={20} strokeWidth={2} className="text-purple-600" />
        </span>
        <span className={navLabel}>Theme</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="theme-dialog-title"
        onClick={(e) => {
          // dialog ke bahar (backdrop) click par band
          if (e.target === dialogRef.current) close()
        }}
        className="m-auto w-[min(92vw,28rem)] rounded-2xl bg-white p-5 text-ink backdrop:bg-black/50"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id="theme-dialog-title" className="text-lg font-bold">
            Site ka theme
          </h2>

          {/* Dialog band karne ka X button */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-lg p-1.5 text-muted hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <ul className="flex flex-col gap-2">
          {THEMES.map((t) => {
            const active = theme === t.id
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setTheme(t.id)}
                  aria-pressed={active}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors ${
                    active ? 'border-brand bg-brand-soft' : 'border-line hover:bg-slate-100'
                  }`}
                >
                  <span className="flex shrink-0">
                    {t.swatches.map((c, i) => (
                      <span
                        key={c}
                        style={{ backgroundColor: c }}
                        className={`size-7 rounded-full border border-black/10 ${i > 0 ? '-ml-2' : ''}`}
                      />
                    ))}
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">{t.name}</span>
                    <span className="block text-sm text-muted">{t.note}</span>
                  </span>
                  {active && <Check size={20} className="text-brand" />}
                </button>
              </li>
            )
          })}
        </ul>
      </dialog>
    </>
  )
}

export default ThemeSwitcher