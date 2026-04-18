import { useState } from 'react'
import SectionCard from '../components/SectionCard'

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const textareaClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const defaultFormState = {
  title: '',
  slug: '',
  description: '',
  date: '',
  location: '',
  tag: '',
  scheduleLine: '',
  bookletScheduleNote: '',
  about: '',
  experience: '',
  registrationUrl: '',
  imageUrl: '',
  imageAlt: '',
  highlights: ['', '', ''],
  isPublished: false,
  sortOrder: '',
}

function EventEditorPage({ mode }) {
  const isEdit = mode === 'edit'
  const [form, setForm] = useState(defaultFormState)

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const updateHighlight = (index, value) => {
    setForm((current) => ({
      ...current,
      highlights: current.highlights.map((highlight, highlightIndex) =>
        highlightIndex === index ? value : highlight,
      ),
    }))
  }

  const addHighlight = () => {
    setForm((current) => ({
      ...current,
      highlights: [...current.highlights, ''],
    }))
  }

  const removeHighlight = (index) => {
    setForm((current) => ({
      ...current,
      highlights:
        current.highlights.length === 1
          ? ['']
          : current.highlights.filter((_, highlightIndex) => highlightIndex !== index),
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
  }

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Event schema"
        title={isEdit ? 'Edit event' : 'Create event'}
        description="This editor now mirrors the public frontend event shape used by the event card listing and the event detail page, so every displayed field can become backend-driven."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Listing card</p>
            <ul className="mt-4 space-y-2 text-sm text-[#b7c6bf]">
              <li>`title`</li>
              <li>`description`</li>
              <li>`date`</li>
              <li>`location`</li>
              <li>`slug`</li>
              <li>`imageUrl`</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Hero detail</p>
            <ul className="mt-4 space-y-2 text-sm text-[#b7c6bf]">
              <li>`tag`</li>
              <li>`scheduleLine`</li>
              <li>`highlights[]`</li>
              <li>`registrationUrl`</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Detail body</p>
            <ul className="mt-4 space-y-2 text-sm text-[#b7c6bf]">
              <li>`bookletScheduleNote`</li>
              <li>`about`</li>
              <li>`experience`</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Admin meta</p>
            <ul className="mt-4 space-y-2 text-sm text-[#b7c6bf]">
              <li>`isPublished`</li>
              <li>`sortOrder`</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Event editor"
        title={isEdit ? 'Frontend-aligned event form' : 'Frontend-aligned event form'}
        description="The fields below are grouped by how the public site consumes them: event cards first, then detail-page content, then admin-only publishing controls."
      >
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <div className="space-y-6">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Card content</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-[#b7c6bf]">Event title</span>
                    <input
                      value={form.title}
                      onChange={(event) => updateField('title', event.target.value)}
                      placeholder="Char Dwar Cycle Yatra"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Slug</span>
                    <input
                      value={form.slug}
                      onChange={(event) => updateField('slug', event.target.value)}
                      placeholder="char-dwar-cycle-yatra"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Tag</span>
                    <input
                      value={form.tag}
                      onChange={(event) => updateField('tag', event.target.value)}
                      placeholder="Featured Event"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Date label</span>
                    <input
                      value={form.date}
                      onChange={(event) => updateField('date', event.target.value)}
                      placeholder="Annual (Sawan month)"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Location</span>
                    <input
                      value={form.location}
                      onChange={(event) => updateField('location', event.target.value)}
                      placeholder="Ujjain Sacred Circuit"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-[#b7c6bf]">Card description</span>
                    <textarea
                      rows="4"
                      value={form.description}
                      onChange={(event) => updateField('description', event.target.value)}
                      placeholder="Short summary shown in the events carousel card and detail intro."
                      className={textareaClassName}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Detail page content</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-[#b7c6bf]">Schedule line</span>
                    <input
                      value={form.scheduleLine}
                      onChange={(event) => updateField('scheduleLine', event.target.value)}
                      placeholder="Annual during Sawan month"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-[#b7c6bf]">Booklet schedule note</span>
                    <textarea
                      rows="4"
                      value={form.bookletScheduleNote}
                      onChange={(event) => updateField('bookletScheduleNote', event.target.value)}
                      placeholder="Used inside the event info card and coming-soon modal."
                      className={textareaClassName}
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-[#b7c6bf]">About this event</span>
                    <textarea
                      rows="5"
                      value={form.about}
                      onChange={(event) => updateField('about', event.target.value)}
                      placeholder="Main story section for the detail page."
                      className={textareaClassName}
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-[#b7c6bf]">What to expect</span>
                    <textarea
                      rows="5"
                      value={form.experience}
                      onChange={(event) => updateField('experience', event.target.value)}
                      placeholder="Experience block shown beside the About section."
                      className={textareaClassName}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Highlights</p>
                    <p className="mt-2 text-sm text-[#9db0a7]">
                      These render as chips on the event detail page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white max-md:w-full"
                  >
                    Add highlight
                  </button>
                </div>
                <div className="mt-5 space-y-3">
                  {form.highlights.map((highlight, index) => (
                    <div key={`highlight-${index}`} className="flex flex-col gap-3 md:flex-row">
                      <input
                        value={highlight}
                        onChange={(event) => updateHighlight(index, event.target.value)}
                        placeholder={`Highlight ${index + 1}`}
                        className={`${inputClassName} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => removeHighlight(index)}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Media and CTA</p>
                <div className="mt-5 space-y-4">
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Event image URL</span>
                    <input
                      value={form.imageUrl}
                      onChange={(event) => updateField('imageUrl', event.target.value)}
                      placeholder="https://..."
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Image alt text</span>
                    <input
                      value={form.imageAlt}
                      onChange={(event) => updateField('imageAlt', event.target.value)}
                      placeholder="Event preview image alt text"
                      className={inputClassName}
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Registration URL</span>
                    <input
                      value={form.registrationUrl}
                      onChange={(event) => updateField('registrationUrl', event.target.value)}
                      placeholder="Google Form or registration page link"
                      className={inputClassName}
                    />
                  </label>
                  <div className="rounded-[24px] border border-dashed border-white/15 bg-[#0f1513] p-4 text-sm leading-6 text-[#9db0a7]">
                    Replace this URL input with image upload once the backend upload flow is wired. The public frontend
                    currently reads `event.image` first and falls back to local assets by slug.
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Publish controls</p>
                <div className="mt-5 space-y-4">
                  <label className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-[#0f1513] p-4">
                    <input
                      type="checkbox"
                      checked={form.isPublished}
                      onChange={(event) => updateField('isPublished', event.target.checked)}
                      className="mt-1 h-4 w-4 accent-[#f8d35c]"
                    />
                    <span>
                      <span className="block text-sm font-medium text-white">Published</span>
                      <span className="mt-1 block text-sm text-[#9db0a7]">
                        When enabled, this event should appear on the public frontend.
                      </span>
                    </span>
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Sort order</span>
                    <input
                      type="number"
                      value={form.sortOrder}
                      onChange={(event) => updateField('sortOrder', event.target.value)}
                      placeholder="0"
                      className={inputClassName}
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[24px] border border-[#f8d35c]/20 bg-[#f8d35c]/8 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Frontend mapping</p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-[#e5ede8]">
                  <li>Events card uses `title`, `description`, `date`, `location`, `slug`, and `image`.</li>
                  <li>Detail hero uses `tag`, `scheduleLine`, `highlights`, and `registrationUrl`.</li>
                  <li>Detail info card uses `location`, `scheduleLine`, and `bookletScheduleNote`.</li>
                  <li>Detail body uses `about` and `experience`.</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6 max-md:[&>*]:w-full">
            <button type="submit" className="rounded-2xl bg-[#f8d35c] px-5 py-3 font-medium text-[#1b1b12]">
              {isEdit ? 'Save event changes' : 'Create event'}
            </button>
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, isPublished: false }))}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white"
            >
              Save as draft
            </button>
            <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white">
              Delete event
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}

export default EventEditorPage
