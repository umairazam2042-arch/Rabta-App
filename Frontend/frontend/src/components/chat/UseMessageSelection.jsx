import { useEffect, useState } from 'react'
import { getMessages, sendMessage } from '../../services/message.service'
import { getChatKey, encryptText } from '../../utils/e2ee'
import getErrorMessage from '../../utils/getErrorMessage'

// Message selection, ⋮ menu actions (Update / Forward / Delete) ka state aur logic
const useMessageSelection = ({ username, me, messages, onEdit, onDelete }) => {
  const [selected, setSelected] = useState(() => new Set())
  const [menuOpen, setMenuOpen] = useState(false)
  // Jis message par hold kiya, menu usi ke paas khulta hai
  const [menuAnchorId, setMenuAnchorId] = useState(null)
  const [forwardOpen, setForwardOpen] = useState(false)
  const [forwardTo, setForwardTo] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState('')
  const [actionBusy, setActionBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  // Chat badle to selection reset
  useEffect(() => {
    setSelected(new Set())
    setMenuOpen(false)
    setMenuAnchorId(null)
    setForwardOpen(false)
    setEditingId(null)
    setActionError('')
  }, [username])

  // Selected messages, list ki tarteeb mein (delete hue ko chhod kar)
  const selectedMsgs = messages.filter((m) => selected.has(m._id) && !m.deletedForEveryone)
  const canUpdate = selectedMsgs.length === 1 && selectedMsgs[0].sender === me._id
  const allMine = selectedMsgs.length > 0 && selectedMsgs.every((m) => m.sender === me._id)

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setActionError('')
  }

  // Long press se message select + usi par menu khulta hai
  const selectMessage = (id) => {
    setSelected((prev) => (prev.has(id) ? prev : new Set(prev).add(id)))
    setMenuAnchorId(id)
    setMenuOpen(true)
    setActionError('')
  }

  const closeMenu = () => setMenuOpen(false)

  const clearSelection = () => {
    setSelected(new Set())
    setMenuOpen(false)
    setMenuAnchorId(null)
    setForwardOpen(false)
    setForwardTo('')
  }

  const openForward = () => {
    setMenuOpen(false)
    setForwardOpen(true)
  }

  const closeForward = () => setForwardOpen(false)

  const startEdit = () => {
    const msg = selectedMsgs[0]
    if (!msg) return
    setEditingId(msg._id)
    setEditDraft(msg.text)
    clearSelection()
  }

  const cancelEdit = () => setEditingId(null)

  const saveEdit = async () => {
    const text = editDraft.trim()
    if (!text) return
    setActionBusy(true)
    setActionError('')
    try {
      await onEdit(editingId, text)
      setEditingId(null)
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setActionBusy(false)
    }
  }

  // "Sab ke liye" sirf apne messages par chalega
  const deleteSelected = async (scope) => {
    const targets =
      scope === 'everyone' ? selectedMsgs.filter((m) => m.sender === me._id) : selectedMsgs
    if (targets.length === 0) return
    setMenuOpen(false)
    setActionBusy(true)
    setActionError('')
    try {
      await Promise.all(targets.map((m) => onDelete(m._id, scope)))
      clearSelection()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setActionBusy(false)
    }
  }

  const forwardSelected = async () => {
    const target = forwardTo.trim().replace(/^@/, '')
    if (!target || selectedMsgs.length === 0) return
    setActionBusy(true)
    setActionError('')
    try {
      // Target user ki public key se chat key banao, phir har message encrypt karke bhejo
      const data = await getMessages(target)
      const key = await getChatKey(me._id, data.user.publicKey)
      for (const m of selectedMsgs) {
        const encrypted = await encryptText(m.text, key)
        await sendMessage(target, encrypted.text, encrypted.iv)
      }
      clearSelection()
    } catch (err) {
      setActionError(getErrorMessage(err))
    } finally {
      setActionBusy(false)
    }
  }

  return {
    selected,
    selectedMsgs,
    canUpdate,
    allMine,
    menuOpen,
    menuAnchorId,
    closeMenu,
    forwardOpen,
    openForward,
    closeForward,
    forwardTo,
    setForwardTo,
    forwardSelected,
    toggleSelect,
    selectMessage,
    clearSelection,
    startEdit,
    editingId,
    editDraft,
    setEditDraft,
    cancelEdit,
    saveEdit,
    deleteSelected,
    actionBusy,
    actionError,
  }
}

export default useMessageSelection