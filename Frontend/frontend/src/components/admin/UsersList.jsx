import React, { useEffect, useState } from 'react'
import UsersTable from './UsersTable'
import Alert from '../common/Alert'
import { getUsers } from '../../services/admin.service'
import getErrorMessage from '../../utils/getErrorMessage'

const UsersList = ({ status }) => {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false // component hat jaye to purana jawab ignore karo

    const loadUsers = async () => {
      try {
        const data = await getUsers(status)
        if (!ignore) setUsers(data.users)
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadUsers()
    return () => {
      ignore = true
    }
  }, [status])

  if (isLoading) return <p className="text-muted">Loading users...</p>
  if (error) return <Alert message={error} />
  if (users.length === 0) {
    return (
      <p className="rounded-2xl border border-line bg-white p-6 text-muted">No users found.</p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-muted">
        {users.length} {users.length === 1 ? 'user' : 'users'}
      </p>
      <UsersTable users={users} />
    </div>
  )
}

export default UsersList