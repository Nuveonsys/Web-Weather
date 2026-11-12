import type { CSSProperties, ReactNode } from 'react';

export type IconName =
  | 'list'
  | 'refresh'
  | 'tune'
  | 'search'
  | 'close'
  | 'location'
  | 'clock'
  | 'calendar'
  | 'check'
  | 'trash'
  | 'droplet'
  | 'wind'
  | 'eye'
  | 'gauge'
  | 'sun'
  | 'moon'
  | 'pollen'
  | 'uv'
  | 'aqi'
  | 'humidity'
  | 'thermometer'
  | 'arrow'
  | 'my-location';

const ICONS: Record<IconName, ReactNode> = {
  list: (
    <>
      <g fill="currentColor" stroke="none">
        <circle cx="4.4" cy="6" r="1.5" />
        <circle cx="4.4" cy="12" r="1.5" />
        <circle cx="4.4" cy="18" r="1.5" />
      </g>
      <path d="M9 6h11M9 12h11M9 18h11" />
    </>
  ),
  refresh: <path d="M20 12a8 8 0 1 1-2.5-5.8M20 4.2V10h-5.6" />,
  tune: (
    <>
      <path d="M3.5 7h8.5M17 7h3.5M3.5 12h3.5M12 12h8.5M3.5 17h8.5M17 17h3.5" />
      <circle cx="15" cy="7" r="2.2" />
      <circle cx="9.5" cy="12" r="2.2" />
      <circle cx="15" cy="17" r="2.2" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.3 15.3 20 20" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  location: (
    <>
      <path d="M12 21c4.6-4.4 7-7.9 7-11a7 7 0 1 0-14 0c0 3.1 2.4 6.6 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3.4" />
      <path d="M8 3.2v3.6M16 3.2v3.6M3.5 10.2h17" />
    </>
  ),
  check: <path d="M5 12.6 9.4 17 19 7.2" />,
  trash: (
    <>
      <path d="M4.5 6.8h15M9.5 6.8V4.6h5v2.2M6.8 6.8l.8 13h8.8l.8-13" />
      <path d="M10.5 10.4v6M13.5 10.4v6" />
    </>
  ),
  droplet: <path d="M12 3.2c3.2 4.1 6 6.9 6 10.2a6 6 0 0 1-12 0c0-3.3 2.8-6.1 6-10.2z" />,
  wind: (
    <path d="M3 8.2h9.6a2.6 2.6 0 1 0-2.6-2.6M3 12h13.2a2.6 2.6 0 1 1-2.6 2.6M3 16h6.4a2.1 2.1 0 1 1-2.1 2.1" />
  ),
  eye: (
    <>
      <path d="M2.6 12S6.1 6.4 12 6.4 21.4 12 21.4 12 17.9 17.6 12 17.6 2.6 12 2.6 12z" />
      <circle cx="12" cy="12" r="2.9" />
    </>
  ),
  gauge: (
    <>
      <circle cx="12" cy="12" r="8.6" />
      <path d="M12 12l3.6-3.4M12 12l-2.4 3" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3.2v2M12 18.8v2M3.2 12h2M18.8 12h2M5.8 5.8l1.4 1.4M16.8 16.8l1.4 1.4M18.2 5.8l-1.4 1.4M7.2 16.8l-1.4 1.4" />
    </>
  ),
  moon: <path d="M20.2 14.4A8.6 8.6 0 0 1 9.6 3.8a8.6 8.6 0 1 0 10.6 10.6z" fill="currentColor" stroke="none" />,
  pollen: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M12 3v3.4M12 17.6V21M3 12h3.4M17.6 12H21M5.7 5.7l2.4 2.4M15.9 15.9l2.4 2.4M18.3 5.7l-2.4 2.4M8.1 15.9l-2.4 2.4" />
    </>
  ),
  uv: (
    <>
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 4v1.8M12 18.2V20M4 12h1.8M18.2 12H20M6.3 6.3l1.3 1.3M16.4 16.4l1.3 1.3M17.7 6.3l-1.3 1.3M7.6 16.4l-1.3 1.3" />
    </>
  ),
  aqi: (
    <g fill="currentColor" stroke="none">
      <circle cx="6" cy="6" r="1.4" />
      <circle cx="12" cy="6" r="1.4" />
      <circle cx="18" cy="6" r="1.4" />
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
      <circle cx="6" cy="18" r="1.4" />
      <circle cx="12" cy="18" r="1.4" />
      <circle cx="18" cy="18" r="1.4" />
    </g>
  ),
  humidity: (
    <>
      <path d="M10.2 3.6c2.6 3.3 4.8 5.6 4.8 8.2a4.8 4.8 0 0 1-9.6 0c0-2.6 2.2-4.9 4.8-8.2z" />
      <path d="M13.5 16.5c2.6.6 4.6 2 4.6 4" />
    </>
  ),
  arrow: <path d="M12 20V5M6.2 10.8 12 5l5.8 5.8" />,
  thermometer: (
    <>
      <path d="M10 13.6V5.5a2 2 0 1 1 4 0v8.1a4.2 4.2 0 1 1-4 0z" />
      <path d="M12 9v6.4" />
    </>
  ),
  'my-location': (
    <>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 3v3.4M12 17.6V21M3 12h3.4M17.6 12H21" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}

export function Icon({ name, size = 24, className, style, strokeWidth = 1.8 }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      style={style}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}
