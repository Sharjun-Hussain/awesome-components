import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from 'react'
import './ForgeAutomotiveMenu.exact.css'

export const meta = {
  title: 'Inzeedo Forge Automotive Menu',
  description:
    'Exact fullscreen navigation from forgeautomotive.co.uk: centred wordmark, Navigate/Close trigger, burgundy overlay with oversized editorial links, staggered letter hover and layered credits.',
  category: 'navigation',
  fullWidth: true,
  thumbnail: true,
}

export type ForgeMenuLink = {
  label: string
  href: string
}

export type ForgeMenuSocial = {
  label: 'linkedin' | 'instagram' | 'facebook'
  href: string
}

export type ForgeAutomotiveMenuProps = {
  links?: ForgeMenuLink[]
  legalLinks?: ForgeMenuLink[]
  socials?: ForgeMenuSocial[]
  phone?: string
  logoHref?: string
  copyright?: string
  siteBy?: { label: string; href: string }
  poweredByHref?: string
  onNavigate?: (href: string) => void
  className?: string
}

const DEFAULT_LINKS: ForgeMenuLink[] = [
  { label: 'Builds', href: '#builds' },
  { label: 'Stock', href: '#stock' },
  { label: 'Contact', href: '#contact' },
]

const DEFAULT_LEGALS: ForgeMenuLink[] = [
  { label: 'Legal', href: '#legal' },
  { label: 'Cookie Settings', href: '#cookie-settings' },
]

const DEFAULT_SOCIALS: ForgeMenuSocial[] = [
  { label: 'linkedin', href: 'https://www.linkedin.com/company/forge-automotive-ltd/' },
  { label: 'instagram', href: 'https://www.instagram.com/forgeautomotive/' },
  { label: 'facebook', href: 'https://www.facebook.com/profile.php?id=61588925168989' },
]

type LetterStyle = CSSProperties & { '--i'?: number }

function Letters({ text }: { text: string }) {
  return (
    <>
      {Array.from(text).map((character, index) => (
        <span className="forge-menu__letter" style={{ '--i': index } as LetterStyle} key={index}>
          {character === ' ' ? '\u00A0' : character}
        </span>
      ))}
    </>
  )
}

