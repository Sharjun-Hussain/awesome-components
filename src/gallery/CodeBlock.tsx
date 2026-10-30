import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/cn'

export function CodeBlock({
  code,
  fileName,
  className,
}: {
  code: string
  fileName?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)
  const lines = code.replace(/\n$/, '').split('\n')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-zinc-800 bg-[#0c0c11] shadow-2xl shadow-black/10',
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
        <span className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-red-400/80" />
          <span className="size-2.5 rounded-full bg-amber-400/80" />
          <span className="size-2.5 rounded-full bg-emerald-400/80" />
        </span>
        <span className="ml-1.5 truncate font-mono text-[11px] text-zinc-500">
          {fileName ?? 'component.tsx'}
        </span>
        <button
          type="button"
          onClick={copy}
          className="ml-auto inline-flex items-center gap-1.5 rounded-md border border-zinc-700/80 bg-zinc-800/60 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-700/60 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" /> Copied
            </>
          ) : (
            <>
              <Copy className="size-3" /> Copy
            </>
          )}
        </button>
      </div>

      <div className="max-h-[640px] overflow-auto">
        <div className="flex w-max min-w-full font-mono text-[12.5px] leading-6">
          <div
            aria-hidden
            className="sticky left-0 shrink-0 select-none border-r border-zinc-800/80 bg-[#0c0c11] px-3 py-4 text-right text-zinc-600"
          >
            {lines.map((_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
          <pre className="px-4 py-4 text-zinc-300">
            <code>{code.replace(/\n$/, '')}</code>
          </pre>
        </div>
      </div>
    </div>
  )
}
