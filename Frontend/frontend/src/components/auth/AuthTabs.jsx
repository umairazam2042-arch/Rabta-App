import React from 'react'
import { NavLink } from 'react-router'

const tabs = [
  { to: '/login', label: 'Log in' },
  { to: '/register', label: 'Sign up' },
]

const AuthTabs = () => {
  return (
    <div className="flex rounded-xl bg-slate-200/70 p-1">
      {tabs.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 rounded-lg py-2.5 text-center text-[15px] font-semibold transition-colors ${
              isActive ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  )
}

export default AuthTabs