import { useEffect, useState } from 'react'
import './App.css'
import './components/HeroSection.css'
import Loader from './components/Loader'
import Header from './components/Header'
import Hero from './components/Hero'
import Campaigns, { CampaignDetailPage } from './components/Campaigns'
import Events from './components/Events'
import GalleryMedia from './components/GalleryMedia'
import GalleryStory from './components/GalleryStory'
import Timeline from './components/Timeline'
import PressMentions from './components/PressMentions'
import MediaCoveragePage from './components/MediaCoveragePage'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BackgroundGradient from './components/BackgroundGradient'
import MoveToTopButton from './components/MoveToTopButton'
import VolunteerPopup from './components/VolunteerPopup'
import ScrollReveal from './components/ScrollReveal'
import { contentEn } from './data/content.en'
import { contentHi } from './data/content.hi'
import { campaignContentEn } from './data/campaign_content.en'
import { campaignContentHi } from './data/campaign_content.hi'

const LANGUAGE_STORAGE_KEY = 'sogc-language'
const HERO_IMAGE_ROTATION_MS = 5000
const MEDIA_COVERAGE_HASH = '#media-coverage'
const CAMPAIGN_HASH_PREFIX = '#campaign/'
const HEADER_LOGO_SRC = '/sogc-logo.png'
const heroBackgroundImageModules = import.meta.glob(
  [
    './assets/SOGC-Media/hero-bg-images/*.jpg',
    './assets/SOGC-Media/hero-bg-images/*.jpeg',
    './assets/SOGC-Media/hero-bg-images/*.JPG',
    './assets/SOGC-Media/hero-bg-images/*.JPEG',
  ],
  {
    eager: true,
    import: 'default',
  },
)
const heroBackgroundImages = Object.values(heroBackgroundImageModules)

function shuffleItems(items) {
  const shuffledItems = [...items]

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
      ;[shuffledItems[index], shuffledItems[randomIndex]] = [shuffledItems[randomIndex], shuffledItems[index]]
  }

  return shuffledItems
}

function getCurrentRoute() {
  if (typeof window === 'undefined') return { type: 'home' }

  const { hash } = window.location

  if (hash === MEDIA_COVERAGE_HASH) {
    return { type: 'media-coverage' }
  }

  if (hash.startsWith(CAMPAIGN_HASH_PREFIX)) {
    return { type: 'campaign', slug: hash.slice(CAMPAIGN_HASH_PREFIX.length) }
  }

  return { type: 'home' }
}


function preloadImage(src, fetchPriority = 'auto') {
  if (typeof window === 'undefined' || !src) return undefined

  const image = new window.Image()
  image.decoding = 'async'

  if ('fetchPriority' in image) {
    image.fetchPriority = fetchPriority
  }

  image.src = src
  return image
}

function App() {
  const [loading, setLoading] = useState(true)
  const [currentRoute, setCurrentRoute] = useState(getCurrentRoute)
  const [heroCarouselImages] = useState(() => shuffleItems(heroBackgroundImages))
  const [heroImageIndex, setHeroImageIndex] = useState(0)
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'en'

    const savedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return savedLang === 'hi' ? 'hi' : 'en'
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleHashChange = () => setCurrentRoute(getCurrentRoute())

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Reset scroll position to top whenever the route changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentRoute.type, currentRoute.slug])

  useEffect(() => {
    if (heroCarouselImages.length <= 1) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setHeroImageIndex((currentIndex) => (currentIndex + 1) % heroCarouselImages.length)
    }, HERO_IMAGE_ROTATION_MS)

    return () => window.clearInterval(intervalId)
  }, [heroCarouselImages])

  const t = lang === 'hi' ? contentHi : contentEn
  const campaignCatalog = lang === 'hi' ? campaignContentHi : campaignContentEn
  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'hi' : 'en'))
  const campaign = currentRoute.type === 'campaign'
    ? campaignCatalog.find((item) => item.slug === currentRoute.slug)
    : null
  const isSubpage = currentRoute.type === 'media-coverage' || Boolean(campaign)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.setAttribute('data-lang', lang)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  }, [lang])

  useEffect(() => {
    const criticalImages = [HEADER_LOGO_SRC, heroCarouselImages[0]].filter(Boolean)
    criticalImages.map((src) => preloadImage(src, 'high')).filter(Boolean)
    return undefined
  }, [heroCarouselImages])

  return (
    <BackgroundGradient>
      <ScrollReveal />
      <div className={`page${isSubpage ? ' page--subpage' : ''}`}>
        {!isSubpage && loading ? (
          <div className="loader-overlay">
            <Loader text={t.loader.text} size="medium" />
          </div>
        ) : null}

        {isSubpage ? (
          <>
            <section className="header-shell header-shell--subpage subpage-stage">
              <Header t={t} onToggle={toggleLang} />
            </section>
            <main className="subpage-main">
              {currentRoute.type === 'media-coverage' ? <MediaCoveragePage t={t} /> : null}
              {campaign ? <CampaignDetailPage t={t} campaign={campaign} /> : null}
            </main>
          </>
        ) : (
          <>
            <section className="hero-stage">
              {heroCarouselImages.length > 0 ? (
                <div className="hero-stage-carousel" aria-hidden="true">
                  {heroCarouselImages.map((heroImage, index) => (
                    <img
                      key={heroImage}
                      className={
                        index === heroImageIndex ? 'hero-stage-image hero-stage-image--active' : 'hero-stage-image'
                      }
                      src={heroImage}
                      alt=""
                      decoding="async"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                    />
                  ))}
                </div>
              ) : null}
              <div className="hero-stage-overlay" aria-hidden="true" />
              <Header t={t} onToggle={toggleLang} />
              <Hero t={t} />
            </section>
            <main>
              <CTA t={t} />
              <GalleryStory t={t} />
              <Campaigns t={t} campaigns={campaignCatalog} />
              <Events t={t} />
              <GalleryMedia t={t} />
              <Timeline t={t} />
              <PressMentions t={t} />
              <Testimonials t={t} />
              <Contact t={t} />
            </main>
          </>
        )}
        <Footer t={t} />
      </div>
      <VolunteerPopup />
      <MoveToTopButton />
    </BackgroundGradient>
  )
}

export default App
