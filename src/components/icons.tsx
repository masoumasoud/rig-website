import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

export const PhoneIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
export const WhatsappIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
  </svg>
);
export const TelegramIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M15 10l-4 4 6 6 4-16-18 7 4 2 2 6 3-4" />
  </svg>
);
export const MessageIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 5h16v11H8l-4 4z" />
    <path d="M8 9h8M8 12h5" />
  </svg>
);
export const MailIcon = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
);
export const PinIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const ClockIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const ArrowIcon = (p: P) => (
  <svg {...base(p)} className={`rtl:-scale-x-100 ${p.className ?? ""}`}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const MenuIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const CloseIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
export const GlobeIcon = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
);
export const UploadIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
  </svg>
);
export const CheckIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);
export const FileIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
    <path d="M14 3v5h5" />
  </svg>
);
export const TextSizeIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 19l5-13 5 13M4.8 15h6.4M15 19l3.5-9 3.5 9M16 16.5h5" />
  </svg>
);
export const TruckIcon = (p: P) => (
  <svg {...base(p)} className={`rtl:-scale-x-100 ${p.className ?? ""}`}>
    <path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z" />
    <circle cx="6" cy="17.5" r="2" />
    <circle cx="17" cy="17.5" r="2" />
  </svg>
);
export const ChevronIcon = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ---- service glyphs: drawn like tiny technical sketches ---- */
const serviceGlyphs: Record<string, React.ReactNode> = {
  mill: (
    <>
      <path d="M9 2h6v4l-1 2h-4L9 6z" />
      <path d="M11 8h2v7l-1 2-1-2z" />
      <path d="M3 21h18M5 21v-3h14v3" />
    </>
  ),
  lathe: (
    <>
      <rect x="2" y="8" width="5" height="8" />
      <path d="M7 10h11v4H7M18 11h3v2h-3" />
      <path d="M12 14l2 4h-4z" />
    </>
  ),
  wire: (
    <>
      <path d="M12 2v20" strokeDasharray="2 2" />
      <path d="M4 7h6v10H4M20 7h-6v10h6" />
      <circle cx="12" cy="4" r="2" />
      <circle cx="12" cy="20" r="2" />
    </>
  ),
  grind: (
    <>
      <circle cx="12" cy="9" r="6" />
      <circle cx="12" cy="9" r="1.5" />
      <path d="M3 20h18M6 17h12" />
    </>
  ),
  manual: (
    <>
      <circle cx="8" cy="12" r="4" />
      <path d="M8 8V5M8 19v-3M4 12H2M14 12h-2" />
      <path d="M14 12h8M18 9v6" />
    </>
  ),
  weld: (
    <>
      <path d="M4 20l9-9M13 11l3-3 3 3-3 3z" />
      <path d="M18 3l1 2M21 6l-2 1M15 2v2" />
      <path d="M3 21h8" />
    </>
  ),
  drill: (
    <>
      <path d="M8 2h8v5H8z" />
      <path d="M11 7h2v10l-1 3-1-3z" />
      <path d="M11 10l2-1M11 13l2-1" />
      <path d="M4 21h16" />
    </>
  ),
  machine: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="1" />
      <circle cx="9" cy="10" r="3" />
      <path d="M15 8h3M15 11h3M6 16v4M18 16v4M4 20h16" />
    </>
  ),
  reverse: (
    <>
      <path d="M4 4h6v6H4zM14 14h6v6h-6z" />
      <path d="M10 7h4a3 3 0 0 1 3 3v4M14 17h-4a3 3 0 0 1-3-3v-4" />
    </>
  ),
  mold: (
    <>
      <path d="M3 4h18v6H3zM3 14h18v6H3z" />
      <path d="M9 10v4M15 10v4M9 7h6M9 17h6" />
    </>
  ),
};

export function ServiceIcon({ name, ...p }: P & { name: string }) {
  return <svg {...base(p)}>{serviceGlyphs[name] ?? serviceGlyphs.mill}</svg>;
}