function SocialIcon({ name }: { name: ForgeMenuSocial['label'] }) {
  if (name === 'instagram') {
    return (
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M8 1.85C10 1.85 10.24 1.8575 11.0305 1.8935C11.5062 1.89911 11.9774 1.98656 12.4235 2.152C12.7492 2.27222 13.0437 2.46392 13.2855 2.713C13.5346 2.95479 13.7263 3.24934 13.8465 3.575C14.0119 4.02106 14.0994 4.49227 14.105 4.968C14.141 5.76 14.15 6 14.15 8C14.15 10 14.1425 10.24 14.1065 11.0305C14.1009 11.5062 14.0134 11.9774 13.848 12.4235C13.7232 12.7468 13.5321 13.0404 13.287 13.2855C13.0419 13.5306 12.7483 13.7217 12.425 13.8465C11.9789 14.0119 11.5077 14.0994 11.032 14.105C10.2415 14.141 10.004 14.1485 8.0015 14.1485C5.999 14.1485 5.7615 14.141 4.971 14.105C4.49528 14.0994 4.02407 14.0119 3.578 13.8465C3.25234 13.7263 2.95779 13.5346 2.716 13.2855C2.46692 13.0437 2.27522 12.7492 2.155 12.4235C1.98956 11.9774 1.90211 11.5062 1.8965 11.0305C1.859 10.24 1.85 10.0025 1.85 8C1.85 5.9975 1.8575 5.76 1.8935 4.9695C1.89911 4.49378 1.98656 4.02256 2.152 3.5765C2.27265 3.2507 2.46487 2.95613 2.7145 2.7145C2.95629 2.46542 3.25084 2.27372 3.5765 2.1535C4.02256 1.98806 4.49378 1.90061 4.9695 1.895C5.76 1.859 6 1.85 8 1.85ZM8 0.5C5.963 0.5 5.7075 0.5085 4.908 0.545C4.28561 0.558186 3.66993 0.676521 3.087 0.895C2.58688 1.08322 2.13373 1.37805 1.759 1.759C1.37751 2.13358 1.08216 2.58675 0.8935 3.087C0.675021 3.66993 0.556686 4.28561 0.5435 4.908C0.5085 5.7075 0.5 5.963 0.5 8C0.5 10.037 0.5085 10.2925 0.545 11.092C0.558186 11.7144 0.676521 12.3301 0.895 12.913C1.08366 13.4133 1.37901 13.8664 1.7605 14.241C2.13508 14.6225 2.58825 14.9178 3.0885 15.1065C3.67143 15.325 4.28711 15.4433 4.9095 15.4565C5.7095 15.493 5.9645 15.5015 8.0015 15.5015C10.0385 15.5015 10.294 15.493 11.0935 15.4565C11.7159 15.4433 12.3316 15.325 12.9145 15.1065C13.4125 14.9135 13.8648 14.6187 14.2425 14.241C14.6202 13.8633 14.915 13.411 15.108 12.913C15.3265 12.3301 15.4448 11.7144 15.458 11.092C15.4945 10.292 15.503 10.037 15.503 8C15.503 5.963 15.4945 5.7075 15.458 4.908C15.4448 4.28561 15.3265 3.66993 15.108 3.087C14.9193 2.58675 14.624 2.13358 14.2425 1.759C13.8679 1.37751 13.4148 1.08216 12.9145 0.8935C12.3316 0.675021 11.7159 0.556686 11.0935 0.5435C10.2925 0.5085 10.037 0.5 8 0.5Z" />
        <path d="M8.00039 4.1499C7.23893 4.1499 6.49458 4.3757 5.86145 4.79874C5.22832 5.22179 4.73485 5.82308 4.44346 6.52657C4.15206 7.23007 4.07582 8.00417 4.22437 8.751C4.37292 9.49783 4.7396 10.1838 5.27803 10.7223C5.81646 11.2607 6.50247 11.6274 7.24929 11.7759C7.99612 11.9245 8.77023 11.8482 9.47372 11.5568C10.1772 11.2654 10.7785 10.772 11.2016 10.1388C11.6246 9.50572 11.8504 8.76136 11.8504 7.9999C11.8504 6.97882 11.4448 5.99956 10.7228 5.27754C10.0007 4.55553 9.02148 4.1499 8.00039 4.1499ZM8.00039 10.4999C7.50594 10.4999 7.02259 10.3533 6.61147 10.0786C6.20034 9.80387 5.87991 9.41343 5.69069 8.95661C5.50147 8.4998 5.45197 7.99713 5.54843 7.51218C5.64489 7.02722 5.88299 6.58177 6.23263 6.23214C6.58226 5.8825 7.02771 5.6444 7.51267 5.54794C7.99762 5.45148 8.50029 5.50098 8.9571 5.6902C9.41392 5.87942 9.80436 6.19985 10.0791 6.61098C10.3538 7.0221 10.5004 7.50545 10.5004 7.9999C10.5004 8.66294 10.237 9.29883 9.76816 9.76767C9.29932 10.2365 8.66343 10.4999 8.00039 10.4999Z" />
        <path d="M12.0035 4.8965C12.5006 4.8965 12.9035 4.49355 12.9035 3.9965C12.9035 3.49944 12.5006 3.0965 12.0035 3.0965C11.5065 3.0965 11.1035 3.49944 11.1035 3.9965C11.1035 4.49355 11.5065 4.8965 12.0035 4.8965Z" />
      </svg>
    )
  }

  if (name === 'facebook') {
    return (
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M16 7.9999C15.9998 6.47112 15.5615 4.97441 14.737 3.68697C13.9126 2.39953 12.7365 1.37528 11.3481 0.735467C9.95962 0.0956545 8.4169 -0.132923 6.90257 0.0767945C5.38823 0.286512 3.9657 0.925743 2.80337 1.91881C1.64104 2.91188 0.787596 4.2172 0.344069 5.68023C-0.099457 7.14327 -0.114491 8.70275 0.300748 10.1741C0.715987 11.6454 1.54411 12.9669 2.68708 13.9822C3.83004 14.9975 5.23999 15.664 6.75 15.9029V10.3124H4.719V7.9999H6.75V6.2374C6.75 4.2324 7.9445 3.1249 9.7715 3.1249C10.3715 3.13323 10.9701 3.18536 11.5625 3.2809V5.2499H10.5535C10.3816 5.22707 10.2067 5.24322 10.0418 5.29715C9.87698 5.35109 9.72638 5.44143 9.60119 5.56148C9.476 5.68154 9.37943 5.82822 9.31864 5.99067C9.25784 6.15311 9.23439 6.32716 9.25 6.4999V7.9999H11.469L11.114 10.3124H9.25V15.9029C11.1319 15.6052 12.8458 14.6456 14.0832 13.1968C15.3206 11.7481 16.0003 9.9052 16 7.9999Z" />
      </svg>
    )
  }

  return (
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" aria-hidden="true">
      <path d="M14.5 0.5H1.5C1.23478 0.5 0.98043 0.605357 0.792893 0.792893C0.605357 0.98043 0.5 1.23478 0.5 1.5V14.5C0.5 14.7652 0.605357 15.0196 0.792893 15.2071C0.98043 15.3946 1.23478 15.5 1.5 15.5H14.5C14.7652 15.5 15.0196 15.3946 15.2071 15.2071C15.3946 15.0196 15.5 14.7652 15.5 14.5V1.5C15.5 1.23478 15.3946 0.98043 15.2071 0.792893C15.0196 0.605357 14.7652 0.5 14.5 0.5ZM4.9435 13.297H2.687V6.125H4.9435V13.297ZM3.815 5.1405C3.55558 5.13971 3.30222 5.06206 3.08691 4.91736C2.87159 4.77266 2.70399 4.5674 2.60526 4.32751C2.50654 4.08761 2.48111 3.82384 2.53221 3.5695C2.5833 3.31516 2.70862 3.08167 2.89234 2.89852C3.07605 2.71536 3.30992 2.59075 3.56441 2.54043C3.8189 2.49011 4.0826 2.51634 4.32219 2.6158C4.56179 2.71525 4.76654 2.88348 4.91058 3.09923C5.05462 3.31498 5.1315 3.56858 5.1315 3.828C5.13157 4.00072 5.09753 4.17175 5.03134 4.33128C4.96516 4.49081 4.86813 4.6357 4.74581 4.75764C4.6235 4.87958 4.47831 4.97618 4.31858 5.04188C4.15885 5.10758 3.98771 5.14109 3.815 5.1405ZM13.3105 13.297H11.1V9.828C11.1 8.9845 11.1 7.953 9.925 7.953C8.75 7.953 8.6085 8.844 8.6085 9.781V13.344H6.4V6.125H8.468V7.1095H8.515C8.72828 6.74075 9.03779 6.43691 9.41041 6.23047C9.78304 6.02404 10.2048 5.92277 10.6305 5.9375C12.887 5.9375 13.31 7.4375 13.31 9.3595L13.3105 13.297Z" />
    </svg>
  )
}

