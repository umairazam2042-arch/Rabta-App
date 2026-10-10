import { useCallback, useEffect, useState } from 'react'

// Ulti ginti: start(30) se 30, 29, 28 ... 0 tak
const useCountdown = (initialSeconds = 0) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [secondsLeft])

  const start = useCallback((seconds) => setSecondsLeft(seconds), [])

  return { secondsLeft, start }
}

export default useCountdown