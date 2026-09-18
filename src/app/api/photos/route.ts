import { NextResponse } from 'next/server'
import { albums, applyFilters, timeline } from '~/lib/gallery'
import { emptyFilters } from '~/lib/types'

export const dynamic = 'force-static'

/** Read-only feed of the same data the pages render, for embeds and the portfolio site. */
export function GET(request: Request) {
  const q = new URL(request.url).searchParams
  const photos = applyFilters(timeline, {
    ...emptyFilters,
    album: q.get('album'),
    lens: q.get('lens'),
    year: q.get('year'),
    minRating: Number(q.get('minRating') ?? 0),
  })

  return NextResponse.json(
    { count: photos.length, albums, photos },
    { headers: { 'cache-control': 'public, max-age=3600, s-maxage=86400' } },
  )
}
