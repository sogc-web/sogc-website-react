import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
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

const AUTO_PLAY_DELAY = 3600
const MAX_VISIBLE_OFFSET = 5
const CARD_WIDTH_RATIO = 0.46
const CARD_WIDTH_MIN = 260
const CARD_WIDTH_MAX = 600
const DESKTOP_TRANSLATE_RATIO = 0.35
const MOBILE_TRANSLATE_RATIO = 0.28
const SCALE_STEP = 0.08
const OPACITY_STEP = 0.18
const BLUR_STEP = 2
const ACTIVE_SCALE = 1.02
const DESKTOP_DRAG_SENSITIVITY = 260
const MOBILE_DRAG_SENSITIVITY = 190
const WHEEL_SENSITIVITY = 520
const SPRING_TRANSITION = {
  type: 'spring',
  stiffness: 280,
  damping: 30,
}

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
    '../assets/SOGC-Media/Signature_campaign/*.MOV',
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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function normalizePosition(value, total) {
  if (!total) {
    return 0
  }

  return ((value % total) + total) % total
}

function normalizeIndex(value, total) {
  return Math.round(normalizePosition(value, total)) % total
}

function getCircularOffset(index, position, total) {
  if (!total) {
    return 0
  }

  let offset = ((index - normalizePosition(position, total)) % total + total) % total

  if (offset > total / 2) {
    offset -= total
  }

  return offset
}

function getCardWidth(viewportWidth) {
  return clamp(viewportWidth * CARD_WIDTH_RATIO, CARD_WIDTH_MIN, CARD_WIDTH_MAX)
}

function getCardMotion(offset, cardWidth, isMobile) {
  const distance = Math.abs(offset)
  const hidden = distance > MAX_VISIBLE_OFFSET
  const translateRatio = isMobile ? MOBILE_TRANSLATE_RATIO : DESKTOP_TRANSLATE_RATIO
  const x = offset * (cardWidth * translateRatio)
  const scale = clamp(ACTIVE_SCALE - distance * SCALE_STEP, 0.54, ACTIVE_SCALE)
  const opacity = hidden ? 0 : clamp(1 - distance * OPACITY_STEP, 0, 1)
  const blur = hidden ? 8 : distance * BLUR_STEP
  const zIndex = hidden ? 0 : 100 - Math.floor(distance)
  const boxShadow = distance < 0.5 ? '0 34px 90px rgba(2, 10, 8, 0.34)' : '0 18px 42px rgba(8, 18, 16, 0.18)'

  return {
    x,
    scale,
    opacity,
    filter: `blur(${blur}px)`,
    zIndex,
    boxShadow,
    pointerEvents: hidden ? 'none' : 'auto',
  }
}

