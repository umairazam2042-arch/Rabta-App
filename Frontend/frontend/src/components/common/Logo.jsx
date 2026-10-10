import React from 'react'
import { Link } from 'react-router'
import { APP_NAME } from '../../config/constants'

// Sirf nishan (icon). Rang theme se aata hai (bg-brand).
export const LogoMark = ({ size = 40, label = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={label ? 'img' : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className="shrink-0"
    >
      <rect width="100" height="100" rx="24" className="fill-brand" />

      {/* Pul ki sarak (road) aur dono sirey */}
      <path
        d="M22 76H78"
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="22" cy="76" r="4.5" fill="#fff" fillOpacity="0.9" />
      <circle cx="78" cy="76" r="4.5" fill="#fff" fillOpacity="0.9" />

      {/* R: tana aur taang pul ke pillar ban jate hain */}
      <path
        d="M34 72V24H54a15 15 0 0 1 0 30H34M54 54L68 72"
        fill="none"
        stroke="#fff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Nishan + naam. Poora logo click karne par Home (/) khulta hai.
// showText={false} karo to sirf nishan dikhega.
const Logo = ({ size = 40, showText = true, className = '' }) => {
  return (
    <Link
      to="/"
      aria-label={`${APP_NAME} home`}
      className={`inline-flex items-center gap-3 rounded-xl transition-opacity hover:opacity-80 ${className}`}
    >
      <LogoMark size={size} label={showText ? '' : APP_NAME} />
      {showText && (
        <span className="text-2xl font-bold tracking-tight text-ink">{APP_NAME}</span>
      )}
    </Link>
  )
}

export default Logo