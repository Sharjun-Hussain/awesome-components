import { useRef, type MouseEvent } from 'react'

export const meta = {
  title: 'Spotlight Card',
  description:
    'A glassy card with a radial spotlight that follows the cursor, revealing a soft colored glow.',
}

export default function SpotlightCard() {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (event: MouseEvent<HTMLDivElement>) => {
    const card = ref.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    card.style.setProperty('--x', `${event.clientX - rect.left}px`)
    card.style.setProperty('--y', `${event.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className="group relative w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-7 transition-colors hover:border-violet-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-violet-500/40"
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(320px_circle_at_var(--x,50%)_var(--y,50%),rgba(139,92,246,0.16),transparent_70%)]" />
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-semibold text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
          ✦ New release
        </span>
        <h3 className="mt-4 text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          Spotlight card
        </h3>
        <p className="mt-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          Move your cursor across the surface — a soft light follows along. Built
          with CSS variables and zero dependencies.
        </p>
        <div className="mt-5 flex items-center gap-2 text-xs font-medium text-zinc-400">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Interactive preview
        </div>
      </div>
    </div>
  )
}
