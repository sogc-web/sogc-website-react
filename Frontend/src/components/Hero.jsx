function Hero({ t }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="pill">{t.hero.pill}</span>
        <h1>{t.hero.title}</h1>
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
      <div className="hero-card">
        <div className="glass-card">
          <h2>{t.hero.card.title}</h2>
          <p>{t.hero.card.description}</p>
          <div className="hero-card-footer">
            <div>
              <p className="label">{t.hero.card.focusLabel}</p>
              <p>{t.hero.card.focusValue}</p>
            </div>
            <div>
              <p className="label">{t.hero.card.scopeLabel}</p>
              <p>{t.hero.card.scopeValue}</p>
            </div>
          </div>
        </div>
        <div className="hero-orbit">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="hero-lane"></div>
      </div>
    </section>
  )
}

export default Hero