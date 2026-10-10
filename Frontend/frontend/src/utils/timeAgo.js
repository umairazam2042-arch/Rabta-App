// "2h ago", "3d ago" jaisa text banata hai
const timeAgo = (value) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000)
  if (seconds < 60) return 'Just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return new Date(value).toLocaleDateString('en-GB', { dateStyle: 'medium' })
}

export default timeAgo