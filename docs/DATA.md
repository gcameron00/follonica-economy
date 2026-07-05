# Data & Sources

**Read this before quoting any number from the site.**

Every figure on Follonica Economy is a **rounded, representative estimate** assembled to
illustrate the *shape* of the local economy — direction and rough magnitude — for an
educational audience. They are **not** official statistics and should not be cited as such.
This choice is deliberate: it lets the site tell an honest, legible story without implying a
precision the project hasn't independently verified.

## Where the real numbers live

To replace the illustrative figures with authoritative ones, consult:

| Source | Use it for |
| --- | --- |
| **ISTAT** (Istituto Nazionale di Statistica) — istat.it, `dati.istat.it`, `demo.istat.it` | Resident population, census, employment by economic sector, demographics. |
| **Comune di Follonica** — comune.follonica.gr.it | Municipal open data, tourism figures, planning and budget documents. |
| **Regione Toscana / Toscana Notizie / IRPET** | Regional tourism statistics, value added, economic analysis for Tuscany. |
| **Camera di Commercio della Maremma e del Tirreno** | Business registrations by sector in the province. |
| **Parco Nazionale Tecnologico e Archeologico delle Colline Metallifere** (Tuscan Mining UNESCO Global Geopark) & **MAGMA** museum | Mining and iron-foundry history, heritage-tourism context. |

## Figures used on the site (all illustrative)

- **Sector mix / value added** (Home donut; Economy) — a services-dominated split typical of
  a Tuscan coastal town, weighted toward tourism and trade.
- **Employment by economic level** — Primary ≈ 6%, Secondary ≈ 19%, Tertiary ≈ 75%.
- **Employment by industry** — tourism & hospitality largest, then trade, public services,
  construction/real estate, professional services, manufacturing, farming/fishing, transport.
- **Seasonality** — a monthly "people present" curve peaking sharply in July–August (a 4×+
  swing over winter), reflecting the town's well-known summer concentration.
- **Then vs now** (~1920s vs today) — a stylised reconstruction of the shift from an
  industrial (secondary-heavy) structure to a service (tertiary-heavy) one.
- **Distances** (Surroundings) — approximate road distances, rounded to the nearest few km.
- **Future scenarios** — three illustrative visitor-nights trajectories to ~2045, indexed to
  today = 100. Scenarios, explicitly **not** forecasts.

## Historical context (widely documented, dates approximate)

- Follonica grew in the 19th century around **grand-ducal iron foundries** (the *Regie
  Fonderie*) expanded under **Leopold II of Lorraine**, smelting ore from **Elba** and the
  **Colline Metallifere**.
- The **Church of San Leopoldo** (completed ~1838) is notable for its **cast-iron** portico
  and fittings — the foundry expressed in civic architecture.
- Heavy iron production **declined through the 20th century**; **beach tourism and
  second-home building** became the dominant economy from roughly the 1960s onward.
- The **MAGMA** museum (Museo delle Arti in Ghisa nella Maremma) opened in the former furnace
  complex (2013), turning industrial heritage into a visitor attraction.

## How to update a figure

1. Find the chart in the relevant page (`index.html` in `/`, `economy/`, etc.).
2. Edit the `data-values='…'` JSON on the `<div class="chart" …>` element.
3. If the meaning or year changes, update the caption and this file.

No rebuild is required — `assets/js/charts.js` reads the values from the HTML at load time.
