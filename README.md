# Life Calendar Wallpaper

A Next.js App Router + TypeScript MVP for a Life Calendar Wallpaper product.

The public website is only a landing page. It advertises the app, shows a wallpaper preview, includes a shortcut setup video area, and links to App Store / Google Play. Users should not see or copy generated wallpaper URLs from the site.

The wallpaper URL generation API is meant to be called internally by the mobile app or shortcut flow. No database or storage is used.

The current product direction is a modular lockscreen wallpaper. The app can compose up to three time grids on the same wallpaper:

- `life`: lifetime progress based on birth date and life expectancy
- `goal`: time remaining until a user-defined target date
- `year`: progress through the current year

Current phase: optimize the one-grid-per-wallpaper experience first. Combined wallpapers with two or three grids are supported by the backend, but they are a second-phase product focus.

Dot count rule: `year` always renders the real number of days in the current year, `365` or `366`. `life` always renders `lifeYears * 52` week dots. `goal` renders the number of days in the goal range.

Dot size rule: the modular renderer uses fixed dot sizes and fixed dot gaps. Short goals such as 7 or 15 days do not stretch to fill the wallpaper. If a fixed dot size is too large for the selected frame, the renderer only scales it down enough to fit.

## Local Setup

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to view the landing page.

## App Developer Handoff

Share [API_HANDOFF.md](./API_HANDOFF.md) with the mobile app developer. It includes the production base URL placeholder, example PNG URLs, supported query params, and the richer `POST /api/wallpaper` JSON contract.

## Test PNG Endpoint

For development, you can still open the legacy GET endpoint directly in your browser to test the life grid:

```text
http://localhost:3000/api/wallpaper?birth=1990-01-01&life=90&filled=%23f5f5f5&empty=%233f3f46&bg=%23050505&cell=8&gap=2&layout=single&width=1179&height=2556

http://localhost:3000/api/wallpaper?birth=1985-06-15&life=85&filled=%23f5f5f5&empty=%233f3f46&bg=%23050505&cell=6&gap=2&layout=double&width=1290&height=2796
```

You can also use the modular GET endpoint for quick browser tests. Add `grid` and `theme` query params:

```text
http://localhost:3000/api/wallpaper?grid=life&theme=midnight&birth=1990-01-01&life=90&width=828&height=1792

http://localhost:3000/api/wallpaper?grid=year&theme=paper&width=828&height=1792&density=bold

http://localhost:3000/api/wallpaper?grid=goal&theme=neon&target=2026-12-31&width=828&height=1792&density=bold&marker=glow

http://localhost:3000/api/wallpaper?grid=goal&theme=paper&target=2026-05-11&width=828&height=1792

http://localhost:3000/api/wallpaper?grid=goal&theme=paper&start=2026-05-05&target=2026-05-12&width=828&height=1792&dot=24&dotGap=8

http://localhost:3000/api/wallpaper?grid=goal&theme=paper&start=2026-05-05&target=2026-05-20&width=828&height=1792&dot=24&dotGap=8

http://localhost:3000/api/wallpaper?grid=goal&theme=paper&start=2026-05-05&target=2026-06-04&width=828&height=1792&dot=24&dotGap=8

http://localhost:3000/api/wallpaper?grid=goal&theme=paper&start=2026-05-05&target=2026-08-03&width=828&height=1792&dot=24&dotGap=8

http://localhost:3000/api/wallpaper?grid=year&theme=paper&width=828&height=1792&yearDot=18&yearDotGap=6

http://localhost:3000/api/wallpaper?grid=life&theme=midnight&birth=1990-01-01&life=90&width=828&height=1792&lifeDot=8&lifeDotGap=3

http://localhost:3000/api/wallpaper?grid=life,year&theme=midnight&birth=1990-01-01&life=90&width=828&height=1792

http://localhost:3000/api/wallpaper?grid=life,goal,year&theme=neon&birth=1990-01-01&life=90&target=2026-12-31&width=828&height=1792&density=balanced&marker=glow
```

Default PNG size is `1179x2556`, which matches the modern 6.1-inch iPhone screen size used by iPhone 15 and iPhone 16. The app should send the actual device wallpaper size with `width` and `height` when it knows the user's model.

Common iPhone wallpaper sizes:

