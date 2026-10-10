import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { ArrowLeft, Trash2 } from 'lucide-react'
import StatusBadge from '../../components/admin/StatusBadge'
import Alert from '../../components/common/Alert'
import { deleteUser, getUserById } from '../../services/admin.service'
import formatDate from '../../utils/formatDate'
import getErrorMessage from '../../utils/getErrorMessage'

const AdminUserDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    let ignore = false

    const loadUser = async () => {
      try {
        const data = await getUserById(id)
        if (!ignore) setUser(data)
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadUser()
    return () => {
      ignore = true
    }
  }, [id])

  const handleDelete = async () => {
    const confirmed = window.confirm(`Delete @${user.username}? This cannot be undone.`)
    if (!confirmed) return

    setIsDeleting(true)
    setError('')
    try {
      await deleteUser(id)
      navigate('/admin/users', { replace: true })
    } catch (err) {
      setError(getErrorMessage(err))
      setIsDeleting(false)
    }
  }

  const backLink = (
    <Link
      to="/admin/users"
      className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
    >
      <ArrowLeft size={18} />
      All users
    </Link>
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <p className="text-muted">Loading user...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col gap-6">
        {backLink}
        <Alert message={error || 'User not found'} />
      </div>
    )
  }

  const details = [
    { label: 'User ID', value: user._id },
    { label: 'Username', value: `@${user.username}` },
    { label: 'Email', value: user.email },
    { label: 'Date of birth', value: formatDate(user.dob, false) },
    { label: 'Role', value: user.role },
    { label: 'Joined', value: formatDate(user.createdAt) },
    { label: 'Last login', value: formatDate(user.lastLoginAt) },
    { label: 'Last logout', value: formatDate(user.lastLogoutAt) },
  ]

  return (
    <div className="flex flex-col gap-6">
      {backLink}

      <Alert message={error} />

      <section className="rounded-2xl border border-line bg-white p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-lg font-bold uppercase text-brand-dark">
            {user.username.slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-bold">@{user.username}</h1>
            <p className="truncate text-muted">{user.email}</p>
          </div>
          <StatusBadge isLoggedIn={user.isLoggedIn} />
        </div>

        <dl className="mt-6 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {details.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-sm font-semibold text-muted">{label}</dt>
              <dd className="mt-0.5 break-all font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Admin account yahan se delete nahi hota (backend bhi mana karta hai) */}
      {user.role !== 'admin' && (
        <div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-red-300 bg-white px-5 text-sm font-bold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Trash2 size={18} />
            {isDeleting ? 'Deleting...' : 'Delete user'}
          </button>
        </div>
      )}
    </div>
  )
}

export default AdminUserDetailPage