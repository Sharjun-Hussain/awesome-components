import { ArrowRight, Star } from 'lucide-react'

export type AvatarList = {
  image: string
  alt?: string
}

export default function HeroSection({ avatarList }: { avatarList: AvatarList[] }) {
  return (
    <section className="relative isolate overflow-hidden px-5 pt-8 pb-14 sm:px-8 sm:pt-14 sm:pb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 size-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-200/80 via-fuchsia-100/60 to-transparent blur-3xl dark:from-violet-600/20 dark:via-fuchsia-600/10" />
        <div className="absolute right-0 bottom-0 size-72 rounded-full bg-amber-100/70 blur-3xl dark:bg-amber-500/10" />
        <div className="dot-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-zinc-600 uppercase shadow-sm backdrop-blur dark:border-zinc-700/70 dark:bg-zinc-900/70 dark:text-zinc-300">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          Booking projects for Q4
        </span>

        <h1 className="mt-6 text-4xl leading-[1.02] font-semibold tracking-[-0.035em] text-balance text-zinc-950 sm:text-6xl lg:text-7xl dark:text-white">
          We craft brands that{' '}
          <span className="relative inline-block font-serif font-normal italic">
            move
            <svg
              aria-hidden
              viewBox="0 0 200 14"
              preserveAspectRatio="none"
              className="absolute -bottom-1 left-0 h-2.5 w-full text-violet-400/70 dark:text-violet-500/60"
            >
              <path
                d="M2 10C40 4 92 2 198 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </span>{' '}
          people.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-7 text-pretty text-zinc-600 sm:text-lg dark:text-zinc-400">
          Strategy, identity and digital experiences for ambitious teams. We turn
          bold ideas into brands people remember — and love.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="#"
            className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-zinc-900 px-6 text-sm font-semibold text-white shadow-xl shadow-zinc-900/15 transition-all duration-300 hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-2xl hover:shadow-violet-500/30 active:translate-y-0 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:hover:shadow-violet-500/20"
          >
            <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full dark:via-zinc-900/10" />
            <span className="relative">Start a project</span>
            <ArrowRight className="relative size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
          <a
            href="#"
            className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full border border-zinc-300 bg-white/70 px-6 text-sm font-semibold text-zinc-800 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-zinc-900 hover:shadow-lg hover:shadow-zinc-900/10 active:translate-y-0 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900/60 dark:text-zinc-100 dark:hover:border-zinc-500 dark:hover:shadow-black/30"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-zinc-900 transition-transform duration-300 ease-out group-hover:scale-x-100 dark:bg-white" />
            <span className="relative transition-colors duration-300 group-hover:text-white dark:group-hover:text-zinc-900">
              See our work
            </span>
            <span className="relative text-zinc-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-white dark:group-hover:text-zinc-900">
              ↗
            </span>
          </a>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <div className="flex -space-x-3">
            {avatarList.map((avatar, index) => (
              <img
                key={`${avatar.image}-${index}`}
                src={avatar.image}
                alt={avatar.alt ?? `Happy client ${index + 1}`}
                loading="lazy"
                className="size-10 rounded-full border-2 border-white object-cover shadow-sm transition-transform duration-300 hover:-translate-y-1 dark:border-zinc-950"
              />
            ))}
            <span className="grid size-10 place-items-center rounded-full border-2 border-white bg-zinc-900 text-[10px] font-semibold text-white shadow-sm dark:border-zinc-950 dark:bg-white dark:text-zinc-900">
              +2k
            </span>
          </div>

          <div className="flex flex-col items-center sm:items-start">
            <div className="flex items-center gap-0.5 text-amber-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3.5 fill-current" />
              ))}
            </div>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Loved by <span className="font-semibold text-zinc-800 dark:text-zinc-200">2,000+</span>{' '}
              founders and teams
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
