import React from 'react'
import './ForgeAutomotiveButton.exact.css'

export const meta = {
  title: 'Inzeedo Forge Automotive Button',
  description: 'Luxury automotive button with revolving conic shimmer border beam and char-by-char cascade roll hover kinetics from Forge Automotive UK.',
  category: 'buttons',
  fullWidth: true,
  thumbnail: true,
}

export interface ForgeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode
  variant?: 'default' | 'gold' | 'wine' | 'light'
  asLink?: boolean
  href?: string
}

export function ForgeButton({
  children = 'EXPLORE BUILDS',
  variant = 'default',
  asLink = false,
  href = '#',
  className = '',
  ...props
}: ForgeButtonProps) {
  const text = typeof children === 'string' ? children : 'EXPLORE BUILDS'
  const characters = Array.from(text)

  const content = (
    <>
      {/* Exact 1:1 Forge Conic Shimmer Border Beam (> i) */}
      <i className="forge-btn__beam" aria-hidden="true" />
      <span className="forge-btn__label">
        {characters.map((char, index) => {
          const isSpace = char === ' '
          return (
            <span
              key={index}
              className="forge-btn__char"
              style={{
                transitionDelay: `${index * 0.02}s`,
              }}
            >
              {isSpace ? '\u00A0' : char}
            </span>
          )
        })}
      </span>
    </>
  )

  const variantClass = `forge-btn--${variant}`
  const combinedClass = `forge-btn ${variantClass} ${className}`.trim()

  if (asLink) {
    return (
      <a href={href} className={combinedClass}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" className={combinedClass} {...props}>
      {content}
    </button>
  )
}

export default function ForgeAutomotiveButtonShowcase({
  thumbnail = false,
}: {
  thumbnail?: boolean
}) {
  if (thumbnail) {
    return (
      <div className="forge-btn-scope w-full h-full flex flex-col items-center justify-center p-6 bg-[#0c0c0c] text-white rounded-xl border border-white/10">
        <div className="relative px-6 py-3 border border-white/20 bg-black/40 text-[#f2f1ed] text-[10px] font-semibold tracking-[0.28rem] uppercase overflow-hidden">
          <i className="forge-btn__beam" aria-hidden="true" />
          EXPLORE BUILDS
        </div>
        <span className="mt-3 text-[10px] text-zinc-500 font-mono">Conic Shimmer Beam</span>
      </div>
    )
  }

  return (
    <div className="forge-btn-scope w-full min-h-[460px] flex items-center justify-center bg-[#0c0c0c] p-8">
      <ForgeButton variant="default">
        EXPLORE BUILDS
      </ForgeButton>
    </div>
  )
}
