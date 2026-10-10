// Date ko parhne layak bana deta hai (value na ho to "—")
const formatDate = (value, withTime = true) => {
  if (!value) return '—'

  return new Date(value).toLocaleString(
    'en-GB',
    withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }
  )
}

export default formatDate