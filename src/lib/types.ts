export type AlbumKind = 'concert' | 'studio' | 'documentary'

export interface Album {
  slug: string
  title: string
  subtitle: string
  kind: AlbumKind
  venue: string
  city: string
  country: string
  lat: number
  lon: number
  date: string
  start_hour: number
  blurb: string
}

export interface Photo {
  id: string
  albumSlug: string
  src: string
  width: number
  height: number
  takenAt: string
  make: string
  model: string
  lens: string
  lensKey: string
  focalLength: number
  focalLength35: number
  aperture: number
  shutterSpeed: string
  iso: number
  exposureCompensation: number
  meteringMode: string
  whiteBalance: string
  flash: boolean
  lat: number
  lon: number
  rating: number
  fileSize: number
}

export interface PhotoFilters {
  album: string | null
  lens: string | null
  year: string | null
  minRating: number
  kind: AlbumKind | null
  city: string | null
  camera: string | null
}

export const emptyFilters: PhotoFilters = {
  album: null,
  lens: null,
  year: null,
  minRating: 0,
  kind: null,
  city: null,
  camera: null,
}
