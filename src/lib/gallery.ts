import { albums, photos } from '~/data/gallery'
import type { Album, Photo, PhotoFilters } from '~/lib/types'

/** Newest frame first — the whole gallery is ordered by capture time, never by upload time. */
export const timeline: Photo[] = [...photos].sort(
  (a, b) => Date.parse(b.takenAt) - Date.parse(a.takenAt),
)

export const albumBySlug = new Map<string, Album>(albums.map((a) => [a.slug, a]))

export function photosOf(slug: string): Photo[] {
  return timeline.filter((p) => p.albumSlug === slug)
}

export function coverOf(slug: string): Photo {
  const set = photosOf(slug)
  return set.reduce((best, p) => (p.rating > best.rating ? p : best), set[0])
}

export function neighbours(id: string, pool: Photo[]) {
  const i = pool.findIndex((p) => p.id === id)
  return {
    index: i,
    prev: i > 0 ? pool[i - 1] : null,
    next: i >= 0 && i < pool.length - 1 ? pool[i + 1] : null,
  }
}

export function applyFilters(pool: Photo[], f: PhotoFilters): Photo[] {
  return pool.filter((p) => {
    if (f.album && p.albumSlug !== f.album) return false
    if (f.lens && p.lensKey !== f.lens) return false
    if (f.year && p.takenAt.slice(0, 4) !== f.year) return false
    if (p.rating < f.minRating) return false
    if (f.camera && p.model !== f.camera) return false
    const album = albumBySlug.get(p.albumSlug)
    if (f.kind && album?.kind !== f.kind) return false
    if (f.city && album?.city !== f.city) return false
    return true
  })
}

/** Chronological buckets. The date header is the unit of navigation, as in ChronoFrame. */
export interface DayGroup {
  key: string
  label: string
  album: Album | undefined
  photos: Photo[]
}

export function groupByDay(pool: Photo[]): DayGroup[] {
  const buckets = new Map<string, Photo[]>()
  for (const p of pool) {
    const key = p.takenAt.slice(0, 10)
    const bucket = buckets.get(key)
    if (bucket) bucket.push(p)
    else buckets.set(key, [p])
  }
  return [...buckets.entries()].map(([key, set]) => ({
    key,
    label: longDate(key),
    album: albumBySlug.get(set[0].albumSlug),
    photos: set,
  }))
}

export function years(pool: Photo[]): string[] {
  return [...new Set(pool.map((p) => p.takenAt.slice(0, 4)))].sort().reverse()
}

export function cities(): string[] {
  return [...new Set(albums.map((a) => a.city))].sort()
}

export const kindLabels: Record<Album['kind'], string> = {
  concert: 'Concert',
  studio: 'Studio',
  documentary: 'Documentary',
}

export const cameraModels = [...new Set(photos.map((p) => p.model))]

/** A short, book-spine-style label for a frame, used for the "Title" sort. */
export function titleOf(photo: Photo): string {
  const album = albumBySlug.get(photo.albumSlug)
  const n = photo.id.split('-').pop() ?? ''
  return `${album?.title ?? photo.albumSlug} ${n}`
}

/** Coarse, build-time-relative label like the reference's "a year ago". */
export function relativeTime(iso: string): string {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000)
  if (days < 1) return 'today'
  if (days === 1) return 'a day ago'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return months === 1 ? 'a month ago' : `${months} months ago`
  const yrs = Math.floor(days / 365)
  return yrs === 1 ? 'a year ago' : `${yrs} years ago`
}

/** Stand-in "profile photo" for the header avatar — the top-rated studio frame. */
export const avatarPhoto = photos.find((p) => p.albumSlug === 'studio' && p.rating === 5) ?? photos[0]

export interface StorySlideData {
  title: string
  caption: string
  storyImage: string
}

/** The most recent few albums, packaged as story slides for the avatar's story viewer. */
export function featuredStories(count = 3): StorySlideData[] {
  return [...albums]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, count)
    .map((a) => ({
      title: `${a.title} — ${a.subtitle}`,
      caption: `${a.venue}, ${a.city} · ${longDate(a.date)}`,
      storyImage: cld(coverOf(a.slug).src, 1200),
    }))
}

export const lenses = [
  { key: 'ef-s-18-55', short: '18-55mm', label: 'EF-S 18-55mm f/3.5-5.6 IS II' },
  { key: 'ef-s-55-250', short: '55-250mm', label: 'EF-S 55-250mm f/4-5.6 IS II' },
]

export const body = {
  model: 'Canon EOS 1500D',
  sensor: 'APS-C CMOS, 24.1 MP',
  crop: 1.6,
}

/* ---------- formatting ---------- */

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export function longDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${Number(d)} ${MONTHS[Number(m) - 1]} ${y}`
}

export function shortDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-')
  return `${Number(d)} ${MONTHS[Number(m) - 1].slice(0, 3)} ${y}`
}

export function clockTime(iso: string): string {
  return iso.slice(11, 16)
}

export function fNumber(a: number): string {
  return `f/${a % 1 === 0 ? a.toFixed(0) : a.toFixed(1)}`
}

export function exposure(shutter: string): string {
  return `${shutter}s`
}

export function evLabel(ev: number): string {
  if (ev === 0) return '±0 EV'
  return `${ev > 0 ? '+' : '−'}${Math.abs(ev).toFixed(1)} EV`
}

export function megapixels(w: number, h: number): string {
  return `${((w * h) / 1_000_000).toFixed(1)} MP`
}

export function fileWeight(bytes: number): string {
  return `${(bytes / 1_048_576).toFixed(1)} MB`
}

export function coords(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lon).toFixed(4)}° ${ew}`
}

/** Cloudinary delivers the resize; we only ever ask for the width we paint. */
export function cld(src: string, width: number, quality = 'auto'): string {
  return src.replace('/upload/', `/upload/f_auto,q_${quality},w_${width},c_limit/`)
}

export function blurThumb(src: string): string {
  return src.replace('/upload/', '/upload/f_auto,q_10,w_24,e_blur:400/')
}

export { albums, photos }