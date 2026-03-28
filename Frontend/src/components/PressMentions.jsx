import './PressMentions.css'
import SectionHeader from './SectionHeader'
import { mediaCoverageImages } from '../data/mediaCoverageImages'

const PREVIEW_IMAGE_COUNT = 10

function PressMentions({ t }) {
  const previewImages = mediaCoverageImages.slice(0, PREVIEW_IMAGE_COUNT)
  const buttonLabel = t.press?.previewCta ?? 'More coverage'

  return (
    <section id="press" className="section press press-preview-section">
      <SectionHeader
        eyebrow={t.press.eyebrow}
        title={t.press.title}
        description={t.press.description}
      />
      <div className="press-masonry-preview">
        {previewImages.map((image, index) => (
          <article
            key={image.id}
            className={`press-masonry-card press-masonry-card--${index + 1} reveal`}
            style={{ animationDelay: `${0.08 + index * 0.04}s` }}
          >
            <img src={image.src} alt={image.alt} loading="lazy" />
          </article>
        ))}
      </div>
      <div className="press-more-row">
        <a className="ghost-btn press-more-btn" href="#media-coverage">
          {buttonLabel}
        </a>
      </div>
    </section>
  )
}

export default PressMentions
