import { defaultGridFrameForLayout } from "./defaultGridFrame";

export type ThemeName = "midnight" | "paper" | "neon" | "custom";
export type DotDensity = "compact" | "balanced" | "bold";
export type MarkerStyle = "dot" | "ring" | "glow";
export type GridType = "life" | "goal" | "year";
export type LabelMode = "hidden" | "percent" | "remaining" | "elapsed" | "custom";
export type DotShape = "circle" | "rounded" | "hex" | "pill";

export type WallpaperTheme = {
  name: ThemeName;
  background: string;
  filled: string;
  empty: string;
  current: string;
  label: string;
  shape: DotShape;
};

export type GridFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type TimeGridConfig = {
  type: GridType;
  enabled: boolean;
  frame: GridFrame;
  rotation: number;
  colors: Partial<Pick<WallpaperTheme, "filled" | "empty" | "current" | "label">>;
  density: DotDensity;
  dotSize: number;
  dotGap: number;
  label: LabelMode;
  targetDate?: string;
  startDate?: string;
  customLabel?: string;
};

export type ModularWallpaperConfig = {
  canvas: {
    width: number;
    height: number;
  };
  currentDate?: string;
  theme: ThemeName;
  customTheme: WallpaperTheme;
  birthDate: string;
  lifeYears: number;
  markerStyle: MarkerStyle;
  grids: TimeGridConfig[];
};

type WallpaperConfigInput = Partial<{
  canvas: Partial<{ width: unknown; height: unknown }>;
  theme: unknown;
  customTheme: Partial<{
    background: unknown;
    filled: unknown;
    empty: unknown;
    current: unknown;
    label: unknown;
  }>;
  currentDate: unknown;
  today: unknown;
  birthDate: unknown;
  lifeYears: unknown;
  markerStyle: unknown;
  grids: unknown;
}>;

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

export const wallpaperThemes: Record<ThemeName, WallpaperTheme> = {
  midnight: {
    name: "midnight",
    background: "#050505",
    filled: "#f5f5f5",
    empty: "#3f3f46",
    current: "#f97316",
    label: "#f5f5f5",
    shape: "circle",
  },
  paper: {
    name: "paper",
    background: "#fbf7ef",
    filled: "#1c1917",
    empty: "#d6d3d1",
    current: "#f97316",
    label: "#1c1917",
    shape: "rounded",
  },
  neon: {
    name: "neon",
    background: "#08020f",
    filled: "#f8f32b",
    empty: "#4c1d95",
    current: "#d946ef",
    label: "#f0abfc",
    shape: "hex",
  },
  custom: {
    name: "custom",
    background: "#050505",
    filled: "#f5f5f5",
    empty: "#3f3f46",
    current: "#f97316",
    label: "#f5f5f5",
    shape: "circle",
  },
};

const defaultCanvas = {
  width: 1179,
  height: 2556,
};

export const defaultModularWallpaperConfig: ModularWallpaperConfig = {
  canvas: defaultCanvas,
  theme: "midnight",
  customTheme: wallpaperThemes.custom,
  birthDate: "1990-01-01",
  lifeYears: 90,
  markerStyle: "dot",
  grids: [
    {
      type: "life",
      enabled: true,
      frame: {
        x: 80,
        y: 720,
        width: 1019,
        height: 1120,
    },
      rotation: 0,
      colors: {},
      density: "balanced",
      dotSize: 8,
      dotGap: 3,
      label: "percent",
    },
  ],
};

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function sanitizeInteger(value: unknown, fallback: number, min: number, max: number) {
  const candidate = asString(value).trim();
  const parsed = typeof value === "number" ? value : candidate ? Number(candidate) : fallback;

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function sanitizeDate(value: unknown, fallback: string) {
  const candidate = asString(value);

  if (!datePattern.test(candidate)) {
    return fallback;
  }

  const parsed = new Date(`${candidate}T00:00:00.000Z`);
  const isValid =
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === candidate &&
    parsed.getUTCFullYear() >= 1900;

  return isValid ? candidate : fallback;
}

function sanitizeTheme(value: unknown): ThemeName {
  return value === "paper" || value === "neon" || value === "custom" ? value : "midnight";
}

const hexColorPattern = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

function sanitizeColor(value: unknown, fallback: string) {
  const candidate = asString(value).trim();
  const match = candidate.match(hexColorPattern);

  if (!match) {
    return fallback;
  }

  const hex = match[1].toLowerCase();

  if (hex.length === 3) {
    return `#${hex
      .split("")
      .map((character) => `${character}${character}`)
      .join("")}`;
  }

  return `#${hex}`;
}

function sanitizeCustomTheme(value: WallpaperConfigInput["customTheme"]): WallpaperTheme {
  return {
    name: "custom",
    background: sanitizeColor(value?.background, wallpaperThemes.custom.background),
    filled: sanitizeColor(value?.filled, wallpaperThemes.custom.filled),
    empty: sanitizeColor(value?.empty, wallpaperThemes.custom.empty),
    current: sanitizeColor(value?.current, wallpaperThemes.custom.current),
    label: sanitizeColor(value?.label, wallpaperThemes.custom.label),
    shape: "circle",
  };
}

function sanitizeMarkerStyle(value: unknown): MarkerStyle {
  return value === "ring" || value === "glow" ? value : "dot";
}

function sanitizeDensity(value: unknown): DotDensity {
  return value === "compact" || value === "bold" ? value : "balanced";
}

function defaultDotSize(type: GridType, density: DotDensity) {
  if (type === "life") {
    return density === "compact" ? 4 : density === "bold" ? 6 : 5;
  }

  if (type === "year") {
    return density === "compact" ? 12 : density === "bold" ? 18 : 15;
  }

  return density === "compact" ? 14 : density === "bold" ? 24 : 18;
}

function defaultDotGap(type: GridType, density: DotDensity) {
  if (type === "life") {
    return density === "compact" ? 7 : density === "bold" ? 10 : 9;
  }

  if (type === "year") {
    return density === "compact" ? 4 : density === "bold" ? 6 : 5;
  }

  return density === "compact" ? 5 : density === "bold" ? 8 : 6;
}

function sanitizeGridType(value: unknown): GridType {
  return value === "goal" || value === "year" ? value : "life";
}

function sanitizeLabel(value: unknown): LabelMode {
  if (value === "hidden" || value === "remaining" || value === "elapsed" || value === "custom") {
    return value;
  }

  return "percent";
}

function sanitizeFrame(value: unknown, fallback: GridFrame, canvas: { width: number; height: number }) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const frame = source as Partial<Record<keyof GridFrame, unknown>>;
  const x = sanitizeInteger(frame.x, fallback.x, 0, canvas.width - 80);
  const y = sanitizeInteger(frame.y, fallback.y, 0, canvas.height - 80);
  const maxWidth = Math.max(80, canvas.width - x);
  const maxHeight = Math.max(80, canvas.height - y);

  return {
    x,
    y,
    width: sanitizeInteger(frame.width, fallback.width, 80, maxWidth),
    height: sanitizeInteger(frame.height, fallback.height, 80, maxHeight),
  };
}

