import React from 'react'
import { Link, useSearchParams } from 'react-router'
import UsersList from '../../components/admin/UsersList'

const filters = [
  { label: 'All users', value: '', to: '/admin/users' },
  { label: 'Logged in', value: 'online', to: '/admin/users?status=online' },
  { label: 'Logged out', value: 'offline', to: '/admin/users?status=offline' },
]

const AdminUsersPage = () => {
  const [searchParams] = useSearchParams()

  // Address se status parho (sirf online ya offline allowed)
  const rawStatus = searchParams.get('status')
  const status = rawStatus === 'online' || rawStatus === 'offline' ? rawStatus : ''

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="mt-1 text-muted">Everyone who has signed up.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.value}
            to={filter.to}
            aria-current={status === filter.value ? 'page' : undefined}
            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              status === filter.value
                ? 'bg-brand text-white'
                : 'border border-line bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {/* key badalne par component naya ban jata hai, is liye har filter par fresh loading hoti hai */}
      <UsersList key={status} status={status} />
    </div>
  )
}

export default AdminUsersPage