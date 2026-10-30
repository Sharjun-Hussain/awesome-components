import { AnimatePresence, motion, type Variants } from 'framer-motion'
import {
  Battery,
  Bluetooth,
  ChevronRight,
  Music,
  SlidersVertical,
  Wifi,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import earbudLeft from '@/components/ui/spatial-showcase-assets/earbud-left.png'
import earbudRight from '@/components/ui/spatial-showcase-assets/earbud-right.png'

export const meta = {
  title: 'Spatial Product Showcase',
  description:
    'A split product showcase for two spatial-audio earbuds: a floating product medallion with rotating rings, animated feature meters and a springy bottom switcher.',
  fullWidth: true,
}

type ProductId = 'left' | 'right'

type ShowcaseData = {
  id: ProductId
  label: string
  title: string
  description: string
  image: string
  colors: {
    gradient: string
    glow: string
    ring: string
  }
  stats: {
    connectionStatus: string
    batteryLevel: number
  }
  features: {
    label: string
    value: number
    icon: LucideIcon
  }[]
}

const PRODUCTS: Record<ProductId, ShowcaseData> = {
  left: {
    id: 'left',
    label: 'Left',
    title: 'Spatial Anchor',
    description:
      'The primary node for binaural synchronization. Handles low-latency transmission and anchors the spatial audio soundstage.',
    image: earbudLeft,
    colors: {
      gradient: 'from-blue-600 to-indigo-900',
      glow: 'bg-blue-500',
      ring: 'border-l-blue-500/50',
    },
    stats: { connectionStatus: 'Connected', batteryLevel: 82 },
    features: [
      { label: 'Latency', value: 12, icon: Zap },
      { label: 'Sync Rate', value: 98, icon: Wifi },
    ],
  },
  right: {
    id: 'right',
    label: 'Right',
    title: 'Vocal Clarity',
    description:
      'Optimized for high-frequency detail and voice pickup. Contains the beamforming microphone array for crystal clear calls.',
    image: earbudRight,
    colors: {
      gradient: 'from-emerald-600 to-teal-900',
      glow: 'bg-emerald-500',
      ring: 'border-r-emerald-500/50',
    },
    stats: { connectionStatus: 'Connected', batteryLevel: 74 },
    features: [
      { label: 'Bitrate', value: 94, icon: Bluetooth },
      { label: 'Clarifier', value: 88, icon: Music },
    ],
  },
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 100, damping: 20 },
  },
  exit: { opacity: 0, y: -10, filter: 'blur(5px)' },
}

const imageVariants = (isLeft: boolean): Variants => ({
  initial: {
    opacity: 0,
    scale: 1.5,
    filter: 'blur(15px)',
    rotate: isLeft ? -30 : 30,
    x: isLeft ? -80 : 80,
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    rotate: 0,
    x: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.6,
    filter: 'blur(20px)',
    transition: { duration: 0.25 },
  },
})

