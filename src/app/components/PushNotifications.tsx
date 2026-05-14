'use client'

import { useEffect } from 'react'
import { useAuth } from '../lib/useAuth'

// Converts the VAPID public key from base64 to Uint8Array
// (required by the Push API)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

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
        // Register the service worker
        const registration = await navigator.serviceWorker.register('/sw.js')

        // If already subscribed, just save/refresh in DB and stop
        const existing = await registration.pushManager.getSubscription()
        if (existing) {
          await saveSubscription(existing, user.id)
          return
        }

        // Ask for permission — browser handles "don't ask again" automatically
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        // Subscribe to push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
          ),
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
