import React from 'react'
import { Link } from 'react-router'
import StatusBadge from './StatusBadge'
import formatDate from '../../utils/formatDate'

const UsersTable = ({ users }) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="border-b border-line bg-slate-50 text-muted">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">Username</th>
            <th scope="col" className="px-4 py-3 font-semibold">Email</th>
            <th scope="col" className="px-4 py-3 font-semibold">Role</th>
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            <th scope="col" className="px-4 py-3 font-semibold">Last login</th>
            <th scope="col" className="px-4 py-3 font-semibold">Last logout</th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="border-b border-line last:border-0 hover:bg-slate-50">
              <td className="px-4 py-3 font-semibold">@{u.username}</td>
              <td className="px-4 py-3 text-slate-700">{u.email}</td>
              <td className="px-4 py-3 capitalize">{u.role}</td>
              <td className="px-4 py-3">
                <StatusBadge isLoggedIn={u.isLoggedIn} />
              </td>
              <td className="px-4 py-3 text-slate-700">{formatDate(u.lastLoginAt)}</td>
              <td className="px-4 py-3 text-slate-700">{formatDate(u.lastLogoutAt)}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  to={`/admin/users/${u._id}`}
                  className="font-semibold text-brand hover:text-brand-dark"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsersTable