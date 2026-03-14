function Header({ t, onToggle }) {
  return (
    <header className="site-header">
      <div className="brand">
        <div className="brand-mark">SOGC</div>
        <div>
          <p className="brand-title">Society of Global Cycle</p>
          <p className="brand-subtitle">{t.hero.pill}</p>
        </div>
      </div>
      <nav className="nav">
        <a href="#mission">{t.nav.mission}</a>
        <a href="#campaigns">{t.nav.campaigns}</a>
        <a href="#events">{t.nav.events}</a>
        <a href="#gallery">{t.nav.gallery}</a>
        <a href="#story">{t.nav.stories}</a>
        <a href="#timeline">{t.nav.timeline}</a>
        <a href="#press">{t.nav.press}</a>
        <a href="#testimonials">{t.nav.testimonials}</a>
        <a href="#contact">{t.nav.contact}</a>
      </nav>
      <div className="header-actions">
        <button className="ghost-btn lang-toggle" onClick={onToggle}>
          {t.nav.toggle}
        </button>
        <a className="primary-btn" href="#contact">
          {t.nav.volunteer}
        </a>
      </div>
    </header>
  )
}

export default Header
