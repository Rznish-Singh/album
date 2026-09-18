'use client'

import { useEffect, useRef, useState } from 'react'
import { cld } from '~/lib/gallery'

const BINS = 48

/**
 * Reads the delivered JPEG back off a canvas to plot its tone curve — the same
 * read-out ChronoFrame shows next to the EXIF block.
 */
export default function Histogram({ src }: { src: string }) {
  const [bands, setBands] = useState<number[][] | null>(null)
  const [failed, setFailed] = useState(false)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    setBands(null)
    setFailed(false)

    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.src = cld(src, 180)

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) throw new Error('no 2d context')
        ctx.drawImage(img, 0, 0)
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const out = [new Array(BINS).fill(0), new Array(BINS).fill(0), new Array(BINS).fill(0)]
        for (let i = 0; i < data.length; i += 4) {
          out[0][Math.min(BINS - 1, (data[i] * BINS) >> 8)]++
          out[1][Math.min(BINS - 1, (data[i + 1] * BINS) >> 8)]++
          out[2][Math.min(BINS - 1, (data[i + 2] * BINS) >> 8)]++
        }
        const peak = Math.max(...out.flat(), 1)
        if (alive.current) setBands(out.map((b) => b.map((v) => v / peak)))
      } catch {
        if (alive.current) setFailed(true)
      }
    }
    img.onerror = () => alive.current && setFailed(true)

    return () => {
      alive.current = false
    }
  }, [src])

  if (failed) {
    return (
      <p className="data text-haze">
        Tone curve unavailable — the image host did not allow a pixel read.
      </p>
    )
  }

  if (!bands) return <div className="h-16 animate-pulse rounded bg-edge/50" />

  const path = (band: number[]) => {
    const step = 100 / (BINS - 1)
    const pts = band.map((v, i) => `${(i * step).toFixed(2)},${(100 - v * 100).toFixed(2)}`)
    return `M0,100 L${pts.join(' L')} L100,100 Z`
  }

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-16 w-full" role="img" aria-label="Tone distribution across the red, green and blue channels">
      <rect width="100" height="100" fill="#07090a" />
      {[25, 50, 75].map((x) => (
        <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="#1f2f22" strokeWidth="0.4" />
      ))}
      {/* Channels stay true red/green/blue — that's the reading a photographer expects,
          even on a green-on-black page. */}
      <path d={path(bands[0])} fill="#d4574f" fillOpacity="0.5" />
      <path d={path(bands[1])} fill="#3ef07a" fillOpacity="0.55" />
      <path d={path(bands[2])} fill="#4f7fd4" fillOpacity="0.45" />
    </svg>
  )
}