- iPhone 15 / 16: `1179x2556`
- iPhone 16 Pro: `1206x2622`
- iPhone 15 Plus / 16 Plus: `1290x2796`
- iPhone 16 Pro Max: `1320x2868`

Windows PowerShell quick header check:

```powershell
$response = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000/api/wallpaper?birth=1990-01-01&life=90&filled=%23f5f5f5&empty=%233f3f46&bg=%23050505&cell=8&gap=2&layout=single&width=1179&height=2556'
$response.StatusCode
$response.Headers['Content-Type']
$response.RawContentLength
```

## API

### `GET /api/wallpaper`

Legacy test endpoint. Returns a PNG image with `Content-Type: image/png`.

Query params:

- `birth`: birth date as `YYYY-MM-DD`
- `life`: life expectancy in years
- `filled`: lived-week color as hex, default white
- `empty`: future-week color as hex, default dark gray
- `bg`: background color as hex, default black
- `cell`: grid cell size
- `gap`: grid gap
- `layout`: `single` or `double`
- `width`: PNG width
- `height`: PNG height

If `grid` or `theme` is present, GET uses the modular renderer instead of the legacy life-only renderer.

Modular query params:

- `grid`: comma-separated `life`, `goal`, `year`
- `theme`: `midnight`, `paper`, `neon`, or `custom`
- `birth`: birth date for life grid
- `life`: life expectancy for life grid
- `target`: target date for goal grid
- `start`: optional start date for goal progress
- `today`: optional device-local render date as `YYYY-MM-DD`; the app should send this so year/life/goal use the user's current day
- `width`: PNG width
- `height`: PNG height
- `density`: default density for all grids
- `dot`: fixed default dot diameter for all modular grids
- `dotGap`: fixed default dot gap for all modular grids
- `marker`: `dot`, `ring`, or `glow`
- `label`: label mode for life/year grids
- `goalLabel`: label mode for goal grid
- `lifeRotation`, `goalRotation`, `yearRotation`: per-grid rotation degrees
- `lifeDot`, `goalDot`, `yearDot`: per-grid fixed dot diameter overrides
- `lifeDotGap`, `goalDotGap`, `yearDotGap`: per-grid fixed dot gap overrides
- `lifeX`, `lifeY`, `lifeW`, `lifeH`: optional frame override for the life grid
- `goalX`, `goalY`, `goalW`, `goalH`: optional frame override for the goal grid
- `yearX`, `yearY`, `yearW`, `yearH`: optional frame override for the year grid
- `lifeFilled`, `lifeEmpty`, `lifeCurrent`, `lifeLabelColor`: optional life grid color overrides
- `goalFilled`, `goalEmpty`, `goalCurrent`, `goalLabelColor`: optional goal grid color overrides
- `yearFilled`, `yearEmpty`, `yearCurrent`, `yearLabelColor`: optional year grid color overrides
- `customBg`, `customFilled`, `customEmpty`, `customCurrent`, `customLabel`: custom theme colors

### `POST /api/wallpaper`

Primary app endpoint. Accepts a JSON wallpaper config and returns a PNG image with `Content-Type: image/png`.

The app controls each grid's position and size with a `frame`. The API keeps the configured `dotSize` and `dotGap` fixed unless it must scale them down to fit inside that frame.

Each grid can also include `rotation` in degrees. This lets the app place grids diagonally while the backend still renders the final PNG. Rotation is clamped between `-45` and `45`.

```json
{
  "canvas": {
    "width": 1179,
    "height": 2556
  },
  "today": "2026-05-05",
  "theme": "midnight",
  "customTheme": {
    "background": "#050505",
    "filled": "#f5f5f5",
    "empty": "#3f3f46",
    "current": "#f97316",
    "label": "#f5f5f5"
  },
  "birthDate": "1990-01-01",
  "lifeYears": 90,
  "markerStyle": "glow",
  "grids": [
    {
      "type": "life",
      "enabled": true,
      "frame": {
        "x": 80,
        "y": 700,
        "width": 1019,
        "height": 980
      },
      "rotation": 0,
      "dotSize": 8,
      "dotGap": 3,
      "colors": {
        "filled": "#f5f5f5",
        "empty": "#3f3f46",
        "current": "#f97316",
        "label": "#f5f5f5"
      },
      "density": "balanced",
      "label": "percent"
    },
    {
      "type": "goal",
      "enabled": true,
      "targetDate": "2026-12-31",
      "frame": {
        "x": 150,
        "y": 1760,
        "width": 879,
        "height": 250
      },
      "rotation": 8,
      "dotSize": 24,
      "dotGap": 8,
      "density": "bold",
      "label": "remaining"
    },
    {
      "type": "year",
      "enabled": true,
      "frame": {
        "x": 150,
        "y": 2060,
        "width": 879,
        "height": 180
      },
      "rotation": -6,
      "dotSize": 18,
      "dotGap": 6,
      "density": "compact",
      "label": "percent"
    }
  ]
}
```

