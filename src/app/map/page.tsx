import type { Metadata } from 'next'
import MapExplorer from '~/components/MapExplorer'
import { timeline } from '~/lib/gallery'

export const metadata: Metadata = {
  title: 'Map',
  description: 'Every frame plotted where the camera stood, clustered by venue.',
}

export default function MapPage() {
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6">
      <h1 className="display text-5xl text-paper sm:text-6xl">Where the camera stood.</h1>
      <p className="mt-4 max-w-[62ch] text-haze">
        Coordinates come off each frame, so the pins sit at the shooting position rather than at the
        venue's address. Almost all of it is within ten kilometres of the Doon valley floor.
      </p>

      <div className="mt-10">
        <MapExplorer pool={timeline} />
      </div>
    </div>
  )
}
