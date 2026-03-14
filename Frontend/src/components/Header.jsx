import { useEffect, useRef, useState } from 'react'
import MobileMenuButton from './MobileMenuButton'

function Header({ t, onToggle }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const toggleRef = useRef(null)

  const toggleMenu = () => setIsOpen((prev) => !prev)
  const closeMenu = () => setIsOpen(false)

  useEffect(() => {
    if (!isOpen) return

    const handleOutsideClick = (event) => {
      const target = event.target
      if (menuRef.current?.contains(target)) return
      if (toggleRef.current?.contains(target)) return
      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [isOpen])

  return (
    <header className="site-header">
      <div className="brand">
        <div className="brand-mark">SOGC</div>
        <div>
          <p className="brand-title">Society of Global Cycle</p>
          <p className="brand-subtitle">{t.hero.pill}</p>
        </div>
      </div>
      <nav ref={menuRef} className={`nav ${isOpen ? 'nav--open' : ''}`}>
        <a href="#mission" onClick={closeMenu}>
          {t.nav.mission}
        </a>
        <a href="#campaigns" onClick={closeMenu}>
          {t.nav.campaigns}
        </a>
        <a href="#events" onClick={closeMenu}>
          {t.nav.events}
        </a>
        <a href="#gallery" onClick={closeMenu}>
          {t.nav.gallery}
        </a>
        <a href="#story" onClick={closeMenu}>
          {t.nav.stories}
        </a>
        <a href="#timeline" onClick={closeMenu}>
          {t.nav.timeline}
        </a>
        <a href="#press" onClick={closeMenu}>
          {t.nav.press}
        </a>
        <a href="#testimonials" onClick={closeMenu}>
          {t.nav.testimonials}
        </a>
        <a href="#contact" onClick={closeMenu}>
          {t.nav.contact}
        </a>
        <div className="nav-actions">
          <button className="ghost-btn small" onClick={onToggle}>
            {t.nav.toggle}
          </button>
          <a className="primary-btn" href="#contact" onClick={closeMenu}>
            {t.nav.volunteer}
          </a>
        </div>
      </nav>
      <div className="header-actions">
        <button className="ghost-btn lang-toggle" onClick={onToggle}>
          {t.nav.toggle}
        </button>
        <a className="primary-btn" href="#contact" onClick={closeMenu}>
          {t.nav.volunteer}
        </a>
        <div className="menu-toggle md:hidden" ref={toggleRef}>
          <MobileMenuButton isOpen={isOpen} onClick={toggleMenu} label="Toggle navigation" />
        </div>
      </div>
    </header>
  )
}

export default Header