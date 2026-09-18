import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import GalleryView from '~/components/GalleryView'
import { albumBySlug, albums, cld, coverOf, coords, lenses, longDate, photosOf } from '~/lib/gallery'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return albums.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const album = albumBySlug.get(slug)
  if (!album) return {}
  return {
    title: `${album.title} — ${album.subtitle}`,
    description: album.blurb,
    openGraph: { images: [cld(coverOf(slug).src, 1200)] },
  }
}

export default async function AlbumPage({ params }: Params) {
  const { slug } = await params
  const album = albumBySlug.get(slug)
  if (!album) notFound()

  const set = photosOf(slug)
  const lensUse = lenses
    .map((l) => ({ ...l, count: set.filter((p) => p.lensKey === l.key).length }))
    .filter((l) => l.count > 0)
  const isoRange = [Math.min(...set.map((p) => p.iso)), Math.max(...set.map((p) => p.iso))]

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6">
      <Link href="/albums" className="inline-flex items-center gap-1.5 text-sm text-haze hover:text-paper">
        <ArrowLeft className="h-4 w-4" />
        All albums
      </Link>

      <header className="mt-6 grid gap-8 border-b border-edge/70 pb-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h1 className="display text-6xl text-paper sm:text-7xl">{album.title}</h1>
          <p className="display mt-1 text-2xl text-key">{album.subtitle}</p>
          <p className="mt-5 max-w-[60ch] leading-relaxed text-haze">{album.blurb}</p>
        </div>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 self-end">
          <div>
            <dt className="text-xs text-haze">Date</dt>
            <dd className="data mt-1 text-paper">{longDate(album.date)}</dd>
          </div>
          <div>
            <dt className="text-xs text-haze">Venue</dt>
            <dd className="mt-1 text-sm text-paper">{album.venue}</dd>
          </div>
          <div>
            <dt className="text-xs text-haze">ISO range</dt>
            <dd className="data mt-1 text-paper">
              {isoRange[0]}–{isoRange[1]}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-haze">Position</dt>
            <dd className="data mt-1 text-paper">{coords(album.lat, album.lon)}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs text-haze">Lenses on the night</dt>
            <dd className="mt-1 flex flex-wrap gap-2">
              {lensUse.map((l) => (
                <span key={l.key} className="data rounded-full border border-edge px-2.5 py-1 text-paper">
                  {l.short} × {l.count}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </header>

      <GalleryView pool={set} showFilters={false} />
    </div>
  )
}