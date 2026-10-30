export const meta = {
  title: 'Quantam Inzeedo Hero',
  description:
    'A futuristic dark AI-studio hero with a purple glow, glassy pill navigation, badge tagline, oversized light headline, dual CTAs and an infinite logo marquee.',
  fullWidth: true,
}

const NAV_ITEMS = ['Home', 'About', 'Portfolio', 'Contact', 'FAQ']

const LOGOS = ['INZEEDO', '\u221E', 'INZEEDO.LK']

/**
 * Endless marquee track. The list is rendered twice, and the `marquee`
 * keyframes (in index.css) slide the track by -50%, so the loop is seamless.
 */
const MARQUEE_ITEMS = [...LOGOS, ...LOGOS]

export default function QuantamInzeedoHero() {
  return (
    <div className="relative min-h-screen w-full max-w-screen space-y-28 overflow-x-hidden bg-black font-sans text-white">
      <nav className="z-10 flex items-center justify-between px-10 py-6">
        <div className="flex items-center">
          <span className="mr-1 text-2xl text-purple-600">&bull;</span>
          <span className="text-xl font-semibold">Inzeedo</span>
          <span className="ml-1 text-2xl text-purple-600">&bull;</span>
        </div>

        <ul className="hidden space-x-8 rounded-full bg-purple-500/10 px-3 py-1 text-sm sm:flex">
          {NAV_ITEMS.map((item) => (
            <li
              key={item}
              className="cursor-pointer rounded-full p-2 px-3 font-thin hover:bg-purple-700"
            >
              {item}
            </li>
          ))}
        </ul>

        <button
          type="button"
          className="rounded-md bg-purple-600 px-5 py-2 text-sm font-medium text-white"
        >
          Get In Touch
        </button>
      </nav>

      <div className="z-10 flex flex-col items-center px-10 text-center">
        <div className="mb-8 flex items-center rounded-full border border-purple-600/50 bg-purple-900/20 py-1 pr-4 pl-2 text-xs font-light tracking-wider text-purple-400">
          <span className="mr-2 rounded-full bg-purple-600 px-3 py-1 text-xs font-light text-white">
            2025
          </span>
          Next-Gen AI Studio
        </div>

        <h1 className="text-7xl leading-tight font-bold font-light">
          AI-Driven Success.
        </h1>
        <h1 className="mb-6 text-7xl leading-tight font-bold font-light">
          Redefining the Future.
        </h1>

        <p className="mb-2 max-w-lg text-sm font-light">
          Creating latest solutions that redefine innovation.
        </p>
        <p className="mb-8 max-w-lg text-sm font-light">
          Stay ahead with AI-powered technology for the future.
        </p>

        <div className="mb-16 flex space-x-4">
          <button
            type="button"
            className="cursor-pointer rounded-md bg-white px-5 py-2 text-sm text-black hover:bg-purple-200"
          >
            Connect With Us
          </button>
          <button
            type="button"
            className="cursor-pointer rounded-md bg-white/50 px-5 py-2 text-sm text-white hover:bg-purple-600"
          >
            What is Inzeedo?
          </button>
        </div>

        <div className="relative z-10 mx-auto mb-20 h-10 w-full max-w-xl overflow-hidden">
          <div className="flex animate-marquee [animation-duration:15s] text-xl whitespace-nowrap text-gray-400">
            {MARQUEE_ITEMS.map((logo, index) => (
              <span key={index} className="mx-6">
                {logo}
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-purple-900/10 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-purple-900/10 to-transparent" />
        </div>
      </div>

      <div className="absolute right-0 bottom-0 left-0 h-[400px] rounded-t-full bg-gradient-to-t from-purple-900/50 via-purple-600/20 to-transparent opacity-80 blur-3xl" />
    </div>
  )
}
