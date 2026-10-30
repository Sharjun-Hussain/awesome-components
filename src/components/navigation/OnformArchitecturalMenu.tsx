import { useState, useEffect, useRef } from 'react'
import './OnformArchitecturalMenu.exact.css'

export const meta = {
  title: 'Inzeedo ONFORM Architectural Menu',
  description: 'Exact 1:1 ONFORM full-screen architectural navigation with 5-band shutter entry, morphing pill button, and spring arrows.',
  category: 'navigation',
  fullWidth: true,
  thumbnail: true,
}

interface MenuPanelData {
  id: string
  title: string
  href: string
  themeClass: string
  image: string
}

const PANELS: MenuPanelData[] = [
  {
    id: 'work',
    title: 'Work',
    href: '#work',
    themeClass: '',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'studio',
    title: 'Studio',
    href: '#studio',
    themeClass: 'onform-single-panel--studio',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'pricing',
    title: 'Pricing',
    href: '#pricing',
    themeClass: 'onform-single-panel--pricing',
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop',
  },
  {
    id: 'contact',
    title: 'Contact',
    href: '#contact',
    themeClass: 'onform-single-panel--contact',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop',
  },
]

// Shutter image used by ONFORM for the 5-band horizontal entrance animation
const SHUTTER_IMG = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1600&auto=format&fit=crop'

export default function OnformArchitecturalMenu({ thumbnail = false }: { thumbnail?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [selectedPanel, setSelectedPanel] = useState<MenuPanelData>(PANELS[0])
  const closeTimerRef = useRef<number | null>(null)

  const toggleMenu = () => {
    if (isOpen) {
      triggerClose()
    } else {
      setIsClosing(false)
      setIsOpen(true)
    }
  }

  const triggerClose = () => {
    setIsClosing(true)
    setIsOpen(false)
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    closeTimerRef.current = window.setTimeout(() => {
      setIsClosing(false)
    }, 700)
  }

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (isOpen || isClosing)) {
        triggerClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isClosing])

  // Body scroll lock
  useEffect(() => {
    if (isOpen || isClosing) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, isClosing])

  if (thumbnail) {
    return (
      <div className="onform-menu-container w-full h-full flex flex-col items-center justify-center p-5 bg-[#120d09] text-white rounded-xl">
        <div className="flex items-center justify-between w-28 h-9 px-3 rounded-full bg-[#10214870] border border-white/20">
          <span className="text-[10px] font-bold tracking-widest uppercase">MENU</span>
          <div className="flex flex-col gap-1 w-3.5">
            <span className="block h-[1.5px] bg-white w-full rounded" />
            <span className="block h-[1.5px] bg-white w-3/4 rounded" />
          </div>
        </div>
        <p className="mt-3 text-[11px] text-zinc-400 font-mono">ONFORM Architectural Menu</p>
      </div>
    )
  }

  return (
    <div className="onform-menu-container relative w-full">
      {/* 1. Exact Fixed Floating Toggle Button */}
      <button
        type="button"
        className={`onform-menu-toggle ${isOpen ? 'is-open' : ''}`}
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
        aria-expanded={isOpen}
        onClick={toggleMenu}
      >
        <span />
        <span />
      </button>

      {/* 2. Embedded Gallery Canvas Showcase */}
      <div className="onform-hero-showcase">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          <span className="px-3.5 py-1 rounded-full text-[11px] font-mono tracking-widest uppercase bg-white/10 text-zinc-300 border border-white/10 mb-4">
            ONFORM STUDIO ARCHITECTURAL
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Architectural Navigation
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mb-8 max-w-lg leading-relaxed">
            Click the <strong className="text-white">MENU</strong> button in the top right to view the authentic horizontal shutter transitions, kinetic ribbons, and dynamic photo preview.
          </p>
          <button
            type="button"
            onClick={toggleMenu}
            className="px-8 py-3.5 rounded-full bg-white text-zinc-950 font-bold text-sm hover:bg-zinc-200 transition-all shadow-xl active:scale-95"
          >
            {isOpen ? 'Close Menu' : 'Open Menu Experience'}
          </button>
        </div>
      </div>

      {/* 3. Fullscreen Architectural Overlay with Exact Shutters & Panels */}
      <div
        className={`onform-dialog-nav ${isOpen ? 'is-open is-active' : isClosing ? 'is-closing is-active' : ''}`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-label="Navigation"
      >
        {/* Five horizontal shutter bands assembling the scene */}
        <div className="onform-architectural-scene" aria-hidden="true">
          {[0, 1, 2, 3, 4].map((bandIndex) => (
            <span
              key={bandIndex}
              className="onform-menu-shutter"
              style={{ ['--band' as string]: bandIndex }}
            >
              <img
                src={SHUTTER_IMG}
                alt=""
                width="1672"
                height="941"
              />
            </span>
          ))}
        </div>

        {/* Split view: Panels on left, Synchronized Preview Gallery on right */}
        <div className="onform-split-view">
          <nav className="onform-panels-list" aria-label="Main navigation">
            {PANELS.map((panel) => (
              <a
                key={panel.id}
                href={panel.href}
                className={`onform-single-panel ${panel.themeClass}`}
                onMouseEnter={() => setSelectedPanel(panel)}
                onFocus={() => setSelectedPanel(panel)}
                onClick={() => triggerClose()}
              >
                <span className="onform-panel-face">
                  <span className="onform-panel-title-text">{panel.title}</span>
                  <svg
                    className="onform-panel-svg-arrow"
                    viewBox="0 0 64 64"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path
                      className="onform-panel-arrow-shaft"
                      d="M8 56 53.5 10.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="square"
                    />
                    <path
                      className="onform-panel-arrow-head"
                      d="M12 9h43v43"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="square"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            ))}
          </nav>

          {/* Right Photographic Gallery with Smooth Fade/Scale */}
          <div className="onform-gallery-anchor" aria-label={`View ${selectedPanel.title}`}>
            {PANELS.map((panel) => {
              const isCurrent = selectedPanel.id === panel.id
              return (
                <span
                  key={panel.id}
                  className={`onform-preview-picture ${isCurrent ? 'is-visible' : ''} ${panel.id === 'studio' ? 'onform-preview-picture--studio' : ''}`}
                >
                  <img
                    src={panel.image}
                    alt={panel.title}
                    loading="lazy"
                  />
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
