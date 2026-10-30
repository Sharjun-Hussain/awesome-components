import { ArrowUpRight } from 'lucide-react'
import { cn } from '../../lib/cn'

export interface AeroHeroProps {
  heroImage?: string
  title?: string
  description?: string
  teamsCount?: string
  teamsLabel?: string
  ctaText?: string
  ctaHref?: string
  avatars?: string[]
  partnerLogos?: string[]
}

export const meta = {
  title: 'Inzeedo Aero Hero',
  description:
    'Split-screen hero section for Inzeedo featuring clean sustainability photography, Kantumruy display typography, avatar stack, interactive pill CTA, and logo marquee.',
  category: 'heroes',
  fullWidth: true,
  thumbnail: true,
}

export default function AeroHero1({
  heroImage = 'https://cdn.21st.dev/assets/mirror/0d/0dcef67a9a4911ba1b860dd16a39755058dcabf707463ec54ba654a649d10b16.jpg',
  title = 'Empowering Visionaries at Inzeedo',
  description = 'Inzeedo crafts cutting-edge digital experiences, brand ecosystems, and bespoke modern web applications tailored for the next generation of industry leaders.',
  teamsCount = '15,000+',
  teamsLabel = 'Teams Connected with Inzeedo',
  ctaText = 'Start a Project with Inzeedo',
  ctaHref = 'https://inzeedo.lk',
  avatars = [
    'https://images.cnippet.dev/image/upload/v1770400411/a1.jpg',
    'https://images.cnippet.dev/image/upload/v1770400411/a2.jpg',
    'https://images.cnippet.dev/image/upload/v1770400411/a3.jpg',
    'https://images.cnippet.dev/image/upload/v1770400411/a4.jpg',
  ],
  partnerLogos = [
    'https://images.cnippet.dev/image/upload/v1770400411/logoipsum-1.png',
    'https://images.cnippet.dev/image/upload/v1770400411/logoipsum-2.png',
    'https://images.cnippet.dev/image/upload/v1770400411/logoipsum-3.png',
    'https://images.cnippet.dev/image/upload/v1770400411/logoipsum-4.png',
    'https://images.cnippet.dev/image/upload/v1770400411/logoipsum-5.png',
  ],
  thumbnail = false,
}: AeroHeroProps & { thumbnail?: boolean }) {
  return (
    <section
      className={cn(
        'relative w-full overflow-hidden pt-0 text-black bg-white',
        thumbnail && 'h-[520px] pointer-events-none select-none',
      )}
    >
      <div className="relative z-10 mx-auto h-full w-full max-w-full">
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-12',
            thumbnail ? 'h-full' : 'md:min-h-screen',
          )}
        >
          {/* Left Column - Hero Photography */}
          <div
            className={cn(
              'w-full md:col-span-6',
              thumbnail ? 'h-full' : 'h-64 md:h-full',
            )}
          >
            <img
              alt=""
              className="h-full w-full overflow-hidden object-cover object-center"
              src={heroImage}
            />
          </div>

          {/* Right Column - Content */}
          <div
            className={cn(
              'flex w-full items-center justify-between px-6 text-left md:col-span-6',
              thumbnail
                ? 'p-6'
                : 'pt-8 pb-10 md:pt-20 md:pr-6 md:pb-0 md:pl-10',
            )}
          >
            <div className="w-full max-w-3xl space-y-6">
              {/* Display Headline */}
              <h1
                className={cn(
                  'font-kanturmuy font-normal tracking-tighter leading-[1.08]',
                  thumbnail
                    ? 'text-2xl'
                    : 'text-4xl md:text-6xl lg:text-7xl',
                )}
                style={{ fontFamily: "'Kantumruy Pro', sans-serif" }}
              >
                {title}
              </h1>

              {/* Description */}
              <p
                className={cn(
                  'font-light text-zinc-700',
                  thumbnail
                    ? 'text-xs line-clamp-2'
                    : 'max-w-2xl text-base md:text-lg lg:text-xl',
                )}
              >
                {description}
              </p>

              <div className={cn('mt-auto', thumbnail ? 'space-y-3' : 'space-y-7')}>
                {/* Social Proof Avatars & Counter */}
                <div
                  className={cn(
                    'flex flex-wrap items-center gap-3',
                    thumbnail ? 'mt-2' : 'mt-8 lg:mt-auto',
                  )}
                >
                  <div className="flex -space-x-3">
                    {avatars.map((url, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full border-2 border-white transition-all duration-300 hover:grayscale-0 bg-zinc-200',
                          thumbnail ? 'size-8' : 'size-12',
                        )}
                      >
                        <img
                          src={url}
                          alt={`User ${idx + 1}`}
                          className="size-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        <span className="text-[10px] font-semibold text-zinc-600">
                          U{idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col font-normal text-sm">
                    <span
                      className={cn(
                        'font-semibold text-zinc-900',
                        thumbnail ? 'text-xs' : 'text-base sm:text-lg',
                      )}
                    >
                      {teamsCount}
                    </span>
                    <span
                      className={cn(
                        'text-zinc-600',
                        thumbnail ? 'text-[10px]' : 'text-xs sm:text-sm',
                      )}
                    >
                      {teamsLabel}
                    </span>
                  </div>
                </div>

                {/* Interactive Animated Action Button */}
                <div className="flex w-fit gap-6">
                  <a
                    href={ctaHref}
                    className="group not-disabled:inset-shadow-none mx-auto flex cursor-pointer items-center justify-center gap-0 rounded-full border-none bg-transparent px-0 py-3 font-normal shadow-none hover:bg-transparent"
                  >
                    <span
                      className={cn(
                        'rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad] group-hover:transition-colors font-medium',
                        thumbnail ? 'px-4 py-2 text-xs' : 'px-6 py-3 text-sm sm:text-base',
                      )}
                    >
                      {ctaText}
                    </span>

                    <div
                      className={cn(
                        'relative flex h-fit cursor-pointer items-center overflow-hidden rounded-full bg-[#e1fcad] text-black duration-500 ease-in-out group-hover:bg-[#122023] group-hover:text-[#e1fcad] group-hover:transition-colors',
                        thumbnail ? 'p-3' : 'p-5',
                      )}
                    >
                      <ArrowUpRight
                        className={cn(
                          'absolute -translate-x-1/2 transition-all duration-500 ease-in-out group-hover:translate-x-10',
                          thumbnail ? 'h-3.5 w-3.5' : 'h-5 w-5',
                        )}
                      />
                      <ArrowUpRight
                        className={cn(
                          'absolute -translate-x-10 transition-all duration-500 ease-in-out group-hover:-translate-x-1/2',
                          thumbnail ? 'h-3.5 w-3.5' : 'h-5 w-5',
                        )}
                      />
                    </div>
                  </a>
                </div>
              </div>

              {/* Infinite Logo Marquee with Gradient Masks */}
              {!thumbnail && (
                <div className="relative -mx-4 mt-8 sm:-mx-6 lg:-mx-8 overflow-hidden">
                  <div className="pointer-events-none absolute left-0 z-40 h-full w-20 bg-gradient-to-r from-white to-transparent" />
                  <div className="pointer-events-none absolute right-0 z-40 h-full w-20 bg-gradient-to-l from-white to-transparent" />

                  <div className="group flex gap-4 overflow-hidden p-2 [--gap:1rem]">
                    {[0, 1].map((copyIdx) => (
                      <div
                        key={copyIdx}
                        className={cn(
                          'flex shrink-0 justify-around gap-4 animate-marquee group-hover:[animation-play-state:paused]',
                        )}
                        style={{ animationDuration: '25s' }}
                      >
                        {partnerLogos.map((logo, idx) => (
                          <div
                            key={`logo-${idx}`}
                            className="flex items-center justify-center px-3 md:px-5"
                          >
                            <img
                              alt="Partner logo"
                              className="h-5 w-auto md:h-8 object-contain opacity-70 hover:opacity-100 transition-opacity"
                              src={logo}
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
