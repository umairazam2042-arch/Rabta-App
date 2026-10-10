import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { X } from 'lucide-react'
import Avatar from '../common/Avatar'
import Alert from '../common/Alert'
import { getPostLikes } from '../../services/post.service'
import getErrorMessage from '../../utils/getErrorMessage'

const LikesModal = ({ postId, onClose }) => {
  const dialogRef = useRef(null)
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Dikhte hi dialog khol do
  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  // Likes ki list mangwao
  useEffect(() => {
    let ignore = false

    const loadLikes = async () => {
      try {
        const data = await getPostLikes(postId)
        if (!ignore) setUsers(data)
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadLikes()
    return () => {
      ignore = true
    }
  }, [postId])

  // Dhundle hisse (box ke bahar) par click karne se band ho jaye
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current) dialogRef.current.close()
  }

  const closeDialog = () => dialogRef.current?.close()

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={handleBackdropClick}
      aria-labelledby={`likes-title-${postId}`}
      className="m-auto w-[min(92vw,24rem)] rounded-2xl p-0 backdrop:bg-black/40"
    >
      <div className="flex max-h-[70vh] flex-col">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 id={`likes-title-${postId}`} className="text-lg font-bold">
            Liked by
          </h2>
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close"
            className="flex size-10 items-center justify-center rounded-xl text-muted hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-2">
          {isLoading && <p className="p-3 text-muted">Loading...</p>}
          {error && (
            <div className="p-2">
              <Alert message={error} />
            </div>
          )}
          {!isLoading && !error && users.length === 0 && (
            <p className="p-3 text-muted">No likes yet.</p>
          )}

          <ul>
            {users.map((u) => (
              <li key={u._id}>
                <Link
                  to={`/profile/${u.username}`}
                  onClick={closeDialog}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-100"
                >
                  <Avatar username={u.username} src={u.avatar?.url} />
                  <span className="font-semibold">@{u.username}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </dialog>
  )
}

export default LikesModal