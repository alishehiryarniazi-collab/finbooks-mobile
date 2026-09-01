// Aurora dark-glass palette + shared spacing/radius tokens, mirrored from the web app
// (frontend/tailwind.config.js) so the mobile app looks like the same product.
// Centralising these means one place to tweak the whole look.

export const colors = {
  bg: "#05060a", // app background (near-black)
  bg2: "#04060d", // slightly darker panels / sidebars
  surface: "rgba(255,255,255,0.04)", // glass card fill
  border: "rgba(255,255,255,0.10)", // hairline borders

  teal: "#12b39a",
  mint: "#5ff0d4", // primary accent (buttons, active states)
  violet: "#7b5cff",
  blue: "#0891ff",

  text: "#e2e8f0", // slate-200
  textMuted: "#94a3b8", // slate-400
  textFaint: "#64748b", // slate-500

  danger: "#fb7185", // rose-400
  success: "#34d399", // emerald-400
  warning: "#fbbf24", // amber-400
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 10, md: 14, lg: 20, pill: 9999 } as const;
