import { useEffect, useRef, useState } from 'react'
import MobileMenuButton from './MobileMenuButton'
import './Header.css'

function Header({ t, onToggle }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const toggleRef = useRef(null)

  const navItems = [
    { key: 'campaigns', href: '#campaigns', label: t.nav.campaigns },
    { key: 'events', href: '#events', label: t.nav.events },
    { key: 'gallery', href: '#gallery', label: t.nav.gallery },
    { key: 'stories', href: '#story', label: t.nav.stories },
    { key: 'timeline', href: '#timeline', label: t.nav.timeline },
    { key: 'press', href: '#press', label: t.nav.press },
    { key: 'testimonials', href: '#testimonials', label: t.nav.testimonials },
    { key: 'contact', href: '#contact', label: t.nav.contact },
  ]

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
      <a className="brand" href="#">
        <img className="brand-mark" src="/sogc-logo.png" alt="SOGC logo" loading="eager" fetchPriority="high" />
        <div>
          <p className="brand-title">Society of Global Cycle</p>
        </div>
      </a>
      <nav ref={menuRef} className={`nav ${isOpen ? 'nav--open' : ''}`}>
        {navItems.map((item) => (
          <a key={item.key} href={item.href} onClick={closeMenu}>
            {item.label}
          </a>
        ))}
        <div className="nav-actions">
          <button
            className="ghost-btn small"
            onClick={() => {
              onToggle()
              closeMenu()
            }}
          >
            {t.nav.toggle}
          </button>
          <button
            className="primary-btn"
            onClick={() => {
              closeMenu()
              window.dispatchEvent(new CustomEvent('open-volunteer-popup'))
            }}
          >
            {t.nav.volunteer}
          </button>
        </div>
      </nav>
      <div className="header-actions">
        <button className="ghost-btn lang-toggle" onClick={onToggle}>
          {t.nav.toggle}
        </button>
        <button
          className="primary-btn"
          onClick={() => {
            closeMenu()
            window.dispatchEvent(new CustomEvent('open-volunteer-popup'))
          }}
        >
          {t.nav.volunteer}
        </button>
        <div className="menu-toggle md:hidden" ref={toggleRef}>
          <MobileMenuButton isOpen={isOpen} onClick={toggleMenu} label="Toggle navigation" />
        </div>
      </div>
    </header>
  )
}

export default Header
