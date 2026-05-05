# Life Calendar Wallpaper API Handoff

Production base URL:

```text
https://berkozbek20-lifecalendar.vercel.app
```

The app or Shortcut should call the API internally and use the returned PNG bytes directly. Public website visitors should not see generated wallpaper URLs.

## Main Endpoint

```text
GET /api/wallpaper
```

Returns:

```text
Content-Type: image/png
Cache-Control: no-store
```

## Required App Rule

Send `today=YYYY-MM-DD` on every request using the user's device-local date.

Example:

```text
today=2026-05-05
```

This keeps `year`, `life`, and `goal` aligned with the user's local day instead of the server timezone.

## Recommended GET Examples

### Year, Midnight, Days Left

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=year&theme=midnight&today=2026-05-05&width=828&height=1792&yearDot=18&yearDotGap=6&label=remaining&v=handoff-year-midnight-1
```

### Year, Paper, Days Left

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=year&theme=paper&today=2026-05-05&width=828&height=1792&yearDot=18&yearDotGap=6&label=remaining&v=handoff-year-paper-1
```

### Lifetime, Midnight, Weeks Left

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=life&theme=midnight&today=2026-05-05&birth=1990-01-01&life=90&width=828&height=1792&lifeDot=8&lifeDotGap=3&label=remaining&v=handoff-life-midnight-1
```

### Lifetime, Paper, Weeks Left

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=life&theme=paper&today=2026-05-05&birth=1990-01-01&life=90&width=828&height=1792&lifeDot=8&lifeDotGap=3&label=remaining&v=handoff-life-paper-1
```

### Lifetime, Neon, Weeks Left

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=life&theme=neon&today=2026-05-05&birth=1990-01-01&life=90&width=828&height=1792&lifeDot=8&lifeDotGap=3&label=remaining&marker=glow&v=handoff-life-neon-1
```

### Goal, 7 Days

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=goal&theme=paper&today=2026-05-05&start=2026-05-05&target=2026-05-12&width=828&height=1792&dot=24&dotGap=8&goalLabel=remaining&v=handoff-goal-7-1
```

### Goal, 15 Days

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=goal&theme=paper&today=2026-05-05&start=2026-05-05&target=2026-05-20&width=828&height=1792&dot=24&dotGap=8&goalLabel=remaining&v=handoff-goal-15-1
```

### Goal, 30 Days

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=goal&theme=paper&today=2026-05-05&start=2026-05-05&target=2026-06-04&width=828&height=1792&dot=24&dotGap=8&goalLabel=remaining&v=handoff-goal-30-1
```

### Goal, 90 Days, Midnight

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=goal&theme=midnight&today=2026-05-05&start=2026-05-05&target=2026-08-03&width=828&height=1792&dot=24&dotGap=8&goalLabel=remaining&v=handoff-goal-90-midnight-1
```

### Goal, Neon

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?grid=goal&theme=neon&today=2026-05-05&start=2026-05-05&target=2026-12-31&width=828&height=1792&density=bold&marker=glow&goalLabel=remaining&v=handoff-goal-neon-1
```

## Query Parameters

- `grid`: `life`, `goal`, `year`. Comma-separated combinations are supported but are a second-phase product focus.
- `theme`: `midnight`, `paper`, `neon`, or `custom`.
- `today`: device-local render date, format `YYYY-MM-DD`.
- `width`: output PNG width in pixels.
- `height`: output PNG height in pixels.
- `birth`: birth date for `life`, format `YYYY-MM-DD`.
- `life`: expected life years for `life`, integer `1-120`.
- `start`: goal start date, format `YYYY-MM-DD`.
- `target`: goal target date, format `YYYY-MM-DD`.
- `dot`: default fixed dot diameter for modular grids.
- `dotGap`: default fixed dot gap for modular grids.
- `lifeDot`, `yearDot`, `goalDot`: per-grid fixed dot diameter.
- `lifeDotGap`, `yearDotGap`, `goalDotGap`: per-grid fixed dot gap.
- `label`: label mode for life/year grids: `hidden`, `percent`, `remaining`, `elapsed`, `custom`.
- `goalLabel`: label mode for goal grid.
- `marker`: current marker style: `dot`, `ring`, `glow`.
- `lifeFilled`, `lifeEmpty`, `lifeCurrent`, `lifeLabelColor`: life grid colors.
- `goalFilled`, `goalEmpty`, `goalCurrent`, `goalLabelColor`: goal grid colors.
- `yearFilled`, `yearEmpty`, `yearCurrent`, `yearLabelColor`: year grid colors.
- `customBg`, `customFilled`, `customEmpty`, `customCurrent`, `customLabel`: custom theme colors.
- `lifeX`, `lifeY`, `lifeW`, `lifeH`: optional life frame override.
- `goalX`, `goalY`, `goalW`, `goalH`: optional goal frame override.
- `yearX`, `yearY`, `yearW`, `yearH`: optional year frame override.
- `lifeRotation`, `goalRotation`, `yearRotation`: per-grid rotation in degrees, clamped to `-45` through `45`.
- `v`: optional cache-busting/debug value.

## POST Endpoint

```text
POST /api/wallpaper
```

Use this when the app needs explicit frame, rotation, and per-grid options. It returns PNG bytes, not JSON.

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

## Legacy Compatibility

Old life-only URLs still work:

```text
https://berkozbek20-lifecalendar.vercel.app/api/wallpaper?birth=1985-06-15&life=85&filled=%23f5f5f5&empty=%233f3f46&bg=%23050505&v=legacy-compat-1
```

Internally they are mapped to the modern renderer. Missing numeric parameters now use sane fallbacks:

- `width`: `1179`
- `height`: `2556`
- `cell`: `8`
- `gap`: `2`

## Product Rules

- First phase focuses on one grid per wallpaper.
- `year` dot count is always the number of days in the selected year.
- `life` dot count is always `lifeYears * 52`.
- `goal` dot count is the number of days between `start` and `target`.
- Dot size and dot gap are fixed. Short goals do not stretch to fill the screen.
- If a configured dot size cannot fit the frame, the renderer scales it down only enough to fit.
- Labels are rendered as SVG paths, not system fonts, to avoid broken glyph boxes on Vercel.
- `custom` theme changes colors only; dot shape stays circular.
