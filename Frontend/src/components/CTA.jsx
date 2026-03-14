function CTA({ t }) {
  return (
    <section className="cta">
      <div>
        <h2>{t.cta.title}</h2>
        <p>{t.cta.description}</p>
      </div>
      <a className="primary-btn" href="#contact">
        {t.cta.button}
      </a>
    </section>
  )
}

export default CTA

