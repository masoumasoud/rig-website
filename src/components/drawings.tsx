/**
 * Blueprint-style line drawings of the workshop machines. Every stroke uses
 * pathLength=1 so `.draw` can trace it when it scrolls into view.
 */

type DP = { d: string; i?: number; thin?: boolean };
const P = ({ d, i = 0, thin }: DP) => (
  <path d={d} pathLength={1} style={{ ["--i" as string]: i }} strokeWidth={thin ? 1 : 2} />
);

/** Dimension line with end ticks and a centred label. */
function Dim({ x1, y1, x2, y2, label, i = 8 }: { x1: number; y1: number; x2: number; y2: number; label: string; i?: number }) {
  const horizontal = Math.abs(y2 - y1) < Math.abs(x2 - x1);
  const t = 4;
  const ticks = horizontal
    ? `M${x1} ${y1 - t}v${t * 2}M${x2} ${y2 - t}v${t * 2}`
    : `M${x1 - t} ${y1}h${t * 2}M${x2 - t} ${y2}h${t * 2}`;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  return (
    <g className="text-accent" stroke="currentColor">
      <P d={`M${x1} ${y1}L${x2} ${y2}${ticks}`} i={i} thin />
      <text
        x={horizontal ? mx : mx - 6}
        y={horizontal ? my - 6 : my}
        fill="currentColor"
        stroke="none"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
        textAnchor="middle"
        direction="ltr"
        transform={horizontal ? undefined : `rotate(-90 ${mx - 6} ${my})`}
      >
        {label}
      </text>
    </g>
  );
}

