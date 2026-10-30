export const meta = {
  title: 'Gradient Text',
  description:
    'Animated gradient text with a slow shifting hue — perfect for hero headlines and headings.',
}

export default function GradientText() {
  return (
    <div className="flex w-full flex-col items-center gap-3 text-center">
      <h2 className="animate-gradient bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-[length:200%_auto] bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl dark:from-violet-400 dark:via-fuchsia-400 dark:to-amber-300">
        Make it pop
      </h2>
      <p className="text-xs tracking-[0.2em] text-zinc-400 uppercase">
        Animated gradient headline
      </p>
    </div>
  )
}