function ForgeLogo() {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const clipId = `forge-logo-${uid}`

  return (
    <svg width="78" height="36" viewBox="0 0 78 36" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="24" width="78" height="12" />
        </clipPath>
      </defs>
      <g className="icon">
        <path d="M52.6364 20.4918H61.6962C61.745 20.4918 61.7717 20.4348 61.7362 20.3997L42.5779 1.46088C41.628 0.522057 40.3452 0 39.0047 0H32.0179C31.969 0 31.9424 0.0570314 31.9779 0.0921277L38.7028 6.73848C38.7383 6.77358 38.7117 6.83061 38.6629 6.83061H32.0445C30.7039 6.83061 29.4167 7.35706 28.4712 8.29149L16.2243 20.3953C16.1888 20.4304 16.2154 20.4874 16.2643 20.4874H25.324C25.324 20.4874 25.3507 20.4831 25.364 20.4699L29.8384 16.0478C29.8384 16.0478 29.8961 16.0258 29.9183 16.0478L34.3927 20.4699C34.3927 20.4699 34.4148 20.4874 34.4326 20.4874H43.4924C43.5412 20.4874 43.5678 20.4304 43.5323 20.3953L34.5303 11.4984C34.5303 11.4984 34.5081 11.4414 34.5303 11.4194L38.9558 7.04558C38.9558 7.04558 39.0135 7.02364 39.0357 7.04558L52.6187 20.4699C52.6187 20.4699 52.6409 20.4874 52.6586 20.4874L52.6364 20.4918Z" />
      </g>
      <g className="text" clipPath={`url(#${clipId})`}>
        <path d="M10.8797 30.1741L10.8841 31.4639H3.28477V35.8465H0V25.6072H11.1549V26.8926H3.28477V30.1741H10.8797Z" />
        <path d="M27.9118 34.2013C25.8122 36.0702 22.1457 36.2632 19.5045 35.7718C17.2585 35.3551 15.039 34.1706 14.5552 31.7884C14.4087 31.0733 14.4087 30.3538 14.5552 29.6388C15.039 27.2566 17.2673 26.094 19.5045 25.6817C22.1368 25.1991 25.8122 25.3833 27.9118 27.2347C28.6397 27.8752 29.128 28.7087 29.3189 29.6607C29.4609 30.367 29.4565 31.0689 29.3189 31.7752C29.128 32.7272 28.6397 33.5608 27.9162 34.2057L27.9118 34.2013ZM23.1222 34.5084C24.2896 34.2232 25.1952 33.4116 25.6124 32.3105C25.9853 31.3322 25.9986 30.2398 25.6613 29.2527C25.2662 28.0945 24.3296 27.2434 23.1311 26.9495C22.1945 26.7214 21.1957 26.7872 20.2991 27.1338C19.2071 27.5593 18.4081 28.4455 18.1107 29.5686C17.9021 30.3582 17.9154 31.1874 18.1507 31.9683C18.4791 33.0694 19.2915 33.9293 20.379 34.3373C21.249 34.6619 22.1989 34.7277 23.1222 34.4996V34.5084Z" />
        <path d="M42.9818 31.9947L45.6762 35.8465H42.2183L39.7724 32.3369H36.3146V35.8509H33.0298V25.6116H40.6735C41.4992 25.6116 42.2937 25.7169 43.0794 25.9143C44.1891 26.2214 45.2633 26.8399 45.5874 28.0069C45.7782 28.6781 45.7339 29.38 45.4897 30.0293C45.2589 30.5865 44.8772 31.0252 44.3756 31.3586C43.9494 31.6525 43.4833 31.8368 42.9818 31.9947ZM42.1339 28.3886C42.0052 27.827 41.6501 27.3839 41.1441 27.1339C40.8067 26.9672 40.4605 26.9014 40.0743 26.8926H36.3146V31.0515H40.1497C40.9976 31.0208 41.7167 30.5426 42.0185 29.7661C42.1872 29.3274 42.2271 28.8668 42.1339 28.3886Z" />
        <path d="M59.5167 31.49H56.3917V30.1871H62.6416V35.3901C60.9859 35.7805 59.3524 35.9692 57.679 35.9955C56.5826 36.013 55.5172 35.9604 54.4341 35.8025C52.9693 35.5743 51.4113 35.1269 50.2705 34.1661C49.5558 33.5651 49.0586 32.7842 48.8545 31.8717C48.7035 31.2049 48.6902 30.5336 48.8012 29.858C49.0631 28.2699 50.0973 27.1907 51.5267 26.5151C53.7905 25.4491 56.9288 25.3657 59.4012 25.4929L62.3131 25.7605V27.1249C61.3499 26.967 60.4044 26.8749 59.4279 26.8354C57.9497 26.7827 56.5559 26.7783 55.1355 27.2214C53.715 27.6645 52.5165 28.5726 52.2946 30.1125C52.1082 31.4023 52.4855 32.6131 53.533 33.4379C53.9725 33.7844 54.4563 34.0257 54.989 34.2144C55.7125 34.4644 56.4494 34.5785 57.2173 34.6224C57.9897 34.6487 58.7443 34.6311 59.5167 34.5741V31.4856V31.49Z" />
        <path d="M77.6049 31.0997H70.1032L70.0987 34.5611H77.9999V35.8465H66.814V25.6072H77.8712V26.8926H70.0987V29.8143H77.6049V31.0997Z" />
      </g>
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14.8085 15.6909L12.6675 17.7999C11.5511 17.1262 10.514 16.3292 9.57547 15.4239C8.6719 14.485 7.87535 13.4486 7.20047 12.3339L9.31047 10.1929C9.4371 10.0634 9.5226 9.89941 9.55623 9.72147C9.58986 9.54353 9.57011 9.35962 9.49947 9.19288L7.30047 4.05988C7.21356 3.85768 7.0569 3.69344 6.85903 3.59707C6.66116 3.50071 6.43525 3.47864 6.22247 3.53488L2.18847 4.59988C1.98651 4.65222 1.80836 4.77172 1.68332 4.93874C1.55829 5.10576 1.4938 5.31035 1.50047 5.51888C1.75739 10.2103 3.70814 14.6491 6.99047 18.0109C10.3534 21.2937 14.7938 23.2442 19.4865 23.4999C19.6948 23.5065 19.8991 23.4419 20.0658 23.3169C20.2325 23.1918 20.3516 23.0137 20.4035 22.8119L21.4695 18.7759C21.526 18.5632 21.5042 18.3373 21.408 18.1394C21.3118 17.9415 21.1477 17.7848 20.9455 17.6979L15.8165 15.4999C15.6486 15.4276 15.4629 15.4072 15.2833 15.4412C15.1037 15.4753 14.9384 15.5622 14.8085 15.6909Z"
        strokeLinecap="square"
      />
      <path d="M14.5 6.50488H22.5" strokeLinecap="square" />
      <path d="M18.5 10.5049V2.50488" strokeLinecap="square" />
    </svg>
  )
}

