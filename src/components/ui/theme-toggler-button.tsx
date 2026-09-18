'use client'

import { useCallback, useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'rznish-theme'

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* storage may be blocked; theme still applies for this session */
  }
}

type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> }
}

export function ThemeTogglerButton({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setTheme((document.documentElement.dataset.theme as Theme) || 'dark')
  }, [])

  const toggle = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const next: Theme = theme === 'dark' ? 'light' : 'dark'
      const doc = document as ViewTransitionDocument

      if (!doc.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        applyTheme(next)
        setTheme(next)
        return
      }

      const { clientX: x, clientY: y } = event
      const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y))

      const transition = doc.startViewTransition(() => {
        applyTheme(next)
        setTheme(next)
      })

      transition.ready.then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 550, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' },
        )
      })
    },
    [theme],
  )

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted && theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
      title="Toggle theme"
      className={cn(
        'grid h-8 w-8 shrink-0 place-items-center rounded-full border border-edge text-haze transition-colors hover:border-haze/60 hover:text-paper',
        className,
      )}
    >
      {mounted && theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  )
}

export default ThemeTogglerButton
