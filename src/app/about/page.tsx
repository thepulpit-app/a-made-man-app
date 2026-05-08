'use client'

import BottomNav from '../../components/BottomNav'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black px-6 pb-24 pt-8 text-white">
      <section className="mx-auto max-w-md space-y-8">
        <div className="overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-950 shadow-2xl">
          <img
            src="/branding/taelf-hero.png"
            alt="Temitope Ajijola Empowerment and Leadership Foundation"
            className="aspect-video w-full object-cover object-center"
          />
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-zinc-500">
            About
          </p>

          <h1 className="mt-4 text-5xl font-black leading-none">
            About A MADE MAN
          </h1>

          <p className="mt-6 leading-8 text-zinc-300">
            A MADE MAN is a movement committed to building men of discipline,
            responsibility, integrity, purpose, and legacy.
          </p>

          <p className="mt-5 leading-8 text-zinc-400">
            Powered by the Temitope Ajijola Empowerment and Leadership
            Foundation, this platform exists to equip men through principles,
            conversations, media, community, reflection, and intentional growth.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold">Conference History</h2>

          <p className="mt-4 leading-8 text-zinc-400">
            Two conferences. 500+ men impacted. More conversations, more
            resources, and more transformative gatherings are being built.
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="text-2xl font-bold">The Mandate</h2>

          <p className="mt-4 leading-8 text-zinc-400">
            To create spaces where men are challenged, strengthened, corrected,
            equipped, and reminded that manhood is not performance — it is
            responsibility lived with conviction.
          </p>
        </div>
      </section>

      <BottomNav />
    </main>
  )
}