import type { Metadata } from 'next'
import { Inter, Oswald, IBM_Plex_Mono, Caveat } from 'next/font/google'
import Link from 'next/link'
import Script from 'next/script'
import './globals.css'

const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald', weight: ['400', '500', '600', '700'] })
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const plexMono = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-plex-mono', weight: ['400', '500'] })
const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat', weight: ['500', '600'] })

// const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://gallery.rznish.dev'

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: 'rznish — photo gallery', template: '%s — rznish' },
  description:
    'Concert, studio and campus photography by rznish, filed in the order it was shot. Every frame keeps its camera data and the spot on the map where it was taken.',
  openGraph: { type: 'website', siteName: 'rznish', url: site },
  twitter: { card: 'summary_large_image' },
}

// Applied before paint so a saved light-mode preference never flashes dark first.
const THEME_INIT = `
try {
  var t = localStorage.getItem('rznish-theme');
  if (t === 'light' || t === 'dark') document.documentElement.dataset.theme = t;
} catch (e) {}
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${oswald.variable} ${inter.variable} ${plexMono.variable} ${caveat.variable}`}
    >
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT}
        </Script>
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded focus:bg-back focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-pit"
        >
          Skip to the photos
        </a>

        <main id="main">{children}</main>

        {/* No top nav bar — the map, albums, filter and sort icons on the timeline
            card carry that weight instead; this footer keeps a thin trail back. */}
        {/* <footer className="mt-24 border-t border-edge/70">
          <div className="mx-auto flex max-w-[1500px] flex-col gap-4 px-4 py-10 text-sm text-haze sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div>
              <Link href="/" className="display text-2xl text-paper">
                rznish
              </Link>
              {/* <p className="mt-1 max-w-prose">
                Photography by rznish 
              </p> */}
            {/* </div>
            <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link href="/albums" className="hover:text-paper">
                Albums
              </Link>
              <Link href="/map" className="hover:text-paper">
                Map
              </Link>
              <Link href="/gear" className="hover:text-paper">
                Gear
              </Link>
            </nav>
            
          </div> 
        </footer> */}
      </body>
    </html>
  )
}