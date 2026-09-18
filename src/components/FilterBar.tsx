'use client'

import { albums, lenses, years } from '~/lib/gallery'
import { emptyFilters, type Photo, type PhotoFilters } from '~/lib/types'

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        'rounded-full border px-3 py-1 text-sm transition-colors ' +
        (active
          ? 'border-key/60 bg-key/15 text-key'
          : 'border-edge text-haze hover:border-haze/60 hover:text-paper')
      }
    >
      {children}
    </button>
  )
}

export default function FilterBar({
  pool,
  filters,
  onChange,
  resultCount,
}: {
  pool: Photo[]
  filters: PhotoFilters
  onChange: (next: PhotoFilters) => void
  resultCount: number
}) {
  const set = (patch: Partial<PhotoFilters>) => onChange({ ...filters, ...patch })
  const touched = JSON.stringify(filters) !== JSON.stringify(emptyFilters)

  return (
    <section
      aria-label="Filter the timeline"
      className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-edge/70 py-4"
    >
      <div className="flex flex-wrap items-center gap-2">
        {albums.map((a) => (
          <Chip
            key={a.slug}
            active={filters.album === a.slug}
            onClick={() => set({ album: filters.album === a.slug ? null : a.slug })}
          >
            {a.title}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {lenses.map((l) => (
          <Chip
            key={l.key}
            active={filters.lens === l.key}
            onClick={() => set({ lens: filters.lens === l.key ? null : l.key })}
          >
            {l.short}
          </Chip>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {years(pool).map((y) => (
          <Chip key={y} active={filters.year === y} onClick={() => set({ year: filters.year === y ? null : y })}>
            {y}
          </Chip>
        ))}
        <Chip active={filters.minRating === 5} onClick={() => set({ minRating: filters.minRating === 5 ? 0 : 5 })}>
          Picks only
        </Chip>
      </div>

      <p className="data ml-auto text-haze">
        {resultCount} {resultCount === 1 ? 'frame' : 'frames'}
        {touched && (
          <button
            type="button"
            onClick={() => onChange(emptyFilters)}
            className="ml-3 text-back underline underline-offset-4 hover:text-paper"
          >
            Clear filters
          </button>
        )}
      </p>
    </section>
  )
}
