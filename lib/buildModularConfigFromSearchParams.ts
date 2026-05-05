import { defaultGridFrameForLayout } from "./defaultGridFrame";
import {
  defaultModularWallpaperConfig,
  GridType,
  LabelMode,
  validateModularWallpaperConfig,
} from "./wallpaperConfig";

function getInteger(searchParams: URLSearchParams, key: string, fallback: number) {
  const rawValue = searchParams.get(key);

  if (rawValue === null || rawValue.trim() === "") {
    return fallback;
  }

  const value = Number(rawValue);

  return Number.isFinite(value) ? Math.round(value) : fallback;
}

function splitGridTypes(value: string | null): GridType[] {
  if (!value) {
    return ["life"];
  }

  const grids = value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is GridType => item === "life" || item === "goal" || item === "year");

  return grids.length > 0 ? Array.from(new Set(grids)) : ["life"];
}

function frameFromSearchParams(
  searchParams: URLSearchParams,
  type: GridType,
  index: number,
  width: number,
  height: number,
) {
  const fallback = defaultGridFrameForLayout(type, index, splitGridTypes(searchParams.get("grid")), {
    width,
    height,
  });

  return {
    x: getInteger(searchParams, `${type}X`, fallback.x),
    y: getInteger(searchParams, `${type}Y`, fallback.y),
    width: getInteger(searchParams, `${type}W`, fallback.width),
    height: getInteger(searchParams, `${type}H`, fallback.height),
  };
}

export function buildModularConfigFromSearchParams(searchParams: URLSearchParams) {
  const width = getInteger(searchParams, "width", defaultModularWallpaperConfig.canvas.width);
  const height = getInteger(searchParams, "height", defaultModularWallpaperConfig.canvas.height);
  const gridTypes = splitGridTypes(searchParams.get("grid"));
  const label = (searchParams.get("label") ?? "percent") as LabelMode;

  return validateModularWallpaperConfig({
    canvas: {
      width,
      height,
    },
    currentDate: searchParams.get("today") ?? searchParams.get("currentDate") ?? undefined,
    theme: searchParams.get("theme") ?? "midnight",
    customTheme: {
      background: searchParams.get("customBg") ?? undefined,
      filled: searchParams.get("customFilled") ?? undefined,
      empty: searchParams.get("customEmpty") ?? undefined,
      current: searchParams.get("customCurrent") ?? undefined,
      label: searchParams.get("customLabel") ?? undefined,
    },
    birthDate: searchParams.get("birth") ?? undefined,
    lifeYears: searchParams.get("life") ?? undefined,
    markerStyle: searchParams.get("marker") ?? "glow",
    grids: gridTypes.map((type, index) => ({
      type,
      enabled: true,
      targetDate: type === "goal" ? searchParams.get("target") ?? undefined : undefined,
      startDate: type === "goal" ? searchParams.get("start") ?? undefined : undefined,
      frame: frameFromSearchParams(searchParams, type, index, width, height),
      rotation: getInteger(searchParams, `${type}Rotation`, 0),
      colors: {
        filled: searchParams.get(`${type}Filled`) ?? undefined,
        empty: searchParams.get(`${type}Empty`) ?? undefined,
        current: searchParams.get(`${type}Current`) ?? undefined,
        label: searchParams.get(`${type}LabelColor`) ?? undefined,
      },
      density: searchParams.get(`${type}Density`) ?? searchParams.get("density") ?? "bold",
      dotSize: searchParams.get(`${type}Dot`) ?? searchParams.get("dot") ?? undefined,
      dotGap: searchParams.get(`${type}DotGap`) ?? searchParams.get("dotGap") ?? undefined,
      label: type === "goal" ? searchParams.get("goalLabel") ?? "remaining" : label,
    })),
  });
}
