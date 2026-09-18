'use client'

import Image from 'next/image'
import EmojiReaction from '@/components/ui/emoji-reaction'
import { clockTime, fNumber } from '~/lib/gallery'
import type { Photo } from '~/lib/types'

export default function PhotoTile({
  photo,
  onOpen,
  priority = false,
}: {
  photo: Photo
  onOpen: () => void
  priority?: boolean
}) {
  return (
    <div className="group relative mb-4 w-full break-inside-avoid overflow-hidden rounded-lg bg-riser">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${photo.id} at ${clockTime(photo.takenAt)}`}
        className="block w-full text-left"
      >
        <Image
          src={photo.src}
          alt=""
          width={photo.width}
          height={photo.height}
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw"
          priority={priority}
          className="h-auto w-full transition duration-500 group-hover:scale-[1.02] group-hover:brightness-110"
        />

        {/* The read-out only appears on intent, so the wall stays a wall of pictures. */}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-pit/90 to-transparent px-3 pt-8 pb-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="data text-paper">{clockTime(photo.takenAt)}</span>
          <span className="data text-haze">
            {photo.focalLength}mm · {fNumber(photo.aperture)} · ISO {photo.iso}
          </span>
        </span>
      </button>

      {photo.rating === 5 && (
        <span
          className="pointer-events-none absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-key shadow-[0_0_10px_2px_rgba(62,240,122,0.55)]"
          title="Pick of the set"
        />
      )}

      <div className="absolute bottom-2 left-2 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100">
        <EmojiReaction size="sm" align="left" />
      </div>
    </div>
  )
}
