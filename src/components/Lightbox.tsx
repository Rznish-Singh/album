'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Download, Info, Share2, X } from 'lucide-react'
import ExifPanel from '~/components/ExifPanel'
import { cld, clockTime, fNumber, shortDate } from '~/lib/gallery'
import type { Photo } from '~/lib/types'

function IconButton({
  label,
  onClick,
  active = false,
  children,
}: {
  label: string
  onClick: () => void
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={
        'grid h-9 w-9 place-items-center rounded-full border transition-colors ' +
        (active
          ? 'border-back/60 bg-back/15 text-back'
          : 'border-edge bg-stage/80 text-haze hover:text-paper')
      }
    >
      {children}
    </button>
  )
}

export default function Lightbox({
  pool,
  index,
  onIndexChange,
  onClose,
}: {
  pool: Photo[]
  index: number
  onIndexChange: (next: number) => void
  onClose: () => void
}) {
  const [showInfo, setShowInfo] = useState(true)
  const [zoomed, setZoomed] = useState(false)
  const [origin, setOrigin] = useState('50% 50%')
  const [copied, setCopied] = useState(false)
  const strip = useRef<HTMLDivElement>(null)
  const photo = pool[index]

  const go = useCallback(
    (delta: number) => {
      const next = index + delta
      if (next < 0 || next >= pool.length) return
      setZoomed(false)
      onIndexChange(next)
    },
    [index, pool.length, onIndexChange],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return zoomed ? setZoomed(false) : onClose()
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key.toLowerCase() === 'i') setShowInfo((v) => !v)
      if (e.key === 'Home') onIndexChange(0)
      if (e.key === 'End') onIndexChange(pool.length - 1)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [go, onClose, onIndexChange, pool.length, zoomed])

  // Warm the neighbours so arrowing through the set never shows a blank frame.
  useEffect(() => {
    for (const p of [pool[index + 1], pool[index - 1]]) {
      if (!p) continue
      const img = new window.Image()
      img.src = cld(p.src, 1600)
    }
  }, [index, pool])

  useEffect(() => {
    strip.current?.querySelector('[data-active="true"]')?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [index])

  const share = async () => {
    const url = `${window.location.origin}${window.location.pathname}?frame=${photo.id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: `rznish — ${photo.id}`, url })
        return
      } catch {
        /* the sheet was dismissed; fall through to the clipboard */
      }
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Frame ${index + 1} of ${pool.length}`}
      className="lights-down fixed inset-0 z-50 flex flex-col bg-pit/97 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 border-b border-edge/70 px-4 py-2.5">
        <p className="data text-haze">
          {String(index + 1).padStart(2, '0')} / {String(pool.length).padStart(2, '0')}
        </p>
        <p className="data hidden text-paper sm:block">
          {shortDate(photo.takenAt)} · {clockTime(photo.takenAt)}
        </p>
        <p className="data ml-auto hidden text-haze md:block">
          {photo.focalLength}mm · {fNumber(photo.aperture)} · {photo.shutterSpeed}s · ISO {photo.iso}
        </p>
        <div className="ml-auto flex items-center gap-2 md:ml-3">
          <IconButton label={copied ? 'Link copied' : 'Copy link to this frame'} onClick={share}>
            {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
          </IconButton>
          <a
            href={cld(photo.src, 2400, '90')}
            target="_blank"
            rel="noreferrer"
            title="Open the full-size file"
            aria-label="Open the full-size file"
            className="grid h-9 w-9 place-items-center rounded-full border border-edge bg-stage/80 text-haze transition-colors hover:text-paper"
          >
            <Download className="h-4 w-4" />
          </a>
          <IconButton label="Show camera data" active={showInfo} onClick={() => setShowInfo((v) => !v)}>
            <Info className="h-4 w-4" />
          </IconButton>
          <IconButton label="Close" onClick={onClose}>
            <X className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden p-2 sm:p-6">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={index === 0}
            aria-label="Previous frame"
            className="absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full border border-edge bg-stage/80 text-paper disabled:opacity-25 sm:left-4"
          >
            ‹
          </button>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={photo.id}
            src={cld(photo.src, 1800)}
            alt={`Frame from ${photo.albumSlug}, ${shortDate(photo.takenAt)}`}
            onClick={(e) => {
              const r = e.currentTarget.getBoundingClientRect()
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`)
              setZoomed((v) => !v)
            }}
            style={{ transformOrigin: origin, transform: zoomed ? 'scale(2.25)' : 'none' }}
            className="frame-up max-h-full max-w-full cursor-zoom-in object-contain transition-transform duration-300 ease-out"
          />

          <button
            type="button"
            onClick={() => go(1)}
            disabled={index === pool.length - 1}
            aria-label="Next frame"
            className="absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full border border-edge bg-stage/80 text-paper disabled:opacity-25 sm:right-4"
          >
            ›
          </button>
        </div>

        {showInfo && (
          <aside className="w-full shrink-0 border-t border-edge/70 bg-stage lg:h-auto lg:w-[340px] lg:border-t-0 lg:border-l">
            <ExifPanel photo={photo} />
          </aside>
        )}
      </div>

      <div ref={strip} className="thin-scroll flex gap-2 overflow-x-auto border-t border-edge/70 px-4 py-3">
        {pool.map((p, i) => (
          <button
            key={p.id}
            type="button"
            data-active={i === index}
            onClick={() => onIndexChange(i)}
            aria-label={`Go to frame ${i + 1}`}
            aria-current={i === index}
            className={
              'h-12 w-16 shrink-0 overflow-hidden rounded border transition-opacity ' +
              (i === index ? 'border-key opacity-100' : 'border-transparent opacity-45 hover:opacity-80')
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cld(p.src, 140)} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}