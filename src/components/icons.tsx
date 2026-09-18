export function IconMap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M9 4.5 3.5 6.6v13L9 17.5l6 2 5.5-2.1v-13L15 6.4l-6-1.9Z" strokeLinejoin="round" />
      <path d="M9 4.5v13M15 6.4v13.1" />
    </svg>
  )
}

export function IconGrid(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
    </svg>
  )
}

export function IconFilter(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M4 5h16l-6 7.2v6L10 21v-8.8L4 5Z" strokeLinejoin="round" />
    </svg>
  )
}

export function IconSort(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <path d="M7 4v16M7 20l-3.5-3.5M7 20l3.5-3.5M17 20V4M17 4l3.5 3.5M17 4l-3.5 3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function IconDensity(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" {...props}>
      <circle cx="12" cy="12" r="4.4" />
      <path d="M12 2.4v2.4M12 19.2v2.4M4.4 12H2M22 12h-2.4M5.4 5.4l1.7 1.7M17 17l1.7 1.7M18.6 5.4 17 7M7 17l-1.7 1.7" strokeLinecap="round" />
    </svg>
  )
}

export function AvatarMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#0d130f" stroke="#3ef07a" strokeWidth="1.5" />
      {/* A shutter-blade mark instead of a photo — the same idea as the reference avatar, own shape. */}
      <g stroke="#3ef07a" strokeWidth="1.4" strokeLinecap="round">
        <path d="M24 12v8.2M24 27.8V36M12 24h8.2M27.8 24H36M16.2 16.2l5.8 5.8M26 26l5.8 5.8M31.8 16.2 26 22M22 26l-5.8 5.8" />
      </g>
      <circle cx="24" cy="24" r="3.6" fill="#3ef07a" />
    </svg>
  )
}
