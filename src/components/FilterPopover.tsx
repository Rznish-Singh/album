'use client'

import { useMemo, useState } from 'react'
import { LayoutGrid, Search, Tag as TagIcon, Camera, Aperture, MapPin, Star } from 'lucide-react'
import { albums, cameraModels, cities, kindLabels, lenses, years } from '~/lib/gallery'
import { emptyFilters, type Photo, type PhotoFilters } from '~/lib/types'

type Tab = 'tags' | 'cameras' | 'lenses' | 'cities' | 'ratings'

const TABS: { id: Tab; label: string; icon: typeof TagIcon }[] = [
  { id: 'tags', label: 'Tags', icon: TagIcon },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'lenses', label: 'Lenses', icon: Aperture },
  { id: 'cities', label: 'Cities', icon: MapPin },
  { id: 'ratings', label: 'Ratings', icon: Star },
]

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'rounded-full border px-3 py-1.5 text-sm transition-colors ' +
        (active ? 'border-key/60 bg-key/15 text-key' : 'border-edge text-haze hover:border-haze/60 hover:text-paper')
      }
    >
      {children}
    </button>
  )
}

export default function FilterPopover({
  pool,
  filters,
  onChange,
}: {
  pool: Photo[]
  filters: PhotoFilters
  onChange: (next: PhotoFilters) => void
}) {
  const [tab, setTab] = useState<Tab>('tags')
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [dense, setDense] = useState(false)

  const set = (patch: Partial<PhotoFilters>) => onChange({ ...filters, ...patch })

  const tagChips = useMemo(() => {
    const albumChips = albums.map((a) => ({ key: `album:${a.slug}`, label: a.title, active: filters.album === a.slug, onClick: () => set({ album: filters.album === a.slug ? null : a.slug }) }))
    const kindChips = (Object.keys(kindLabels) as (keyof typeof kindLabels)[]).map((k) => ({
      key: `kind:${k}`,
      label: kindLabels[k],
      active: filters.kind === k,
      onClick: () => set({ kind: filters.kind === k ? null : k }),
    }))
    const yearChips = years(pool).map((y) => ({ key: `year:${y}`, label: y, active: filters.year === y, onClick: () => set({ year: filters.year === y ? null : y }) }))
    return [...albumChips, ...kindChips, ...yearChips].filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
  }, [pool, filters, query])

  const cameraChips = cameraModels
    .filter((m) => m.toLowerCase().includes(query.toLowerCase()))
    .map((m) => ({ key: m, label: m, active: filters.camera === m, onClick: () => set({ camera: filters.camera === m ? null : m }) }))

  const lensChips = lenses
    .filter((l) => l.short.toLowerCase().includes(query.toLowerCase()))
    .map((l) => ({ key: l.key, label: l.short, active: filters.lens === l.key, onClick: () => set({ lens: filters.lens === l.key ? null : l.key }) }))

  const cityChips = cities()
    .filter((c) => c.toLowerCase().includes(query.toLowerCase()))
    .map((c) => ({ key: c, label: c, active: filters.city === c, onClick: () => set({ city: filters.city === c ? null : c }) }))

  const ratingChips = [
    { key: 5, label: '5 stars', min: 5 },
    { key: 4, label: '4 stars & up', min: 4 },
    { key: 3, label: '3 stars & up', min: 3 },
    { key: 0, label: 'Any rating', min: 0 },
  ].map((r) => ({ key: String(r.key), label: r.label, active: filters.minRating === r.min, onClick: () => set({ minRating: r.min }) }))

  const chips = tab === 'tags' ? tagChips : tab === 'cameras' ? cameraChips : tab === 'lenses' ? lensChips : tab === 'cities' ? cityChips : ratingChips

  const touched = JSON.stringify(filters) !== JSON.stringify(emptyFilters)

  return (
    <div className="w-[min(92vw,380px)] overflow-hidden rounded-xl border border-edge bg-stage shadow-2xl">
      <div className="flex items-center justify-between border-b border-edge/70 px-4 py-3">
        <h3 className="display text-lg text-paper">Filter Photos</h3>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSearching((v) => !v)}
            aria-pressed={searching}
            aria-label="Search filters"
            className={'grid h-7 w-7 place-items-center rounded-full ' + (searching ? 'text-key' : 'text-haze hover:text-paper')}
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDense((v) => !v)}
            aria-pressed={dense}
            aria-label={dense ? 'Loosen chip layout' : 'Tighten chip layout'}
            className={'grid h-7 w-7 place-items-center rounded-full ' + (dense ? 'text-key' : 'text-haze hover:text-paper')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      {searching && (
        <div className="border-b border-edge/70 px-4 py-2.5">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this tab…"
            className="w-full rounded-lg border border-edge bg-pit px-3 py-1.5 text-sm text-paper placeholder:text-haze focus:border-key/60 focus:outline-none"
          />
        </div>
      )}

      <div className="thin-scroll flex gap-1.5 overflow-x-auto px-4 py-3">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            aria-pressed={tab === id}
            className={
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ' +
              (tab === id ? 'border-key/60 bg-key/15 text-key' : 'border-edge text-haze hover:border-haze/60 hover:text-paper')
            }
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      <div className={'flex flex-wrap gap-2 px-4 pb-4 ' + (dense ? 'max-h-24 overflow-y-auto thin-scroll' : '')}>
        {chips.length === 0 && <p className="text-sm text-haze">Nothing matches &ldquo;{query}&rdquo;.</p>}
        {chips.map((c) => (
          <Chip key={c.key} active={c.active} onClick={c.onClick}>
            {c.label}
          </Chip>
        ))}
      </div>

      {touched && (
        <div className="border-t border-edge/70 px-4 py-2.5">
          <button type="button" onClick={() => onChange(emptyFilters)} className="text-sm text-back underline underline-offset-4 hover:text-paper">
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
