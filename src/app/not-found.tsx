import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-[700px] px-4 py-32 text-center">
      <p className="display text-8xl text-rim">404</p>
      <h1 className="display mt-3 text-4xl text-paper">That frame is not in the archive.</h1>
      <p className="mt-3 text-haze">The link may be old, or the album was renamed.</p>
      <Link
        href="/"
        className="mt-7 inline-block rounded-full bg-key px-5 py-2.5 text-sm font-medium text-pit hover:bg-key/85"
      >
        Back to the timeline
      </Link>
    </div>
  )
}
