# Implementation Plan — Follonica Economy

This document captured the plan for the initial build-out (issue #1) and now serves as the
map for anyone extending the site. It is intentionally lightweight: the project is a static,
framework-free site, so the "architecture" is mostly discipline and shared conventions.

## 1. Goals

From the brief:

- Explain Follonica's **local economy** to visitors — economic **levels**, **industries**,
  and the **surrounding area**.
- Lead with **data** and **historical context** (the audience likes both).
- Include a **Future trends** subpage.
- Be **elegant and interesting**, and include a **game**.
- Ship as **static HTML/CSS/JS, no framework**, hosted on **Cloudflare Pages**.
- **Document first** (README, About, supporting docs), then plan, then build the front end.

## 2. Principles

1. **No build step.** Anything that needs compiling is out of scope. Plain files a browser
   can open directly.
2. **One design system.** All styling lives in `assets/css/styles.css` via CSS custom
   properties, with light/dark parity. Pages compose components; they don't invent styles
   (the game's bespoke widgets are the one scoped exception).
3. **Data lives in the markup.** Charts read `data-values` JSON from the HTML so a
   non-developer can update a number without touching JavaScript.
4. **Honest numbers.** Illustrative data is labelled as such everywhere, with a single
   canonical [data note](/economy/#data) and [`DATA.md`](DATA.md).
5. **Accessible & progressive.** Semantic HTML, keyboard-friendly, `prefers-*` aware; the
   content works without JS (only the game requires it).

## 3. Information architecture

```
Home  ──►  Economy  ──►  Surroundings  ──►  Future  ──►  Game  ──►  About
                │
                └── #history, #data anchors
```

- **Home** — narrative hook, key stats, sector donut, history teaser, CTAs.
- **Economy** — levels (bar + cards), industries (horizontal bar), seasonality (line),
  history (timeline + then/now bars), data note.
- **Surroundings** — Gulf, pineta, geopark, neighbouring towns, distance chart.
- **Future** — scenario line chart, trend cards, the central trade-off.
- **Game** — *Mayor of the Gulf* + how-to-play.
- **About** — project + town + build + data.

## 4. Work breakdown (as executed)

| # | Task | Output |
| - | ---- | ------ |
| 1 | Research Follonica's economy & history | Content baked into pages + `DATA.md` |
| 2 | Documentation | `README.md`, `docs/*`, `about/` |
| 3 | Design system | `assets/css/styles.css` |
| 4 | Shared behaviour | `assets/js/main.js` (nav, theme, reveal) |
| 5 | Chart engine | `assets/js/charts.js` (bar/hbar/donut/line, theme-reactive) |
| 6 | Content pages | Home, Economy, Surroundings, Future, About |
| 7 | Game | `game/index.html` + `assets/js/game.js` |
| 8 | Polish | `404.html`, favicon, a11y pass, cross-links |

## 5. Data model for charts

Every chart is a `<div class="chart" data-chart="TYPE" data-values='…' data-opts='…'>`.

- `TYPE` ∈ `bar` | `hbar` | `donut` | `line`.
- `data-values` — array of `{label,value[,color]}` (bar/hbar/donut) or an array of series
  `{name,color,points:[{x,y}]}` (line).
- `data-opts` — optional `{height, legend, area, fmt, centerTop, centerBottom}`.
- Colours default to the categorical palette (`--c1`…`--c5`) so they stay theme-correct.

## 6. Backlog / future enhancements

- Replace illustrative figures with **verified ISTAT / Comune** data + exact citations.
- Add a **Sources & further reading** page and a `sitemap.xml` / `robots.txt`.
- Optional **Italian-language** version (`/it/`) for local visitors.
- Chart **tooltips** and a table fallback for screen readers (data tables behind `<details>`).
- A **map** of the Gulf and neighbouring towns (inline SVG to stay framework-free).
- Game: **shareable result**, difficulty levels, and a longer 20-season "career" mode.

## 7. Definition of done (initial build)

- [x] All six pages present, cross-linked and responsive.
- [x] Light/dark theme with persistence.
- [x] Charts render and re-theme correctly.
- [x] Playable game with a scored ending and replay.
- [x] README, About and supporting docs in place.
- [x] Deployable to Cloudflare Pages with no build configuration.
