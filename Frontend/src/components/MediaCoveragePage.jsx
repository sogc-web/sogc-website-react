import { useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import './MediaCoveragePage.css'
import { mediaCoverageImages } from '../data/mediaCoverageImages'

function MediaCoveragePage({ t }) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const eyebrow = t.press?.eyebrow ?? 'Press Mentions'
  const title = t.press?.pageTitle ?? t.press?.title ?? 'Media coverage'
  const description =
    t.press?.pageDescription ?? 'A full archive of newspaper clippings and media coverage from the movement.'
  const backLabel = t.press?.backToHome ?? 'Back to home'

  const slides = useMemo(
    () =>
      mediaCoverageImages.map((image, index) => ({
        src: image.src,
        alt: image.alt,
        thumbnail: image.src,
        title,
        description: `${index + 1} / ${mediaCoverageImages.length}`,
      })),
    [title],
  )

  return (
    <section className="media-coverage-page">
      <div className="media-coverage-page__topbar">
        <a className="ghost-btn media-coverage-page__back" href="#press">
          {backLabel}
        </a>
      </div>

      <div className="section-header section-header--center media-coverage-page__header">
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p className="section-desc">{description}</p>
      </div>

      <div className="media-coverage-grid">
        {mediaCoverageImages.map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="media-coverage-card"
            onClick={() => setSelectedIndex(index)}
          >
            <img src={image.src} alt={image.alt} loading="lazy" />
          </button>
        ))}
      </div>

      <Lightbox
        open={selectedIndex >= 0}
        close={() => setSelectedIndex(-1)}
        index={selectedIndex >= 0 ? selectedIndex : 0}
        slides={slides}
        plugins={[Captions, Thumbnails, Zoom]}
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
        zoom={{ maxZoomPixelRatio: 2.5, scrollToZoom: true }}
      />
    </section>
  )
}

export default MediaCoveragePage
