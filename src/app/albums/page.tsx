import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import AlbumFolder from '@/components/ui/folder'
import EmojiReaction from '@/components/ui/emoji-reaction'
import { albums, cld, longDate, photosOf, relativeTime } from '~/lib/gallery'

export const metadata: Metadata = {
  title: 'Folder',
  description: 'Every shoot filed as its own night, with the venue, date and frame count.',
}

export default function AlbumsPage() {
  const ordered = [...albums].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-14 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-haze hover:text-paper">
        <ArrowLeft className="h-4 w-4" />
        Back to home
      </Link>

      <h1 className="display mt-6 max-w-[18ch] text-5xl text-paper sm:text-6xl">
        {/* Six nights, one body, two lenses. */}
      </h1>
      <p className="mt-4 max-w-[62ch] text-haze">
        {/* Each album is its own folder — hover to see what&rsquo;s inside, open it for the full
        timeline, its own filters and its own corner of the map. */}
      </p>

      <div className="mt-14 grid gap-x-8 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
        {ordered.map((album) => {
          const set = photosOf(album.slug)
          const covers = set.slice(0, 3).map((p) => cld(p.src, 420))

          return (
            <div key={album.slug} className="group relative flex flex-col items-center text-center">
              <div className="absolute top-0 right-2 z-20">
                <EmojiReaction size="sm" align="right" />
              </div>

              <Link href={`/albums/${album.slug}`} className="block">
                <AlbumFolder photos={covers} />
                <h2 className="display mt-2 text-2xl text-paper">{album.title}</h2>
                <p className="data mt-1 text-haze">
                  {relativeTime(album.date)} · {set.length} photos
                </p>
                <p className="mx-auto mt-2 max-w-[32ch] text-sm leading-relaxed text-haze/90">{album.blurb}</p>
              </Link>

              <p className="data mt-2 text-haze/70">
                {longDate(album.date)} · {album.venue}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}