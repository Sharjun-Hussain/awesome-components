# Lusion UI

A visual, self-updating gallery for high-end motion & editorial React components. The root page groups every
component by category with a live thumbnail and search; each component gets a
detail page with a full preview, reload button and copyable source.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL.

## Adding a component

Drop a `.tsx` (or `.jsx`) file into `src/components/<group>/` and export it as
**default** — a single PascalCase named export also works. No registry edits, no
imports — Vite picks it up through `import.meta.glob` and it appears in the
sidebar and on the home page automatically.

```
src/components/
├── buttons/
│   └── ShinyButton.tsx      → Buttons › Shiny Button
├── cards/
│   └── SpotlightCard.tsx    → Cards › Spotlight Card
└── inputs/
    └── FloatingLabelInput.tsx
```

To add a new group, create a new folder — e.g. `src/components/heroes/Hero.tsx`.
New groups show up automatically (after the built-in ones) and are sorted
alphabetically.

### Optional metadata

Add a `meta` export for better titles/descriptions, or to place a component in a
different group than its folder:

```tsx
export const meta = {
  title: 'Shiny Button',
  description: 'A pill button with a sweeping shine on hover.',
  category: 'buttons', // optional override
  fullWidth: true, // optional: preview edge-to-edge (great for hero sections)
  thumbnail: true, // optional: render the component in compact card mode
}

export default function ShinyButton() {
  return <button>Get started</button>
}
```

Without `meta`, the gallery derives the title from the filename
(`FloatingLabelInput` → “Floating Label Input”) and uses a generic description.

With `thumbnail: true`, home-page cards pass a `thumbnail` prop so tall demos
can collapse to a single-screen poster instead of a cropped scroll surface.

### Helper files and `ui/`

Anything under `src/components/ui/`, in a `*-utils` folder, or prefixed with `_`
is treated as a helper — it can be imported by demos, but it won't show up as a
demo itself. This keeps shared sub-components out of the gallery:

```
src/components/
├── heroes/Hero01.tsx              → demo (group: Heroes)
└── ui/hero-01-utils/
    ├── header.tsx                 → helper, hidden from gallery
    ├── hero.tsx
    └── brand-slider.tsx
```

The `@/` alias points at `src/`, so imports like
`@/components/ui/hero-01-utils/header` work everywhere.

### Multi-file components

Put a component and its helpers in their own folder. The **first** folder after
`src/components/` stays the group:

```
src/components/cards/spotlight/
├── SpotlightCard.tsx   ← default export = the demo, group = "cards"
└── spotlight.css
```

Files or folders prefixed with `_` are ignored, which is handy for shared
helpers that must not become demos themselves:

```
src/components/buttons/_shared.ts
```

## How navigation works

- `/` — grouped library with live previews and search (`?q=...`)
- `/c/<group>/<component>` — preview + source + copy + prev/next
- Sidebar search filters both the sidebar and the home page
- Press `/` anywhere to jump to the search box

## Commands

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start the dev server     |
| `npm run build`   | Type-check + build       |
| `npm run preview` | Preview the built app    |
| `npm run lint`    | Lint with oxlint         |

## Notes

- Styling is Tailwind CSS v4 (`@tailwindcss/vite`), no config file needed.
- shadcn/ui tokens (`bg-background`, `text-muted-foreground`, `border-border`,
  etc.) and the `@/lib/utils` `cn` helper are set up, so components copied from
  shadcn/21st.dev mostly work without edits.
- `framer-motion` is installed for animated components.
- `three` is installed for WebGL components. Keep their models, textures and
  HDRIs next to the component in an `assets/` folder so previews stay local.
- Dark mode follows the system theme on first load and is stored in
  `localStorage`.
- A crashing component is isolated by an error boundary, so one bad paste does
  not take the whole gallery down.