function sanitizeRotation(value: unknown) {
  return sanitizeInteger(value, 0, -45, 45);
}

function sanitizeGridColors(value: unknown) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const colors = source as Partial<Record<"filled" | "empty" | "current" | "label", unknown>>;

  return {
    filled: colors.filled ? sanitizeColor(colors.filled, wallpaperThemes.custom.filled) : undefined,
    empty: colors.empty ? sanitizeColor(colors.empty, wallpaperThemes.custom.empty) : undefined,
    current: colors.current ? sanitizeColor(colors.current, wallpaperThemes.custom.current) : undefined,
    label: colors.label ? sanitizeColor(colors.label, wallpaperThemes.custom.label) : undefined,
  };
}

function sanitizeGrid(value: unknown, canvas: { width: number; height: number }, fallback: GridFrame) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const grid = source as Partial<Record<keyof TimeGridConfig, unknown>>;
  const type = sanitizeGridType(grid.type);
  const density = sanitizeDensity(grid.density);

  return {
    type,
    enabled: grid.enabled !== false,
    frame: sanitizeFrame(grid.frame, fallback, canvas),
    rotation: sanitizeRotation(grid.rotation),
    colors: sanitizeGridColors(grid.colors),
    density,
    dotSize: sanitizeInteger(grid.dotSize, defaultDotSize(type, density), 2, 80),
    dotGap: sanitizeInteger(grid.dotGap, defaultDotGap(type, density), 0, 40),
    label: sanitizeLabel(grid.label),
    targetDate: type === "goal" ? sanitizeDate(grid.targetDate, oneYearFromToday()) : undefined,
    startDate: type === "goal" && grid.startDate ? sanitizeDate(grid.startDate, today()) : undefined,
    customLabel: asString(grid.customLabel).slice(0, 80),
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function oneYearFromToday() {
  const date = new Date();
  date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date.toISOString().slice(0, 10);
}

export function validateModularWallpaperConfig(input: WallpaperConfigInput): ModularWallpaperConfig {
  const canvas = {
    width: sanitizeInteger(input.canvas?.width, defaultCanvas.width, 320, 7680),
    height: sanitizeInteger(input.canvas?.height, defaultCanvas.height, 320, 7680),
  };
  const rawGrids = Array.isArray(input.grids) ? input.grids.slice(0, 6) : [{}];
  const gridTypes = rawGrids.map((grid) => {
    const source = grid && typeof grid === "object" && !Array.isArray(grid) ? grid : {};
    return sanitizeGridType((source as Partial<Record<keyof TimeGridConfig, unknown>>).type);
  });
  const grids = rawGrids
    .map((grid, index) =>
      sanitizeGrid(
        grid,
        canvas,
        defaultGridFrameForLayout(gridTypes[index], index, gridTypes, canvas),
      ),
    )
    .filter((grid) => grid.enabled);

  return {
    canvas,
    currentDate:
      input.currentDate || input.today
        ? sanitizeDate(input.currentDate ?? input.today, today())
        : undefined,
    theme: sanitizeTheme(input.theme),
    customTheme: sanitizeCustomTheme(input.customTheme),
    birthDate: sanitizeDate(input.birthDate, defaultModularWallpaperConfig.birthDate),
    lifeYears: sanitizeInteger(input.lifeYears, defaultModularWallpaperConfig.lifeYears, 1, 120),
    markerStyle: sanitizeMarkerStyle(input.markerStyle),
    grids:
      grids.length > 0
        ? grids
        : [sanitizeGrid({}, canvas, defaultGridFrameForLayout("life", 0, ["life"], canvas))],
  };
}
