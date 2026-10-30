import { Mail } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'

export const meta = {
  title: 'Floating Label Input',
  description:
    'An email field whose label glides up on focus and stays visible when filled, with an icon accent.',
}

export default function FloatingLabelInput() {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const floating = focused || value.length > 0

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <div className="relative w-full">
        <input
          id="floating-email"
          type="email"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="h-14 w-full rounded-xl border border-zinc-300 bg-white px-11 pt-5 pb-2 text-sm text-zinc-900 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
        />
        <Mail
          className={cn(
            'pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 transition-colors',
            focused ? 'text-violet-500' : 'text-zinc-400',
          )}
        />
        <label
          htmlFor="floating-email"
          className={cn(
            'pointer-events-none absolute left-11 transition-all duration-200',
            floating
              ? 'top-2.5 text-[10px] font-semibold tracking-wide text-violet-500 uppercase'
              : 'top-1/2 -translate-y-1/2 text-sm text-zinc-400',
          )}
        >
          Email address
        </label>
      </div>
      <p className="text-xs text-zinc-400">
        {value ? `Hello, ${value}` : 'Type an address to see the label stick.'}
      </p>
    </div>
  )
}