const drawings: Record<string, React.ReactNode> = {
  mill: (
    <>
      <P d="M40 140h160v12H40z" i={0} />
      <P d="M150 140V30h30v110" i={1} />
      <P d="M110 30h70v34h-70z" i={2} />
      <P d="M128 64h22v14h-22z" i={3} />
      <P d="M136 78h6v22l-3 6-3-6z" i={4} />
      <P d="M60 118h120v10H60zM70 112h40v6H70z" i={5} />
      <P d="M136 84l6-3M136 90l6-3M136 96l6-3" i={6} thin />
      <Dim x1={60} y1={108} x2={180} y2={108} label="1000" />
      <Dim x1={196} y1={64} x2={196} y2={128} label="500" i={9} />
    </>
  ),
  lathe: (
    <>
      <P d="M20 120h200v10H20zM34 130v20M206 130v20" i={0} />
      <P d="M24 60h46v60H24z" i={1} />
      <P d="M70 74h14v32H70z" i={2} />
      <P d="M84 82h96v16H84z" i={3} />
      <P d="M180 70h30v50h-30zM166 86h14v8h-14z" i={4} />
      <P d="M120 98l8 14h-16z" i={5} />
      <P d="M84 90h96" i={6} thin />
      <Dim x1={84} y1={70} x2={180} y2={70} label="600" />
      <Dim x1={104} y1={82} x2={104} y2={98} label="Ø250" i={9} />
    </>
  ),
  wire: (
    <>
      <P d="M30 20h140v14H30zM30 126h140v14H30z" i={0} />
      <P d="M170 20h30v120h-30" i={1} />
      <P d="M60 34v92" i={2} />
      <P d="M40 70h90v24H40z" i={3} />
      <P d="M60 70l14 6-6 8 10 10" i={4} thin />
      <circle cx="60" cy="34" r="5" pathLength={1} strokeWidth={2} style={{ ["--i" as string]: 5 }} />
      <circle cx="60" cy="126" r="5" pathLength={1} strokeWidth={2} style={{ ["--i" as string]: 5 }} />
      <Dim x1={40} y1={110} x2={130} y2={110} label="700" />
      <Dim x1={216} y1={34} x2={216} y2={126} label="300" i={9} />
    </>
  ),
  grind: (
    <>
      <P d="M30 128h180v20H30z" i={0} />
      <P d="M50 110h140v18H50z" i={1} />
      <circle cx="120" cy="66" r="34" pathLength={1} strokeWidth={2} style={{ ["--i" as string]: 2 }} />
      <circle cx="120" cy="66" r="6" pathLength={1} strokeWidth={2} style={{ ["--i" as string]: 3 }} />
      <P d="M80 66a40 40 0 0 1 80 0" i={4} />
      <P d="M84 100h72v10H84z" i={5} />
      <P d="M70 104h10M160 104h10" i={6} thin />
      <Dim x1={84} y1={94} x2={156} y2={94} label="0.01" />
    </>
  ),
  drill: (
    <>
      <P d="M50 136h140v14H50z" i={0} />
      <P d="M70 136V20h16v116" i={1} />
      <P d="M86 30h84v36H86z" i={2} />
      <P d="M136 66h14v12h-14z" i={3} />
      <P d="M140 78h6v34l-3 6-3-6z" i={4} />
      <P d="M110 120h70v16h-70z" i={5} />
      <P d="M140 86l6-3M140 94l6-3M140 102l6-3" i={6} thin />
      <Dim x1={140} y1={128} x2={180} y2={128} label="Ø50" />
    </>
  ),
  weld: (
    <>
      <P d="M30 120h90v16H30zM120 120h90v16h-90z" i={0} />
      <P d="M164 30l-40 76" i={1} />
      <P d="M170 22l-12 22-8-4 12-22z" i={2} />
      <P d="M124 106l-4 12M116 112l8 4M128 112l-8 4" i={3} />
      <P d="M110 118c4-6 16-6 20 0" i={4} thin />
      <Dim x1={30} y1={150} x2={210} y2={150} label="TIG · LASER" />
    </>
  ),
  caliper: (
    <>
      <P d="M20 60h200v14H20z" i={0} />
      <P d="M20 74v50h14V74" i={1} />
      <P d="M60 50h40v34H60zM60 84v40h14V84" i={2} />
      <P d="M66 56h28v14H66z" i={3} thin />
      <P d="M110 66h100M120 62v8M140 62v8M160 62v8M180 62v8M200 62v8" i={4} thin />
      <P d="M20 60V36h10v24" i={5} />
    </>
  ),
  micrometer: (
    <>
      <P d="M40 40h20v60a30 30 0 0 0 30 30h40a30 30 0 0 0 30-30V40h0" i={0} />
      <P d="M60 64h40" i={1} />
      <P d="M160 56h20v16h-20z" i={2} />
      <P d="M180 52h40v24h-40z" i={3} />
      <P d="M186 52v24M194 52v24M202 52v24M210 52v24" i={4} thin />
      <P d="M100 58v12" i={5} />
    </>
  ),
  bore: (
    <>
      <circle cx="120" cy="40" r="26" pathLength={1} strokeWidth={2} style={{ ["--i" as string]: 0 }} />
      <P d="M120 40l14-12" i={1} />
      <P d="M114 66h12v64h-12z" i={2} />
      <P d="M100 130h40v10h-40z" i={3} />
      <P d="M96 135h-8M144 135h8" i={4} thin />
    </>
  ),
  cmm: (
    <>
      <P d="M20 128h200v20H20z" i={0} />
      <P d="M40 128V34h12v94M188 128V34h12v94" i={1} />
      <P d="M40 30h160v14H40z" i={2} />
      <P d="M110 44h20v30h-20z" i={3} />
      <P d="M120 74v30" i={4} />
      <circle cx="120" cy="108" r="4" pathLength={1} strokeWidth={2} style={{ ["--i" as string]: 5 }} />
      <P d="M86 116h68v12H86z" i={6} />
    </>
  ),
};

export function Drawing({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 240 160"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`draw ${className ?? ""}`}
      aria-hidden="true"
    >
      {drawings[name] ?? drawings.mill}
    </svg>
  );
}
