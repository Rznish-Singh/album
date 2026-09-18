'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { IconFilter, IconGrid, IconMap, IconSort } from '~/components/icons'
import AskAiButton from '~/components/AskAiButton'
import AvatarStories from '~/components/AvatarStories'
import FilterPopover from '~/components/FilterPopover'
import Lightbox from '~/components/Lightbox'
import PhotoTile from '~/components/PhotoTile'
import SortMenu, { type SortKey } from '~/components/SortMenu'
import ThemeTogglerButton from '@/components/ui/theme-toggler-button'
import { albums, applyFilters, shortDate, titleOf } from '~/lib/gallery'
import { emptyFilters, type Photo, type PhotoFilters } from '~/lib/types'

function ToolbarButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  const cls =
    'grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ' +
    (active ? 'border-key/60 bg-key/15 text-key' : 'border-edge text-haze hover:border-haze/60 hover:text-paper')
  const inner = <span className="h-4 w-4">{children}</span>

  return onClick ? (
    <button type="button" onClick={onClick} aria-label={label} aria-pressed={active} title={label} className={cls}>
      {inner}
    </button>
  ) : (
    <span title={label} className={cls}>
      {inner}
    </span>
  )
}

function sortPool(pool: Photo[], key: SortKey): Photo[] {
  const list = [...pool]
  switch (key) {
    case 'date-asc':
      return list.sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt))
    case 'size-asc':
      return list.sort((a, b) => a.fileSize - b.fileSize)
    case 'size-desc':
      return list.sort((a, b) => b.fileSize - a.fileSize)
    case 'title-asc':
      return list.sort((a, b) => titleOf(a).localeCompare(titleOf(b)))
    case 'title-desc':
      return list.sort((a, b) => titleOf(b).localeCompare(titleOf(a)))
    case 'date-desc':
    default:
      return list.sort((a, b) => Date.parse(b.takenAt) - Date.parse(a.takenAt))
  }
}

export default function HomeGallery({ pool }: { pool: Photo[] }) {
  const [filters, setFilters] = useState<PhotoFilters>(emptyFilters)
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')
  const [openPopover, setOpenPopover] = useState<'filter' | 'sort' | null>(null)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)

  const ordered = useMemo(() => sortPool(pool, sortKey), [pool, sortKey])
  const visible = useMemo(() => applyFilters(ordered, filters), [ordered, filters])
  const touched = JSON.stringify(filters) !== JSON.stringify(emptyFilters)

  useEffect(() => {
    if (!openPopover) return
    const onDown = (e: PointerEvent) => {
      if (!toolbarRef.current?.contains(e.target as Node)) setOpenPopover(null)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpenPopover(null)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [openPopover])

  const oldest = pool[pool.length - 1]
  const newest = pool[0]
  const year = new Date(newest.takenAt).getFullYear()

  return (
    <>
      <div className="mx-auto max-w-[1500px] px-4 py-4 sm:px-6 columns-2 gap-3 sm:columns-2 md:columns-3 xl:columns-4">
        {/* Full width on a phone, like the reference — embedded as the grid's first
            column-width cell from `sm:` up, with the frames flowing in beside it. */}
        <div className="relative mb-3 [column-span:all] break-inside-avoid overflow-visible rounded-xl border border-edge bg-stage sm:[column-span:none]">
          <div className="flex flex-col items-center p-5 text-center sm:items-start sm:p-5 sm:text-left">
            <AvatarStories className="h-14 w-14" />
            <h1 className="display mt-3 text-2xl text-paper">rznish studio</h1>
            <p className="data mt-1 text-haze">
              {shortDate(oldest.takenAt)} – {shortDate(newest.takenAt)} · {pool.length} photos total
            </p>
            <p className="mt-2 text-xl leading-none text-key" style={{ fontFamily: 'var(--font-script)' }}>
              Everything the shutter kept.
            </p>

            <div ref={toolbarRef} className="relative mt-4 flex items-center justify-center gap-2 sm:justify-start">
              <Link href="/map" aria-label="Open the map">
                <ToolbarButton label="Open the map">
                  <IconMap className="h-full w-full" />
                </ToolbarButton>
              </Link>
              <Link href="/albums" aria-label="Browse albums">
                <ToolbarButton label="Browse albums">
                  <IconGrid className="h-full w-full" />
                </ToolbarButton>
              </Link>

              <ToolbarButton
                label="Filter photos"
                active={openPopover === 'filter' || touched}
                onClick={() => setOpenPopover((v) => (v === 'filter' ? null : 'filter'))}
              >
                <IconFilter className="h-full w-full" />
              </ToolbarButton>

              <ToolbarButton label="Sort by" active={openPopover === 'sort'} onClick={() => setOpenPopover((v) => (v === 'sort' ? null : 'sort'))}>
                <IconSort className="h-full w-full" />
              </ToolbarButton>

              <ThemeTogglerButton />

              {openPopover === 'filter' && (
                <div className="absolute top-full left-1/2 z-30 mt-2 -translate-x-1/2 sm:left-0 sm:translate-x-0">
                  <FilterPopover pool={pool} filters={filters} onChange={setFilters} />
                </div>
              )}
              {openPopover === 'sort' && (
                <div className="absolute top-full left-1/2 z-30 mt-2 -translate-x-1/2 sm:left-0 sm:translate-x-0">
                  <SortMenu
                    value={sortKey}
                    onChange={(k) => {
                      setSortKey(k)
                      setOpenPopover(null)
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t border-edge/70 px-4 py-2.5 text-center sm:justify-between sm:px-5 sm:text-left">
            <p className="data text-haze">© {2026} rznish</p>
            <p className="data text-haze">{albums.length} folder </p>
          </div>
        </div>

        {visible.map((photo, i) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            priority={i < 4}
            onOpen={() => setOpenIndex(visible.findIndex((p) => p.id === photo.id))}
          />
        ))}
      </div>

      {visible.length === 0 && (
        <div className="py-16 text-center">
          <p className="display text-2xl text-paper">Nothing was shot under those settings.</p>
          <button
            type="button"
            onClick={() => setFilters(emptyFilters)}
            className="mt-4 rounded-full border border-back/60 px-4 py-2 text-sm text-back hover:bg-back/10"
          >
            Clear filters
          </button>
        </div>
      )}

      {openIndex !== null && visible[openIndex] && (
        <Lightbox
          pool={visible}
          index={openIndex}
          onIndexChange={setOpenIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}

      <AskAiButton />
    </>
  )
}