function BackgroundGradient({ isLeft }: { isLeft: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        animate={{
          background: isLeft
            ? 'radial-gradient(circle at 0% 50%, rgba(59, 130, 246, 0.15), transparent 50%)'
            : 'radial-gradient(circle at 100% 50%, rgba(16, 185, 129, 0.15), transparent 50%)',
        }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0"
      />
    </div>
  )
}

function ProductVisual({ data, isLeft }: { data: ShowcaseData; isLeft: boolean }) {
  return (
    <motion.div layout="position" className="group relative shrink-0">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-[-20%] rounded-full border border-dashed border-white/10 ${data.colors.ring}`}
      />
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${data.colors.gradient} opacity-40 blur-2xl`}
      />

      <div className="relative flex h-80 w-80 items-center justify-center overflow-hidden rounded-full border border-white/5 bg-black/20 shadow-2xl backdrop-blur-sm md:h-[450px] md:w-[450px]">
        <motion.div
          animate={{ y: [-10, 10, -10] }}
          transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
          className="relative z-10 flex h-full w-full items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={data.id}
              src={data.image}
              alt={`Inzeedo ${data.title} earbud`}
              variants={imageVariants(isLeft)}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full w-full object-contain p-4 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              draggable={false}
            />
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.div
        layout="position"
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
      >
        <div className="flex items-center gap-2 rounded-full border border-white/5 bg-zinc-950/80 px-4 py-2 text-xs tracking-widest text-zinc-500 uppercase backdrop-blur">
          <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${data.colors.glow}`} />
          {data.stats.connectionStatus}
        </div>
      </motion.div>
    </motion.div>
  )
}

function ProductDetails({ data, isLeft }: { data: ShowcaseData; isLeft: boolean }) {
  const alignment = isLeft ? 'items-start text-left' : 'items-end text-right'
  const row = isLeft ? 'flex-row' : 'flex-row-reverse'
  const meter = isLeft ? 'left-0 bg-blue-500' : 'right-0 bg-emerald-500'

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex flex-col ${alignment}`}
    >
      <motion.h2
        variants={itemVariants}
        className="mb-2 text-sm font-bold tracking-[0.2em] text-zinc-500 uppercase"
      >
        {data.label} Earbud
      </motion.h2>

      <motion.h1
        variants={itemVariants}
        className="mb-2 bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl"
      >
        {data.title}
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className={`mb-8 max-w-sm leading-relaxed text-zinc-400 ${isLeft ? 'mr-auto' : 'ml-auto'}`}
      >
        {data.description}
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="w-full space-y-6 rounded-2xl border border-white/5 bg-zinc-900/40 p-6 backdrop-blur-sm"
      >
        {data.features.map((feature, index) => (
          <div key={feature.label} className="group">
            <div className={`mb-3 flex items-center justify-between text-sm ${row}`}>
              <div
                className={`flex items-center gap-2 ${
                  feature.value > 50 ? 'text-zinc-200' : 'text-zinc-400'
                }`}
              >
                <feature.icon size={16} />
                <span>{feature.label}</span>
              </div>
              <span className="font-mono text-xs text-zinc-500">{feature.value}%</span>
            </div>

            <div className="relative h-2 w-full overflow-hidden rounded-full bg-zinc-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${feature.value}%` }}
                transition={{ duration: 1, delay: 0.4 + index * 0.15 }}
                className={`absolute top-0 bottom-0 ${meter} opacity-80`}
              />
            </div>
          </div>
        ))}

        <div className={`flex pt-4 ${isLeft ? 'justify-start' : 'justify-end'}`}>
          <button
            type="button"
            className="group flex items-center gap-2 text-xs font-semibold tracking-wider text-zinc-300 uppercase transition-colors hover:text-white"
          >
            <SlidersVertical size={14} />
            View Specs
            <ChevronRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className={`mt-6 flex items-center gap-3 text-zinc-500 ${row}`}
      >
        <Battery size={16} />
        <span className="text-sm font-medium">{data.stats.batteryLevel}% Charge</span>
      </motion.div>
    </motion.div>
  )
}

function Switcher({
  activeId,
  onToggle,
}: {
  activeId: ProductId
  onToggle: (id: ProductId) => void
}) {
  const options = Object.values(PRODUCTS).map((product) => ({
    id: product.id,
    label: product.label,
  }))

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-12 z-50 flex justify-center">
      <motion.div
        layout
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-zinc-900/80 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/5 backdrop-blur-2xl"
      >
        {options.map((option) => (
          <motion.button
            key={option.id}
            onClick={() => onToggle(option.id)}
            whileTap={{ scale: 0.96 }}
            className="relative flex h-12 w-24 items-center justify-center rounded-full text-sm font-medium focus:outline-none"
          >
            {activeId === option.id && (
              <motion.div
                layoutId="island-surface"
                className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-white/5 shadow-inner"
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              />
            )}
            <span
              className={`relative z-10 transition-colors duration-300 ${
                activeId === option.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {option.label}
            </span>
            {activeId === option.id && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -bottom-1 h-1 w-6 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
              />
            )}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}

export default function SpatialProductShowcase() {
  const [activeId, setActiveId] = useState<ProductId>('left')
  const active = PRODUCTS[activeId]
  const isLeft = activeId === 'left'

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-zinc-100 selection:bg-zinc-800">
      <BackgroundGradient isLeft={isLeft} />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-8">
        <div className="flex items-center gap-2">
          <span
            className={`size-1.5 rounded-full ${isLeft ? 'bg-blue-400' : 'bg-emerald-400'}`}
          />
          <span className="text-[10px] font-semibold tracking-[0.45em] text-white/60 uppercase">
            Inzeedo
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-[0.3em] text-white/30 uppercase">
          inzeedo.lk
        </span>
      </div>

      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col justify-center px-6 py-8">
        <motion.div
          layout
          transition={{ type: 'spring', bounce: 0, duration: 0.9 }}
          className={`flex w-full flex-col items-center justify-center gap-12 md:flex-row md:gap-32 lg:gap-48 ${
            isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
          }`}
        >
          <ProductVisual data={active} isLeft={isLeft} />

          <motion.div layout="position" className="w-full max-w-md">
            <AnimatePresence mode="wait">
              <ProductDetails key={activeId} data={active} isLeft={isLeft} />
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </main>

      <Switcher activeId={activeId} onToggle={setActiveId} />
    </div>
  )
}
