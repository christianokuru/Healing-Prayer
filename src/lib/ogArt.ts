// Plain SVG markup of the chapel candles, for generated images (share image, icons).
// Mirrors components/ui/Candles.tsx; generated images cannot use React components or CSS classes.

function candle(x: number, height: number): string {
  const top = 380 - height;
  return [
    `<circle cx="${x}" cy="${top - 20}" r="46" fill="url(#g)"/>`,
    `<rect x="${x - 12}" y="${top}" width="24" height="${height}" rx="4" fill="#fbf1e2"/>`,
    `<rect x="${x - 12}" y="${top}" width="8" height="${height}" rx="3" fill="#efdcc4"/>`,
    `<path d="M${x} ${top}v-8" stroke="#3e2350" stroke-width="2"/>`,
    `<ellipse cx="${x}" cy="${top - 22}" rx="10" ry="18" fill="#ffd27a"/>`,
    `<ellipse cx="${x}" cy="${top - 18}" rx="5" ry="10" fill="#fff6d6"/>`,
  ].join("");
}

export const CHAPEL_SVG = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 420">`,
  `<defs><radialGradient id="g"><stop offset="0" stop-color="#ffd27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>`,
  `<linearGradient id="a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24142f"/><stop offset="1" stop-color="#4b2a5e"/></linearGradient></defs>`,
  `<path d="M30 410V170A140 140 0 0 1 310 170V410Z" fill="url(#a)" stroke="#f0c96a" stroke-opacity=".7" stroke-width="2"/>`,
  `<path d="M44 410V174A126 126 0 0 1 296 174V410" fill="none" stroke="#f0c96a" stroke-opacity=".35"/>`,
  `<path d="M170 70v70M150 92h40" stroke="#f0c96a" stroke-width="5" stroke-linecap="round"/>`,
  candle(110, 120),
  candle(170, 170),
  candle(230, 95),
  `<rect x="40" y="380" width="260" height="12" rx="3" fill="#c9962e"/>`,
  `<rect x="60" y="392" width="220" height="18" fill="#7a560f" opacity=".6"/>`,
  `</svg>`,
].join("");

/** Gold cross on plum with rounded corners: the site icon. */
export const ICON_SVG = [
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">`,
  `<rect width="64" height="64" rx="14" fill="#3e2350"/>`,
  `<path d="M32 12v40M21 24h22" stroke="#f0c96a" stroke-width="5.5" stroke-linecap="round"/>`,
  `</svg>`,
].join("");

export const svgDataUri = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`;
