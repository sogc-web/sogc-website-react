const socialUrlByLabel = {
  X: 'https://x.com/SocietyOfGlobal',
  Facebook: 'https://www.facebook.com/Sengarutk/',
  Instagram: 'https://www.instagram.com/societyofglobalcycle/',
}

function Footer({ t }) {
  return (
    <footer className="footer">
      <div>
        <p className="brand-title">{t.footer.name}</p>
        <p className="brand-subtitle">{t.footer.address}</p>
      </div>
      <div className="footer-links">
        {t.footer.links.map((link) => {
          const socialLink = typeof link === 'string' ? { label: link, url: socialUrlByLabel[link] ?? '#' } : link

          return (
            <a key={socialLink.label} href={socialLink.url} target="_blank" rel="noreferrer">
              {socialLink.label}
            </a>
          )
        })}
      </div>
    </footer>
  )
}

export default Footer
