'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Redirects /media to /resources
// The media library lives at /resources in this app
export default function MediaRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/resources')
  }, [router])

  return null
}
