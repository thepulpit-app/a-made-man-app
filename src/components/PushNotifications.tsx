'use client'

import { useEffect } from 'react'
import { useAuth } from '../lib/useAuth'


async function saveSubscription(
  subscription: PushSubscription,
  userId: string
) {
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      user_id: userId,
    }),
  })
}

export default function PushNotifications() {
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    const setup = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')

        // If already subscribed, refresh in DB and stop
        const existing = await registration.pushManager.getSubscription()
        if (existing) {
          await saveSubscription(existing, user.id)
          return
        }

        // Ask permission — browser handles "don't ask again" automatically
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        // Pass VAPID key as a string — pushManager.subscribe accepts
        // base64url strings directly, no Uint8Array conversion needed.
        // This avoids all TypeScript ArrayBuffer type issues entirely.
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
        })

        await saveSubscription(subscription, user.id)
      } catch (err) {
        console.error('[PushNotifications] setup error:', err)
      }
    }

    setup()
  }, [user])

  // Renders nothing — runs silently in the background
  return null
}