Windows PowerShell PNG test:

```powershell
$body = @{
  canvas = @{
    width = 1179
    height = 2556
  }
  theme = "midnight"
  customTheme = @{
    background = "#050505"
    filled = "#f5f5f5"
    empty = "#3f3f46"
    current = "#f97316"
    label = "#f5f5f5"
  }
  birthDate = "1990-01-01"
  lifeYears = 90
  markerStyle = "glow"
  grids = @(
    @{
      type = "life"
      enabled = $true
      frame = @{
        x = 80
        y = 700
        width = 1019
        height = 980
      }
      rotation = 0
      colors = @{
        filled = "#f5f5f5"
        empty = "#3f3f46"
        current = "#f97316"
        label = "#f5f5f5"
      }
      density = "balanced"
      label = "percent"
    },
    @{
      type = "goal"
      enabled = $true
      targetDate = "2026-12-31"
      frame = @{
        x = 150
        y = 1760
        width = 879
        height = 250
      }
      rotation = 8
      density = "bold"
      label = "remaining"
    },
    @{
      type = "year"
      enabled = $true
      frame = @{
        x = 150
        y = 2060
        width = 879
        height = 180
      }
      rotation = -6
      density = "compact"
      label = "percent"
    }
  )
} | ConvertTo-Json -Depth 10

$response = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000/api/wallpaper' -Method Post -ContentType 'application/json' -Body $body
$response.StatusCode
$response.Headers['Content-Type']
$response.RawContentLength
```

Supported themes:

- `midnight`: black background, white elapsed dots, dark gray future dots, orange current marker
- `paper`: warm paper background, black rounded-square elapsed marks, stone future marks, orange current marker
- `neon`: cyberpunk palette with neon-yellow hex marks, deep-purple future marks, magenta current marker
- `custom`: user-defined colors with fixed circular dots

When `theme` is `custom`, the app can send:

```json
{
  "customTheme": {
    "background": "#050505",
    "filled": "#f5f5f5",
    "empty": "#3f3f46",
    "current": "#f97316",
    "label": "#f5f5f5"
  }
}
```

Custom theme only changes colors. Dot shape stays fixed so the app does not need to expose shape controls.

Supported dot densities:

- `compact`
- `balanced`
- `bold`

Supported current marker styles:

- `dot`
- `ring`
- `glow`

Supported label modes:

- `hidden`
- `percent`
- `remaining`
- `elapsed`
- `custom`

### `POST /api/wallpaper-url`

Accepts JSON customization options from the app or shortcut flow and returns a full wallpaper URL. This endpoint is not exposed in the landing page UI.

```json
{
  "birthDate": "1990-01-01",
  "lifeYears": 90,
  "filledColor": "#f5f5f5",
  "emptyColor": "#3f3f46",
  "backgroundColor": "#050505",
  "cellSize": 8,
  "gap": 2,
  "layout": "single",
  "width": 1179,
  "height": 2556
}
```

## Vercel Notes

- Deploy as a standard Next.js project.
- Recommended deploy path: push the project to GitHub, import it from Vercel, keep the default Next.js build settings, and deploy.
- CLI deploy path from the project root:

```bash
npm install
npm run build
npx vercel
npx vercel --prod
```

- `sharp` is a production dependency.
- The wallpaper API uses `export const runtime = "nodejs"` because `sharp` requires Node.js support.
- `package.json` pins the Node requirement with `"engines": { "node": ">=20.9.0" }`, matching the installed Next.js requirement.
- No database, storage, or environment variables are required for the MVP.

After deploy, test the hosted PNG endpoint:

```text
https://YOUR-VERCEL-PROJECT.vercel.app/api/wallpaper?grid=goal&theme=paper&start=2026-05-05&target=2026-05-20&width=828&height=1792&dot=24&dotGap=8
```