function WrpdLogo() {
  return (
    <svg width="72" height="16" viewBox="0 0 72 16" fill="none" aria-hidden="true" role="img">
      <path d="M17.8695 15.7825H12.066L11.3043 8.56653L7.64474 15.7825H1.84592L0 0H5.54236L6.4085 7.87472L10.4075 0H15.4538L16.2217 7.9803L20.2744 0H25.869L17.871 15.7825H17.8695ZM12.6266 15.1427H17.4901L24.84 0.639811H20.6522L15.807 10.1818L14.8887 0.639811H10.7853L6.01536 10.029L4.98336 0.639811H0.703353L2.39877 15.1427H7.26696L11.7036 6.39338L12.6281 15.1427H12.6266Z" fill="white" />
      <path d="M37.1698 15.7825H31.2834L29.1964 11.9752H28.4117L27.673 15.7825H22.0615L25.1391 0H32.0144C36.0518 0 38.4613 1.97932 38.4613 5.29499C38.4613 7.98818 37.0638 10.1251 34.6144 11.2077L37.1713 15.7825H37.1698ZM31.6474 15.1427H36.0917L33.7114 10.8831L34.0538 10.7507C36.4572 9.81779 37.8363 7.82902 37.8363 5.29656C37.8363 2.33862 35.7139 0.641387 32.0144 0.641387H25.6505L22.8232 15.1443H27.1616L27.9003 11.3369H29.5619L31.6489 15.1443L31.6474 15.1427ZM30.9379 8.12528H28.5115L29.3331 3.93657H31.2543C33.1401 3.93657 33.4211 5.09958 33.4211 5.79297C33.4211 7.25382 32.4936 8.12528 30.9379 8.12528ZM29.2747 7.48547H30.9394C32.1388 7.48547 32.7992 6.88506 32.7992 5.79454C32.7992 5.27292 32.6395 4.57796 31.2558 4.57796H29.846L29.2763 7.48547H29.2747Z" fill="white" />
      <path d="M41.6886 15.7825H36.0771L39.1532 0H45.9656C50.0413 0 52.4754 1.99665 52.4754 5.33911C52.4754 9.36078 49.3502 12.0619 44.7017 12.0619H42.4073L41.6902 15.7825H41.6886ZM36.8373 15.1427H41.1757L41.8929 11.422H44.7001C49.0431 11.422 51.8504 9.03457 51.8504 5.33911C51.8504 2.3528 49.705 0.639811 45.964 0.639811H39.663L36.8373 15.1427ZM44.9535 8.12528H42.5271L43.3487 3.93657H45.2699C47.1557 3.93657 47.4368 5.09958 47.4368 5.79297C47.4368 7.25382 46.5092 8.12528 44.9535 8.12528ZM43.2888 7.48547H44.9535C46.1529 7.48547 46.8133 6.88506 46.8133 5.79454C46.8133 5.27292 46.6536 4.57796 45.2699 4.57796H43.8601L43.2904 7.48547H43.2888Z" fill="white" />
      <path d="M58.3648 15.7825H50.0781L53.1557 0H60.0725C64.9069 0 67.9107 2.58446 67.9107 6.7448C67.9107 12.1501 64.0745 15.7825 58.3648 15.7825ZM50.8414 15.1427H58.3663C63.7029 15.1427 67.2888 11.7672 67.2888 6.7448C67.2888 2.9217 64.5921 0.639811 60.074 0.639811H53.6686L50.8429 15.1427H50.8414ZM58.5337 11.8034H55.8355L57.3512 3.9807H59.5043C61.6589 3.9807 62.8936 5.098 62.8936 7.04895C62.8936 9.93756 61.1828 11.8034 58.5337 11.8034ZM56.5957 11.162H58.5337C60.8035 11.162 62.2686 9.54674 62.2686 7.04738C62.2686 5.04127 60.7651 4.62051 59.5027 4.62051H57.8611L56.5941 11.162H56.5957Z" fill="white" />
      <path d="M68.7156 15.9999C67.0201 15.9999 65.79 14.7833 65.79 13.105C65.79 11.1777 67.1799 9.77832 69.0949 9.77832C70.8318 9.77832 72.0004 10.9413 72.0004 12.6732C72.0004 14.5706 70.5876 15.9999 68.7156 15.9999ZM69.0949 10.4181C67.5407 10.4181 66.4135 11.548 66.4135 13.105C66.4135 14.4319 67.3595 15.3585 68.7156 15.3585C70.2574 15.3585 71.3754 14.2286 71.3754 12.6717C71.3754 11.3022 70.4801 10.4181 69.0949 10.4181Z" fill="white" />
    </svg>
  )
}

