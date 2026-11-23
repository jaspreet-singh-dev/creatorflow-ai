/**
 * CreatorFlow AI - Generative AI Thumbnail Graphics Engine
 * Dynamically designs and renders content-tailored visual thumbnail themes
 * according to video metadata like modern YouTube Studio AI tools.
 */

export interface GenerativeColorPalette {
  primaryAccent: string; // Main bold hook text color (#00F5A0, #FACC15, #00D8F6, #EF4444, #FFFFFF)
  secondaryAccent: string; // Badge & border accents
  glowColor: string; // Ambient lighting & particle effects
  backgroundMood: "obsidian_void" | "deep_navy" | "crimson_danger" | "emerald_neon" | "split_contrast" | "cyber_grid" | "solar_flare";
}

export interface GenerativeThemeSpecification {
  themeName: string;
  mood: string;
  hookText: string;
  badgeText: string;
  colorPalette: GenerativeColorPalette;
  visualFocalPoint: string;
  compositionLayout: string;
  graphicMotifs?: string[];
  aiImagePrompt?: string;
  ctrPredictionRationale?: string;
}

export interface ThumbnailRenderOptions {
  format: "long_form" | "shorts";
  textOverlay: string;
  topic?: string;
  videoTitle?: string;
  niche?: string;
  stylePreset?: "cyber_gaming" | "viral_hook" | "urgent_danger" | "hyper_mint" | "split_contrast";
  accentColor?: string;
  badgeText?: string;
  theme?: GenerativeThemeSpecification;
}

/**
 * Render dynamic graphic motifs based on video content and metadata
 */
