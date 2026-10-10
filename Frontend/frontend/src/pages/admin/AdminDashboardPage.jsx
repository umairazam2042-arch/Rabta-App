import React, { useEffect, useState } from 'react'
import { Users, UserCheck, UserX } from 'lucide-react'
import StatCard from '../../components/admin/StatCard'
import Alert from '../../components/common/Alert'
import { getStats } from '../../services/admin.service'
import getErrorMessage from '../../utils/getErrorMessage'

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    const loadStats = async () => {
      try {
        const data = await getStats()
        if (!ignore) setStats(data)
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadStats()
    return () => {
      ignore = true
    }
  }, [])

  // Loading ke dauran "–" dikhao
  const show = (value) => (isLoading ? '–' : value ?? 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Admin panel</h1>
        <p className="mt-1 text-muted">Overview of all users. Click a card to see the list.</p>
      </div>

      <Alert message={error} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          to="/admin/users"
          label="Total users"
          value={show(stats?.total)}
          icon={Users}
          tone="brand"
        />
        <StatCard
          to="/admin/users?status=online"
          label="Logged in"
          value={show(stats?.online)}
          icon={UserCheck}
          tone="green"
        />
        <StatCard
          to="/admin/users?status=offline"
          label="Logged out"
          value={show(stats?.offline)}
          icon={UserX}
          tone="slate"
        />
      </div>

      <p className="text-sm text-muted">
        &quot;Logged in&quot; means the user has not logged out yet.
      </p>
    </div>
  )
}

export default AdminDashboardPage