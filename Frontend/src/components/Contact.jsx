import { useEffect, useRef, useState } from 'react'
import SectionHeader from './SectionHeader'
import { submitContactForm } from '../lib/publicForms'
import './Contact.css'

function Contact({ t }) {
  const roles = t.contact.form.roles
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(roles[0])
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [submitState, setSubmitState] = useState('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const selectRef = useRef(null)

  useEffect(() => {
    setSelectedRole(roles[0])
    setIsOpen(false)
  }, [roles])

  useEffect(() => {
    if (!isOpen) return

    const handlePointerDownOutside = (event) => {
      if (!selectRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDownOutside, true)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDownOutside, true)
    }
  }, [isOpen])

  function handleRoleSelect(role) {
    setSelectedRole(role)
    setIsOpen(false)
  }

  const isFormValid = formData.name.trim() && formData.email.trim() && formData.message.trim()

  async function handleSubmit(event) {
    event.preventDefault()

    setSubmitState('submitting')
    setStatusMessage('')

    try {
      await submitContactForm({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        role: selectedRole,
        message: formData.message.trim(),
      })

      setSubmitState('success')
      setStatusMessage('Thanks for reaching out. Your message has been sent successfully.')
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      })
      setSelectedRole(roles[0])
    } catch (error) {
      setSubmitState('error')
      setStatusMessage(error.message || 'Unable to send your message right now.')
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    if (submitState !== 'idle') {
      setSubmitState('idle')
      setStatusMessage('')
    }
  }

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

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form__row">
              <label>
                {t.contact.form.name}
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t.contact.form.namePlaceholder}
                />
              </label>

              <label>
                {t.contact.form.email}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t.contact.form.emailPlaceholder}
                />
              </label>
            </div>

            <div className="contact-form__row">
              <label>
                {t.contact.form.phone}
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t.contact.form.phonePlaceholder}
                />
              </label>

              <label>
                {t.contact.form.role}
                <div className="custom-select" ref={selectRef}>
                  <button
                    type="button"
                    className="custom-select__trigger"
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                    onClick={(event) => {
                      event.stopPropagation()
                      setIsOpen((prev) => !prev)
                    }}
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
                        >
                          <button
                            type="button"
                            className="custom-select__option-btn"
                            onClick={() => handleRoleSelect(role)}
                          >
                            {role}
                          </button>
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
              <textarea
                rows="5"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t.contact.form.messagePlaceholder}
              />
            </label>

            {statusMessage ? (
              <div
                className={`rounded-[20px] border px-4 py-3 text-sm ${submitState === 'error'
                  ? 'border-[#ffb4a2]/20 bg-[#ffb4a2]/10 text-[#ffd7cd]'
                  : 'border-[#f8d35c]/20 bg-[#f8d35c]/10 text-[#f3e7b2]'
                  }`}
              >
                {statusMessage}
              </div>
            ) : null}

            <div className="contact-form__footer">

              <button className="primary-btn" type="submit" disabled={!isFormValid || submitState === 'submitting'}>
                {submitState === 'submitting' ? 'Sending...' : t.contact.form.submit}
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
