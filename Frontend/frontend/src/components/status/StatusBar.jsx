import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Plus } from 'lucide-react'
import Avatar from '../common/Avatar'
import StatusViewer from './StatusViewer'
import { getStatuses } from '../../services/status.service'

// Status wali gol shakal ke ird gird neela ring
const Ring = ({ children }) => (
  <span className="block rounded-full bg-brand p-0.5">
    <span className="block rounded-full border-2 border-white">{children}</span>
  </span>
)

const StatusBar = () => {
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewingId, setViewingId] = useState(null) // jis user ka status khula hai

  useEffect(() => {
    let ignore = false

    const load = async () => {
      try {
        const data = await getStatuses()
        if (!ignore) setGroups(data)
      } catch {
        // ye patti sirf sahulat hai, error par chup rehna theek hai
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    load()
    return () => {
      ignore = true
    }
  }, [])

  // Status delete ho to list se hata do; kisi ka status khatam to us ka ring bhi
  const handleDeleted = (statusId) => {
    setGroups((prev) =>
      prev
        .map((g) => ({ ...g, statuses: g.statuses.filter((s) => s._id !== statusId) }))
        .filter((g) => g.statuses.length > 0)
    )
  }

  if (isLoading) return null

  const mine = groups.find((g) => g.isMine)
  const others = groups.filter((g) => !g.isMine)
  const viewing = groups.find((g) => g.user._id === viewingId)

  return (
    <section aria-label="Status" className="rounded-2xl border border-line bg-white p-4">
      <ul className="flex gap-4 overflow-x-auto pb-1">
        <li className="shrink-0">
          {mine ? (
            <button
              type="button"
              onClick={() => setViewingId(mine.user._id)}
              className="flex w-16 flex-col items-center gap-1.5"
            >
              <Ring>
                <Avatar username={mine.user.username} src={mine.user.avatar?.url} size="lg" />
              </Ring>
              <span className="text-xs font-semibold">Your status</span>
            </button>
          ) : (
            <Link to="/shots" className="flex w-16 flex-col items-center gap-1.5">
              <span className="flex size-15 items-center justify-center rounded-full border-2 border-dashed border-slate-400 text-brand">
                <Plus size={26} />
              </span>
              <span className="text-xs font-semibold">Add status</span>
            </Link>
          )}
        </li>

        {others.map((g) => (
          <li key={g.user._id} className="shrink-0">
            <button
              type="button"
              onClick={() => setViewingId(g.user._id)}
              className="flex w-16 flex-col items-center gap-1.5"
            >
              <Ring>
                <Avatar username={g.user.username} src={g.user.avatar?.url} size="lg" />
              </Ring>
              <span className="w-full truncate text-center text-xs font-semibold">
                {g.user.username}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {viewing && (
        <StatusViewer
          key={viewing.user._id}
          group={viewing}
          onClose={() => setViewingId(null)}
          onDeleted={handleDeleted}
        />
      )}
    </section>
  )
}

export default StatusBar