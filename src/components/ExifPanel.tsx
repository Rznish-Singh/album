'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import Histogram from '~/components/Histogram'
import {
  albumBySlug,
  body,
  clockTime,
  coords,
  evLabel,
  exposure,
  fNumber,
  fileWeight,
  longDate,
  megapixels,
} from '~/lib/gallery'
import type { Photo } from '~/lib/types'

const MapCanvas = dynamic(() => import('~/components/MapCanvas'), {
  ssr: false,
  loading: () => <div className="h-36 animate-pulse rounded-lg bg-edge/50" />,
})

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-edge/50 py-1.5 last:border-0">
      <dt className="text-xs text-haze">{k}</dt>
      <dd className="data text-right text-paper">{v}</dd>
    </div>
  )
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h3 className="display mb-2 text-lg text-paper">{title}</h3>
      <dl>{children}</dl>
    </section>
  )
}

export default function ExifPanel({ photo }: { photo: Photo }) {
  const album = albumBySlug.get(photo.albumSlug)

  return (
    <div className="thin-scroll h-full overflow-y-auto px-5 py-5">
      {album && (
        <div className="mb-6">
          <Link
            href={`/albums/${album.slug}`}
            className="display text-2xl text-paper underline-offset-4 hover:underline"
          >
            {album.title}
          </Link>
          <p className="mt-1 text-sm text-haze">
            {album.subtitle} · {album.venue}
          </p>
        </div>
      )}

      <Block title="Frame">
        <Row k="Taken" v={`${longDate(photo.takenAt)}, ${clockTime(photo.takenAt)}`} />
        <Row k="Dimensions" v={`${photo.width} × ${photo.height}`} />
        <Row k="Resolution" v={megapixels(photo.width, photo.height)} />
        <Row k="File" v={fileWeight(photo.fileSize)} />
        <Row k="Rating" v={'★'.repeat(photo.rating) + '☆'.repeat(5 - photo.rating)} />
      </Block>

      <Block title="Exposure">
        <Row k="Shutter" v={exposure(photo.shutterSpeed)} />
        <Row k="Aperture" v={fNumber(photo.aperture)} />
        <Row k="ISO" v={String(photo.iso)} />
        <Row k="Compensation" v={evLabel(photo.exposureCompensation)} />
        <Row k="Metering" v={photo.meteringMode} />
        <Row k="White balance" v={photo.whiteBalance} />
        <Row k="Flash" v={photo.flash ? 'Fired' : 'Did not fire'} />
      </Block>

      <Block title="Camera">
        <Row k="Body" v={photo.model} />
        <Row k="Sensor" v={body.sensor} />
        <Row k="Lens" v={photo.lens} />
        <Row k="Focal length" v={`${photo.focalLength}mm`} />
        <Row k="Full-frame equivalent" v={`${photo.focalLength35}mm`} />
      </Block>

      <section className="mb-6">
        <h3 className="display mb-2 text-lg text-paper">Tone curve</h3>
        <Histogram src={photo.src} />
        <p className="data mt-1.5 flex justify-between text-haze">
          <span>shadows</span>
          <span>highlights</span>
        </p>
      </section>

      <section>
        <h3 className="display mb-2 text-lg text-paper">Where</h3>
        <div className="overflow-hidden rounded-lg border border-edge">
          <MapCanvas
            photos={[photo]}
            interactive={false}
            cluster={false}
            zoom={14}
            center={[photo.lon, photo.lat]}
            className="h-36 w-full"
          />
        </div>
        <p className="data mt-2 text-haze">{coords(photo.lat, photo.lon)}</p>
        {album && (
          <p className="mt-1 text-sm text-haze">
            {album.venue}, {album.city}
          </p>
        )}
      </section>
    </div>
  )
}
