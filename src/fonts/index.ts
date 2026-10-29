import localFont from "next/font/local";

/** Self-hosted variable fonts: no runtime or build-time dependency on Google. */
export const vazirmatn = localFont({
  src: "./Vazirmatn-Variable.woff2",
  variable: "--font-vazir",
  weight: "100 900",
  display: "swap",
  fallback: ["Tahoma", "Arial", "sans-serif"],
});

export const manrope = localFont({
  src: "./Manrope-Variable.woff2",
  variable: "--font-latin",
  weight: "200 800",
  display: "swap",
  preload: false,
  fallback: ["system-ui", "Arial", "sans-serif"],
});
