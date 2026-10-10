import React from 'react'
import { Loader2 } from 'lucide-react'

const Loader = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 size={32} className="animate-spin text-brand" aria-label="Loading" />
    </div>
  )
}

export default Loader