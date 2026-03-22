function Hero({ t }) {
  const titleLines = [t.hero.title.line1, t.hero.title.line2, t.hero.title.line3].filter(Boolean)

  return (
    <section className="hero">
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
        <div className="hero-actions">
          <a className="primary-btn" href="#events">
            {t.hero.ctaPrimary}
          </a>
          <a className="ghost-btn" href="#campaigns">
            {t.hero.ctaSecondary}
          </a>
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
