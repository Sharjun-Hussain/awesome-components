export type BrandList = {
  image: string
  lightimg: string
  name: string
}

export default function BrandSlider({ brandList }: { brandList: BrandList[] }) {
  return (
    <section
      aria-label="Trusted by brands"
      className="border-y border-zinc-200/80 bg-white/60 py-10 backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/30"
    >
      <p className="text-center text-[11px] font-semibold tracking-[0.2em] text-zinc-400 uppercase">
        Trusted by forward-thinking teams
      </p>

      <div className="relative mt-7 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <div className="flex w-max animate-marquee motion-reduce:animate-none hover:[animation-play-state:paused]">
          {[0, 1].map((group) => (
            <div
              key={group}
              aria-hidden={group === 1}
              className="flex shrink-0 items-center gap-12 pr-12 sm:gap-16 sm:pr-16"
            >
              {brandList.map((brand) => (
                <div
                  key={`${group}-${brand.name}`}
                  className="flex h-9 w-28 shrink-0 items-center justify-center sm:w-32"
                  title={brand.name}
                >
                  <img
                    src={brand.image}
                    alt={brand.name}
                    loading="lazy"
                    className="max-h-7 w-auto max-w-full object-contain opacity-55 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 dark:hidden"
                  />
                  <img
                    src={brand.lightimg}
                    alt={brand.name}
                    loading="lazy"
                    className="hidden max-h-7 w-auto max-w-full object-contain opacity-55 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 dark:block"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
