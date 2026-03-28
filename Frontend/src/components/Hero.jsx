const socialLinks = [
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/Sengarutk/',
    icon: 'https://img.icons8.com/?size=100&id=118555&format=png&color=000000',
  },
  {
    label: 'X',
    href: 'https://x.com/SocietyOfGlobal',
    icon: 'https://img.icons8.com/?size=100&id=I02TdaPxbwRz&format=png&color=000000',
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/societyofglobalcycle/',
    icon: 'https://img.icons8.com/?size=100&id=TEYr8ETaIfBJ&format=png&color=000000',
  },
]

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
            <a className="ghost-btn" href="#campaigns">
              {t.hero.ctaSecondary}
            </a>
          </div>
          <div className="hero-socials" aria-label="Social links">
            <span className="hero-socials__label">{t.hero.SocialLinks}</span>
            <div className="hero-socials__icons">
              {socialLinks.map((link) => (
                <a key={link.label} className="hero-social-link" href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}>
                  <img src={link.icon} alt="" />
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

