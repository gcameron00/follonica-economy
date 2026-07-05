# Follonica Economy

An elegant, framework-free explainer website about the **local economy of Follonica**, a
coastal town in the Maremma region of Tuscany, Italy. It breaks down the town's economic
levels and industries, sets them in historical and geographical context, looks ahead to
future trends, and lets visitors *play* with the trade-offs in a small browser game.

Built as **static HTML, CSS and vanilla JavaScript** — no framework, no build step — and
designed to be deployed on **Cloudflare Pages**.

> **Note on data:** every figure on the site is a *rounded, representative estimate* used to
> illustrate the shape of the economy for teaching purposes — not an official statistic.
> See [Making the data authoritative](#making-the-data-authoritative) and the on-site
> [data note](/economy/#data).

---

## Pages

| Page | Path | What it covers |
| --- | --- | --- |
| **Home** | `/` | Hook, key stats, the three economic "engines", a history teaser and the sector-mix donut. |
| **Economy** | `/economy/` | The three economic levels, industries, the seasonal cycle, the iron-foundry history and the data note. |
| **Surroundings** | `/surroundings/` | The Gulf of Follonica, the Maremma, the Colline Metallifere geopark and neighbouring towns. |
| **Future** | `/future/` | Illustrative scenarios and the trends likely to reshape the economy. |
| **Game** | `/game/` | *Mayor of the Gulf* — a ten-season economic balancing game. |
| **About** | `/about/` | What the project is, who it's for, how it's built and the sources. |

## Project structure

```
.
├── index.html                # Home
├── about/index.html          # About the project + about Follonica
├── economy/index.html        # Deep dive: levels, industries, history, data note
├── surroundings/index.html   # The wider region
├── future/index.html         # Future trends subpage
├── game/index.html           # "Mayor of the Gulf" game (page + scoped styles)
├── 404.html                  # Friendly not-found page
├── assets/
│   ├── favicon.svg
│   ├── css/styles.css        # The whole design system (tokens, layout, components)
│   └── js/
│       ├── main.js           # Nav, theme toggle, reveal-on-scroll, footer year
│       ├── charts.js         # Tiny dependency-free SVG charts (bar/hbar/donut/line)
│       └── game.js           # Game logic
├── docs/
│   ├── IMPLEMENTATION_PLAN.md # The build-out plan
│   └── DATA.md               # Where the numbers come from / how to verify them
└── README.md
```

## Design system in brief

- **Palette** — Tyrrhenian teal (the Gulf), Maremma terracotta, summer gold, pinewood sage
  and cast-iron slate, all defined as CSS custom properties with a full **dark-mode** set.
- **Typography** — *Fraunces* (display serif) + *Inter* (body), loaded from Google Fonts,
  with system-font fallbacks.
- **Charts** — hand-rolled inline SVG. Each chart is declared in the HTML with a
  `data-values` JSON payload; `charts.js` renders it and **re-colours on theme change**, so
  editing a number never requires touching JavaScript.
- **Accessibility** — skip link, semantic landmarks, `aria-current` nav, focus-visible
  controls, `prefers-reduced-motion` and `prefers-color-scheme` support, and a theme toggle
  that persists to `localStorage`.

## The game — *Mayor of the Gulf*

A light economic simulation. Each of ten seasons you invest **six points** across four
levers — **Tourism, Heritage, Nature, Off-season** — then advance. Environment, Community
and Prosperity respond, a random event nudges the outcome, and revenue flows into the
treasury. The final score (out of 100) weighs money, environment, community and prosperity
*together*, so balanced play beats maxing out tourism. Pure vanilla JS in
[`assets/js/game.js`](assets/js/game.js).

## Running locally

No build step. Serve the folder with any static server so that the clean directory URLs
(`/economy/`, `/game/`, …) resolve:

```bash
# Python 3
python3 -m http.server 8080

# or Node
npx serve .
```

Then open <http://localhost:8080>.

## Deploying to Cloudflare Pages

This repo is deployment-ready as a **static site with no build**.

1. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git** and
   pick this repository.
2. Build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/` (the repository root)
3. Deploy. Cloudflare serves each `directory/index.html` at its clean URL automatically, and
   `404.html` handles unknown paths.

## Making the data authoritative

The charts read their numbers straight from each page's HTML (`data-values="…"`), so
updating them needs no tooling:

1. Pull verified figures from the sources listed in [`docs/DATA.md`](docs/DATA.md) and the
   on-site [data note](/economy/#data) (ISTAT, Comune di Follonica, Regione Toscana, the
   Tuscan Mining Geopark).
2. Replace the illustrative arrays in the relevant page.
3. Update the data note with the exact tables, years and links.

## License & disclaimer

This is an **independent, educational project**. It is not affiliated with, nor endorsed by,
the Comune di Follonica or any official body. Content is provided for learning and
illustration.
