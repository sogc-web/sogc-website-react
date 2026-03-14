import { useEffect, useState } from 'react'
import './App.css'
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
import { contentEn } from './data/content.en'
import { contentHi } from './data/content.hi'

function App() {
  const [loading, setLoading] = useState(true)
  const [lang, setLang] = useState('en')

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const t = lang === 'hi' ? contentHi : contentEn
  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'hi' : 'en'))

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.setAttribute('data-lang', lang)
  }, [lang])

  return (
    <div className="page">
      {loading ? (
        <div className="loader-overlay">
          <Loader text={t.loader.text} />
        </div>
      ) : null}
      <Header t={t} onToggle={toggleLang} />
      <main>
        <Hero t={t} />
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
  )
}

export default App