function renderMotifs(motifs: string[] | undefined, width: number, height: number, isShorts: boolean, accent: string, glowColor: string): string {
  if (!motifs || motifs.length === 0) return "";

  let out = "";

  for (const motif of motifs) {
    if (motif === "minecraft_hearts") {
      // Pixelated Minecraft Health / Hearts bar in upper safe area
      const heartY = isShorts ? height * 0.22 : height * 0.24;
      const startX = isShorts ? width * 0.22 : width * 0.08;
      out += `
        <!-- Motif: Minecraft Hearts Bar -->
        <g transform="translate(${startX}, ${heartY}) scale(${isShorts ? 1.4 : 1.2})">
          ${Array.from({ length: 5 })
            .map(
              (_, i) => `
            <g transform="translate(${i * 28}, 0)">
              <rect x="0" y="4" width="8" height="8" fill="#EF4444" />
              <rect x="8" y="0" width="8" height="12" fill="#DC2626" />
              <rect x="16" y="4" width="8" height="8" fill="#EF4444" />
              <rect x="4" y="12" width="16" height="8" fill="#B91C1C" />
              <rect x="8" y="20" width="8" height="6" fill="#7F1D1D" />
              <rect x="2" y="2" width="4" height="4" fill="#FFFFFF" opacity="0.8" />
            </g>
          `
            )
            .join("")}
        </g>
      `;
    } else if (motif === "isometric_blocks") {
      // 3D Isometric Ore Blocks with glowing edges
      const blockX = isShorts ? width * 0.78 : width * 0.82;
      const blockY = isShorts ? height * 0.32 : height * 0.45;
      out += `
        <!-- Motif: 3D Isometric Ore Blocks -->
        <g transform="translate(${blockX}, ${blockY}) scale(${isShorts ? 1.3 : 1.5})" filter="url(#ambientGlow)">
          <polygon points="0,-40 35,-20 0,0 -35,-20" fill="${accent}" opacity="0.9" />
          <polygon points="-35,-20 0,0 0,40 -35,20" fill="#047857" />
          <polygon points="35,-20 0,0 0,40 35,20" fill="#065F46" />
          <!-- Inner Ore Highlights -->
          <circle cx="-10" cy="-8" r="4" fill="#FFFFFF" />
          <circle cx="12" cy="-14" r="3" fill="#FFFFFF" />
        </g>
      `;
    } else if (motif === "danger_hazard") {
      // Volumetric caution stripes & danger warning symbol
      const badgeY = isShorts ? height * 0.18 : height * 0.22;
      out += `
        <!-- Motif: Danger Caution Accents -->
        <g opacity="0.25">
          ${Array.from({ length: 8 })
            .map((_, i) => `<line x1="${i * 180}" y1="0" x2="${i * 180 + 300}" y2="${height}" stroke="#EF4444" stroke-width="36" stroke-dasharray="24,24" />`)
            .join("")}
        </g>
        <g transform="translate(${width * 0.85}, ${badgeY})">
          <polygon points="0,-40 36,24 -36,24" fill="none" stroke="#EF4444" stroke-width="8" stroke-linejoin="round" />
          <text x="0" y="16" font-family="Arial, sans-serif" font-weight="900" font-size="42" fill="#EF4444" text-anchor="middle">!</text>
        </g>
      `;
    } else if (motif === "viral_arrow") {
      // High-velocity curved neon arrow pointing to subject/text
      const arrowX = isShorts ? width * 0.75 : width * 0.72;
      const arrowY = isShorts ? height * 0.42 : height * 0.52;
      out += `
        <!-- Motif: Viral Neon Arrow -->
        <g transform="translate(${arrowX}, ${arrowY}) scale(${isShorts ? 1.2 : 1.4})" filter="url(#ambientGlow)">
          <path d="M -80 -60 Q 20 -90 40 -20 Q 50 10 10 30" fill="none" stroke="${accent}" stroke-width="14" stroke-linecap="round" />
          <polygon points="25,45 -10,32 5,0" fill="${accent}" />
        </g>
      `;
    } else if (motif === "analytics_surge") {
      // Exponential growth curve with glowing nodes
      const curveY = isShorts ? height * 0.65 : height * 0.75;
      out += `
        <!-- Motif: Analytics Growth Surge -->
        <g opacity="0.45" filter="url(#ambientGlow)">
          <path d="M 0 ${curveY} Q ${width * 0.4} ${curveY - 40} ${width * 0.7} ${curveY - 140} T ${width} ${curveY - 260}" fill="none" stroke="${accent}" stroke-width="8" stroke-dasharray="8,8" />
          <circle cx="${width * 0.7}" cy="${curveY - 140}" r="12" fill="${accent}" />
          <circle cx="${width * 0.7}" cy="${curveY - 140}" r="22" fill="none" stroke="${accent}" stroke-width="3" opacity="0.6" />
        </g>
      `;
    } else if (motif === "speed_particles") {
      // Volumetric warp speed lines
      out += `
        <!-- Motif: Speed Lines -->
        <g opacity="0.3">
          ${Array.from({ length: 12 })
            .map((_, i) => {
              const x1 = (i * width) / 12;
              const y1 = Math.random() * height * 0.4;
              return `<line x1="${x1}" y1="${y1}" x2="${x1 + 60}" y2="${y1 + 180}" stroke="${glowColor}" stroke-width="${i % 2 === 0 ? 3 : 6}" stroke-linecap="round" />`;
            })
            .join("")}
        </g>
      `;
    } else if (motif === "split_comparison") {
      // 50/50 comparison line with red X and green Check
      out += `
        <!-- Motif: Split Comparison Divider -->
        <line x1="${width * 0.5}" y1="0" x2="${width * 0.5}" y2="${height}" stroke="${accent}" stroke-width="8" stroke-dasharray="16,8" />
        <g transform="translate(${width * 0.25}, ${height * 0.25})">
          <circle cx="0" cy="0" r="36" fill="#EF4444" opacity="0.2" />
          <text x="0" y="14" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="#EF4444" text-anchor="middle">✕</text>
        </g>
        <g transform="translate(${width * 0.75}, ${height * 0.25})">
          <circle cx="0" cy="0" r="36" fill="#10B981" opacity="0.2" />
          <text x="0" y="14" font-family="Arial, sans-serif" font-weight="900" font-size="44" fill="#10B981" text-anchor="middle">✓</text>
        </g>
      `;
    } else if (motif === "timer_badge") {
      // Speedrun 0.01s frame window timer
      const timerY = isShorts ? height * 0.24 : height * 0.28;
      out += `
        <!-- Motif: Speedrun 0.01s Frame Window -->
        <g transform="translate(${width * 0.82}, ${timerY})">
          <rect x="-60" y="-20" width="120" height="40" rx="8" fill="#000000" stroke="${accent}" stroke-width="3" />
          <text x="0" y="7" font-family="'Courier New', monospace" font-weight="900" font-size="22" fill="${accent}" text-anchor="middle">0.01s</text>
        </g>
      `;
    }
  }

  return out;
}

