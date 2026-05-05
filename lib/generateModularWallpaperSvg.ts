import {
  DotShape,
  MarkerStyle,
  ModularWallpaperConfig,
  TimeGridConfig,
} from "./wallpaperConfig";
import { resolveWallpaperTheme } from "./resolveWallpaperTheme";
import TextToSVG from "text-to-svg";
import path from "node:path";

const weeksPerYear = 52;
const millisecondsPerDay = 1000 * 60 * 60 * 24;
const millisecondsPerWeek = millisecondsPerDay * 7;
const labelFontPath = path.join(process.cwd(), "node_modules", "text-to-svg", "fonts", "ipag.ttf");
const labelTextToSvg = TextToSVG.loadSync(labelFontPath);

type DotGrid = {
  total: number;
  elapsed: number;
  current: number;
  columns: number;
  rows: number;
  unit: "weeks" | "days";
};

type FittedDots = {
  diameter: number;
  gap: number;
  gapX: number;
  gapY: number;
  radius: number;
  width: number;
  height: number;
  x: number;
  y: number;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function dayStartUtc(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function parseDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

function daysBetween(start: Date, end: Date) {
  return Math.floor((dayStartUtc(end) - dayStartUtc(start)) / millisecondsPerDay);
}

function weeksBetween(start: Date, end: Date) {
  return Math.floor((dayStartUtc(end) - dayStartUtc(start)) / millisecondsPerWeek);
}

function resolveColumns(total: number, grid: TimeGridConfig, frameRatio: number) {
  if (grid.type === "life") {
    return Math.min(weeksPerYear, total);
  }

  if (grid.type === "year") {
    return Math.max(10, Math.min(total, Math.round(Math.sqrt(total * frameRatio))));
  }

  if (grid.type === "goal") {
    if (total <= 10) {
      return total;
    }

    if (total <= 20) {
      return 5;
    }

    if (total <= 31) {
      return 6;
    }

    if (total <= 100) {
      return 10;
    }

    return Math.max(10, Math.min(total, Math.round(Math.sqrt(total * frameRatio))));
  }

  return Math.max(1, Math.min(total, Math.round(Math.sqrt(total * frameRatio))));
}

function fitDots(total: number, columns: number, grid: TimeGridConfig): FittedDots {
  const frame = grid.frame;
  const reservedLabelSpace = Math.max(34, Math.min(58, frame.width / 22));
  const drawableHeight = Math.max(40, frame.height - reservedLabelSpace);
  const rows = Math.ceil(total / columns);
  const desiredDiameter = Math.max(2, grid.dotSize);
  const desiredGap = Math.max(0, grid.dotGap);
  const desiredWidth = columns * desiredDiameter + Math.max(0, columns - 1) * desiredGap;
  const desiredHeight = rows * desiredDiameter + Math.max(0, rows - 1) * desiredGap;
  const scale = Math.min(1, frame.width / desiredWidth, drawableHeight / desiredHeight);
  const diameter = Math.max(2, Math.floor(desiredDiameter * scale));
  const gap = Math.max(0, Math.floor(desiredGap * scale));
  const radius = diameter / 2;
  const width = columns * diameter + Math.max(0, columns - 1) * gap;
  const height = rows * diameter + Math.max(0, rows - 1) * gap;
  const centeredY = frame.y + Math.max(0, (frame.height - height) / 2);
  const anchoredY = frame.y + Math.max(0, Math.min(24, frame.height - height - reservedLabelSpace));

  return {
    diameter,
    gap,
    gapX: gap,
    gapY: gap,
    radius,
    width,
    height,
    x: frame.x + Math.max(0, (frame.width - width) / 2),
    y: grid.type === "goal" ? anchoredY : centeredY,
  };
}

function lifeGrid(config: ModularWallpaperConfig, now: Date): DotGrid {
  const total = config.lifeYears * weeksPerYear;
  const elapsed = Math.min(total, Math.max(0, weeksBetween(parseDate(config.birthDate), now)));

  return {
    total,
    elapsed,
    current: Math.min(total - 1, Math.max(0, elapsed)),
    columns: weeksPerYear,
    rows: config.lifeYears,
    unit: "weeks",
  };
}

function goalGrid(grid: TimeGridConfig, now: Date): DotGrid {
  const start = grid.startDate ? parseDate(grid.startDate) : now;
  const target = parseDate(grid.targetDate ?? new Date(Date.now() + millisecondsPerDay * 365).toISOString().slice(0, 10));
  const total = Math.max(1, daysBetween(start, target));
  const elapsed = Math.min(total, Math.max(0, daysBetween(start, now)));
  const frameRatio = grid.frame.width / grid.frame.height;
  const columns = resolveColumns(total, grid, frameRatio);

  return {
    total,
    elapsed,
    current: Math.min(total - 1, Math.max(0, elapsed)),
    columns,
    rows: Math.ceil(total / columns),
    unit: "days",
  };
}

function yearGrid(grid: TimeGridConfig, now: Date): DotGrid {
  const start = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  const end = new Date(Date.UTC(now.getUTCFullYear() + 1, 0, 1));
  const total = daysBetween(start, end);
  const elapsed = Math.min(total, Math.max(0, daysBetween(start, now)));
  const frameRatio = grid.frame.width / grid.frame.height;
  const columns = resolveColumns(total, grid, frameRatio);

  return {
    total,
    elapsed,
    current: Math.min(total - 1, Math.max(0, elapsed)),
    columns,
    rows: Math.ceil(total / columns),
    unit: "days",
  };
}

function buildGridModel(config: ModularWallpaperConfig, grid: TimeGridConfig, now: Date) {
  if (grid.type === "goal") {
    return goalGrid(grid, now);
  }

  if (grid.type === "year") {
    return yearGrid(grid, now);
  }

  return lifeGrid(config, now);
}

function resolveGridTheme(config: ModularWallpaperConfig, grid: TimeGridConfig) {
  const theme = resolveWallpaperTheme(config);

  return {
    ...theme,
    filled: grid.colors.filled ?? theme.filled,
    empty: grid.colors.empty ?? theme.empty,
    current: grid.colors.current ?? theme.current,
    label: grid.colors.label ?? theme.label,
  };
}

function markerDot(options: {
  cx: number;
  cy: number;
  radius: number;
  color: string;
  markerStyle: MarkerStyle;
  shape: DotShape;
}) {
  if (options.shape === "hex") {
    const points = polygonPoints(options.cx, options.cy, options.radius * 1.18, 6, -30);

    if (options.markerStyle === "ring") {
      return `<polygon points="${points}" fill="transparent" stroke="${escapeXml(
        options.color,
      )}" stroke-width="${Math.max(2, options.radius * 0.38)}" /><line x1="${options.cx - options.radius * 1.9}" y1="${options.cy}" x2="${options.cx - options.radius * 1.15}" y2="${options.cy}" stroke="${escapeXml(
        options.color,
      )}" stroke-width="${Math.max(1.5, options.radius * 0.22)}" /><line x1="${options.cx + options.radius * 1.15}" y1="${options.cy}" x2="${options.cx + options.radius * 1.9}" y2="${options.cy}" stroke="${escapeXml(
        options.color,
      )}" stroke-width="${Math.max(1.5, options.radius * 0.22)}" />`;
    }

    return `<polygon points="${polygonPoints(options.cx, options.cy, options.radius * 2.05, 6, -30)}" fill="${escapeXml(
      options.color,
    )}" opacity="0.2" /><polygon points="${points}" fill="${escapeXml(
      options.color,
    )}" /><circle cx="${options.cx}" cy="${options.cy}" r="${Math.max(1.5, options.radius * 0.34)}" fill="#f8f32b" />`;
  }

  if (options.markerStyle === "ring") {
    return `<circle cx="${options.cx}" cy="${options.cy}" r="${options.radius}" fill="transparent" stroke="${escapeXml(
      options.color,
    )}" stroke-width="${Math.max(2, options.radius * 0.45)}" />`;
  }

  if (options.markerStyle === "glow") {
    return `<circle cx="${options.cx}" cy="${options.cy}" r="${options.radius * 1.9}" fill="${escapeXml(
      options.color,
    )}" opacity="0.24" /><circle cx="${options.cx}" cy="${options.cy}" r="${options.radius}" fill="${escapeXml(
      options.color,
    )}" />`;
  }

  return `<circle cx="${options.cx}" cy="${options.cy}" r="${options.radius}" fill="${escapeXml(
    options.color,
  )}" />`;
}

function polygonPoints(cx: number, cy: number, radius: number, sides: number, rotation = 0) {
  return Array.from({ length: sides }, (_, index) => {
    const angle = ((Math.PI * 2) / sides) * index + (rotation * Math.PI) / 180;

    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
}

function renderShape(options: {
  shape: DotShape;
  cx: number;
  cy: number;
  radius: number;
  color: string;
}) {
  const fill = escapeXml(options.color);
  const diameter = options.radius * 2;

  if (options.shape === "rounded") {
    return `<rect x="${options.cx - options.radius}" y="${options.cy - options.radius}" width="${diameter}" height="${diameter}" rx="${Math.max(
      2,
      options.radius * 0.38,
    )}" fill="${fill}" />`;
  }

  if (options.shape === "hex") {
    return `<polygon points="${polygonPoints(
      options.cx,
      options.cy,
      options.radius,
      6,
      -30,
    )}" fill="${fill}" />`;
  }

  if (options.shape === "pill") {
    return `<rect x="${options.cx - options.radius * 1.18}" y="${options.cy - options.radius * 0.62}" width="${diameter * 1.18}" height="${diameter * 1.24}" rx="${options.radius}" fill="${fill}" />`;
  }

  return `<circle cx="${options.cx}" cy="${options.cy}" r="${options.radius}" fill="${fill}" />`;
}

function renderDots(config: ModularWallpaperConfig, grid: TimeGridConfig, model: DotGrid, fit: FittedDots) {
  const theme = resolveGridTheme(config, grid);
  const dots: string[] = [];

  for (let index = 0; index < model.total; index += 1) {
    const cx = fit.x + (index % model.columns) * (fit.diameter + fit.gapX) + fit.radius;
    const cy = fit.y + Math.floor(index / model.columns) * (fit.diameter + fit.gapY) + fit.radius;

    if (index === model.current) {
      dots.push(
        markerDot({
          cx,
          cy,
          radius: fit.radius,
          color: theme.current,
          markerStyle: config.markerStyle,
          shape: theme.shape,
        }),
      );
      continue;
    }

    dots.push(
      renderShape({
        shape: theme.shape,
        cx,
        cy,
        radius: fit.radius,
        color: index < model.elapsed ? theme.filled : theme.empty,
      }),
    );
  }

  return dots.join("");
}

function pluralize(value: number, unit: DotGrid["unit"]) {
  const singular = unit === "weeks" ? "week" : "day";

  return `${value.toLocaleString("en-US")} ${value === 1 ? singular : `${singular}s`}`;
}

function labelText(grid: TimeGridConfig, model: DotGrid) {
  if (grid.label === "hidden") {
    return "";
  }

  if (grid.label === "custom") {
    return grid.customLabel ?? "";
  }

  if (grid.label === "remaining") {
    return `${pluralize(Math.max(0, model.total - model.elapsed), model.unit)} left`;
  }

  if (grid.label === "elapsed") {
    return `${pluralize(model.elapsed, model.unit)} elapsed`;
  }

  return `${Math.round((model.elapsed / model.total) * 1000) / 10}% complete`;
}

function renderLabel(config: ModularWallpaperConfig, grid: TimeGridConfig, model: DotGrid, fit: FittedDots) {
  const text = labelText(grid, model);

  if (!text) {
    return "";
  }

  const theme = resolveGridTheme(config, grid);
  const fontSize = Math.max(14, Math.min(28, grid.frame.width / 34));
  const y = Math.min(grid.frame.y + grid.frame.height - 8, fit.y + fit.height + fontSize * 2.35);

  return labelTextToSvg.getPath(text, {
    x: grid.frame.x + grid.frame.width / 2,
    y,
    fontSize,
    anchor: "center top",
    attributes: {
      fill: escapeXml(theme.label),
      opacity: 0.68,
    },
  });
}

function renderGrid(config: ModularWallpaperConfig, grid: TimeGridConfig, now: Date) {
  const model = buildGridModel(config, grid, now);
  const frameRatio = grid.frame.width / grid.frame.height;
  const columns = grid.type === "life" ? model.columns : resolveColumns(model.total, grid, frameRatio);
  const fit = fitDots(model.total, columns, grid);

  const renderedGrid = `${renderDots(config, grid, { ...model, columns }, fit)}${renderLabel(
    config,
    grid,
    model,
    fit,
  )}`;

  if (grid.rotation === 0) {
    return renderedGrid;
  }

  const centerX = grid.frame.x + grid.frame.width / 2;
  const centerY = grid.frame.y + grid.frame.height / 2;

  return `<g transform="rotate(${grid.rotation} ${centerX} ${centerY})">${renderedGrid}</g>`;
}

function renderBackground(config: ModularWallpaperConfig) {
  const theme = resolveWallpaperTheme(config);
  const { width, height } = config.canvas;

  if (theme.name !== "neon") {
    return `<rect width="100%" height="100%" fill="${escapeXml(theme.background)}" />`;
  }

  const circuitY = Math.round(height * 0.17);
  const lowerCircuitY = Math.round(height * 0.82);
  const midX = Math.round(width * 0.58);

  return `<defs>
    <radialGradient id="neonGlowA" cx="22%" cy="18%" r="62%">
      <stop offset="0%" stop-color="#d946ef" stop-opacity="0.28" />
      <stop offset="52%" stop-color="#4c1d95" stop-opacity="0.08" />
      <stop offset="100%" stop-color="#08020f" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="neonGlowB" cx="86%" cy="76%" r="58%">
      <stop offset="0%" stop-color="#f8f32b" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#08020f" stop-opacity="0" />
    </radialGradient>
    <pattern id="scanlines" width="1" height="9" patternUnits="userSpaceOnUse">
      <rect width="1" height="1" fill="#f8f32b" opacity="0.045" />
    </pattern>
    <pattern id="microGrid" width="44" height="44" patternUnits="userSpaceOnUse">
      <path d="M 44 0 L 0 0 0 44" fill="none" stroke="#f8f32b" stroke-width="1" opacity="0.055" />
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="${escapeXml(theme.background)}" />
  <rect width="100%" height="100%" fill="url(#neonGlowA)" />
  <rect width="100%" height="100%" fill="url(#neonGlowB)" />
  <rect width="100%" height="100%" fill="url(#microGrid)" />
  <rect width="100%" height="100%" fill="url(#scanlines)" />
  <g opacity="0.24" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M ${Math.round(width * 0.08)} ${circuitY} H ${Math.round(width * 0.34)} L ${Math.round(
      width * 0.42,
    )} ${circuitY + 72} H ${Math.round(width * 0.62)}" stroke="#d946ef" stroke-width="3" />
    <path d="M ${Math.round(width * 0.78)} ${circuitY - 54} H ${Math.round(width * 0.92)} V ${
      circuitY + 92
    }" stroke="#f8f32b" stroke-width="2" />
    <path d="M ${Math.round(width * 0.11)} ${lowerCircuitY} H ${Math.round(
      width * 0.3,
    )} V ${lowerCircuitY - 70} H ${midX}" stroke="#f8f32b" stroke-width="2" />
    <path d="M ${Math.round(width * 0.72)} ${lowerCircuitY + 54} H ${Math.round(
      width * 0.91,
    )}" stroke="#d946ef" stroke-width="3" />
    <circle cx="${Math.round(width * 0.62)}" cy="${circuitY + 72}" r="7" fill="#d946ef" stroke="none" />
    <circle cx="${Math.round(width * 0.92)}" cy="${circuitY + 92}" r="5" fill="#f8f32b" stroke="none" />
    <circle cx="${midX}" cy="${lowerCircuitY - 70}" r="5" fill="#f8f32b" stroke="none" />
  </g>
  <g opacity="0.18" fill="none" stroke="#d946ef" stroke-width="1.5">
    <path d="M ${Math.round(width * 0.15)} ${Math.round(height * 0.93)} L ${Math.round(
      width * 0.42,
    )} ${Math.round(height * 0.58)} L ${Math.round(width * 0.56)} ${Math.round(height * 0.93)}" />
    <path d="M ${Math.round(width * 0.48)} ${Math.round(height * 0.93)} L ${Math.round(
      width * 0.66,
    )} ${Math.round(height * 0.56)} L ${Math.round(width * 0.83)} ${Math.round(height * 0.93)}" />
  </g>`;
}

export function generateModularWallpaperSvg(config: ModularWallpaperConfig, now?: Date) {
  const renderDate = now ?? (config.currentDate ? parseDate(config.currentDate) : new Date());
  const renderedGrids = config.grids
    .filter((grid) => grid.enabled)
    .map((grid) => renderGrid(config, grid, renderDate))
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${config.canvas.width}" height="${config.canvas.height}" viewBox="0 0 ${config.canvas.width} ${config.canvas.height}" role="img" aria-label="Life calendar wallpaper">
  ${renderBackground(config)}
  ${renderedGrids}
</svg>`;
}
