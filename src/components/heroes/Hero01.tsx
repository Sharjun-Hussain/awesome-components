import BrandSlider, { type BrandList } from '@/components/ui/hero-01-utils/brand-slider'
import Header, { type NavigationSection } from '@/components/ui/hero-01-utils/header'
import HeroSection, { type AvatarList } from '@/components/ui/hero-01-utils/hero'

import avatar1 from '@/components/ui/hero-01-utils/assets/avatar-1.jpg'
import avatar2 from '@/components/ui/hero-01-utils/assets/avatar-2.jpg'
import avatar3 from '@/components/ui/hero-01-utils/assets/avatar-3.jpg'
import avatar4 from '@/components/ui/hero-01-utils/assets/avatar-4.jpg'

import brand1 from '@/components/ui/hero-01-utils/assets/brand-1.svg'
import brand1Light from '@/components/ui/hero-01-utils/assets/brand-1-light.svg'
import brand2 from '@/components/ui/hero-01-utils/assets/brand-2.svg'
import brand2Light from '@/components/ui/hero-01-utils/assets/brand-2-light.svg'
import brand3 from '@/components/ui/hero-01-utils/assets/brand-3.svg'
import brand3Light from '@/components/ui/hero-01-utils/assets/brand-3-light.svg'
import brand4 from '@/components/ui/hero-01-utils/assets/brand-4.svg'
import brand4Light from '@/components/ui/hero-01-utils/assets/brand-4-light.svg'
import brand5 from '@/components/ui/hero-01-utils/assets/brand-5.svg'
import brand5Light from '@/components/ui/hero-01-utils/assets/brand-5-light.svg'

export const meta = {
  title: 'Agency Hero 01',
  description:
    'A full-width agency hero with a sticky-style navigation, oversized headline, avatar social proof and an infinite brand marquee.',
  fullWidth: true,
}

export default function AgencyHeroSection() {
  const avatarList: AvatarList[] = [
    { image: avatar1, alt: 'Client portrait' },
    { image: avatar2, alt: 'Client portrait' },
    { image: avatar3, alt: 'Client portrait' },
    { image: avatar4, alt: 'Client portrait' },
  ]

  const navigationData: NavigationSection[] = [
    {
      title: 'Home',
      href: '#',
      isActive: true,
    },
    {
      title: 'About us',
      href: '#',
    },
    {
      title: 'Services',
      href: '#',
    },
    {
      title: 'Team',
      href: '#',
    },
    {
      title: 'Pricing',
      href: '#',
    },
    {
      title: 'Awards',
      href: '#',
    },
  ]

  const brandList: BrandList[] = [
    { image: brand1, lightimg: brand1Light, name: 'Brand 1' },
    { image: brand2, lightimg: brand2Light, name: 'Brand 2' },
    { image: brand3, lightimg: brand3Light, name: 'Brand 3' },
    { image: brand4, lightimg: brand4Light, name: 'Brand 4' },
    { image: brand5, lightimg: brand5Light, name: 'Brand 5' },
  ]

  return (
    <div className="relative overflow-hidden">
      <Header navigationData={navigationData} />
      <main>
        <HeroSection avatarList={avatarList} />
        <BrandSlider brandList={brandList} />
      </main>
    </div>
  )
}