/**
 * Generates an SVG thumbnail based on either a custom GenerativeThemeSpecification or preset
 */
export function generateThumbnailSvg(options: ThumbnailRenderOptions): string {
  const isShorts = options.format === "shorts";
  const width = isShorts ? 1080 : 1280;
  const height = isShorts ? 1920 : 720;

  const theme = options.theme;
  const text = (theme?.hookText || options.textOverlay || options.topic || "WATCH THIS!").toUpperCase().slice(0, 36);
  const words = text.split(" ");
  const line1 = words.slice(0, Math.ceil(words.length / 2)).join(" ") || text;
  const line2 = words.slice(Math.ceil(words.length / 2)).join(" ");

  // Color selection
  const accent = theme?.colorPalette.primaryAccent || options.accentColor || "#00F5A0";
  const badgeColor = theme?.colorPalette.secondaryAccent || "#00D8F6";
  const glowColor = theme?.colorPalette.glowColor || accent;
  const badge = (theme?.badgeText || options.badgeText || "NEW 2026").toUpperCase();

  const mood = theme?.colorPalette.backgroundMood || (options.stylePreset === "urgent_danger" ? "crimson_danger" : options.stylePreset === "cyber_gaming" ? "cyber_grid" : "obsidian_void");

  // Determine Background Gradient based on Generative Theme Mood
  let bgGradient = "";
  if (mood === "crimson_danger") {
    bgGradient = `
      <radialGradient id="themeBg" cx="40%" cy="50%" r="65%">
        <stop offset="0%" stop-color="#DC2626" stop-opacity="0.45" />
        <stop offset="70%" stop-color="#1F1115" stop-opacity="0.95" />
        <stop offset="100%" stop-color="#030508" stop-opacity="1" />
      </radialGradient>
    `;
  } else if (mood === "emerald_neon") {
    bgGradient = `
      <radialGradient id="themeBg" cx="60%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#00F5A0" stop-opacity="0.4" />
        <stop offset="50%" stop-color="#047857" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#030508" stop-opacity="1" />
      </radialGradient>
    `;
  } else if (mood === "solar_flare") {
    bgGradient = `
      <radialGradient id="themeBg" cx="50%" cy="30%" r="75%">
        <stop offset="0%" stop-color="#FFB800" stop-opacity="0.42" />
        <stop offset="55%" stop-color="#78350F" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#030508" stop-opacity="1" />
      </radialGradient>
    `;
  } else if (mood === "deep_navy") {
    bgGradient = `
      <radialGradient id="themeBg" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#00D8F6" stop-opacity="0.35" />
        <stop offset="60%" stop-color="#0B132B" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#030508" stop-opacity="1" />
      </radialGradient>
    `;
  } else {
    // obsidian_void / cyber_grid default
    bgGradient = `
      <radialGradient id="themeBg" cx="60%" cy="40%" r="70%">
        <stop offset="0%" stop-color="${glowColor}" stop-opacity="0.32" />
        <stop offset="45%" stop-color="#00D8F6" stop-opacity="0.18" />
        <stop offset="100%" stop-color="#030508" stop-opacity="1" />
      </radialGradient>
    `;
  }

  // Motifs to render
  const defaultMotifs = options.niche?.toLowerCase().includes("minecraft")
    ? ["minecraft_hearts", "isometric_blocks"]
    : options.stylePreset === "urgent_danger"
    ? ["danger_hazard"]
    : options.stylePreset === "split_contrast"
    ? ["split_comparison"]
    : ["viral_arrow", "speed_particles"];

  const motifsToRender = theme?.graphicMotifs && theme.graphicMotifs.length > 0 ? theme.graphicMotifs : defaultMotifs;
  const renderedMotifsSvg = renderMotifs(motifsToRender, width, height, isShorts, accent, glowColor);

  // Typography Coordinates strictly respecting Safe Zones
  const textX = isShorts ? width / 2 : width * 0.08;
  const textAnchor = isShorts ? "middle" : "start";
  const fontSize = isShorts ? 112 : 92;
  const textY1 = isShorts ? height * 0.42 : height * 0.58;
  const textY2 = textY1 + fontSize * 1.12;

  const badgeX = isShorts ? width / 2 : width * 0.08;
  const badgeY = isShorts ? height * 0.28 : height * 0.32;

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${bgGradient}
    <filter id="ambientGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Void Obsidian Base -->
  <rect width="${width}" height="${height}" fill="#030508" />
  <rect width="${width}" height="${height}" fill="url(#themeBg)" />

  <!-- Cyber Grid Background Pattern -->
  <g opacity="0.12">
    <path d="M 0 0 L ${width} ${height} M ${width} 0 L 0 ${height}" stroke="${accent}" stroke-width="2" />
    ${Array.from({ length: 8 })
      .map((_, i) => `<line x1="${(i * width) / 8}" y1="0" x2="${(i * width) / 8}" y2="${height}" stroke="#FFFFFF" stroke-width="1" />`)
      .join("")}
    ${Array.from({ length: 8 })
      .map((_, i) => `<line x1="0" y1="${(i * height) / 8}" x2="${width}" y2="${(i * height) / 8}" stroke="${accent}" stroke-width="1" />`)
      .join("")}
  </g>

  <!-- Generative Graphic Motifs -->
  ${renderedMotifsSvg}

  <!-- Neon Border Accent Frame -->
  <rect x="16" y="16" width="${width - 32}" height="${height - 32}" rx="24" fill="none" stroke="${accent}" stroke-width="3" opacity="0.35" />

  <!-- High-Impact Pill Badge -->
  <g transform="translate(${badgeX}, ${badgeY})">
    <rect x="${isShorts ? -120 : 0}" y="-34" width="240" height="48" rx="24" fill="${badgeColor}" />
    <text x="${isShorts ? 0 : 120}" y="-2" font-family="'Impact', 'Arial Black', sans-serif" font-weight="900" font-size="24" fill="#030508" text-anchor="middle" letter-spacing="2">
      ${badge}
    </text>
  </g>

  <!-- High-CTR Bold Hook Text Line 1 -->
  <text x="${textX}" y="${textY1}" font-family="'Impact', 'Arial Black', 'Trebuchet MS', sans-serif" font-weight="900" font-size="${fontSize}" fill="${accent}" text-anchor="${textAnchor}" letter-spacing="1" stroke="#000000" stroke-width="18" stroke-linejoin="round" paint-order="stroke fill">
    ${line1}
  </text>

  <!-- High-CTR Bold Hook Text Line 2 (if present) -->
  ${
    line2
      ? `
  <text x="${textX}" y="${textY2}" font-family="'Impact', 'Arial Black', 'Trebuchet MS', sans-serif" font-weight="900" font-size="${fontSize * 0.95}" fill="#FFFFFF" text-anchor="${textAnchor}" letter-spacing="1" stroke="#000000" stroke-width="18" stroke-linejoin="round" paint-order="stroke fill">
    ${line2}
  </text>
  `
      : ""
  }

  <!-- Platform Watermark -->
  <text x="${width - (isShorts ? 40 : 32)}" y="${isShorts ? height - 60 : height - 28}" font-family="sans-serif" font-weight="700" font-size="14" fill="#ffffff" opacity="0.35" text-anchor="end" letter-spacing="1">
    CREATORFLOW AI
  </text>
</svg>
  `.trim();
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
