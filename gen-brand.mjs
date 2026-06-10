import sharp from 'sharp';
import { writeFileSync } from 'fs';

const navy = '#0a192f', lightNavy = '#112240', lightestNavy = '#233554';
const slate = '#8892b0', lightSlate = '#a8b2d1', lightestSlate = '#ccd6f6';
const green = '#64ffda';

// ---------- OG IMAGE 1200x630 ----------
const og = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow1" cx="15%" cy="0%" r="75%">
      <stop offset="0%" stop-color="${green}" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="${green}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="100%" cy="100%" r="70%">
      <stop offset="0%" stop-color="#57cbff" stop-opacity="0.08"/>
      <stop offset="60%" stop-color="#57cbff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="${navy}"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  <!-- corner frame accents -->
  <path d="M64 96 L64 64 L96 64" stroke="${green}" stroke-width="3" fill="none" opacity="0.8"/>
  <path d="M1136 534 L1136 566 L1104 566" stroke="${green}" stroke-width="3" fill="none" opacity="0.8"/>
  <!-- mono label -->
  <text x="80" y="170" font-family="DejaVu Sans Mono, monospace" font-size="26" fill="${green}" letter-spacing="2">~/ eric.run.place</text>
  <!-- name -->
  <text x="76" y="320" font-family="DejaVu Serif, Liberation Serif, serif" font-size="120" font-weight="700" fill="${lightestSlate}" letter-spacing="-1">Eric Cao</text>
  <!-- english tagline -->
  <text x="80" y="392" font-family="DejaVu Serif, Liberation Serif, serif" font-size="40" fill="${lightSlate}">Big Data &amp; Full-Stack · focused on practical AI</text>
  <!-- chinese tagline -->
  <text x="80" y="450" font-family="Noto Sans CJK SC, Noto Sans CJK JP, sans-serif" font-size="34" fill="${slate}">大数据与全栈出身，专注 AI 怎么在企业落地</text>
  <!-- divider -->
  <rect x="80" y="500" width="320" height="2" fill="${lightestNavy}"/>
  <!-- tags -->
  <text x="80" y="556" font-family="DejaVu Sans Mono, monospace" font-size="24" fill="${slate}">AI Agent</text>
  <text x="248" y="556" font-family="DejaVu Sans Mono, monospace" font-size="24" fill="${slate}">Python</text>
  <text x="372" y="556" font-family="DejaVu Sans Mono, monospace" font-size="24" fill="${slate}">Open Source</text>
  <text x="560" y="556" font-family="DejaVu Sans Mono, monospace" font-size="24" fill="${slate}">@caoergou</text>
</svg>`;

await sharp(Buffer.from(og)).png().toFile('./public/og-image.png');
console.log('og-image.png written');

// ---------- AVATAR 512x512 ----------
const avatar = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${lightNavy}"/>
      <stop offset="100%" stop-color="${navy}"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#bg)"/>
  <rect x="14" y="14" width="484" height="484" rx="98" fill="none" stroke="${green}" stroke-width="4" opacity="0.55"/>
  <text x="256" y="256" font-family="DejaVu Serif, Liberation Serif, serif" font-size="240" font-weight="700" fill="${green}" text-anchor="middle" dominant-baseline="central" letter-spacing="-6">EC</text>
</svg>`;

await sharp(Buffer.from(avatar)).png().toFile('./public/avatar.png');
console.log('avatar.png written');
