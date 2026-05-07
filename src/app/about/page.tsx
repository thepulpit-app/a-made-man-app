import BottomNav from '../../components/BottomNav'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white px-6 pb-24 pt-8">
      <section className="mx-auto max-w-md space-y-6">
        <img
  src="/branding/taelf-logo.png"
  alt="Temitope Ajijola Empowerment and Leadership Foundation"
  className="mx-auto w-60 rounded-4xl border border-zinc-400 bg-white p-1"
/>
        <h1 className="text-3xl font-bold">About A MADE MAN</h1>

        <p className="text-zinc-400">
          A MADE MAN is a foundation and movement committed to building men of
          discipline, responsibility, integrity, purpose, and legacy.
        </p>

        <div className="rounded-3xl border border-zinc-800 p-5">
          <h2 className="text-xl font-semibold">Conference History</h2>
          <p className="mt-2 text-zinc-400">
            Two conferences. 500+ men impacted. More to come.
          </p>
        </div>

        <Link href="/admin" className="block text-sm text-zinc-500 underline">
          Admin Access
        </Link>
      </section>
      <BottomNav />
    </main>
  )
}