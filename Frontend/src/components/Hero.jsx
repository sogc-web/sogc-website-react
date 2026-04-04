import SocialIcon from './SocialIcon'

function Hero({ t }) {
  const titleLines = [t.hero.title.line1, t.hero.title.line2, t.hero.title.line3].filter(Boolean)

  return (
    <section id="hero" className="hero">
      <div className="hero-content">
        <span className="pill">{t.hero.pill}</span>
        <h1>
          {titleLines.map((line) => (
            <span key={line} className="hero-title-line">
              {line}
            </span>
          ))}
        </h1>
        <p>{t.hero.description}</p>
        <div className="hero-cta-row">
          <div className="hero-actions">
            <a className="primary-btn" href="#events">
              {t.hero.ctaPrimary}
            </a>

          </div>
          <div className="hero-socials" aria-label="Social links">
            <span className="hero-socials__label">{t.hero.SocialLinks}</span>
            <div className="hero-socials__icons">
              {t.hero.socialLinks.map((link) => (
                <a key={link.label} className="hero-social-link" href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                  <SocialIcon name={link.icon} className="hero-social-icon" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-stats">
          {t.hero.stats.map((stat) => (
            <div key={stat.label}>
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Hero
