import sharp from "sharp";
import { buildModularConfigFromSearchParams } from "@/lib/buildModularConfigFromSearchParams";
import { generateModularWallpaperSvg } from "@/lib/generateModularWallpaperSvg";
import { validateModularWallpaperConfig, wallpaperThemes } from "@/lib/wallpaperConfig";
import { validateWallpaperParams } from "@/lib/validateWallpaperParams";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.has("grid") || searchParams.has("theme")) {
    const config = buildModularConfigFromSearchParams(searchParams);
    const svg = generateModularWallpaperSvg(config);
    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    return new Response(new Uint8Array(png), {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "no-store",
      },
    });
  }

  const params = validateWallpaperParams(searchParams);
  const config = validateModularWallpaperConfig({
    canvas: {
      width: params.width,
      height: params.height,
    },
    theme: "custom",
    customTheme: {
      ...wallpaperThemes.custom,
      background: params.bg,
      filled: params.filled,
      empty: params.empty,
      current: "#f97316",
      label: params.filled,
    },
    birthDate: params.birth,
    lifeYears: params.life,
    markerStyle: "dot",
    grids: [
      {
        type: "life",
        enabled: true,
        density: "balanced",
        dotSize: params.cell,
        dotGap: params.gap,
        label: "percent",
      },
    ],
  });
  const svg = generateModularWallpaperSvg(config);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request) {
  let body: unknown = {};

  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const config = validateModularWallpaperConfig(
    body && typeof body === "object" && !Array.isArray(body) ? body : {},
  );
  const svg = generateModularWallpaperSvg(config);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