export function ForgeAutomotiveMenu({
  links = DEFAULT_LINKS,
  legalLinks = DEFAULT_LEGALS,
  socials = DEFAULT_SOCIALS,
  phone = '+443330417965',
  logoHref = '#',
  copyright = 'Copyright © 2026',
  siteBy = { label: 'Made by 12 Studio', href: 'https://12.studio' },
  poweredByHref = 'https://www.thevehiclewrappingcentre.com/',
  onNavigate,
  className = '',
}: ForgeAutomotiveMenuProps) {
  const [open, setOpen] = useState(false)
  const [pinned, setPinned] = useState(false)
  const pinTimer = useRef<number | undefined>(undefined)
  const panelRef = useRef<HTMLElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuId = `forge-site-menu-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`

  useEffect(() => {
    if (open) {
      setPinned(true)
      if (pinTimer.current) window.clearTimeout(pinTimer.current)
      return
    }

    // Keep the header anchored to the viewport until the overlay has faded.
    pinTimer.current = window.setTimeout(() => setPinned(false), 1250)
    return () => {
      if (pinTimer.current) window.clearTimeout(pinTimer.current)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus({ preventScroll: true })
    }

    document.addEventListener('keydown', onKeyDown)
    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>('a, button')?.focus({ preventScroll: true })
    })

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
      window.cancelAnimationFrame(frame)
    }
  }, [open])

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus({ preventScroll: true })
  }

  const handleLink = (event: ReactMouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      event.preventDefault()
      onNavigate?.(href)
      close()
      return
    }

    onNavigate?.(href)
    setOpen(false)
  }

  return (
    <div
      className={['forge-nav', className].filter(Boolean).join(' ')}
      data-open={open}
      data-pinned={pinned}
    >
      {/* Stand-in page behind the menu */}
      <div className="forge-demo" aria-hidden="true">
        <p className="forge-demo__eyebrow">Bespoke vehicle builds &amp; styling</p>
        <p className="forge-demo__copy">
          A luxury automotive atelier for bespoke styling, performance and craftsmanship.
        </p>
      </div>

      <header className="forge-header">
        <nav className="forge-header__socials" aria-label="Social media">
          {socials.map((social) => (
            <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
              <SocialIcon name={social.label} />
            </a>
          ))}
        </nav>

        <a className="forge-header__phone" href={`tel:${phone}`} aria-label="Call us on our mobile number">
          <PhoneIcon />
        </a>

        <a className="forge-header__logo" href={logoHref} aria-label="Forge home">
          <ForgeLogo />
        </a>

        <button
          ref={triggerRef}
          className="forge-menu-btn"
          type="button"
          aria-label={open ? 'Close menu' : 'Navigate'}
          aria-expanded={open}
          aria-controls={menuId}
          data-open={open}
          onClick={() => setOpen((value) => !value)}
        >
          <em>
            <span data-menu="closed">Navigate</span>
            <span data-menu="open">Close</span>
          </em>
          <i className="forge-burger" aria-hidden="true">
            <span />
            <span />
            <span />
          </i>
        </button>
      </header>

      <nav
        ref={panelRef}
        id={menuId}
        className="forge-menu"
        aria-label="Menu"
        data-open={open}
        inert={!open}
      >
        <figure className="forge-menu__figure" aria-hidden="true">
          <svg viewBox="0 0 440 796" fill="none" aria-hidden="true">
            <path d="M744.064 796H1091.95C1093.83 796 1094.85 793.785 1093.49 792.421L357.651 56.7476C321.174 20.2792 271.914 0 220.438 0H-47.8527C-49.7276 0 -50.7503 2.21537 -49.3867 3.57868L208.847 261.755C210.211 263.118 209.188 265.333 207.313 265.333H-46.8299C-98.3062 265.333 -147.737 285.783 -184.043 322.081L-654.318 792.421C-655.682 793.785 -654.659 796 -652.784 796H-304.893C-304.893 796 -303.87 795.83 -303.359 795.318L-131.544 623.542C-131.544 623.542 -129.328 622.69 -128.476 623.542L43.3388 795.318C43.3388 795.318 44.191 796 44.8729 796H392.764C394.639 796 395.661 793.785 394.298 792.421L48.6227 446.823C48.6227 446.823 47.7705 444.608 48.6227 443.756L218.563 273.854C218.563 273.854 220.779 273.002 221.631 273.854L743.211 795.318C743.211 795.318 744.064 796 744.746 796H744.064Z" />
          </svg>
        </figure>

        <div className="forge-menu__inner">
          <ul className="forge-menu__pages" data-name="pages">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  aria-label={`Navigate to ${link.label}`}
                  onClick={(event) => handleLink(event, link.href)}
                >
                  <Letters text={link.label} />
                </a>
              </li>
            ))}
          </ul>

          <ul className="forge-menu__legals" data-name="legals">
            {legalLinks.map((link) =>
              link.label.toLowerCase().includes('cookie') ? (
                <li key={link.label}>
                  <button type="button" aria-label="Cookie settings: choose again" onClick={() => onNavigate?.(link.href)}>
                    <Letters text={link.label} />
                  </button>
                </li>
              ) : (
                <li key={link.label}>
                  <a href={link.href} aria-label={link.label} onClick={(event) => handleLink(event, link.href)}>
                    <Letters text={link.label} />
                  </a>
                </li>
              ),
            )}
          </ul>

          <ul className="forge-menu__socials" data-name="socials">
            {socials.map((social) => (
              <li key={social.label}>
                <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
                  <SocialIcon name={social.label} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <small className="forge-menu__meta">
          <p className="forge-menu__copyright" data-name="copyright">
            {copyright}
          </p>
          <p className="forge-menu__powered" data-name="powered">
            <a href={poweredByHref} target="_blank" rel="noopener noreferrer" aria-label="Navigate to WRPD">
              Powered by
              <WrpdLogo />
            </a>
          </p>
          <p className="forge-menu__siteby" data-name="siteby">
            <a href={siteBy.href} target="_blank" rel="noopener noreferrer" aria-label={`Navigate to ${siteBy.label}`}>
              {siteBy.label}
            </a>
          </p>
        </small>
      </nav>
    </div>
  )
}

function ForgeMenuThumbnail() {
  return (
    <div className="forge-nav forge-nav--thumb" aria-hidden="true">
      <div className="forge-thumb">
        <figure className="forge-menu__figure">
          <svg viewBox="0 0 440 796" fill="none" aria-hidden="true">
            <path d="M744.064 796H1091.95C1093.83 796 1094.85 793.785 1093.49 792.421L357.651 56.7476C321.174 20.2792 271.914 0 220.438 0H-47.8527C-49.7276 0 -50.7503 2.21537 -49.3867 3.57868L208.847 261.755C210.211 263.118 209.188 265.333 207.313 265.333H-46.8299C-98.3062 265.333 -147.737 285.783 -184.043 322.081L-654.318 792.421C-655.682 793.785 -654.659 796 -652.784 796H-304.893C-304.893 796 -303.87 795.83 -303.359 795.318L-131.544 623.542C-131.544 623.542 -129.328 622.69 -128.476 623.542L43.3388 795.318C43.3388 795.318 44.191 796 44.8729 796H392.764C394.639 796 395.661 793.785 394.298 792.421L48.6227 446.823C48.6227 446.823 47.7705 444.608 48.6227 443.756L218.563 273.854C218.563 273.854 220.779 273.002 221.631 273.854L743.211 795.318C743.211 795.318 744.064 796 744.746 796H744.064Z" />
          </svg>
        </figure>

        <span className="forge-thumb__logo">
          <ForgeLogo />
        </span>

        <div className="forge-thumb__nav">
          {DEFAULT_LINKS.map((link) => (
            <span key={link.label}>{link.label}</span>
          ))}
        </div>

        <div className="forge-thumb__legals">
          <span>Legal</span>
          <span>Cookie Settings</span>
        </div>
      </div>
    </div>
  )
}

export default function ForgeAutomotiveMenuDemo({ thumbnail = false }: { thumbnail?: boolean }) {
  if (thumbnail) return <ForgeMenuThumbnail />
  return <ForgeAutomotiveMenu />
}
