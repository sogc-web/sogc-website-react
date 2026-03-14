function Footer({ t }) {
  return (
    <footer className="footer">
      <div>
        <p className="brand-title">{t.footer.name}</p>
        <p className="brand-subtitle">{t.footer.address}</p>
      </div>
      <div className="footer-links">
        {t.footer.links.map((link) => (
          <a key={link} href="#">
            {link}
          </a>
        ))}
      </div>
    </footer>
  )
}

export default Footer
