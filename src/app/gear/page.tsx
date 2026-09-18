import type { Metadata } from 'next'
import { body, fNumber, lenses, photos } from '~/lib/gallery'

export const metadata: Metadata = {
  title: 'Gear',
  description: 'The one body and two lenses behind every frame in this gallery.',
}

function Bar({ label, value, total, tone }: { label: string; value: number; total: number; tone: string }) {
  const pct = Math.round((value / total) * 100)
  return (
    <div className="py-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-paper">{label}</span>
        <span className="data text-haze">
          {value} · {pct}%
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-edge">
        <div className={`h-full rounded-full ${tone}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function GearPage() {
  const total = photos.length
  const focalBuckets = [
    { label: '18–35mm', test: (f: number) => f <= 35 },
    { label: '36–70mm', test: (f: number) => f > 35 && f <= 70 },
    { label: '71–135mm', test: (f: number) => f > 70 && f <= 135 },
    { label: '136–250mm', test: (f: number) => f > 135 },
  ]
  const isoBuckets = [
    { label: 'ISO 100–400', test: (i: number) => i <= 400 },
    { label: 'ISO 800–1600', test: (i: number) => i > 400 && i <= 1600 },
    { label: 'ISO 2000–3200', test: (i: number) => i > 1600 && i <= 3200 },
    { label: 'ISO 4000+', test: (i: number) => i > 3200 },
  ]
  const widest = Math.min(...photos.map((p) => p.aperture))

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-14 sm:px-6">
      <h1 className="display max-w-[20ch] text-5xl text-paper sm:text-6xl">
        One crop body, two kit lenses, a lot of dark rooms.
      </h1>
      <p className="mt-5 max-w-[62ch] leading-relaxed text-haze">
        Nothing here was shot on borrowed gear. The constraint is the point: the widest aperture
        available all night is {fNumber(widest)}, so the trade is always between a shutter speed fast
        enough to freeze a performer and an ISO the sensor can still carry.
      </p>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        <article className="rounded-xl border border-edge bg-stage p-5 sm:col-span-1">
          <p className="text-xs text-haze">Body</p>
          <h2 className="display mt-1 text-2xl text-paper">{body.model}</h2>
          <p className="data mt-2 text-haze">{body.sensor}</p>
          <p className="data text-haze">{body.crop}× crop factor</p>
        </article>

        {lenses.map((lens) => {
          const used = photos.filter((p) => p.lensKey === lens.key)
          return (
            <article key={lens.key} className="rounded-xl border border-edge bg-stage p-5">
              <p className="text-xs text-haze">Lens</p>
              <h2 className="display mt-1 text-2xl text-paper">{lens.short}</h2>
              <p className="data mt-2 text-haze">{lens.label}</p>
              <p className="data mt-1 text-key">{used.length} frames in this gallery</p>
            </article>
          )
        })}
      </section>

      <section className="mt-12 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="display text-2xl text-paper">Focal lengths used</h2>
          <div className="mt-3 divide-y divide-edge/50">
            {focalBuckets.map((b) => (
              <Bar
                key={b.label}
                label={b.label}
                value={photos.filter((p) => b.test(p.focalLength)).length}
                total={total}
                tone="bg-back"
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="display text-2xl text-paper">How high the ISO went</h2>
          <div className="mt-3 divide-y divide-edge/50">
            {isoBuckets.map((b) => (
              <Bar
                key={b.label}
                label={b.label}
                value={photos.filter((p) => b.test(p.iso)).length}
                total={total}
                tone="bg-key"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
