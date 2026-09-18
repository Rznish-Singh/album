'use client'

import { useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Story, StoryControls, StoryOverlay, StorySlide, StoryProgress } from '@/components/ui/story'
import { featuredStories } from '~/lib/gallery'

const AVATAR_SRC = 'https://res.cloudinary.com/dy4xybzrn/image/upload/v1788852616/1_-_Copy_gtcym4.png'

export default function AvatarStories({ className = '' }: { className?: string }) {
  const slides = useMemo(() => featuredStories(3), [])

  return (
    <Dialog>
      <DialogTrigger className={`rounded-full outline-none focus-visible:ring-2 focus-visible:ring-back ${className}`}>
        <Avatar className="size-full border border-key/40 ring-2 ring-key/20">
          <AvatarImage src={AVATAR_SRC} alt="rznish" />
          <AvatarFallback>RZ</AvatarFallback>
        </Avatar>
      </DialogTrigger>

      <DialogContent className="aspect-9/16 h-[85vh] w-auto overflow-hidden border-edge bg-pit p-0">
        <DialogTitle className="sr-only">Recent albums</DialogTitle>

        <Story className="relative size-full" duration={4000} mediaLength={slides.length}>
          <DialogHeader className="absolute inset-x-0 top-0 z-10 px-4 py-4">
            <div className="flex items-center gap-2">
              <Avatar className="size-9 border border-key/40">
                <AvatarImage src={AVATAR_SRC} alt="rznish" />
                <AvatarFallback>RZ</AvatarFallback>
              </Avatar>
              <StoryProgress className="flex-1" progressWrapClass="h-1" />
              <StoryControls variant="ghost" className="rounded-full text-white hover:bg-white/10 hover:text-white" />
            </div>
          </DialogHeader>

          {slides.map((slide, idx) => (
            <StorySlide key={idx} index={idx} className="absolute inset-0 size-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={slide.storyImage} className="h-full w-full object-cover" alt={slide.title} />
              <div className="absolute inset-x-0 bottom-0 z-10 space-y-1 p-4 text-white">
                <h3 className="display text-lg leading-tight">{slide.title}</h3>
                <p className="text-sm text-white/75">{slide.caption}</p>
              </div>
            </StorySlide>
          ))}

          <StoryOverlay />
        </Story>
      </DialogContent>
    </Dialog>
  )
}
