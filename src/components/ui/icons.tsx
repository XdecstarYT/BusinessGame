import type { ReactElement, SVGProps } from 'react'

export type IconName =
  | 'build'
  | 'walk'
  | 'city'
  | 'play'
  | 'stop'
  | 'box'
  | 'users'
  | 'megaphone'
  | 'truck'
  | 'bank'
  | 'building'
  | 'trophy'
  | 'barChart'
  | 'dollar'
  | 'x'
  | 'calendar'
  | 'clock'
  | 'star'
  | 'droplet'
  | 'person'
  | 'chevronDown'

const PATHS: Record<IconName, ReactElement> = {
  build: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  walk: (
    <>
      <path d="M2 12s3.5-6.2 10-6.2 10 6.2 10 6.2-3.5 6.2-10 6.2S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  city: (
    <>
      <path d="M3 21V10.5l4-3 4 3V21" />
      <path d="M11 21V6l4-3 4 3v15" />
      <path d="M3 21h18" />
    </>
  ),
  play: <path d="M7 4l13 8-13 8V4Z" fill="currentColor" stroke="none" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />,
  box: (
    <>
      <path d="M3 8l9-5 9 5-9 5-9-5Z" />
      <path d="M3 8v9l9 5 9-5V8" />
      <path d="M12 13v9" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
      <circle cx="17.5" cy="9" r="2.6" />
      <path d="M14.8 14.3c2.5.4 4.4 2.7 4.4 5.4" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 10v4a1 1 0 0 0 1 1h2l7 4V5L6 9H4a1 1 0 0 0-1 1Z" />
      <path d="M16.2 9a4 4 0 0 1 0 6" />
      <path d="M19.3 6.2a8 8 0 0 1 0 11.6" />
    </>
  ),
  truck: (
    <>
      <rect x="1.5" y="8" width="12" height="8" rx="1" />
      <path d="M13.5 11h4l3 3v2h-7v-5Z" />
      <circle cx="6" cy="18.2" r="1.8" />
      <circle cx="17" cy="18.2" r="1.8" />
    </>
  ),
  bank: (
    <>
      <path d="M12 3l9 5H3l9-5Z" />
      <path d="M4 10v8M9 10v8M15 10v8M20 10v8" />
      <path d="M2 20h20" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </>
  ),
  trophy: (
    <>
      <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4a3 3 0 0 0 3 5" />
      <path d="M17 5h3a3 3 0 0 1-3 5" />
      <path d="M12 13v3" />
      <path d="M9 17h6l1 3H8l1-3Z" />
    </>
  ),
  barChart: (
    <>
      <rect x="4" y="12" width="3.4" height="8" fill="currentColor" stroke="none" />
      <rect x="10.3" y="7" width="3.4" height="13" fill="currentColor" stroke="none" />
      <rect x="16.6" y="15" width="3.4" height="5" fill="currentColor" stroke="none" />
      <path d="M2 21h20" />
    </>
  ),
  dollar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5v11M15.2 9.6c0-1.4-1.4-2.5-3.2-2.5s-3.2 1-3.2 2.3c0 3 6.4 1.6 6.4 4.6 0 1.4-1.4 2.6-3.2 2.6s-3.2-1.1-3.2-2.6" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6L6 18" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  star: (
    <path
      d="M12,2.5 L14.47,8.6 L21.03,9.06 L15.99,13.3 L17.58,19.69 L12,16.2 L6.42,19.69 L8.01,13.3 L2.97,9.06 L9.53,8.6 Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  droplet: <path d="M12 3s7 7.6 7 12.2a7 7 0 0 1-14 0C5 10.6 12 3 12 3Z" />,
  person: (
    <>
      <circle cx="12" cy="7.2" r="3.2" />
      <path d="M6 21c0-3.9 2.7-7 6-7s6 3.1 6 7" />
    </>
  ),
  chevronDown: <path d="M6 9l6 6 6-6" />,
}

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName
  size?: number
}

export function Icon({ name, size = 16, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
