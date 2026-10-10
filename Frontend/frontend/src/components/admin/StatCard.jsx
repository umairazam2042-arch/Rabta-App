import React from 'react'
import { Link } from 'react-router'

const tones = {
  brand: 'bg-brand-soft text-brand-dark',
  green: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-slate-700',
}

const StatCard = ({ to, label, value, icon: Icon, tone = 'brand' }) => {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand"
    >
      <span className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon size={24} />
      </span>
      <span>
        <span className="block text-3xl font-bold">{value}</span>
        <span className="block text-sm font-semibold text-muted">{label}</span>
      </span>
    </Link>
  )
}

export default StatCard