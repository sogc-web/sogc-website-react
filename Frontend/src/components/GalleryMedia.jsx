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

function buildCollection({ id, title, eyebrow, summary, folder, featuredFileName }) {
  const folderPath = folder.toLowerCase()
  const media = mediaAssets.filter((item) => item.path.includes(folderPath))
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

  const mediaCollections = useMemo(
    () =>
      (t.gallery.collections ?? [])
        .map((collection) => buildCollection(collection))
        .filter((collection) => collection.media.length > 0 && collection.cover),
    [t],
  )

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
