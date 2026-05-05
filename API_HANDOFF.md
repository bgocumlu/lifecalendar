# Life Calendar Wallpaper API Handoff

Base URL after deploy:

```text
https://YOUR-VERCEL-PROJECT.vercel.app
```

The app should call the API internally and use the returned PNG bytes directly. Public website visitors should not see generated URLs.

## Main Endpoint

```text
GET /api/wallpaper
```

Returns:

```text
Content-Type: image/png
```

Use this endpoint for quick app prototyping and Shortcut tests.

## Single Grid Examples

Replace the base URL with the deployed Vercel URL.

### Goal, 7 Days

```text
https://YOUR-VERCEL-PROJECT.vercel.app/api/wallpaper?grid=goal&theme=paper&start=2026-05-05&target=2026-05-12&width=828&height=1792&dot=24&dotGap=8
```

### Goal, 15 Days

```text
https://YOUR-VERCEL-PROJECT.vercel.app/api/wallpaper?grid=goal&theme=paper&start=2026-05-05&target=2026-05-20&width=828&height=1792&dot=24&dotGap=8
```

### Goal, 30 Days

```text
https://YOUR-VERCEL-PROJECT.vercel.app/api/wallpaper?grid=goal&theme=paper&start=2026-05-05&target=2026-06-04&width=828&height=1792&dot=24&dotGap=8
```

### Goal, 90 Days

```text
https://YOUR-VERCEL-PROJECT.vercel.app/api/wallpaper?grid=goal&theme=paper&start=2026-05-05&target=2026-08-03&width=828&height=1792&dot=24&dotGap=8
```

### Year

```text
https://YOUR-VERCEL-PROJECT.vercel.app/api/wallpaper?grid=year&theme=paper&width=828&height=1792&yearDot=18&yearDotGap=6
```

### Lifetime

```text
https://YOUR-VERCEL-PROJECT.vercel.app/api/wallpaper?grid=life&theme=midnight&birth=1990-01-01&life=90&width=828&height=1792&lifeDot=8&lifeDotGap=3
```

## Query Parameters

- `grid`: `life`, `goal`, `year`; comma-separated combinations are supported but second phase.
- `theme`: `midnight`, `paper`, `neon`, `custom`.
- `width`: output PNG width in pixels.
- `height`: output PNG height in pixels.
- `today`: optional device-local render date, format `YYYY-MM-DD`. The app should send this so `year`, `life`, and `goal` use the user's current day instead of the server's timezone day.
- `birth`: birth date for `life`, format `YYYY-MM-DD`.
- `life`: expected life years for `life`, integer.
- `start`: goal start date, format `YYYY-MM-DD`.
- `target`: goal target date, format `YYYY-MM-DD`.
- `dot`: default fixed dot diameter.
- `dotGap`: default fixed dot gap.
- `lifeDot`, `yearDot`, `goalDot`: per-grid fixed dot diameter.
- `lifeDotGap`, `yearDotGap`, `goalDotGap`: per-grid fixed dot gap.
- `label`: `hidden`, `percent`, `remaining`, `elapsed`, `custom`.
- `goalLabel`: label mode for goal grid.
- `marker`: `dot`, `ring`, `glow`.
- `lifeFilled`, `lifeEmpty`, `lifeCurrent`, `lifeLabelColor`: life grid colors.
- `goalFilled`, `goalEmpty`, `goalCurrent`, `goalLabelColor`: goal grid colors.
- `yearFilled`, `yearEmpty`, `yearCurrent`, `yearLabelColor`: year grid colors.
- `customBg`, `customFilled`, `customEmpty`, `customCurrent`, `customLabel`: custom theme colors.

## POST Endpoint

```text
POST /api/wallpaper
```

Use this when the app needs more control over frame, rotation, and per-grid options. It returns PNG bytes, not JSON.

Minimal body:

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

## Current Product Rules

- First phase focuses on one grid per wallpaper.
- The app should send `today` as the user's device-local date on every request.
- `year` dot count is always the number of days in the current year.
- `life` dot count is always `lifeYears * 52`.
- `goal` dot count is the number of days between `start` and `target`.
- Dot size and dot gap are fixed. Short goals do not stretch to fill the screen.
- If a configured dot size cannot fit the frame, the renderer scales it down only enough to fit.
- The current day marker uses `marker`.
- `custom` theme changes colors only; dot shape stays circular.
