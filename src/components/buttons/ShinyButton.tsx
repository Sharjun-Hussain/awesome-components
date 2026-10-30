import { ArrowRight } from 'lucide-react'

export const meta = {
  title: 'Shiny Button',
  description:
    'A dark pill button with a sweeping light shine on hover and a subtle press animation.',
}

export default function ShinyButton() {
  return (
    <div className="flex w-full justify-center">
      <button
        type="button"
        className="group relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full bg-zinc-900 px-7 text-sm font-semibold text-white shadow-lg shadow-zinc-900/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-violet-500/25 active:scale-95 dark:bg-white dark:text-zinc-900"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full dark:via-zinc-900/15" />
        <span className="relative flex items-center gap-2">
          Get started
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </button>
    </div>
  )
}
