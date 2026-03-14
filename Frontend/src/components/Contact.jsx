import SectionHeader from './SectionHeader'

function Contact({ t }) {
  return (
    <section id="contact" className="section contact-section">
      <SectionHeader
        eyebrow={t.contact.eyebrow}
        title={t.contact.title}
        description={t.contact.description}
        align="center"
      />
      <div className="contact-grid">
        <div className="contact-info">
          <div className="contact-card">
            <div className="contact-card__header">
              <span className="pill">{t.contact.kicker}</span>
              <h3>{t.contact.cardTitle}</h3>
              <p>{t.contact.cardDescription}</p>
            </div>
            <div className="contact-details">
              {t.contact.details.map((detail) => (
                <div key={detail.label} className="contact-detail">
                  <span>{detail.label}</span>
                  <p>{detail.value}</p>
                </div>
              ))}
            </div>
            <div className="contact-steps">
              {t.contact.steps.map((step) => (
                <div key={step.title} className="contact-step">
                  <span>{step.title}</span>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="contact-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
        <form className="contact-form">
          <div className="contact-form__row">
            <label>
              {t.contact.form.name}
              <input type="text" placeholder={t.contact.form.namePlaceholder} />
            </label>
            <label>
              {t.contact.form.email}
              <input type="email" placeholder={t.contact.form.emailPlaceholder} />
            </label>
          </div>
          <div className="contact-form__row">
            <label>
              {t.contact.form.phone}
              <input type="tel" placeholder={t.contact.form.phonePlaceholder} />
            </label>
            <label>
              {t.contact.form.role}
              <select>
                {t.contact.form.roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label>
            {t.contact.form.message}
            <textarea rows="5" placeholder={t.contact.form.messagePlaceholder} />
          </label>
          <div className="contact-form__footer">
            <p>{t.contact.form.note}</p>
            <button className="primary-btn" type="button">
              {t.contact.form.submit}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default Contact
