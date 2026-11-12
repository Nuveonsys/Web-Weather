import { useId } from 'react';
import { conditionFor, type IconKind } from '../lib/weather';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  size?: number;
  className?: string;
  title?: string;
}

function Sun({ x = 23, y = 21, r = 10 }: { x?: number; y?: number; r?: number }) {
  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return (
      <line
        key={i}
        x1={(x + Math.cos(angle) * (r + 3.6)).toFixed(2)}
        y1={(y + Math.sin(angle) * (r + 3.6)).toFixed(2)}
        x2={(x + Math.cos(angle) * (r + 7)).toFixed(2)}
        y2={(y + Math.sin(angle) * (r + 7)).toFixed(2)}
      />
    );
  });
  return (
    <g>
      <g stroke="#ffc300" strokeWidth="3.2" strokeLinecap="round">
        {rays}
      </g>
      <circle cx={x} cy={y} r={r} fill="#ffd60a" />
      <circle cx={x - r * 0.24} cy={y - r * 0.28} r={r * 0.6} fill="#ffe680" opacity="0.9" />
    </g>
  );
}

function Moon({ cx = 25, cy = 24, r = 13 }: { cx?: number; cy?: number; r?: number }) {
  const id = `moon-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <g>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="black" />
          <circle cx={cx} cy={cy} r={r} fill="white" />
          <circle cx={cx + r * 0.62} cy={cy - r * 0.32} r={r * 0.94} fill="black" />
        </mask>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="#e9edff" mask={`url(#${id})`} />
      <circle cx={cx + r * 0.42} cy={cy + r * 0.5} r="1" fill="#b9c4e8" opacity="0.8" />
      <circle cx={cx + r * 0.05} cy={cy + r * 0.15} r="1.6" fill="#cdd6f4" opacity="0.7" />
    </g>
  );
}

function Sparkles() {
  return (
    <g fill="#dfe6ff">
      <circle cx="47" cy="17" r="1.3" />
      <circle cx="53" cy="31" r="1" />
      <circle cx="12" cy="40" r="1.2" />
      <circle cx="42" cy="8" r="0.9" />
      <path d="M15 15.5l0.7 2 2 0.7-2 0.7-0.7 2-0.7-2-2-0.7 2-0.7z" opacity="0.9" />
    </g>
  );
}

function Cloud({
  x = 0,
  y = 0,
  scale = 1,
  tone = 'light',
}: {
  x?: number;
  y?: number;
  scale?: number;
  tone?: 'light' | 'grey' | 'dark';
}) {
  const fill = tone === 'dark' ? '#d5dfe9' : tone === 'grey' ? '#eef4fa' : '#ffffff';
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <circle cx="21" cy="37" r="10" fill={fill} opacity="0.95" />
      <circle cx="33" cy="30" r="13" fill={fill} />
      <circle cx="44" cy="37" r="9" fill={fill} />
      <rect x="13.5" y="34.5" width="36" height="13" rx="6.5" fill={fill} />
      <ellipse cx="32" cy="46" rx="16" ry="2.4" fill="#c3d2e0" opacity="0.45" />
    </g>
  );
}

function Drops({ variant }: { variant: 'rain' | 'drizzle' }) {
  const heavy = variant === 'rain';
  return (
    <g stroke="#5ac8fa" strokeWidth={heavy ? 3.6 : 3} strokeLinecap="round">
      <line x1="22" y1="50" x2="20" y2={heavy ? 58 : 55} />
      <line x1="32" y1="50" x2="30" y2={heavy ? 59 : 56} />
      <line x1="42" y1="50" x2="40" y2={heavy ? 58 : 55} />
    </g>
  );
}

function Flake({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  return (
    <g stroke="#eef7ff" strokeWidth="2" strokeLinecap="round">
      <line x1={x - r} y1={y} x2={x + r} y2={y} />
      <line x1={x} y1={y - r} x2={x} y2={y + r} />
      <line x1={x - r * 0.7} y1={y - r * 0.7} x2={x + r * 0.7} y2={y + r * 0.7} />
      <line x1={x - r * 0.7} y1={y + r * 0.7} x2={x + r * 0.7} y2={y - r * 0.7} />
    </g>
  );
}

function body(kind: IconKind, isDay: boolean) {
  switch (kind) {
    case 'clear':
      return isDay ? (
        <Sun x={31} y={30} r={14} />
      ) : (
        <>
          <Moon />
          <Sparkles />
        </>
      );
    case 'partly':
      return (
        <>
          {isDay ? <Sun x={22} y={19} r={9} /> : <Moon cx={21} cy={20} r={10} />}
          <Cloud x={3} y={8} scale={0.92} />
        </>
      );
    case 'cloudy':
      return (
        <>
          <Cloud x={-3} y={2} scale={0.78} tone="grey" />
          <Cloud x={2} y={10} scale={0.95} />
        </>
      );
    case 'fog':
      return (
        <>
          <Cloud x={0} y={1} scale={0.95} tone="grey" />
          <g stroke="#e4edf5" strokeWidth="3" strokeLinecap="round">
            <line x1="16" y1="53" x2="48" y2="53" />
            <line x1="21" y1="59" x2="43" y2="59" />
          </g>
        </>
      );
    case 'drizzle':
      return (
        <>
          <Cloud tone="grey" />
          <Drops variant="drizzle" />
        </>
      );
    case 'rain':
      return (
        <>
          <Cloud tone="grey" />
          <Drops variant="rain" />
        </>
      );
    case 'sleet':
      return (
        <>
          <Cloud tone="grey" />
          <Drops variant="drizzle" />
          <Flake x={45} y={54} r={3.4} />
        </>
      );
    case 'snow':
      return (
        <>
          <Cloud />
          <Flake x={23} y={54} r={4} />
          <Flake x={33} y={58} r={4.2} />
          <Flake x={43} y={53} r={3.6} />
        </>
      );
    case 'showers':
      return (
        <>
          {isDay ? <Sun x={19} y={18} r={8} /> : <Moon cx={19} cy={18} r={9} />}
          <Cloud x={4} y={6} scale={0.9} />
          <Drops variant="rain" />
        </>
      );
    case 'snow-showers':
      return (
        <>
          {isDay ? <Sun x={19} y={18} r={8} /> : <Moon cx={19} cy={18} r={9} />}
          <Cloud x={4} y={6} scale={0.9} />
          <Flake x={28} y={56} r={3.6} />
          <Flake x={42} y={54} r={3.2} />
        </>
      );
    case 'thunder':
      return (
        <>
          <Cloud tone="dark" />
          <path d="M33 43l-6.5 11.5h5.4l-3 9 10.2-13.8h-5.8l3.6-6.7z" fill="#ffd60a" />
        </>
      );
    default:
      return <Cloud />;
  }
}

export function WeatherIcon({ code, isDay = true, size = 40, className, title }: WeatherIconProps) {
  const kind = conditionFor(code).kind;
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      {body(kind, isDay)}
    </svg>
  );
}
