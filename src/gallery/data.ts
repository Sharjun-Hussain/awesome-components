import {
  Box,
  Compass,
  LampCeiling,
  LayoutGrid,
  MessageSquare,
  MousePointerClick,
  Navigation,
  PanelsTopLeft,
  PanelBottom,
  Sparkles,
  SquareStack,
  TextCursorInput,
  Type,
  type LucideIcon,
} from 'lucide-react'
import type { ComponentType } from 'react'

/**
 * Drop a component into src/components/<group>/<Name>.tsx and export it as
 * default. It shows up here automatically, grouped by its folder name.
 *
 * Optional metadata:
 *   export const meta = {
 *     title: 'Pretty Button',
 *     description: 'A button with a shine effect.',
 *     category: 'buttons', // override the folder name
 *   }
 */
export type GalleryMeta = {
  title?: string
  description?: string
  category?: string
  /** Render the preview edge-to-edge instead of in a narrow column. */
  fullWidth?: boolean
  /** Pass `thumbnail` to the component so tall demos can render a compact card. */
  thumbnail?: boolean
}

export type GalleryEntry = {
  /** e.g. "buttons/shiny-button" */
  slug: string
  /** e.g. "buttons" */
  category: string
  categoryLabel: string
  name: string
  title: string
  description: string
  fullWidth: boolean
  thumbnail: boolean
  Component: ComponentType
  source: string
  filePath: string
}

export type GalleryCategory = {
  id: string
  label: string
  icon: LucideIcon
  entries: GalleryEntry[]
}

const CATEGORY_CONFIG: { id: string; label: string; icon: LucideIcon }[] = [
  { id: 'buttons', label: 'Buttons', icon: MousePointerClick },
  { id: 'cards', label: 'Cards', icon: SquareStack },
  { id: 'carousels', label: 'Carousels', icon: Compass },
  { id: 'inputs', label: 'Inputs', icon: TextCursorInput },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'heroes', label: 'Heroes', icon: PanelsTopLeft },
  { id: 'navigation', label: 'Navigation', icon: Navigation },
  { id: 'footers', label: 'Footers', icon: PanelBottom },
  { id: 'backgrounds', label: 'Backgrounds', icon: Sparkles },
  { id: 'objects', label: 'Objects', icon: LampCeiling },
  { id: 'feedback', label: 'Feedback', icon: MessageSquare },
  { id: 'layout', label: 'Layout', icon: LayoutGrid },
]

type ComponentModule = {
  default?: ComponentType
  meta?: GalleryMeta
  [key: string]: unknown
}

const modules = import.meta.glob<ComponentModule>(
  ['../components/**/*.tsx', '../components/**/*.jsx'],
  {
    eager: true,
  },
)

const sources = import.meta.glob<string>(
  ['../components/**/*.tsx', '../components/**/*.jsx'],
  {
    eager: true,
    query: '?raw',
    import: 'default',
  },
)

const kebab = (value: string) =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()

/**
 * `_` prefixes, `*-utils` folders and the `ui` folder hold helpers or raw
 * components that are imported by demos — they should not become demos
 * themselves.
 */
const isHelperSegment = (segment: string) =>
  segment.startsWith('_') || segment === 'ui' || segment.endsWith('-utils')

const titleCase = (value: string) =>
  value
    .replace(/[-_]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase())

function buildEntries() {
  const entries: GalleryEntry[] = []

  for (const [filePath, mod] of Object.entries(modules)) {
    const relative = filePath.replace('../components/', '').replace(/\.[jt]sx$/, '')
    const segments = relative.split('/')
    const fileName = segments[segments.length - 1]

    if (segments.some(isHelperSegment)) continue

    // Prefer the default export, but accept the first PascalCase named export
    // so code copied from tutorials still works without edits.
    const fallback = Object.entries(mod).find(
      ([key, value]) =>
        key !== 'meta' && /^[A-Z]/.test(key) && typeof value === 'function',
    )?.[1] as ComponentType | undefined

    const Component = mod.default ?? fallback
    if (!Component) continue

    // The first folder is always the group. Deeper folders are preserved in the
    // URL so multi-file components can live in their own folder.
    const folder = segments.length > 1 ? segments[0] : 'misc'
    const category = kebab(mod.meta?.category ?? folder)
    const nested = segments.length > 2 ? segments.slice(1, -1).map(kebab) : []
    const name = [...nested, kebab(fileName)].join('/')

    entries.push({
      slug: `${category}/${name}`,
      category,
      categoryLabel: titleCase(category),
      name,
      title: mod.meta?.title ?? titleCase(fileName),
      description: mod.meta?.description ?? 'A reusable component.',
      fullWidth: mod.meta?.fullWidth ?? false,
      thumbnail: mod.meta?.thumbnail ?? false,
      Component,
      source: sources[filePath] ?? '',
      filePath: filePath.replace('../', 'src/'),
    })
  }

  const orderOf = (id: string) => {
    const index = CATEGORY_CONFIG.findIndex((category) => category.id === id)
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }

  return entries.sort(
    (a, b) => orderOf(a.category) - orderOf(b.category) || a.title.localeCompare(b.title),
  )
}

export const allEntries = buildEntries()

export const categories: GalleryCategory[] = (() => {
  const grouped = new Map<string, GalleryEntry[]>()

  for (const entry of allEntries) {
    const list = grouped.get(entry.category) ?? []
    list.push(entry)
    grouped.set(entry.category, list)
  }

  const known = CATEGORY_CONFIG.filter((category) => grouped.has(category.id))
  const knownIds = new Set(known.map((category) => category.id))

  const extra = [...grouped.keys()]
    .filter((id) => !knownIds.has(id))
    .sort()
    .map((id) => ({ id, label: titleCase(id), icon: Box }))

  return [...known, ...extra].map((category) => ({
    ...category,
    entries: grouped.get(category.id) ?? [],
  }))
})()

export function getEntry(slug: string) {
  return allEntries.find((entry) => entry.slug === slug)
}

export function getNeighbours(slug: string) {
  const index = allEntries.findIndex((entry) => entry.slug === slug)
  return {
    previous: index > 0 ? allEntries[index - 1] : undefined,
    next: index >= 0 && index < allEntries.length - 1 ? allEntries[index + 1] : undefined,
  }
}
