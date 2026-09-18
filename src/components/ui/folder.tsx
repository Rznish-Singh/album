'use client'

import Image from 'next/image'
import { useState } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

const BASE_WIDTH = 280
const BASE_HEIGHT = 236

const FLAP_PATH =
  'M0 22C0 9.8 9.8 0 22 0H119C125.1 0 130.9 2.5 135.1 7L156 29.4C160.2 33.9 166 36.4 172.1 36.4H259C271.2 36.4 281 46.2 281 58.4V189C281 201.2 271.2 211 259 211H22C9.8 211 0 201.2 0 189V22Z'

/** One photo, angled like a print pulled halfway out of a folder. */
function Paper({ src, style }: { src: string; style: React.CSSProperties }) {
  return (
    <div
      className="absolute h-[168px] w-[128px] overflow-hidden rounded-xl border border-edge/70 bg-riser shadow-[0_14px_30px_-10px_rgba(0,0,0,0.6)]"
      style={style}
    >
      <Image src={src} alt="" fill sizes="128px" className="object-cover" />
    </div>
  )
}

export function AlbumFolder({
  photos,
  className,
}: {
  /** Up to three cover photos, front-to-back. */
  photos: string[]
  className?: string
}) {
  const [isHovered, setIsHovered] = useState(false)
  const set = [photos[0], photos[1], photos[2]].filter(Boolean) as string[]

  return (
    <div
      data-slot="album-folder"
      className={cn('relative select-none', className)}
      style={{ width: BASE_WIDTH, height: BASE_HEIGHT + 34 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{ width: BASE_WIDTH, height: BASE_HEIGHT }}>
        {/* folder back */}
        <div
          className="absolute inset-x-2 top-3 bottom-0 rounded-2xl"
          style={{
            background: 'linear-gradient(160deg, #1a2a1d 0%, #0e150f 100%)',
            boxShadow: 'inset 0 0 10px 2px rgba(62,240,122,0.12)',
          }}
        />

        {/* fanning photos */}
        <div className="absolute inset-0 flex items-center justify-center">
          {set[2] && (
            <motion.div
              className="absolute"
              animate={{ y: isHovered ? -48 : -14, x: isHovered ? -58 : -30, rotate: isHovered ? -12 : -5 }}
              transition={{ type: 'spring', stiffness: 130, damping: 14 }}
            >
              <Paper src={set[2]} style={{ transform: 'translate(-50%, -50%)' }} />
            </motion.div>
          )}
          {set[1] && (
            <motion.div
              className="absolute"
              animate={{ y: isHovered ? -58 : -18, x: isHovered ? 0 : 3, rotate: isHovered ? 3 : 2 }}
              transition={{ type: 'spring', stiffness: 130, damping: 14, delay: 0.02 }}
            >
              <Paper src={set[1]} style={{ transform: 'translate(-50%, -50%)' }} />
            </motion.div>
          )}
          {set[0] && (
            <motion.div
              className="absolute"
              animate={{ y: isHovered ? -46 : -12, x: isHovered ? 58 : 28, rotate: isHovered ? 14 : 7 }}
              transition={{ type: 'spring', stiffness: 130, damping: 14, delay: 0.04 }}
            >
              <Paper src={set[0]} style={{ transform: 'translate(-50%, -50%)' }} />
            </motion.div>
          )}
        </div>

        {/* front flap, glassy and slightly lifted on hover */}
        <motion.div
          className="absolute top-6 left-1/2 -translate-x-1/2"
          style={{ width: 281, height: 211, transformOrigin: 'bottom center' }}
          animate={{ rotateX: isHovered ? -38 : -14, y: isHovered ? 2 : 0 }}
          transition={{ type: 'spring', stiffness: 130, damping: 15 }}
        >
          <div
            className="absolute inset-0"
            style={{
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              clipPath: `path('${FLAP_PATH}')`,
              WebkitClipPath: `path('${FLAP_PATH}')`,
            }}
          />
          <svg width="281" height="211" viewBox="0 0 281 211" fill="none" className="absolute inset-0">
            <path d={FLAP_PATH} fill="#1c2b1e" fillOpacity="0.55" />
            <path d={FLAP_PATH} stroke="#33472f" strokeOpacity="0.9" />
          </svg>
        </motion.div>
      </div>
    </div>
  )
}

export default AlbumFolder
