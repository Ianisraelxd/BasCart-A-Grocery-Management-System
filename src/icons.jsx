const PATHS = {
  dashboard: 'M3 3h8v8H3z M13 3h8v5h-8z M13 10h8v11h-8z M3 13h8v8H3z',
  pos: 'M3 4h2l2.4 11h10.2L20 7H6.2 M9 20.5a.5.5 0 100-1 .5.5 0 000 1z M17 20.5a.5.5 0 100-1 .5.5 0 000 1z',
  online: 'M12 2l9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10',
  products: 'M3 12V3h9l9 9-9 9z M7.5 7.5h.01',
  inventory: 'M12 2l10 5-10 5L2 7z M2 12l10 5 10-5 M2 17l10 5 10-5',
  suppliers: 'M1 6h13v10H1z M14 9h4l4 3v4h-8z M5.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z M17.5 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  purchasing: 'M9 3h6v3H9z M7 5H5v16h14V5h-2 M9 11h6 M9 15h6',
  customers: 'M16 20v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M10 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7z M20 20v-2a4 4 0 00-3-3.9 M16 3.1a3.5 3.5 0 010 6.8',
  sales: 'M3 17l6-6 4 4 8-8 M15 7h6v6',
  finance: 'M12 22a10 10 0 100-20 10 10 0 000 20z M14.8 8.5c-.6-.8-1.6-1.2-2.8-1.2-1.7 0-2.8.9-2.8 2.1 0 3 5.8 1.5 5.8 4.4 0 1.3-1.2 2.2-3 2.2-1.3 0-2.4-.5-3-1.4 M12 5.5v1.8 M12 16.7v1.8',
  reports: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  employees: 'M3 5h18v14H3z M8 12a2 2 0 100-4 2 2 0 000 4z M5.5 16c.5-1.5 1.7-2.2 2.5-2.2s2 .7 2.5 2.2 M14 9h4 M14 13h4',
  audit: 'M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.3-4.3',
  backup: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3z M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  receipt: 'M6 2h12v20l-3-2-3 2-3-2-3 2z M9 7h6 M9 11h6 M9 15h4',
  alert: 'M12 3l10 18H2z M12 10v5 M12 18h.01',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  volume: 'M11 5L6 9H2v6h4l5 4z M15.5 8.5a5 5 0 010 7 M19 5a9 9 0 010 14',
  mute: 'M11 5L6 9H2v6h4l5 4z M22 9l-6 6 M16 9l6 6',
  power: 'M12 2v10 M18.4 6.6a9 9 0 11-12.8 0',
  cart: 'M3 4h2l2.4 11h10.2L20 7H6.2 M9 20.5a.5.5 0 100-1 .5.5 0 000 1z M17 20.5a.5.5 0 100-1 .5.5 0 000 1z',
  check: 'M4 12.5l5 5L20 6.5',
  x: 'M5 5l14 14 M19 5L5 19',
}

export function Icon({ name, size = 22, className = '' }) {
  return (
    <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name] || PATHS.dashboard} />
    </svg>
  )
}
