import { useMemo, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import './Campaigns.css'
import { getCampaignMediaBySlug } from '../data/campaignMedia'

function Campaigns({ t, campaigns }) {
  return (
    <section id="campaigns" className="section campaigns-luxe-section">
      <div className="campaigns-luxe-shell">
        <div className="campaigns-luxe-header">
          <div>
            <span className="eyebrow">{t.campaigns.eyebrow}</span>
            <h2>{t.campaigns.title}</h2>
          </div>
          <p className="section-note">{t.campaigns.note}</p>
        </div>

        <div className="campaigns-luxe-grid">
          {campaigns.map((campaign, index) => {
            const media = getCampaignMediaBySlug(campaign.slug, 4)
            const heroImage = media[0]
            const supportingImages = media.slice(1, 4)

            return (
              <a
                key={campaign.slug}
                href={`#campaign/${campaign.slug}`}
                className={`campaign-luxe-card campaign-luxe-card--${(index % 6) + 1} reveal`}
                style={{ animationDelay: `${0.08 + index * 0.05}s` }}
              >
                <div className="campaign-luxe-card__backdrop">
                  {heroImage ? <img src={heroImage.src} alt={campaign.title} /> : null}
                </div>
                <div className="campaign-luxe-card__veil" />
                <div className="campaign-luxe-card__glass">
                  <div className="campaign-luxe-card__topline">
                    <span className="campaign-luxe-card__kicker">{campaign.kicker}</span>
                    <span className="campaign-luxe-card__stat">{campaign.stat}</span>
                  </div>
                  <h3>{campaign.title}</h3>
                  <p>{campaign.summary}</p>
                  <div className="campaign-luxe-card__highlights">
                    {campaign.highlights.slice(0, 2).map((highlight) => (
                      <span key={highlight}>{highlight}</span>
                    ))}
                  </div>
                  {supportingImages.length > 0 ? (
                    <div className="campaign-luxe-card__thumbs">
                      {supportingImages.map((image) => (
                        <span key={image.id} className="campaign-luxe-card__thumb">
                          <img src={image.src} alt="" />
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <span className="campaign-luxe-card__cta">{t.campaigns.cta}</span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function CampaignDetailPage({ t, campaign }) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const media = useMemo(() => getCampaignMediaBySlug(campaign.slug), [campaign.slug])
  const slides = useMemo(
    () =>
      media.map((image, index) => ({
        src: image.src,
        alt: image.alt,
        thumbnail: image.src,
        title: campaign.title,
        description: `${index + 1} / ${media.length}`,
      })),
    [campaign.title, media],
  )

  return (
    <section className="campaign-detail-page">
      <div className="campaign-detail-page__hero">
        <div className="campaign-detail-page__hero-copy">
          <span className="eyebrow">{campaign.kicker}</span>
          <h1>{campaign.title}</h1>
          <p className="campaign-detail-page__intro">{campaign.intro}</p>
          <div className="campaign-detail-page__chips">
            {campaign.highlights.map((highlight) => (
              <span key={highlight}>{highlight}</span>
            ))}
          </div>
        </div>

        <div className="campaign-detail-page__hero-media">
          {media.slice(0, 4).map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={`campaign-detail-page__media-card campaign-detail-page__media-card--${index + 1}`}
              onClick={() => setSelectedIndex(index)}
            >
              <img src={image.src} alt={image.alt} loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      <div className="campaign-detail-page__stats">
        {campaign.metrics.map((metric) => (
          <article key={metric.label} className="campaign-detail-page__stat-card">
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>

      <div className="campaign-detail-page__body">
        {campaign.sections.map((section) => (
          <article key={section.title} className="campaign-detail-page__story-card">
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </div>

      <div className="campaign-detail-page__gallery-strip">
        {media.slice(4, 10).map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="campaign-detail-page__gallery-item"
            onClick={() => setSelectedIndex(index + 4)}
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

export { CampaignDetailPage }
export default Campaigns


