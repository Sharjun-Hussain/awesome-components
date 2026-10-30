import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/cn'

export type NavigationSection = {
  title: string
  href: string
  isActive?: boolean
}

export default function Header({
  navigationData,
}: {
  navigationData: NavigationSection[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <header className="relative z-30 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
      <a href="#" className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-zinc-900 text-white shadow-sm dark:bg-white dark:text-zinc-900">
          <svg viewBox="0 0 24 24" fill="none" className="size-4.5" aria-hidden>
            <path
              d="M12 2.5 14.6 9l6.9.5-5.3 4.5 1.7 6.7L12 17l-5.9 3.7 1.7-6.7L2.5 9.5 9.4 9 12 2.5Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <span className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white">
          aster<span className="text-zinc-400">studio</span>
        </span>
      </a>

      <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
        {navigationData.map((item) => (
          <a
            key={item.title}
            href={item.href}
            className={cn(
              'rounded-full px-4 py-2 text-sm transition-colors',
              item.isActive
                ? 'bg-zinc-900 font-medium text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white',
            )}
          >
            {item.title}
          </a>
        ))}
      </nav>

      <div className="hidden items-center gap-4 lg:flex">
        <a
          href="#"
          className="text-sm font-medium text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          Log in
        </a>
        <a
          href="#"
          className="rounded-full bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
        >
          Book a call
        </a>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white text-zinc-700 lg:hidden dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-4 top-full z-40 rounded-2xl border border-zinc-200 bg-white p-3 shadow-2xl lg:hidden dark:border-zinc-800 dark:bg-zinc-900">
          <nav className="flex flex-col">
            {navigationData.map((item) => (
              <a
                key={item.title}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-sm transition',
                  item.isActive
                    ? 'bg-zinc-900 font-medium text-white dark:bg-white dark:text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800',
                )}
              >
                {item.title}
              </a>
            ))}
          </nav>
          <a
            href="#"
            className="mt-2 flex items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Book a call
          </a>
        </div>
      )}
    </header>
  )
}
