import { useState } from 'react'
import SectionCard from '../components/SectionCard'

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const textareaClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const defaultFormState = {
  isEnabled: true,
  openOnScroll: true,
  openOnManualTrigger: true,
  sessionStorageKey: 'volunteer_popup_seen',
  title: 'Become a Cycle Mitra',
  description: 'Join our mission and make cycling safer for everyone.',
  closeAriaLabel: 'Close popup',
  submitButtonText: 'I want to become a Cycle Mitra',
  fields: [
    {
      id: 'volunteer-name',
      name: 'name',
      label: 'Name',
      type: 'text',
      placeholder: 'Your full name',
      required: true,
    },
    {
      id: 'volunteer-email',
      name: 'email',
      label: 'Email',
      type: 'email',
      placeholder: 'you@example.com',
      required: true,
    },
    {
      id: 'volunteer-phone',
      name: 'phone',
      label: 'Phone',
      type: 'tel',
      placeholder: '+91 00000 00000',
      required: true,
    },
  ],
}

function PopupPage() {
  const [form, setForm] = useState(defaultFormState)

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updatePopupField = (index, field, value) => {
    setForm((current) => ({
      ...current,
      fields: current.fields.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Popup schema"
        title="Frontend-aligned volunteer popup form"
        description="This editor is mapped directly to the current public `VolunteerPopup.jsx` structure instead of a generic popup CMS. It reflects the actual copy, field list, CTA, and trigger behavior that the frontend uses today."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Trigger behavior</p>
            <ul className="mt-4 space-y-2 text-sm text-[#b7c6bf]">
              <li>`open-volunteer-popup` event listener</li>
              <li>scroll trigger after 100vh</li>
              <li>`sessionStorage` guard</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Visible copy</p>
            <ul className="mt-4 space-y-2 text-sm text-[#b7c6bf]">
              <li>`title`</li>
              <li>`description`</li>
              <li>`closeAriaLabel`</li>
              <li>`submitButtonText`</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Form fields</p>
            <ul className="mt-4 space-y-2 text-sm text-[#b7c6bf]">
              <li>name field</li>
              <li>email field</li>
              <li>phone field</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Current reality</p>
            <p className="mt-4 text-sm leading-6 text-[#b7c6bf]">
              The public popup is still a hardcoded volunteer modal, so this admin form mirrors that exact shape instead
              of inventing unsupported frontend fields.
            </p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Volunteer popup"
        title="Edit current popup structure"
        description="These fields map to the live volunteer popup component: trigger behavior, visible text, field labels, field placeholders, and submit CTA."
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-6">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Trigger settings</p>
                <div className="mt-5 space-y-4">
                  <label className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-[#0f1513] p-4">
                    <input
                      type="checkbox"
                      checked={form.isEnabled}
                      onChange={(event) => updateField('isEnabled', event.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#f8d35c]"
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">Popup enabled</span>
                      <span className="mt-1 block text-sm text-[#9db0a7]">
                        Master switch for rendering the volunteer popup at all.
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-[#0f1513] p-4">
                    <input
                      type="checkbox"
                      checked={form.openOnManualTrigger}
                      onChange={(event) => updateField('openOnManualTrigger', event.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#f8d35c]"
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">Allow manual trigger event</span>
                      <span className="mt-1 block text-sm text-[#9db0a7]">
                        Used by the current `open-volunteer-popup` custom event from the site.
                      </span>
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-[#0f1513] p-4">
                    <input
                      type="checkbox"
                      checked={form.openOnScroll}
                      onChange={(event) => updateField('openOnScroll', event.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#f8d35c]"
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">Open after scroll past 100vh</span>
                      <span className="mt-1 block text-sm text-[#9db0a7]">
                        Matches the current scroll-based trigger logic in `VolunteerPopup.jsx`.
                      </span>
                    </span>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Session storage key</span>
                    <input
                      value={form.sessionStorageKey}
                      onChange={(event) => updateField('sessionStorageKey', event.target.value)}
                      placeholder="volunteer_popup_seen"
                      className={inputClassName}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Visible copy</p>
                <div className="mt-5 space-y-4">
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Popup title</span>
                    <input
                      value={form.title}
                      onChange={(event) => updateField('title', event.target.value)}
                      placeholder="Become a Cycle Mitra"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Popup description</span>
                    <textarea
                      rows="4"
                      value={form.description}
                      onChange={(event) => updateField('description', event.target.value)}
                      placeholder="Join our mission and make cycling safer for everyone."
                      className={textareaClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Close button aria label</span>
                    <input
                      value={form.closeAriaLabel}
                      onChange={(event) => updateField('closeAriaLabel', event.target.value)}
                      placeholder="Close popup"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Submit CTA text</span>
                    <input
                      value={form.submitButtonText}
                      onChange={(event) => updateField('submitButtonText', event.target.value)}
                      placeholder="I want to become a Cycle Mitra"
                      className={inputClassName}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Form field definitions</p>
                <div className="mt-5 space-y-4">
                  {form.fields.map((field, index) => (
                    <div key={field.id} className="rounded-[24px] border border-white/10 bg-[#0f1513] p-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm text-[#b7c6bf]">DOM id</span>
                          <input
                            value={field.id}
                            onChange={(event) => updatePopupField(index, 'id', event.target.value)}
                            className={inputClassName}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-[#b7c6bf]">Input name</span>
                          <input
                            value={field.name}
                            onChange={(event) => updatePopupField(index, 'name', event.target.value)}
                            className={inputClassName}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-[#b7c6bf]">Label</span>
                          <input
                            value={field.label}
                            onChange={(event) => updatePopupField(index, 'label', event.target.value)}
                            className={inputClassName}
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm text-[#b7c6bf]">Type</span>
                          <input
                            value={field.type}
                            onChange={(event) => updatePopupField(index, 'type', event.target.value)}
                            className={inputClassName}
                          />
                        </label>
                        <label className="space-y-2 md:col-span-2">
                          <span className="text-sm text-[#b7c6bf]">Placeholder</span>
                          <input
                            value={field.placeholder}
                            onChange={(event) => updatePopupField(index, 'placeholder', event.target.value)}
                            className={inputClassName}
                          />
                        </label>
                        <label className="flex items-start gap-3 rounded-[20px] border border-white/10 bg-white/5 p-4 md:col-span-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(event) => updatePopupField(index, 'required', event.target.checked)}
                            className="mt-1 h-4 w-4 accent-[#f8d35c]"
                          />
                          <span>
                            <span className="block text-sm font-medium text-white">Required field</span>
                            <span className="mt-1 block text-sm text-[#9db0a7]">
                              Matches the current frontend form validation requirement.
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#f8d35c]/20 bg-[#f8d35c]/8 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Frontend mapping</p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[#e5ede8]">
                  <li>The current public popup is a volunteer modal, not a generic popup builder.</li>
                  <li>The form always uses three visible fields: name, email, and phone.</li>
                  <li>The CTA is disabled in frontend until all three fields are filled.</li>
                  <li>Manual open and scroll open are both part of the current component logic.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6 max-md:[&>*]:w-full">
            <button type="submit" className="rounded-2xl bg-[#f8d35c] px-5 py-3 font-medium text-[#1b1b12]">
              Save popup settings
            </button>
            <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white">
              Preview volunteer popup
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}

export default PopupPage
