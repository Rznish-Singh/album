'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Send, Sparkles, X } from 'lucide-react'
import Shdr02 from '@/components/ui/shdr-02'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: number
  role: 'user' | 'assistant'
  text: string
}

const OPENING_MESSAGE: ChatMessage = {
  id: 0,
  role: 'assistant',
  text: "Hey — I'm a preview. I can't search the archive yet, but this is what asking me will feel like once I can.",
}

// Canned so the preview has *something* to say without a real model behind it yet.
const CANNED_REPLIES = [
 "Coming soon — I'll pull the answer directly from the EXIF and album data, so there's no guessing.",

"Coming soon — you'll be able to ask this here and get answers directly from the actual archive.",

"Not available just yet, but this chat feature is coming soon and will connect directly to your archive.",
]

function nextCannedReply(seed: number) {
  return CANNED_REPLIES[seed % CANNED_REPLIES.length]
}

export default function AskAiButton() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([OPENING_MESSAGE])
  const [draft, setDraft] = useState('')
  const [thinking, setThinking] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const replySeed = useRef(0)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text || thinking) return

    setMessages((prev) => [...prev, { id: prev.length, role: 'user', text }])
    setDraft('')
    setThinking(true)

    // No backend behind this yet — this is a scripted stand-in for the reply,
    // not a call anywhere. See the note in the file header.
    window.setTimeout(() => {
      const reply = nextCannedReply(replySeed.current++)
      setMessages((prev) => [...prev, { id: prev.length, role: 'assistant', text: reply }])
      setThinking(false)
    }, 650)
  }

  return (
    <div ref={rootRef} className="fixed right-4 bottom-5 z-40 h-14 w-14 sm:right-6">
      {/* Goo filter: melts the two overlapping shapes below into one soft blob while
          the card opens, instead of a circle and a rectangle just crossfading. */}
      <svg width="0" height="0" className="absolute" aria-hidden>
        <defs>
          <filter id="ask-ai-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Silhouette layer — flat shapes only, blurred and thresholded by the filter. */}
      <div className="pointer-events-none absolute inset-0" style={{ filter: 'url(#ask-ai-goo)' }}>
        <div className="absolute right-0 bottom-0 h-14 w-14 rounded-full bg-stage" />
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.3 }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="absolute right-0 bottom-16 h-[400px] w-[320px] origin-bottom-right rounded-2xl bg-stage"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Crisp layer — the real button and card, unfiltered, sitting on top of the blob. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? 'Close Ask AI' : 'Ask AI — preview'}
        className="absolute right-0 bottom-0 grid h-14 w-14 place-items-center overflow-hidden rounded-full border border-key/40 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.6)] transition-transform hover:scale-105"
      >
        {/* The orb stays mounted across open/close so its WebGL context is only ever
            created once — remounting it here just to swap an icon was the thing
            breaking it. The X sits on top instead of replacing it. */}
        <Shdr02 size={44} state={open ? 'thinking' : 'idle'} ariaLabel="Ask AI" />
        {open && (
          <span className="absolute inset-0 grid place-items-center rounded-full bg-pit/70 backdrop-blur-sm">
            <X className="h-5 w-5 text-paper" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.14 } }}
            exit={{ opacity: 0, transition: { duration: 0.06 } }}
            className="absolute right-0 bottom-16 flex h-[400px] w-[320px] flex-col"
          >
            <Card size="sm" className="ring-key/20 h-full shadow-2xl">
              <CardHeader className="border-b border-edge/70 pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-key" />
                  Ask AI
                </CardTitle>
                <CardDescription>Ask what was shot, where, or with what gear.</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden py-3">
                <div ref={listRef} className="thin-scroll h-full space-y-2.5 overflow-y-auto pr-1">
                  {messages.map((m) => (
                    <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                      <p
                        className={cn(
                          'max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug',
                          m.role === 'user' ? 'bg-key/20 text-paper' : 'bg-riser text-haze',
                        )}
                      >
                        {m.text}
                      </p>
                    </div>
                  ))}
                  {thinking && (
                    <div className="flex justify-start">
                      <p className="rounded-2xl bg-riser px-3 py-2 text-sm text-haze">
                        <span className="inline-flex gap-1">
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-haze [animation-delay:-0.2s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-haze [animation-delay:-0.1s]" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-haze" />
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="border-t border-edge/70 p-2.5">
                <form onSubmit={send} className="flex w-full items-center gap-1.5">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Ask about a shoot, lens, place…"
                    aria-label="Message"
                    className="min-w-0 flex-1 rounded-full border border-edge bg-pit px-3 py-1.5 text-sm text-paper placeholder:text-haze focus:border-key/60 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!draft.trim() || thinking}
                    aria-label="Send"
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-key text-pit transition-opacity disabled:opacity-40"
                  >
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}