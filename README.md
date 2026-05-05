# Life Calendar Wallpaper

Next.js App Router + TypeScript MVP for a Life Calendar Wallpaper product.

The public website is a Turkish landing page only. It advertises the app, shows three wallpaper examples, leaves space for a Shortcut tutorial video, and links to App Store / Google Play. Visitors should not see generated wallpaper URLs in the UI.

The wallpaper API is meant to be called internally by the mobile app or Shortcut flow. No database or storage is used; PNG images are generated dynamically on request.

## Product Scope

Current grid types:

- `life`: lifetime progress based on birth date and life expectancy
- `year`: progress through the current year
- `goal`: time remaining until a user-defined target date

Current phase: optimize one grid per wallpaper. Combined wallpapers with multiple grids are supported by the backend but are a second-phase product focus.

Rules:

- The app should send `today=YYYY-MM-DD` using the user's device-local date on every request.
- `year` renders the real number of days in the selected year.
- `life` renders `lifeYears * 52` week dots.
- `goal` renders the number of days between `start` and `target`.
- Dot size and dot gap are fixed. Short goals do not stretch to fill the screen.
- If a configured dot size cannot fit its frame, the renderer scales it down only enough to fit.
- Labels are rendered as SVG paths, not system fonts, so Vercel does not show missing-glyph boxes.

## Local Setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

On this Windows machine, use `npm.cmd` if PowerShell blocks `npm.ps1`:

```powershell
npm.cmd run dev
npm.cmd run lint
npm.cmd run build
```

## App Developer Handoff

Share [API_HANDOFF.md](./API_HANDOFF.md) with the mobile app developer. It contains the production base URL, recommended PNG examples, query params, and the `POST /api/wallpaper` JSON contract.

## Production Base URL

```text
https://berkozbek20-lifecalendar.vercel.app
```

## Quick PNG Examples

### Year, Midnight, Days Left

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=year&theme=midnight&today=2026-05-05&width=828&height=1792&yearDot=18&yearDotGap=6&label=remaining&v=readme-year-midnight-1
```

### Lifetime, Paper, Weeks Left

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=life&theme=paper&today=2026-05-05&birth=1990-01-01&life=90&width=828&height=1792&lifeDot=8&lifeDotGap=3&label=remaining&v=readme-life-paper-1
```

### Lifetime, Neon, Weeks Left

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=life&theme=neon&today=2026-05-05&birth=1990-01-01&life=90&width=828&height=1792&lifeDot=8&lifeDotGap=3&label=remaining&marker=glow&v=readme-life-neon-1
```

### Goal, 90 Days, Midnight

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=goal&theme=midnight&today=2026-05-05&start=2026-05-05&target=2026-08-03&width=828&height=1792&dot=24&dotGap=8&goalLabel=remaining&v=readme-goal-90-midnight-1
```

### Goal, Neon

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=goal&theme=neon&today=2026-05-05&start=2026-05-05&target=2026-12-31&width=828&height=1792&density=bold&marker=glow&goalLabel=remaining&v=readme-goal-neon-1
```

### Legacy Compatible Life URL

Old URLs without `grid` still work and are mapped to the modern renderer:

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?birth=1985-06-15&life=85&filled=%23f5f5f5&empty=%233f3f46&bg=%23050505&v=readme-legacy-1
```

If `width`, `height`, `cell`, or `gap` are missing, the legacy fallback values are:

- `width`: `1179`
- `height`: `2556`
- `cell`: `8`
- `gap`: `2`

## API

### `GET /api/wallpaper`

Returns PNG bytes:

```text
Content-Type: image/png
Cache-Control: no-store
```

Modular query params:

- `grid`: `life`, `year`, `goal`; comma-separated combinations are supported but second-phase
- `theme`: `midnight`, `paper`, `neon`, `custom`
- `today`: device-local render date, format `YYYY-MM-DD`
- `width`: PNG width
- `height`: PNG height
- `birth`: birth date for life grid
- `life`: life expectancy for life grid
- `start`: start date for goal grid
- `target`: target date for goal grid
- `dot`: default fixed dot diameter for modular grids
- `dotGap`: default fixed dot gap for modular grids
- `lifeDot`, `yearDot`, `goalDot`: per-grid fixed dot diameter overrides
- `lifeDotGap`, `yearDotGap`, `goalDotGap`: per-grid fixed dot gap overrides
- `label`: label mode for life/year grids
- `goalLabel`: label mode for goal grid
- `marker`: `dot`, `ring`, or `glow`
- `lifeX`, `lifeY`, `lifeW`, `lifeH`: life frame override
- `goalX`, `goalY`, `goalW`, `goalH`: goal frame override
- `yearX`, `yearY`, `yearW`, `yearH`: year frame override
- `lifeRotation`, `goalRotation`, `yearRotation`: rotation degrees
- `lifeFilled`, `lifeEmpty`, `lifeCurrent`, `lifeLabelColor`: life color overrides
- `goalFilled`, `goalEmpty`, `goalCurrent`, `goalLabelColor`: goal color overrides
- `yearFilled`, `yearEmpty`, `yearCurrent`, `yearLabelColor`: year color overrides
- `customBg`, `customFilled`, `customEmpty`, `customCurrent`, `customLabel`: custom theme colors

Supported label modes:

- `hidden`
- `percent`
- `remaining`
- `elapsed`
- `custom`

### `POST /api/wallpaper`

Primary app endpoint for precise layout control. Accepts JSON and returns PNG bytes.

```json
{
  "canvas": {
    "width": 828,
    "height": 1792
  },
  "today": "2026-05-05",
  "theme": "paper",
  "birthDate": "1990-01-01",
  "lifeYears": 90,
  "markerStyle": "dot",
  "grids": [
    {
      "type": "goal",
      "enabled": true,
      "startDate": "2026-05-05",
      "targetDate": "2026-05-20",
      "frame": {
        "x": 58,
        "y": 573,
        "width": 712,
        "height": 1094
      },
      "rotation": 0,
      "dotSize": 24,
      "dotGap": 8,
      "density": "bold",
      "label": "remaining"
    }
  ]
}
```

## Themes

- `midnight`: black background, white elapsed dots, dark gray future dots, orange current marker
- `paper`: warm paper background, black rounded-square elapsed marks, stone future marks, orange current marker
- `neon`: cyberpunk palette with neon-yellow hex marks, deep-purple future marks, magenta current marker
- `custom`: user-defined colors with fixed circular dots

Custom theme example:

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=life&theme=custom&customBg=%23050505&customFilled=%23f5f5f5&customEmpty=%233f3f46&customCurrent=%23f97316&customLabel=%23f5f5f5&today=2026-05-05&birth=1985-06-15&life=85&width=1179&height=2556&lifeDot=8&lifeDotGap=3&label=percent&v=readme-custom-1
```

## Vercel Notes

- Deploy as a standard Next.js project.
- `sharp` is a production dependency.
- `text-to-svg` is a production dependency used to convert label text to SVG paths.
- `app/api/wallpaper/route.ts` uses `export const runtime = "nodejs"`.
- `next.config.ts` includes the `text-to-svg` font file in output tracing.
- `package.json` requires Node `>=20.9.0`.
- No database, storage, or environment variables are required for the MVP.

Deploy:

```bash
npm install
npm run build
npx vercel
npx vercel --prod
```
