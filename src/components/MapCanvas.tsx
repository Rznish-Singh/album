'use client'

import { useEffect, useRef } from 'react'
import maplibregl, { type StyleSpecification } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { albumBySlug, cld, shortDate } from '~/lib/gallery'
import type { Photo } from '~/lib/types'

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY

/** Keyless fallback so the map works on a clean clone with no accounts set up. */
const osmRaster: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [
    { id: 'bg', type: 'background', paint: { 'background-color': '#07090a' } },
    {
      id: 'osm',
      type: 'raster',
      source: 'osm',
      // Pull the basemap down and green it off so the photo pins stay the brightest thing.
      paint: {
        'raster-saturation': -0.7,
        'raster-hue-rotate': 70,
        'raster-brightness-max': 0.62,
        'raster-contrast': 0.15,
      },
    },
  ],
}

const mapStyle = (): string | StyleSpecification =>
  MAPTILER_KEY ? `https://api.maptiler.com/maps/dataviz-dark/style.json?key=${MAPTILER_KEY}` : osmRaster

export default function MapCanvas({
  photos,
  interactive = true,
  zoom = 11,
  center,
  cluster = true,
  onSelect,
  className = '',
}: {
  photos: Photo[]
  interactive?: boolean
  zoom?: number
  center?: [number, number]
  cluster?: boolean
  onSelect?: (id: string) => void
  className?: string
}) {
  const holder = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const select = useRef(onSelect)
  select.current = onSelect

  useEffect(() => {
    if (!holder.current || map.current) return

    const start: [number, number] =
      center ??
      (photos.length
        ? [
            photos.reduce((s, p) => s + p.lon, 0) / photos.length,
            photos.reduce((s, p) => s + p.lat, 0) / photos.length,
          ]
        : [78.03, 30.32])

    const m = new maplibregl.Map({
      container: holder.current,
      style: mapStyle(),
      center: start,
      zoom,
      interactive,
      attributionControl: interactive ? { compact: true } : false,
    })
    map.current = m

    if (interactive) {
      m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
      m.addControl(new maplibregl.FullscreenControl(), 'bottom-right')
    }

    m.on('load', () => {
      m.addSource('frames', {
        type: 'geojson',
        cluster,
        clusterRadius: 44,
        clusterMaxZoom: 15,
        data: {
          type: 'FeatureCollection',
          features: photos.map((p) => ({
            type: 'Feature' as const,
            geometry: { type: 'Point' as const, coordinates: [p.lon, p.lat] },
            properties: {
              id: p.id,
              src: cld(p.src, 220),
              album: albumBySlug.get(p.albumSlug)?.title ?? '',
              venue: albumBySlug.get(p.albumSlug)?.venue ?? '',
              date: shortDate(p.takenAt),
            },
          })),
        },
      })

      if (cluster) {
        m.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'frames',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#1c8a4c',
            'circle-opacity': 0.92,
            'circle-radius': ['step', ['get', 'point_count'], 16, 5, 21, 10, 27],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#07090a',
          },
        })
        m.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'frames',
          filter: ['has', 'point_count'],
          layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-size': 12 },
          paint: { 'text-color': '#eaf3ea' },
        })
      }

      m.addLayer({
        id: 'frame-pin',
        type: 'circle',
        source: 'frames',
        filter: cluster ? ['!', ['has', 'point_count']] : ['all'],
        paint: {
          'circle-color': '#3ef07a',
          'circle-radius': interactive ? 7 : 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#07090a',
        },
      })

      if (!interactive) return

      m.on('click', 'clusters', (e) => {
        const f = m.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0]
        const src = m.getSource('frames') as maplibregl.GeoJSONSource
        src.getClusterExpansionZoom(f.properties.cluster_id as number).then((z) => {
          m.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: z })
        })
      })

      m.on('click', 'frame-pin', (e) => {
        const f = e.features?.[0]
        if (!f) return
        const p = f.properties as Record<string, string>
        const node = document.createElement('div')
        node.className = 'w-[220px]'
        node.innerHTML = `
          <img src="${p.src}" alt="" class="block h-[130px] w-full object-cover" />
          <div class="px-3 py-2">
            <p class="text-sm font-medium text-[#eaf3ea]">${p.album}</p>
            <p class="text-[11px] text-[#8ea98e]">${p.venue} · ${p.date}</p>
            <button type="button" class="mt-2 text-[12px] text-[#56e0a0] underline underline-offset-4">Open this frame</button>
          </div>`
        node.querySelector('button')?.addEventListener('click', () => select.current?.(p.id))
        new maplibregl.Popup({ offset: 14, closeButton: true, maxWidth: '240px' })
          .setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
          .setDOMContent(node)
          .addTo(m)
      })

      for (const layer of ['clusters', 'frame-pin']) {
        m.on('mouseenter', layer, () => (m.getCanvas().style.cursor = 'pointer'))
        m.on('mouseleave', layer, () => (m.getCanvas().style.cursor = ''))
      }
    })

    return () => {
      m.remove()
      map.current = null
    }
    // Instances are built once; the photo set for a given mount never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div ref={holder} className={className} aria-label="Map of where these photos were taken" />
}
