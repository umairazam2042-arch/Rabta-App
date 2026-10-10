import { useCallback, useEffect, useRef, useState } from 'react'
import { getShots } from '../services/shot.service'
import getErrorMessage from '../utils/getErrorMessage'

// Shots ki list: pehla batch, aur neeche pohanchne par naya batch
const useShots = () => {
  const [shots, setShots] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const busyRef = useRef(false) // ek waqt mein ek hi request

  // Pehla batch
  useEffect(() => {
    let ignore = false

    const loadFirst = async () => {
      try {
        const fresh = await getShots()
        if (!ignore) setShots(fresh)
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadFirst()
    return () => {
      ignore = true
    }
  }, [])

  // Naya batch (neeche scroll karne par, ya "Try again" par)
  const loadMore = useCallback(async () => {
    if (busyRef.current) return
    busyRef.current = true
    setIsLoadingMore(true)

    try {
      const fresh = await getShots()
      setShots((prev) => {
        // Jo shots pehle dikha chuke hain unhein dobara mat jodo
        const seen = new Set(prev.map((s) => s.id))
        return [...prev, ...fresh.filter((s) => !seen.has(s.id))]
      })
      setError('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      busyRef.current = false
      setIsLoadingMore(false)
    }
  }, [])

  return { shots, isLoading, isLoadingMore, error, loadMore }
}

export default useShots