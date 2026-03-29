import { useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Video from 'yet-another-react-lightbox/plugins/video'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import SectionHeader from './SectionHeader'
import './GalleryMedia.css'

const mediaModules = import.meta.glob(
  [
    '../assets/SOGC-Media/Chardwar 2022/*.jpeg',
    '../assets/SOGC-Media/Chardwar 2022/*.jpg',
    '../assets/SOGC-Media/Chardwar 2022/*.JPG',
    '../assets/SOGC-Media/Chardwar 2022/*.JPEG',
    '../assets/SOGC-Media/Chardwar 2022/*.mov',
    '../assets/SOGC-Media/Chardwar 2022/*.MOV',
    '../assets/SOGC-Media/chardwar 2023/*.jpeg',
    '../assets/SOGC-Media/chardwar 2023/*.jpg',
    '../assets/SOGC-Media/chardwar 2023/*.JPG',
    '../assets/SOGC-Media/chardwar 2023/*.JPEG',
    '../assets/SOGC-Media/chardwar 2023/*.mp4',
    '../assets/SOGC-Media/chardwar 2023/*.MP4',
    '../assets/SOGC-Media/chardwar 2024/*.jpeg',
    '../assets/SOGC-Media/chardwar 2024/*.jpg',
    '../assets/SOGC-Media/chardwar 2024/*.JPG',
    '../assets/SOGC-Media/chardwar 2024/*.JPEG',
    '../assets/SOGC-Media/Cycle day 2021/*.mov',
    '../assets/SOGC-Media/Cycle day 2021/*.MOV',
    '../assets/SOGC-Media/Cycle day 2021/*.mp4',
    '../assets/SOGC-Media/Cycle day 2021/*.MP4',
    '../assets/SOGC-Media/Cycle day 2023/*.jpeg',
    '../assets/SOGC-Media/Cycle day 2023/*.jpg',
    '../assets/SOGC-Media/Cycle day 2023/*.JPG',
    '../assets/SOGC-Media/Cycle day 2023/*.JPEG',
    '../assets/SOGC-Media/Signature_campaign/*.jpeg',
    '../assets/SOGC-Media/Signature_campaign/*.jpg',
    '../assets/SOGC-Media/Signature_campaign/*.JPG',
    '../assets/SOGC-Media/Signature_campaign/*.JPEG',
    '../assets/SOGC-Media/Signature_campaign/*.mp4',
    '../assets/SOGC-Media/Signature_campaign/*.MP4',
    '../assets/SOGC-Media/Signature_campaign/*.mov',
    '../assets/SOGC-Media/Signature_campaign/*.MOV'
  ],
  {
    eager: true,
    import: 'default',
  },
)

function getMediaType(path) {
  return /\.(mp4|mov)$/i.test(path) ? 'video' : 'image'
}

function getMimeType(path) {
  if (/\.mov$/i.test(path)) return 'video/quicktime'
  return 'video/mp4'
}

function getFileName(path) {
  const segments = path.split('/')
  return segments[segments.length - 1]
}

function sortMediaItems(items) {
  return [...items].sort((left, right) =>
    left.fileName.localeCompare(right.fileName, undefined, { numeric: true, sensitivity: 'base' }),
  )
}

const mediaAssets = sortMediaItems(
  Object.entries(mediaModules).map(([path, src]) => ({
    src,
    path: path.toLowerCase(),
    fileName: getFileName(path),
    type: getMediaType(path),
  })),
)

function buildCollection({ id, title, eyebrow, summary, matcher, featuredFileName }) {
  const media = mediaAssets.filter((item) => matcher(item.path))
  const cover =
    media.find((item) => item.fileName.toLowerCase() === featuredFileName.toLowerCase()) ??
    media.find((item) => item.type === 'image') ??
    media[0] ??
    null

  return {
    id,
    title,
    eyebrow,
    summary,
    cover,
    media,
    stats: {
      total: media.length,
      photos: media.filter((item) => item.type === 'image').length,
      videos: media.filter((item) => item.type === 'video').length,
    },
  }
}

const mediaCollections = [
  buildCollection({
    id: 'char-dwar-2024',
    title: 'Char Dwar 2024',
    eyebrow: 'Latest album',
    summary: 'The newest Char Dwar ride set with portraits, route moments, and group energy.',
    matcher: (path) => path.includes('/chardwar 2024/'),
    featuredFileName: '0M3A6480.JPG',
  }),
  buildCollection({
    id: 'char-dwar-2023',
    title: 'Char Dwar 2023',
    eyebrow: 'Ride archive',
    summary: 'A mixed collection of ride photos and short clips from the 2023 circuit.',
    matcher: (path) => path.includes('/chardwar 2023/'),
    featuredFileName: 'IMG_1209.JPG',
  }),
  buildCollection({
    id: 'char-dwar-2022',
    title: 'Char Dwar 2022',
    eyebrow: 'Earlier coverage',
    summary: 'An earlier archive with WhatsApp captures and on-ground ride videos.',
    matcher: (path) => path.includes('/chardwar 2022/'),
    featuredFileName: 'WhatsApp Image 2024-06-27 at 3.28.15 PM (3).jpeg',
  }),
  buildCollection({
    id: 'cycle-day-2023',
    title: 'Cycle Day 2023',
    eyebrow: 'Event gallery',
    summary: 'Professional event photography from the 2023 Cycle Day celebration.',
    matcher: (path) => path.includes('/cycle day 2023/'),
    featuredFileName: 'DSC_9607.JPG',
  }),
  buildCollection({
    id: 'cycle-day-2021',
    title: 'Cycle Day 2021',
    eyebrow: 'Drone clips',
    summary: 'Aerial video moments from the 2021 Cycle Day rides.',
    matcher: (path) => path.includes('/cycle day 2021/'),
    featuredFileName: 'DJI_0148.mp4',
  }),
  buildCollection({
    id: 'signature-campaign',
    title: 'Signature Campaign',
    eyebrow: 'Citizen drive',
    summary: 'A public signature drive that turns support for safer cycling into visible collective action.',
    matcher: (path) => path.includes('/signature_campaign/'),
    featuredFileName: 'signature_image_4.jpg',
  }),
].filter((collection) => collection.media.length > 0 && collection.cover)

function buildSlides(collection) {
  return collection.media.map((item, index) => {
    const description = `${index + 1} / ${collection.media.length} · ${item.fileName}`
    const thumbnail = item.type === 'image' ? item.src : collection.cover?.type === 'image' ? collection.cover.src : undefined

    if (item.type === 'video') {
      return {
        type: 'video',
        poster: thumbnail,
        thumbnail,
        title: collection.title,
        description,
        sources: [
          {
            src: item.src,
            type: getMimeType(item.fileName),
          },
        ],
      }
    }

    return {
      src: item.src,
      alt: `${collection.title} - ${item.fileName}`,
      thumbnail: item.src,
      title: collection.title,
      description,
    }
  })
}

function GalleryMedia({ t }) {
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const slides = useMemo(() => {
    if (!selectedCollection) {
      return []
    }

    return buildSlides(selectedCollection)
  }, [selectedCollection])

  const openCollection = (collection) => {
    setSelectedIndex(0)
    setSelectedCollection(collection)
  }

  const closeCollection = () => {
    setSelectedCollection(null)
    setSelectedIndex(0)
  }

  return (
    <section id="gallery" className="section gallery-showcase">
      <div className="section-header split">
        <SectionHeader eyebrow={t.gallery.eyebrow} title={t.gallery.title} />
        <p className="section-note">{t.gallery.note}</p>
      </div>

      <div className="gallery-showcase-grid">
        {mediaCollections.map((collection, index) => (
          <button
            key={collection.id}
            type="button"
            className="gallery-collection-card reveal"
            style={{ animationDelay: `${0.08 + index * 0.06}s` }}
            onClick={() => openCollection(collection)}
          >
            <div className="gallery-collection-card__media">
              {collection.cover.type === 'image' ? (
                <img src={collection.cover.src} alt={collection.title} loading="lazy" decoding="async" />
              ) : (
                <video src={collection.cover.src} muted playsInline preload="metadata" />
              )}
            </div>
            <div className="gallery-collection-card__overlay" />
            <div className="gallery-collection-card__content">
              <span className="gallery-collection-card__eyebrow">{collection.eyebrow}</span>
              <h3>{collection.title}</h3>
              <p>{collection.summary}</p>
              {/* <div className="gallery-collection-card__stats">
                <span>{collection.stats.total} files</span>
                {collection.stats.photos > 0 ? <span>{collection.stats.photos} photos</span> : null}
                {collection.stats.videos > 0 ? <span>{collection.stats.videos} videos</span> : null}
              </div> */}
            </div>
          </button>
        ))}
      </div>

      <Lightbox
        open={Boolean(selectedCollection)}
        close={closeCollection}
        index={selectedIndex}
        slides={slides}
        className="gallery-lightbox"
        plugins={[Captions, Thumbnails, Video, Zoom]}
        on={{
          view: ({ index }) => setSelectedIndex(index),
        }}
        animation={{ fade: 360, swipe: 420 }}
        carousel={{ imageFit: 'contain', padding: 24, spacing: 24 }}
        controller={{ closeOnBackdropClick: true }}
        captions={{ descriptionTextAlign: 'center', descriptionMaxLines: 2 }}
        thumbnails={{
          position: 'bottom',
          width: 104,
          height: 72,
          border: 0,
          borderRadius: 16,
          padding: 0,
          gap: 12,
          vignette: false,
          showToggle: false,
        }}
        video={{ controls: true, playsInline: true, preload: 'metadata' }}
        zoom={{ maxZoomPixelRatio: 2.5, scrollToZoom: true }}
      />
    </section>
  )
}

export default GalleryMedia

