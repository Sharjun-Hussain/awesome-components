import { useState } from 'react'
import { cn } from '../../lib/cn'

export interface NavLinkItem {
  label: string
  href: string
  isActive?: boolean
}

export interface PartnerItem {
  logoUrl: string
  href?: string
}

export interface ResponsiveHeroBannerProps {
  logoUrl?: string
  backgroundImageUrl?: string
  navLinks?: NavLinkItem[]
  ctaButtonText?: string
  ctaButtonHref?: string
  badgeLabel?: string
  badgeText?: string
  title?: string
  titleLine2?: string
  description?: string
  primaryButtonText?: string
  primaryButtonHref?: string
  secondaryButtonText?: string
  secondaryButtonHref?: string
  partnersTitle?: string
  partners?: PartnerItem[]
}

export const meta = {
  title: 'Inzeedo Space Hero',
  description:
    'A cinematic responsive hero banner by Inzeedo featuring cosmic background overlay, glassmorphic navigation, animated typography, and partner agencies.',
  category: 'heroes',
  fullWidth: true,
  thumbnail: true,
}

export default function ResponsiveHeroBanner({
  logoUrl = 'https://cdn.21st.dev/assets/mirror/c4/c4d5f159140e3ccc35a8bd4f043453cb9e2692f700206e43855ff598c171b924.png',
  backgroundImageUrl = 'https://cdn.21st.dev/assets/mirror/a8/a8cf38f65f7315f95eba8c803c4a80a9d78cb2ea36fbfee49828396e4a0b9737.jpg',
  navLinks = [
    { label: 'Home', href: 'https://inzeedo.lk', isActive: true },
    { label: 'Innovations', href: 'https://inzeedo.lk' },
    { label: 'Capabilities', href: 'https://inzeedo.lk' },
    { label: 'Technology', href: 'https://inzeedo.lk' },
    { label: 'Contact', href: 'https://inzeedo.lk' },
  ],
  ctaButtonText = 'Explore Inzeedo',
  ctaButtonHref = 'https://inzeedo.lk',
  badgeLabel = 'Inzeedo 2026',
  badgeText = 'Next-Gen Digital Architecture & Engineering',
  title = 'Journey Beyond Boundaries',
  titleLine2 = 'Crafted by Inzeedo',
  description = 'Experience premier digital design and creative engineering with Inzeedo. We build immersive web apps, high-performance interfaces, and timeless visual experiences.',
  primaryButtonText = 'Discover Inzeedo',
  primaryButtonHref = 'https://inzeedo.lk',
  secondaryButtonText = 'View Work',
  secondaryButtonHref = 'https://inzeedo.lk',
  partnersTitle = 'Inzeedo powers digital products for teams worldwide',
  partners = [
    {
      logoUrl:
        'https://cdn.21st.dev/assets/mirror/96/964eca0b0415aebc2718799b530b39d6f552b39634f3fb2072e769df17c6668f.png',
      href: '#',
    },
    {
      logoUrl:
        'https://cdn.21st.dev/assets/mirror/90/900ad16bdb8bd723836996d2283c47420e719ba8c9a4f7d24ff67e59056e88fe.png',
      href: '#',
    },
    {
      logoUrl:
        'https://cdn.21st.dev/assets/mirror/1b/1b66b155997cb81da3bdabeb8da22771b07f4ac5273d6a19d629c77cf75a861f.png',
      href: '#',
    },
    {
      logoUrl:
        'https://cdn.21st.dev/assets/mirror/cb/cb112906d9fa8a57380201b1385c5534075020542dab48d5f29f2e35a3e19bc1.png',
      href: '#',
    },
    {
      logoUrl:
        'https://cdn.21st.dev/assets/mirror/f6/f68e2933c2f24ef4b28fb81328350831eb56bf42244dee50e2b7f6efd7497783.png',
      href: '#',
    },
  ],
  thumbnail = false,
}: ResponsiveHeroBannerProps & { thumbnail?: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <section
      className={cn(
        'w-full isolate overflow-hidden relative',
        thumbnail ? 'h-[440px] pointer-events-none select-none' : 'min-h-screen',
      )}
    >
      {/* Background Image & Overlay */}
      <img
        src={backgroundImageUrl}
        alt=""
        className="w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/30" />

      {/* Header / Navigation */}
      <header className="z-10 xl:top-4 relative">
        <div className="mx-6">
          <div className="flex items-center justify-between pt-4">
            <a
              href="#"
              className="inline-flex items-center justify-center bg-center w-[100px] h-[40px] bg-cover rounded"
              style={{ backgroundImage: `url(${logoUrl})` }}
              aria-label="Logo"
            />

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-full bg-white/5 px-1 py-1 ring-1 ring-white/10 backdrop-blur">
                {navLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium hover:text-white font-sans transition-colors ${
                      link.isActive ? 'text-white/90' : 'text-white/80'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={ctaButtonHref}
                  className="ml-1 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-sm font-medium text-neutral-900 hover:bg-white/90 font-sans transition-colors"
                >
                  {ctaButtonText}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </a>
              </div>
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-white/90"
              >
                <path d="M4 5h16" />
                <path d="M4 12h16" />
                <path d="M4 19h16" />
              </svg>
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 rounded-2xl bg-black/60 backdrop-blur-md p-4 ring-1 ring-white/10 animate-fade-slide-in">
              <div className="flex flex-col gap-2">
                {navLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.href}
                    className={`px-3 py-2 text-sm font-medium hover:text-white transition-colors rounded-lg hover:bg-white/10 ${
                      link.isActive ? 'text-white' : 'text-white/80'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href={ctaButtonHref}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-white/90 transition-colors"
                >
                  {ctaButtonText}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M7 7h10v10" />
                    <path d="M7 17 17 7" />
                  </svg>
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Content */}
      <div className="z-10 relative">
        <div className="sm:pt-28 md:pt-32 lg:pt-40 max-w-7xl mx-auto pt-28 px-6 pb-16">
          <div className="mx-auto max-w-3xl text-center">
            {/* Pill Badge */}
            <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur animate-fade-slide-in-1">
              <span className="inline-flex items-center text-xs font-medium text-neutral-900 bg-white/90 rounded-full py-0.5 px-2 font-sans">
                {badgeLabel}
              </span>
              <span className="text-sm font-medium text-white/90 font-sans">
                {badgeText}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-4xl text-white tracking-tight font-instrument-serif font-normal animate-fade-slide-in-2"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              {title}
              <br className="hidden sm:block" />
              {titleLine2}
            </h1>

            {/* Description */}
            <p className="sm:text-lg animate-fade-slide-in-3 text-base text-white/80 max-w-2xl mt-6 mx-auto">
              {description}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row sm:gap-4 mt-10 gap-3 items-center justify-center animate-fade-slide-in-4">
              <a
                href={primaryButtonHref}
                className="inline-flex items-center gap-2 hover:bg-white/15 text-sm font-medium text-white bg-white/10 ring-white/15 ring-1 rounded-full py-3 px-5 font-sans transition-colors"
              >
                {primaryButtonText}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </a>

              <a
                href={secondaryButtonHref}
                className="inline-flex items-center gap-2 rounded-full bg-transparent px-5 py-3 text-sm font-medium text-white/90 hover:text-white font-sans transition-colors"
              >
                {secondaryButtonText}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Partners Section */}
          <div className="mx-auto mt-20 max-w-5xl">
            <p className="animate-fade-slide-in-1 text-sm text-white/70 text-center">
              {partnersTitle}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 animate-fade-slide-in-2 text-white/70 mt-6 items-center justify-items-center gap-4">
              {partners.map((partner, idx) => (
                <a
                  key={idx}
                  href={partner.href || '#'}
                  className="inline-flex items-center justify-center bg-center w-[120px] h-[36px] bg-cover rounded-full opacity-80 hover:opacity-100 transition-opacity"
                  style={{ backgroundImage: `url(${partner.logoUrl})` }}
                  aria-label={`Partner ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
