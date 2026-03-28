function CTA({ t }) {
  return (
    <section className="cta">
      <div>
        <h2>{t.cta.title}</h2>
        <p>{t.cta.description}</p>
      </div>
      <button
        className="primary-btn"
        onClick={() => window.dispatchEvent(new CustomEvent('open-volunteer-popup'))}
      >
        {t.cta.button}
      </button>
    </section>
  )
}

export default CTA