function GalleryMedia({ t }) {
  const [selectedCollection, setSelectedCollection] = useState(null)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [position, setPosition] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(1280)
  const dragStartPositionRef = useRef(0)
  const wheelTimeoutRef = useRef(null)
  const positionRef = useRef(0)

  const mediaCollections = useMemo(
    () =>
      (t.gallery.collections ?? [])
        .map((collection) => buildCollection(collection))
        .filter((collection) => collection.media.length > 0 && collection.cover),
    [t],
  )

  const total = mediaCollections.length
  const activeIndex = total ? normalizeIndex(position, total) : 0
  const cardWidth = getCardWidth(viewportWidth)

  const slides = useMemo(() => {
    if (!selectedCollection) {
      return []
    }

    return buildSlides(selectedCollection)
  }, [selectedCollection])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    const updateViewport = () => {
      setIsMobile(mediaQuery.matches)
      setViewportWidth(window.innerWidth)
    }

    updateViewport()
    mediaQuery.addEventListener('change', updateViewport)
    window.addEventListener('resize', updateViewport)

    return () => {
      mediaQuery.removeEventListener('change', updateViewport)
      window.removeEventListener('resize', updateViewport)
    }
  }, [])

  useEffect(() => {
    positionRef.current = position
  }, [position])

  useEffect(() => {
    if (total <= 1 || isPaused) {
      return undefined
    }

    const timer = window.setInterval(() => {
      setPosition((current) => normalizePosition(current + 1, total))
    }, AUTO_PLAY_DELAY)

    return () => window.clearInterval(timer)
  }, [isPaused, total])

  useEffect(() => {
    if (!total) {
      setPosition(0)
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        setPosition((current) => normalizePosition(current - 1, total))
      }

      if (event.key === 'ArrowRight') {
        setPosition((current) => normalizePosition(current + 1, total))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [total])

  useEffect(() => () => window.clearTimeout(wheelTimeoutRef.current), [])

  const openCollection = (collection) => {
    setSelectedIndex(0)
    setSelectedCollection(collection)
  }

  const closeCollection = () => {
    setSelectedCollection(null)
    setSelectedIndex(0)
  }

  const handleCardClick = (collection, index) => {
    if (index === activeIndex) {
      openCollection(collection)
      return
    }

    const offset = getCircularOffset(index, positionRef.current, total)
    setPosition((current) => normalizePosition(current + offset, total))
  }

  const dragSensitivity = isMobile ? MOBILE_DRAG_SENSITIVITY : DESKTOP_DRAG_SENSITIVITY

  const handleDragStart = () => {
    dragStartPositionRef.current = positionRef.current
    setIsPaused(true)
  }

  const handleDrag = (_, info) => {
    if (!total) {
      return
    }

    const nextPosition = normalizePosition(dragStartPositionRef.current - info.offset.x / dragSensitivity, total)
    setPosition(nextPosition)
  }

  const handleDragEnd = (_, info) => {
    if (!total) {
      return
    }

    const nextPosition = normalizePosition(dragStartPositionRef.current - info.offset.x / dragSensitivity, total)
    const snappedIndex = normalizeIndex(nextPosition, total)
    setPosition(snappedIndex)
    setIsPaused(false)
  }

  const handleWheel = (event) => {
    if (!total || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
      return
    }

    event.preventDefault()
    setIsPaused(true)

    const nextPosition = normalizePosition(positionRef.current + event.deltaX / WHEEL_SENSITIVITY, total)
    const snappedIndex = normalizeIndex(nextPosition, total)

    setPosition(nextPosition)
    window.clearTimeout(wheelTimeoutRef.current)
    wheelTimeoutRef.current = window.setTimeout(() => {
      setPosition(snappedIndex)
      setIsPaused(false)
    }, 120)
  }

  return (
    <section id="gallery" className="section gallery-showcase">
      <div className="section-header split">
        <SectionHeader eyebrow={t.gallery.eyebrow} title={t.gallery.title} />
        <p className="section-note">{t.gallery.note}</p>
      </div>

      <div
        className="gallery-stack reveal"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onWheel={handleWheel}
      >
        <div className="gallery-stack__viewport">
          <motion.div
            className="gallery-stack__lane"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            dragMomentum={false}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
          >
            {mediaCollections.map((collection, index) => {
              const offset = getCircularOffset(index, position, total)
              const motionState = getCardMotion(offset, cardWidth, isMobile)

              return (
                <motion.button
                  key={collection.id}
                  type="button"
                  className={`gallery-stack__card ${index === activeIndex ? 'is-active' : ''}`}
                  animate={motionState}
                  initial={false}
                  transition={SPRING_TRANSITION}
                  onClick={() => handleCardClick(collection, index)}
                  aria-pressed={index === activeIndex}
                >
                  <div className="gallery-stack__media">
                    {collection.cover.type === 'image' ? (
                      <img src={collection.cover.src} alt={collection.title} loading="lazy" decoding="async" />
                    ) : (
                      <video src={collection.cover.src} muted playsInline preload="metadata" />
                    )}
                  </div>
                  <div className="gallery-stack__overlay" />
                  <div className="gallery-stack__content">
                    <span className="gallery-stack__eyebrow">{collection.eyebrow}</span>
                    <h3>{collection.title}</h3>
                    <p>{collection.summary}</p>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        </div>

        <div className="gallery-stack__controls">
          <div className="gallery-stack__dots" aria-label="Gallery pagination">
            {mediaCollections.map((collection, index) => (
              <button
                key={collection.id}
                type="button"
                className={`gallery-stack__dot ${index === activeIndex ? 'is-active' : ''}`}
                onClick={() => handleCardClick(collection, index)}
                aria-label={`Go to ${collection.title}`}
                aria-pressed={index === activeIndex}
              />
            ))}
          </div>
        </div>
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
