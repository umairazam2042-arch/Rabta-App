import React from 'react'

const StatusBadge = ({ isLoggedIn }) => {
  if (isLoggedIn) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
        <span className="size-1.5 rounded-full bg-emerald-600" />
        Logged in
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
      <span className="size-1.5 rounded-full bg-slate-400" />
      Logged out
    </span>
  )
}

export default StatusBadge