import { cn } from '@/lib/utils'
import { motion, type Variants } from 'framer-motion'
import type { FC, ReactNode } from 'react'

import image1 from './assets/hero-3/image-1.jpg'
import image2 from './assets/hero-3/image-2.jpg'
import image3 from './assets/hero-3/image-3.jpg'
import image4 from './assets/hero-3/image-4.jpg'
import image5 from './assets/hero-3/image-5.jpg'
import image6 from './assets/hero-3/image-6.jpg'
import image7 from './assets/hero-3/image-7.jpg'
import image8 from './assets/hero-3/image-8.jpg'

export const meta = {
  title: 'Animated Marquee Hero',
  description:
    'A full-screen video-agency hero with staggered spring text, a red motion button and a tilted image marquee along the bottom.',
  fullWidth: true,
}

interface AnimatedMarqueeHeroProps {
  tagline: string
  title: ReactNode
  description: string
  ctaText: string
  images: string[]
  className?: string
}

// Reusable Button component styled like in the image
const ActionButton = ({ children }: { children: ReactNode }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className="mt-8 rounded-full bg-red-500 px-8 py-3 font-semibold text-white shadow-lg transition-colors hover:bg-red-600 focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 focus:outline-none"
  >
    {children}
  </motion.button>
)

// The main hero component
export const AnimatedMarqueeHero: FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  images,
  className,
}) => {
  // Animation variants for the text content
  const FADE_IN_ANIMATION_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
  }

  // Duplicate images for a seamless loop
  const duplicatedImages = [...images, ...images]

  return (
    <section
      className={cn(
        'relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background px-4 text-center',
        className,
      )}
    >
      <div className="z-10 flex flex-col items-center">
        {/* Tagline */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-4 inline-block rounded-full border border-border bg-card/50 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm"
        >
          {tagline}
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="text-5xl font-bold tracking-tighter text-foreground md:text-7xl"
        >
          {typeof title === 'string' ? (
            title.split(' ').map((word, i) => (
              <motion.span
                key={i}
                variants={FADE_IN_ANIMATION_VARIANTS}
                className="inline-block"
              >
                {word}&nbsp;
              </motion.span>
            ))
          ) : (
            title
          )}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.5 }}
          className="mt-6 max-w-xl text-lg text-muted-foreground"
        >
          {description}
        </motion.p>

        {/* Call to Action Button */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.6 }}
        >
          <ActionButton>{ctaText}</ActionButton>
        </motion.div>
      </div>

      {/* Animated Image Marquee */}
      <div className="absolute bottom-0 left-0 h-1/3 w-full [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)] md:h-2/5">
        <motion.div
          className="flex gap-4"
          animate={{
            x: ['-100%', '0%'],
            transition: {
              ease: 'linear',
              duration: 40,
              repeat: Infinity,
            },
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-48 flex-shrink-0 md:h-64"
              style={{
                rotate: `${index % 2 === 0 ? -2 : 5}deg`,
              }}
            >
              <img
                src={src}
                alt={`Showcase image ${index + 1}`}
                className="h-full w-full rounded-2xl object-cover shadow-md"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// A list of sample images for the demo
const DEMO_IMAGES = [
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8,
]

const AnimatedHeroDemo = () => {
  return (
    <AnimatedMarqueeHero
      tagline="Join over 100,000 happy creators"
      title={
        <>
          Engage Audiences
          <br />
          with Stunning Videos
        </>
      }
      description="Boost Your Brand with High-Impact Short Videos from our expert content creators. Our team is ready to propel your business forward."
      ctaText="Get Started"
      images={DEMO_IMAGES}
    />
  )
}

export default AnimatedHeroDemo
