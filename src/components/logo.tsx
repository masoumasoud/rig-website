/** Vector version of the R.I.G mark (spindle + drill in a frame). Uses currentColor. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true}>
      {title ? <title>{title}</title> : null}
      <path d="M45 24H13v86h94V24H75" fill="none" stroke="currentColor" strokeWidth="9" strokeLinejoin="miter" />
      <g data-fx="spindle">
        <path d="M36 3h48v8c-8 0-12 4-14 10l-2 13H52l-2-13c-2-6-6-10-14-10z" fill="currentColor" />
        <rect x="51" y="34" width="18" height="6" fill="currentColor" />
        <path d="M53 40h14l-3 7H56z" fill="currentColor" />
        <g data-fx="bit">
          <path d="M56.5 47h7v22l-3.5 7-3.5-7z" fill="currentColor" />
          <path d="M56.5 53l7-3.5M56.5 59l7-3.5M56.5 65l7-3.5" stroke="var(--logo-bg, #fff)" strokeWidth="1.6" />
        </g>
      </g>
      <text
        x="60"
        y="102"
        textAnchor="middle"
        fontFamily="Manrope, Arial, sans-serif"
        fontWeight="800"
        fontSize="24"
        letterSpacing="1"
        fill="currentColor"
        direction="ltr"
      >
        R.I.G
      </text>
    </svg>
  );
}
