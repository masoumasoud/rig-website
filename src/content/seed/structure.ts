/** Language-independent structure of the seed content. Texts live in ./<locale>.ts */

export const serviceSeed = [
  { slug: "cnc-milling", icon: "mill" },
  { slug: "cnc-turning", icon: "lathe" },
  { slug: "wire-edm", icon: "wire" },
  { slug: "grinding", icon: "grind" },
  { slug: "manual-machining", icon: "manual" },
  { slug: "welding", icon: "weld" },
  { slug: "drilling-tapping", icon: "drill" },
  { slug: "special-machines", icon: "machine" },
  { slug: "reverse-engineering", icon: "reverse" },
  { slug: "tooling-prototyping", icon: "mold" },
] as const;

export type ServiceSlug = (typeof serviceSeed)[number]["slug"];

/** Spec label keys; their translations live in each locale's seed file. */
export type SpecKey =
  | "workArea"
  | "precision"
  | "maxDiameter"
  | "maxLength"
  | "spindleBore"
  | "maxHeight"
  | "drillDiameter"
  | "autoTapping"
  | "tapRange"
  | "processes";

/** Spec values: `n` is a numeric/unit string formatted per locale, `t` a translation key. */
export type SpecValue = { n: string; unit?: "mm" | "cm" } | { t: string };

export const equipmentSeed: {
  key: string;
  kind: "machine" | "measure";
  drawing: string;
  precision?: string;
  specs: [SpecKey, SpecValue][];
}[] = [
  {
    key: "cncMill",
    kind: "machine",
    drawing: "mill",
    precision: "0.02",
    specs: [
      ["workArea", { n: "1000 × 500 × 500", unit: "mm" }],
      ["precision", { n: "0.02", unit: "mm" }],
    ],
  },
  {
    key: "cncLathe",
    kind: "machine",
    drawing: "lathe",
    precision: "0.02",
    specs: [
      ["maxDiameter", { n: "250", unit: "mm" }],
      ["maxLength", { n: "600", unit: "mm" }],
      ["spindleBore", { n: "75", unit: "mm" }],
      ["precision", { n: "0.02", unit: "mm" }],
    ],
  },
  {
    key: "wireCut",
    kind: "machine",
    drawing: "wire",
    precision: "0.01",
    specs: [
      ["workArea", { n: "700 × 300", unit: "mm" }],
      ["maxHeight", { n: "30", unit: "cm" }],
      ["precision", { n: "0.01", unit: "mm" }],
    ],
  },
  {
    key: "surfaceGrinder",
    kind: "machine",
    drawing: "grind",
    precision: "0.01",
    specs: [["precision", { n: "0.01", unit: "mm" }]],
  },
  {
    key: "cylGrinder",
    kind: "machine",
    drawing: "grind",
    precision: "0.01",
    specs: [["precision", { n: "0.01", unit: "mm" }]],
  },
  {
    key: "manualLathe",
    kind: "machine",
    drawing: "lathe",
    precision: "0.05",
    specs: [
      ["maxLength", { n: "1000", unit: "mm" }],
      ["precision", { n: "0.05", unit: "mm" }],
    ],
  },
  {
    key: "manualMill",
    kind: "machine",
    drawing: "mill",
    precision: "0.1",
    specs: [["precision", { n: "0.1", unit: "mm" }]],
  },
  {
    key: "columnDrill",
    kind: "machine",
    drawing: "drill",
    specs: [["drillDiameter", { n: "50", unit: "mm" }]],
  },
  {
    key: "tapping",
    kind: "machine",
    drawing: "drill",
    specs: [
      ["autoTapping", { n: "M16" }],
      ["tapRange", { n: 'M24 · 1"' }],
    ],
  },
  {
    key: "welding",
    kind: "machine",
    drawing: "weld",
    specs: [["processes", { t: "weldProcesses" }]],
  },
  { key: "calipers", kind: "measure", drawing: "caliper", specs: [] },
  { key: "micrometers", kind: "measure", drawing: "micrometer", specs: [] },
  { key: "boreGauges", kind: "measure", drawing: "bore", specs: [] },
  { key: "cmm", kind: "measure", drawing: "cmm", specs: [] },
];

export const pageKeys = ["home", "services", "equipment", "portfolio", "contact"] as const;
export type PageKey = (typeof pageKeys)[number];
