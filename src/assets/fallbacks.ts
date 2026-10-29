/**
 * Reliable fallback assets for FOODORA (Black & Gold theme).
 * Provides both local paths (/images/*) and self-contained SVG Data URIs.
 */

export const SVG_DATA_URIS = {
  food: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#151B23"/>
      <stop offset="50%" stop-color="#111720"/>
      <stop offset="100%" stop-color="#0B0F14"/>
    </linearGradient>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8C66A"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#997A15"/>
    </linearGradient>
    <linearGradient id="steam" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#D4AF37" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="#E8C66A" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#bg)"/>
  <circle cx="200" cy="140" r="110" fill="#1C2530" stroke="#293241" stroke-width="2"/>
  <g transform="translate(200, 140)">
    <ellipse cx="0" cy="35" rx="75" ry="12" fill="#0B0F14" stroke="#293241" stroke-width="2"/>
    <ellipse cx="0" cy="32" rx="65" ry="8" fill="url(#gold)"/>
    <path d="M -50 25 A 50 42 0 0 1 50 25 Z" fill="#1C2530" stroke="url(#gold)" stroke-width="2.5"/>
    <circle cx="0" cy="-22" r="7" fill="url(#gold)"/>
    <path d="M -20 -28 C -24 -38 -12 -46 -18 -56" fill="none" stroke="url(#steam)" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M 0 -32 C -4 -42 8 -50 4 -62" fill="none" stroke="url(#steam)" stroke-width="3" stroke-linecap="round"/>
    <path d="M 20 -28 C 16 -38 28 -46 22 -56" fill="none" stroke="url(#steam)" stroke-width="2.5" stroke-linecap="round"/>
  </g>
  <text x="200" y="225" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="13" fill="#D4AF37" letter-spacing="2">FOODORA SPECIALTY</text>
  <text x="200" y="244" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="10" fill="#94A3B8">Authentic Ceylon Recipe</text>
</svg>
  `)}`,

  restaurant: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 350" width="100%" height="100%">
  <defs>
    <linearGradient id="restBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#151B23"/>
      <stop offset="60%" stop-color="#111720"/>
      <stop offset="100%" stop-color="#0B0F14"/>
    </linearGradient>
    <linearGradient id="restGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8C66A"/>
      <stop offset="50%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#997A15"/>
    </linearGradient>
  </defs>
  <rect width="600" height="350" fill="url(#restBg)"/>
  <line x1="0" y1="280" x2="600" y2="280" stroke="#293241" stroke-width="2"/>
  <g transform="translate(300, 155)">
    <rect x="-140" y="-70" width="280" height="150" rx="8" fill="#1C2530" stroke="#293241" stroke-width="2"/>
    <path d="M -150 -65 L -130 -105 L 130 -105 L 150 -65 Z" fill="url(#restGold)"/>
    <rect x="-80" y="-135" width="160" height="30" rx="6" fill="#0B0F14" stroke="url(#restGold)" stroke-width="2"/>
    <text x="0" y="-115" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="13" fill="#D4AF37" letter-spacing="2">FOODORA</text>
    <rect x="-30" y="5" width="60" height="75" rx="4" fill="#0B0F14" stroke="url(#restGold)" stroke-width="1.5"/>
    <line x1="0" y1="5" x2="0" y2="80" stroke="url(#restGold)" stroke-width="1.5"/>
    <circle cx="-6" cy="45" r="2.5" fill="url(#restGold)"/>
    <circle cx="6" cy="45" r="2.5" fill="url(#restGold)"/>
    <rect x="-115" y="-15" width="60" height="65" rx="4" fill="#111720" stroke="#293241" stroke-width="2"/>
    <rect x="-110" y="-10" width="50" height="55" rx="2" fill="#D4AF37" fill-opacity="0.15"/>
    <rect x="55" y="-15" width="60" height="65" rx="4" fill="#111720" stroke="#293241" stroke-width="2"/>
    <rect x="60" y="-10" width="50" height="55" rx="2" fill="#D4AF37" fill-opacity="0.15"/>
  </g>
  <text x="300" y="315" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="12" fill="#94A3B8" letter-spacing="1">PARTNER RESTAURANT • SRI LANKA</text>
</svg>
  `)}`,

  avatar: `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="100%" height="100%">
  <defs>
    <linearGradient id="avBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1C2530"/>
      <stop offset="100%" stop-color="#111720"/>
    </linearGradient>
    <linearGradient id="avGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E8C66A"/>
      <stop offset="50%" stop-color="#D4AF37"/>
    </linearGradient>
  </defs>
  <rect width="160" height="160" rx="80" fill="url(#avBg)" stroke="#293241" stroke-width="2"/>
  <circle cx="80" cy="58" r="28" fill="url(#avGold)"/>
  <path d="M 28 138 C 32 98 52 90 80 90 C 108 90 128 98 132 138 Z" fill="url(#avGold)"/>
</svg>
  `)}`,
};

export const FALLBACK_PATHS = {
  food: '/images/food-fallback.svg',
  restaurant: '/images/restaurant-fallback.svg',
  avatar: '/images/avatar-fallback.svg',
};
