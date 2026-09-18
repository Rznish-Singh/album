import HomeGallery from '~/components/HomeGallery'
import { timeline } from '~/lib/gallery'

export default function TimelinePage() {
  return (
    <div className="pb-16">
      <HomeGallery pool={timeline} />
    </div>
  )
}
