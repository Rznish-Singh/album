'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import Lightbox from '~/components/Lightbox'
import { albums, coverOf, photosOf, shortDate } from '~/lib/gallery'
import type { Photo } from '~/lib/types'

const MapCanvas = dynamic(() => import('~/components/MapCanvas'), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center bg-stage text-sm text-haze">Loading the map…</div>
  ),
})

export default function MapExplorer({ pool }: { pool: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const byId = useMemo(() => new Map(pool.map((p, i) => [p.id, i])), [pool])

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="h-[62vh] min-h-[420px] overflow-hidden rounded-xl border border-edge">
          <MapCanvas
            photos={pool}
            zoom={11.4}
            onSelect={(id) => setOpenIndex(byId.get(id) ?? null)}
            className="h-full w-full"
          />
        </div>

        <aside className="space-y-3">
          <p className="text-sm text-haze">
            Pins cluster until you zoom in. Tap one to see the frame and open it full size.
          </p>
          {albums.map((a) => {
            const set = photosOf(a.slug)
            return (
              <button
                key={a.slug}
                type="button"
                onClick={() => setOpenIndex(byId.get(coverOf(a.slug).id) ?? null)}
                className="flex w-full items-center gap-3 rounded-lg border border-edge bg-stage p-2 text-left transition-colors hover:border-haze/60"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverOf(a.slug).src.replace('/upload/', '/upload/f_auto,q_auto,w_120,c_fill,ar_1/')}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded object-cover"
                />
                <span className="min-w-0">
                  <span className="block truncate text-sm text-paper">{a.title}</span>
                  <span className="data block truncate text-haze">
                    {a.venue} · {shortDate(a.date)} · {set.length}
                  </span>
                </span>
              </button>
            )
          })}
        </aside>
      </div>

      {openIndex !== null && (
        <Lightbox pool={pool} index={openIndex} onIndexChange={setOpenIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  )
}
