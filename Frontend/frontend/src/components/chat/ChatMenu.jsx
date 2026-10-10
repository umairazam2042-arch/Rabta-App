import React, { useEffect, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { getAutoDelete, setAutoDelete } from '../../services/message.service'
import getErrorMessage from '../../utils/getErrorMessage'

const ChatMenu = ({ username }) => {
  const [open, setOpen] = useState(false)
  const [setting, setSetting] = useState({ enabled: false, nextRunAt: null })
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getAutoDelete(username)
      .then(setSetting)
      .catch(() => {})
  }, [username])

  const toggle = async () => {
    setIsSaving(true)
    setError('')
    try {
      setSetting(await setAutoDelete(username, !setting.enabled))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Chat options"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex size-10 items-center justify-center rounded-xl hover:bg-slate-100"
      >
        <MoreVertical size={20} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-line bg-white p-4 shadow-lg">
          <p className="font-bold">Chat auto-delete</p>
          <p className="mt-1 text-sm text-muted">
            {setting.enabled
              ? `Har 24 ghante baad ye chat aap ki screen se saaf hogi. Agli safai: ${new Date(
                  setting.nextRunAt
                ).toLocaleString()}`
              : 'Band hai. Chat khud delete nahi hogi.'}
          </p>

          <button
            type="button"
            onClick={toggle}
            disabled={isSaving}
            className="mt-3 h-10 w-full rounded-xl bg-brand font-bold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {setting.enabled ? 'Auto-delete band karo' : 'Auto-delete on karo (24 ghante)'}
          </button>

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  )
}

export default ChatMenu