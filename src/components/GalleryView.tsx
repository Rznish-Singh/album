'use client'

import { useEffect, useMemo, useState } from 'react'
import FilterBar from '~/components/FilterBar'
import Lightbox from '~/components/Lightbox'
import PhotoTile from '~/components/PhotoTile'
import { applyFilters, clockTime, groupByDay } from '~/lib/gallery'
import { emptyFilters, type Photo, type PhotoFilters } from '~/lib/types'

export default function GalleryView({
  pool,
  showFilters = true,
}: {
  pool: Photo[]
  showFilters?: boolean
}) {
  const [filters, setFilters] = useState<PhotoFilters>(emptyFilters)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const visible = useMemo(() => applyFilters(pool, filters), [pool, filters])
  const groups = useMemo(() => groupByDay(visible), [visible])

  // A shared link lands on its frame; the URL keeps up as you arrow through the set.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('frame')
    if (!id) return
    const i = pool.findIndex((p) => p.id === id)
    if (i >= 0) setOpenIndex(i)
  }, [pool])

  useEffect(() => {
    const url = new URL(window.location.href)
    if (openIndex === null) url.searchParams.delete('frame')
    else url.searchParams.set('frame', visible[openIndex]?.id ?? '')
    window.history.replaceState(null, '', url)
  }, [openIndex, visible])

  return (
    <>
      {showFilters && (
        <FilterBar pool={pool} filters={filters} onChange={setFilters} resultCount={visible.length} />
      )}

      {visible.length === 0 ? (
        <div className="py-24 text-center">
          <p className="display text-3xl text-paper">Nothing was shot under those settings.</p>
          <button
            type="button"
            onClick={() => setFilters(emptyFilters)}
            className="mt-4 rounded-full border border-back/60 px-4 py-2 text-sm text-back hover:bg-back/10"
          >
            Clear filters
          </button>
        </div>
      ) : (
        groups.map((group, gi) => (
          <section key={group.key} id={`day-${group.key}`} className="scroll-mt-20 pt-10">
            <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b border-edge/60 pb-2">
              <h2 className="display text-3xl text-paper">{group.label}</h2>
              {group.album && (
                <p className="text-sm text-haze">
                  {group.album.title} — {group.album.venue}
                </p>
              )}
              <p className="data ml-auto text-haze">
                {clockTime(group.photos[group.photos.length - 1].takenAt)}–
                {clockTime(group.photos[0].takenAt)} · {group.photos.length} frames
              </p>
            </div>

            <div className="columns-2 gap-4 md:columns-3 xl:columns-4">
              {group.photos.map((photo, i) => (
                <PhotoTile
                  key={photo.id}
                  photo={photo}
                  priority={gi === 0 && i < 4}
                  onOpen={() => setOpenIndex(visible.findIndex((p) => p.id === photo.id))}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {openIndex !== null && visible[openIndex] && (
        <Lightbox
          pool={visible}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  )
}
