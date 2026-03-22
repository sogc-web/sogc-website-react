import { useEffect, useState } from 'react'
import './App.css'
import './components/HeroSection.css'
import Loader from './components/Loader'
import Header from './components/Header'
import Hero from './components/Hero'
import Mission from './components/Mission'
import Campaigns from './components/Campaigns'
import Events from './components/Events'
import GalleryMedia from './components/GalleryMedia'
import GalleryStory from './components/GalleryStory'
import Timeline from './components/Timeline'
import PressMentions from './components/PressMentions'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Contact from './components/Contact'
import Footer from './components/Footer'
import BackgroundGradient from './components/BackgroundGradient'
import MoveToTopButton from './components/MoveToTopButton'
import { contentEn } from './data/content.en'
import { contentHi } from './data/content.hi'

const LANGUAGE_STORAGE_KEY = 'sogc-language'
const HERO_IMAGE_ROTATION_MS = 5000
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

function App() {
  const [loading, setLoading] = useState(true)
  const [heroCarouselImages] = useState(() => shuffleItems(heroBackgroundImages))
  const [heroImageIndex, setHeroImageIndex] = useState(0)
  const [lang, setLang] = useState(() => {
    if (typeof window === 'undefined') return 'en'

    const savedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return savedLang === 'hi' ? 'hi' : 'en'
  })

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

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
  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'hi' : 'en'))

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.setAttribute('data-lang', lang)
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  }, [lang])

  return (
    <BackgroundGradient>
      <div className="page">
        {loading ? (
          <div className="loader-overlay">
            <Loader text={t.loader.text} size="medium" />
          </div>
        ) : null}
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
          <Mission t={t} />
          <Campaigns t={t} />
          <Events t={t} />
          <GalleryMedia t={t} />
          <GalleryStory t={t} />
          <Timeline t={t} />
          <PressMentions t={t} />
          <Testimonials t={t} />
          <Contact t={t} />
        </main>
        <Footer t={t} />
      </div>
      <MoveToTopButton />
    </BackgroundGradient>
  )
}

export default App
