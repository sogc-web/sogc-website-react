import { useEffect, useRef, useState } from 'react'
import SectionHeader from './SectionHeader'
import './Contact.css'

function Contact({ t }) {
  const roles = t.contact.form.roles
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(roles[0])
  const selectRef = useRef(null)

  useEffect(() => {
    setSelectedRole(roles[0])
    setIsOpen(false)
  }, [roles])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (!selectRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  return (
    <section id="contact" className="section contact-section">
      <SectionHeader
        eyebrow={t.contact.eyebrow}
        title={t.contact.title}
        description={t.contact.description}
        align="center"
      />

      <div className="contact-grid">
        <div>

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
                <div className="custom-select" ref={selectRef}>
                  <button
                    type="button"
                    className="custom-select__trigger"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen((prev) => !prev)}
                  >
                    <span>{selectedRole}</span>
                    <span className="custom-select__icon" />
                  </button>

                  {isOpen && (
                    <ul className="custom-select__list" role="listbox">
                      {roles.map((role) => (
                        <li
                          key={role}
                          role="option"
                          aria-selected={selectedRole === role}
                          className={`custom-select__option ${selectedRole === role ? 'is-selected' : ''
                            }`}
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedRole(role)
                            setIsOpen(false)
                          }}
                        >
                          {role}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <input type="hidden" name="role" value={selectedRole} />
              </label>
            </div>

            <label>
              {t.contact.form.message}
              <textarea rows="5" placeholder={t.contact.form.messagePlaceholder} />
            </label>

            <div className="contact-form__footer">

              <button className="primary-btn" type="button">
                {t.contact.form.submit}
              </button>
              <p>{t.contact.form.note}</p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

export default Contact