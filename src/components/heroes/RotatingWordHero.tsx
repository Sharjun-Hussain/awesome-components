import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { ArrowRight, PhoneCall } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'

export const meta = {
  title: 'Rotating Word Hero',
  description:
    'A minimal centered hero where the headline cycles through words with a springy vertical slide, paired with a pill badge and two shadcn-style buttons.',
  fullWidth: true,
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'secondary' | 'outline'
  size?: 'sm' | 'default' | 'lg'
  children: ReactNode
}

// shadcn/ui Button, inlined so this demo is fully self-contained.
function Button({
  className,
  variant = 'default',
  size = 'default',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' &&
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        variant === 'outline' &&
          'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        size === 'sm' && 'h-9 rounded-md px-3',
        size === 'default' && 'h-10 px-4 py-2',
        size === 'lg' && 'h-11 rounded-md px-8',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

const ROTATING_WORDS = ['amazing', 'new', 'wonderful', 'beautiful', 'smart']

export default function RotatingWordHero() {
  const [activeWord, setActiveWord] = useState(0)
  const words = useMemo(() => ROTATING_WORDS, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      setActiveWord((current) => (current === words.length - 1 ? 0 : current + 1))
    }, 2000)

    return () => clearTimeout(timeout)
  }, [activeWord, words])

  return (
    <section className="w-full bg-background text-foreground">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-8 py-20 lg:py-40">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              Read our launch article{' '}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="max-w-2xl text-center text-5xl tracking-tighter md:text-7xl">
              <span className="text-spektr-cyan-50">This is something</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pt-1 md:pb-4">
                {'\u00A0'}
                {words.map((word, index) => (
                  <motion.span
                    key={word}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: -100 }}
                    transition={{ type: 'spring', stiffness: 50 }}
                    animate={
                      activeWord === index
                        ? { y: 0, opacity: 1 }
                        : { y: activeWord > index ? -150 : 150, opacity: 0 }
                    }
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="max-w-2xl text-center text-lg leading-relaxed tracking-tight text-muted-foreground md:text-xl">
              Managing a small business today is already tough. Avoid further
              complications by ditching outdated, tedious trade methods. Our goal
              is to streamline SMB trade, making it easier and faster than ever.
            </p>
          </div>

          <div className="flex flex-row gap-3">
            <Button size="lg" variant="outline" className="gap-4">
              Jump on a call{' '}
              <PhoneCall className="h-4 w-4" />
            </Button>
            <Button size="lg" className="gap-4">
              Sign up here{' '}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
