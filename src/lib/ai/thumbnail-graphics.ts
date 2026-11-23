/**
 * CreatorFlow AI - AI Thumbnail Graphics Engine
 * Generates ultra-high-CTR SVG compositions and visual thumbnail assets
 * optimized for YouTube Long-Form (16:9, 1280x720) and YouTube Shorts (9:16, 1080x1920).
 */

export interface ThumbnailRenderOptions {
  format: "long_form" | "shorts";
  textOverlay: string;
  topic?: string;
  videoTitle?: string;
  niche?: string;
  stylePreset?: "cyber_gaming" | "viral_hook" | "urgent_danger" | "hyper_mint" | "split_contrast";
  accentColor?: string;
  badgeText?: string;
}

export function generateThumbnailSvg(options: ThumbnailRenderOptions): string {
  const isShorts = options.format === "shorts";
  const width = isShorts ? 1080 : 1280;
  const height = isShorts ? 1920 : 720;
  
  const text = (options.textOverlay || options.topic || "WATCH THIS!").toUpperCase().slice(0, 32);
  const words = text.split(" ");
  const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ") || text;
  const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");

  const preset = options.stylePreset || (options.niche?.toLowerCase().includes("minecraft") ? "cyber_gaming" : "hyper_mint");
  const accent = options.accentColor || (preset === "hyper_mint" ? "#00F5A0" : preset === "cyber_gaming" ? "#00D8F6" : "#FFB800");

  // Determine styling gradients & visual accents based on preset
  let bgGradientDef = "";
  let accentGraphics = "";
  let badgeColor = "#DC2626";

  if (preset === "cyber_gaming") {
    badgeColor = "#00F5A0";
    bgGradientDef = `
      <defs>
        <radialGradient id="cyberGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#00D8F6" stop-opacity="0.35" />
          <stop offset="60%" stop-color="#0B132B" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#030508" stop-opacity="1" />
        </radialGradient>
        <linearGradient id="neonBar" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00F5A0" />
          <stop offset="50%" stop-color="#00D8F6" />
          <stop offset="100%" stop-color="#A855F7" />
        </linearGradient>
        <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    `;
    accentGraphics = `
      <!-- Cyber Gaming Grid -->
      <g opacity="0.18">
        <path d="M 0 0 L ${width} ${height} M ${width} 0 L 0 ${height}" stroke="#00D8F6" stroke-width="2" />
        ${Array.from({ length: 8 })
          .map((_, i) => `<line x1="${(i * width) / 8}" y1="0" x2="${(i * width) / 8}" y2="${height}" stroke="#00F5A0" stroke-width="1" />`)
          .join("")}
        ${Array.from({ length: 8 })
          .map((_, i) => `<line x1="0" y1="${(i * height) / 8}" x2="${width}" y2="${(i * height) / 8}" stroke="#00D8F6" stroke-width="1" />`)
          .join("")}
      </g>
      <!-- Isometric Glowing Blocks (Minecraft / Gaming aesthetic) -->
      <g filter="url(#glowFilter)" opacity="0.85">
        <polygon points="${width * 0.15},${height * 0.25} ${width * 0.22},${height * 0.21} ${width * 0.29},${height * 0.25} ${width * 0.22},${height * 0.29}" fill="#00F5A0" opacity="0.8" />
        <polygon points="${width * 0.15},${height * 0.25} ${width * 0.22},${height * 0.29} ${width * 0.22},${height * 0.38} ${width * 0.15},${height * 0.34}" fill="#059669" />
        <polygon points="${width * 0.29},${height * 0.25} ${width * 0.22},${height * 0.29} ${width * 0.22},${height * 0.38} ${width * 0.29},${height * 0.34}" fill="#10B981" />
      </g>
      <rect x="0" y="${height - 12}" width="${width}" height="12" fill="url(#neonBar)" />
    `;
  } else if (preset === "urgent_danger") {
    badgeColor = "#EF4444";
    bgGradientDef = `
      <defs>
        <radialGradient id="dangerGlow" cx="40%" cy="50%" r="65%">
          <stop offset="0%" stop-color="#DC2626" stop-opacity="0.45" />
          <stop offset="70%" stop-color="#1F1115" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#050203" stop-opacity="1" />
        </radialGradient>
        <linearGradient id="warningStripe" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FACC15" />
          <stop offset="100%" stop-color="#DC2626" />
        </linearGradient>
      </defs>
    `;
    accentGraphics = `
      <!-- Danger Warning Accents -->
      <g opacity="0.25">
        ${Array.from({ length: 12 })
          .map((_, i) => `<line x1="${i * 120}" y1="0" x2="${i * 120 + 200}" y2="${height}" stroke="#DC2626" stroke-width="24" stroke-dasharray="20,20" />`)
          .join("")}
      </g>
      <!-- Glowing Red Warning Triangle -->
      <polygon points="${width * 0.85},${height * 0.2} ${width * 0.92},${height * 0.32} ${width * 0.78},${height * 0.32}" fill="none" stroke="#EF4444" stroke-width="12" />
      <text x="${width * 0.85}" y="${height * 0.3}" font-family="Arial, sans-serif" font-weight="900" font-size="${isShorts ? 64 : 48}" fill="#EF4444" text-anchor="middle">!</text>
    `;
  } else if (preset === "split_contrast") {
    badgeColor = "#3B82F6";
    bgGradientDef = `
      <defs>
        <linearGradient id="splitLeft" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1E1B4B" />
          <stop offset="100%" stop-color="#030712" />
        </linearGradient>
        <linearGradient id="splitRight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#064E3B" />
          <stop offset="100%" stop-color="#022C22" />
        </linearGradient>
      </defs>
    `;
    accentGraphics = `
      <rect x="0" y="0" width="${width * 0.5}" height="${height}" fill="url(#splitLeft)" />
      <rect x="${width * 0.5}" y="0" width="${width * 0.5}" height="${height}" fill="url(#splitRight)" />
      <line x1="${width * 0.5}" y1="0" x2="${width * 0.5}" y2="${height}" stroke="#FACC15" stroke-width="8" stroke-dasharray="16,8" />
      <!-- Left side Cross and Right side Check -->
      <text x="${width * 0.25}" y="${height * 0.25}" font-family="Arial, sans-serif" font-weight="900" font-size="${isShorts ? 100 : 72}" fill="#EF4444" text-anchor="middle">✕</text>
      <text x="${width * 0.75}" y="${height * 0.25}" font-family="Arial, sans-serif" font-weight="900" font-size="${isShorts ? 100 : 72}" fill="#10B981" text-anchor="middle">✓</text>
    `;
  } else {
    // Hyper-Mint Aurora Default
    badgeColor = "#00F5A0";
    bgGradientDef = `
      <defs>
        <radialGradient id="mintAurora" cx="60%" cy="40%" r="70%">
          <stop offset="0%" stop-color="#00F5A0" stop-opacity="0.32" />
          <stop offset="45%" stop-color="#00D8F6" stop-opacity="0.18" />
          <stop offset="100%" stop-color="#030508" stop-opacity="1" />
        </radialGradient>
        <linearGradient id="mintStreak" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#00F5A0" />
          <stop offset="100%" stop-color="#00D8F6" />
        </linearGradient>
      </defs>
    `;
    accentGraphics = `
      <!-- Ambient Aurora Glow Circles -->
      <circle cx="${width * 0.75}" cy="${height * 0.35}" r="${width * 0.35}" fill="#00F5A0" opacity="0.12" filter="blur(60px)" />
      <circle cx="${width * 0.2}" cy="${height * 0.7}" r="${width * 0.25}" fill="#00D8F6" opacity="0.15" filter="blur(50px)" />
      <!-- Neon Border Accent -->
      <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="24" fill="none" stroke="#00F5A0" stroke-width="4" opacity="0.4" />
    `;
  }

  // Typography Coordinates
  // Long-form (16:9, 1280x720): Text in left/center safe zone
  // Shorts (9:16, 1080x1920): Text centered vertically between 25% and 65%
  const textX = isShorts ? width / 2 : width * 0.08;
  const textAnchor = isShorts ? "middle" : "start";
  const fontSize = isShorts ? 112 : 92;
  const textY1 = isShorts ? height * 0.42 : height * 0.58;
  const textY2 = textY1 + fontSize * 1.12;

  const badgeX = isShorts ? width / 2 : width * 0.08;
  const badgeY = isShorts ? height * 0.28 : height * 0.32;
  const badge = options.badgeText || (preset === "urgent_danger" ? "DO NOT" : "NEW 2026");

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${bgGradientDef}
  <!-- Base Background -->
  <rect width="${width}" height="${height}" fill="#030508" />
  <rect width="${width}" height="${height}" fill="url(#${preset === 'cyber_gaming' ? 'cyberGlow' : preset === 'urgent_danger' ? 'dangerGlow' : 'mintAurora'})" />
  
  <!-- Accent Visual Graphics -->
  ${accentGraphics}

  <!-- Pill Badge -->
  <g transform="translate(${badgeX}, ${badgeY})">
    <rect x="${isShorts ? -120 : 0}" y="-34" width="240" height="48" rx="24" fill="${badgeColor}" />
    <text x="${isShorts ? 0 : 120}" y="-2" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="24" fill="#030508" text-anchor="middle" letter-spacing="2">
      ${badge}
    </text>
  </g>

  <!-- High-CTR Bold Text Line 1 -->
  <text x="${textX}" y="${textY1}" font-family="'Impact', 'Arial Black', 'Trebuchet MS', sans-serif" font-weight="900" font-size="${fontSize}" fill="${accent}" text-anchor="${textAnchor}" letter-spacing="1" stroke="#000000" stroke-width="16" stroke-linejoin="round" paint-order="stroke fill">
    ${line1}
  </text>

  <!-- High-CTR Bold Text Line 2 (if present) -->
  ${
    line2
      ? `
  <text x="${textX}" y="${textY2}" font-family="'Impact', 'Arial Black', 'Trebuchet MS', sans-serif" font-weight="900" font-size="${fontSize * 0.95}" fill="#FFFFFF" text-anchor="${textAnchor}" letter-spacing="1" stroke="#000000" stroke-width="16" stroke-linejoin="round" paint-order="stroke fill">
    ${line2}
  </text>
  `
      : ""
  }

  <!-- Platform Signature / Watermark -->
  <text x="${width - (isShorts ? 40 : 32)}" y="${isShorts ? height - 60 : height - 28}" font-family="sans-serif" font-weight="700" font-size="14" fill="#ffffff" opacity="0.4" text-anchor="end" letter-spacing="1">
    CREATORFLOW AI
  </text>
</svg>
  `.trim();

  return svgContent;
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
