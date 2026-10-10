import React from 'react'
import { NavLink } from 'react-router'
import { Home, Clapperboard, MessageCircle,  ShieldCheck, LogOut } from 'lucide-react'
import Logo from '../common/Logo'
import Avatar from '../common/Avatar'
import ThemeSwitcher from '../common/ThemeSwitcher'
import useAuth from '../../hooks/useAuth'
import useUnreadCount from '../../hooks/useUnreadCount'
import { navItemBase, navActive, navIdle, navLabel } from './navStyles'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const unreadCount = useUnreadCount()

  const navItems = [
    { to: '/', label: 'Home', icon: Home, end: true, color: 'text-blue-600', tile: 'bg-blue-100' },
    { to: '/shots', label: 'Shots', icon: Clapperboard, color: 'text-pink-600', tile: 'bg-pink-100' },
    {
      to: '/messages',
      label: 'Messages',
      icon: MessageCircle,
      badge: unreadCount,
      color: 'text-emerald-600',
      tile: 'bg-emerald-100',
    },
    { to: `/profile/${user?.username}`, label: 'Profile', isProfile: true },
    ...(user?.role === 'admin'
      ? [{ to: '/admin', label: 'Admin', icon: ShieldCheck, color: 'text-amber-600', tile: 'bg-amber-100' }]
      : []),
  ]

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas px-2 pb-[env(safe-area-inset-bottom)] lg:static lg:z-auto lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:gap-2 lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0">
      <div className="hidden px-3 pb-4 pt-2 lg:block">
        <Logo />
      </div>

      <nav
        aria-label="Main"
        className="flex flex-row items-stretch justify-around gap-1 py-1 lg:flex-col lg:justify-start lg:gap-2 lg:py-0"
      >
        {navItems.map(({ to, label, icon: Icon, end, badge, color, tile, isProfile }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            aria-label={label}
            className={({ isActive }) => `${navItemBase} ${isActive ? navActive : navIdle}`}
          >
            {isProfile ? (
              <Avatar username={user?.username} src={user?.avatar?.url} size="sm" alt="" />
            ) : (
              <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tile}`}>
                <Icon size={20} strokeWidth={2} className={color} />
              </span>
            )}

            <span className={navLabel}>{label}</span>

            {badge > 0 && (
              <span className="absolute right-1 top-0 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white lg:static lg:ml-auto lg:px-2 lg:text-xs">
                {badge > 99 ? '99+' : badge}
                <span className="sr-only"> unread messages</span>
              </span>
            )}
          </NavLink>
        ))}

        <ThemeSwitcher />

        <button
          type="button"
          onClick={logout}
          aria-label="Log out"
          className={`${navItemBase} ${navIdle} hover:bg-red-50`}
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
            <LogOut size={20} strokeWidth={2} className="text-red-600" />
          </span>
          <span className={navLabel}>Log out</span>
        </button>
      </nav>
    </aside>
  )
}

export default Sidebar