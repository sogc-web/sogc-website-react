import { useEffect, useMemo, useRef, useState } from 'react'
import Lightbox from 'yet-another-react-lightbox'
import Captions from 'yet-another-react-lightbox/plugins/captions'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/captions.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import './Campaigns.css'
import { getCampaignMediaBySlug } from '../data/campaignMedia'

const CAMPAIGN_AUTOPLAY_MS = 5000

function Campaigns({ t, campaigns }) {
  const [activeIndex, setActiveIndex] = useState(0)

  const campaignSlides = useMemo(
    () =>
      campaigns.map((campaign) => {
        const media = getCampaignMediaBySlug(campaign.slug, 5)

        return {
          ...campaign,
          heroImage: media[0],
        }
      }),
    [campaigns],
  )

  useEffect(() => {
    if (campaignSlides.length <= 1) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % campaignSlides.length)
    }, CAMPAIGN_AUTOPLAY_MS)

    return () => window.clearInterval(intervalId)
  }, [campaignSlides.length])

  const goToSlide = (nextIndex) => {
    const total = campaignSlides.length
    setActiveIndex((nextIndex + total) % total)
  }

  return (
    <section id="campaigns" className="section campaigns-luxe-section">
      <div className="campaigns-luxe-shell">
        <div className="campaigns-luxe-shell__background" aria-hidden="true">
          {campaignSlides.map((campaign, index) => (
            campaign.heroImage ? (
              <img
                key={campaign.slug}
                src={campaign.heroImage.src}
                alt=""
                className={`campaigns-luxe-shell__background-image ${index === activeIndex ? 'is-active' : ''}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            ) : null
          ))}
          <div className="campaigns-luxe-shell__background-overlay" />
        </div>

        <div className="campaigns-luxe-header reveal">
          <div>
            <span className="eyebrow">{t.campaigns.eyebrow}</span>
            <h2>{t.campaigns.title}</h2>
          </div>
        </div>

        <div className="campaigns-luxe-carousel reveal relative isolate h-[min(56vh,560px)] overflow-hidden md:h-[min(58vh,620px)] xl:h-[min(62vh,700px)]">


          <div className="carousel-indicators absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 md:bottom-7">
            {campaignSlides.map((campaign, index) => (
              <button
                key={campaign.slug}
                type="button"
                onClick={() => goToSlide(index)}
                aria-label={`Slide ${index + 1}`}
                aria-current={index === activeIndex}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <div className="carousel-inner relative h-full overflow-hidden">
            <div
              className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}
            >
              {campaignSlides.map((campaign, index) => (
                <div key={campaign.slug} className={`carousel-item relative h-[min(56vh,560px)] min-w-full md:h-[min(58vh,620px)] xl:h-[min(62vh,700px)] ${index === activeIndex ? 'active' : ''}`}>

                  <div className="carousel-caption absolute inset-4 z-10 flex items-center justify-center md:inset-x-0 md:inset-y-0 md:flex md:items-center md:px-8 md:py-8">
                    <div className="w-full max-w-[18.5rem] rounded-[1.5rem] border border-white/12 bg-[#081512]/42 px-4 py-4 text-center text-white backdrop-blur-md shadow-[0_14px_36px_rgba(0,0,0,0.24)] md:max-w-4xl md:min-h-[17rem] md:rounded-[1.75rem] md:px-8 md:py-7 md:bg-[#081512]/38 md:backdrop-blur-lg md:shadow-none">
                      <div className="mb-4 flex justify-center">
                        <h3 className="inline-flex max-w-full items-center justify-center rounded-full border border-white/16 bg-white/10 px-4 py-2.5 text-center font-[var(--font-heading)] text-[1.05rem] leading-none text-white shadow-[0_8px_24px_rgba(0,0,0,0.16)] backdrop-blur-sm md:px-8 md:py-3 md:text-3xl md:backdrop-blur-md xl:text-4xl">
                          <span className="block max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{campaign.title}</span>
                        </h3>
                      </div>

                      <p className="mx-auto mt-3 max-w-[16rem] text-[0.95rem] leading-7 text-white/88 md:max-w-3xl md:text-[15px] md:leading-7">
                        {campaign.summary}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 md:mt-5">
                        {campaign.highlights.slice(0, 3).map((highlight) => (
                          <span
                            key={highlight}
                            className="rounded-full border border-white/12 bg-[#06120e]/38 px-3 py-1.5 text-[10px] font-medium text-white/90 md:text-xs"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>

                      <a
                        href={`#campaign/${campaign.slug}`}
                        className="mt-4 inline-flex items-center rounded-full border border-[#f8d35c]/28 bg-[#f8d35c]/16 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#fff7dd] transition hover:-translate-y-0.5 hover:bg-[#f8d35c]/22 md:mt-6"
                      >
                        {t.campaigns.cta}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            className="carousel-control-prev absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/16 bg-black/28 text-3xl leading-none text-white backdrop-blur-md transition hover:bg-black/42 md:left-5 md:h-13 md:w-13"
            type="button"
            onClick={() => goToSlide(activeIndex - 1)}
            aria-label="Previous"
          >
            <span aria-hidden="true">&#8249;</span>
            <span className="sr-only">Previous</span>
          </button>

          <button
            className="carousel-control-next absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-white/16 bg-black/28 text-3xl leading-none text-white backdrop-blur-md transition hover:bg-black/42 md:right-5 md:h-13 md:w-13"
            type="button"
            onClick={() => goToSlide(activeIndex + 1)}
            aria-label="Next"
          >
            <span aria-hidden="true">&#8250;</span>
            <span className="sr-only">Next</span>
          </button>
        </div>
      </div>
    </section>
  )
}

function CampaignDetailPage({ t, campaign }) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const heroCopyRef = useRef(null)
  const [heroMediaHeight, setHeroMediaHeight] = useState(null)
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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const updateHeroMediaHeight = () => {
      if (window.innerWidth <= 1280 || !heroCopyRef.current) {
        setHeroMediaHeight(null)
        return
      }

      setHeroMediaHeight(heroCopyRef.current.offsetHeight)
    }

    updateHeroMediaHeight()

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => updateHeroMediaHeight())
      : null

    if (resizeObserver && heroCopyRef.current) {
      resizeObserver.observe(heroCopyRef.current)
    }

    window.addEventListener('resize', updateHeroMediaHeight)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateHeroMediaHeight)
    }
  }, [campaign.slug])

  return (
    <section className="campaign-detail-page">
      <div className="campaign-detail-page__hero">
        <div ref={heroCopyRef} className="campaign-detail-page__hero-copy">
          <a href="#campaigns" className="campaign-detail-page__back">Back to campaigns</a>
          <div className="campaign-detail-page__eyebrow-row">
            <span className="eyebrow">{campaign.kicker}</span>
            <span className="campaign-detail-page__spotlight">{campaign.stat}</span>
          </div>
          <h1>{campaign.title}</h1>
          <p className="campaign-detail-page__intro">{campaign.intro}</p>
          <div className="campaign-detail-page__chips">
            {campaign.highlights.map((highlight) => (
              <span key={highlight}>{highlight}</span>
            ))}
          </div>
        </div>

        <div className="campaign-detail-page__hero-media" style={heroMediaHeight ? { height: `${heroMediaHeight}px` } : undefined}>
          {media.slice(0, 3).map((image, index) => (
            <button
              key={image.id}
              type="button"
              className={`campaign-detail-page__media-card campaign-detail-page__media-card--${index + 1}`}
              onClick={() => setSelectedIndex(index)}
            >
              <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
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
        {media.slice(3, 9).map((image, index) => (
          <button
            key={image.id}
            type="button"
            className="campaign-detail-page__gallery-item"
            onClick={() => setSelectedIndex(index + 3)}
          >
            <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
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










