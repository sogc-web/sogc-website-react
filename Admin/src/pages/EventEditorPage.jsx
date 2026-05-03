import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SectionCard from '../components/SectionCard'
import { createAdminEvent, deleteAdminEvent, fetchAdminEvent, updateAdminEvent } from '../lib/adminEvents'

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const textareaClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const defaultFormState = {
  title: '',
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
  imagePublicId: '',
  imageFileData: '',
  imageFileName: '',
  removeImage: false,
  highlights: ['', '', ''],
  isPublished: false,
}

function EventEditorPage({ mode }) {
  const isEdit = mode === 'edit'
  const navigate = useNavigate()
  const { eventId } = useParams()
  const [form, setForm] = useState(defaultFormState)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    if (!isEdit || !eventId) {
      return
    }

    let isMounted = true

    fetchAdminEvent(eventId)
      .then((item) => {
        if (!isMounted) return
        setForm({
          title: item.title ?? '',
          description: item.description ?? '',
          date: item.date ?? '',
          location: item.location ?? '',
          tag: item.tag ?? '',
          scheduleLine: item.scheduleLine ?? '',
          bookletScheduleNote: item.bookletScheduleNote ?? '',
          about: item.about ?? '',
          experience: item.experience ?? '',
          registrationUrl: item.registrationUrl ?? '',
          imageUrl: item.imageUrl ?? '',
          imagePublicId: item.imagePublicId ?? '',
          imageFileData: '',
          imageFileName: '',
          removeImage: false,
          highlights: item.highlights?.length ? item.highlights : [''],
          isPublished: Boolean(item.isPublished),
        })
        setIsLoading(false)
      })
      .catch((error) => {
        if (!isMounted) return
        setErrorMessage(error.message)
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [eventId, isEdit])

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
    setFieldErrors((current) => ({
      ...current,
      [field]: '',
    }))
  }

  const updateHighlight = (index, value) => {
    setForm((current) => ({
      ...current,
      highlights: current.highlights.map((highlight, highlightIndex) =>
        highlightIndex === index ? value : highlight,
      ),
    }))
    setFieldErrors((current) => ({
      ...current,
      highlights: '',
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

  const toPayload = (nextForm) => ({
    ...nextForm,
    highlights: nextForm.highlights.map((highlight) => highlight.trim()).filter(Boolean),
  })

  const validateForm = (nextForm) => {
    const nextErrors = {}

    if (!nextForm.title.trim()) nextErrors.title = 'Event title is required.'
    if (!nextForm.description.trim()) nextErrors.description = 'Card description is required.'
    if (!nextForm.date.trim()) nextErrors.date = 'Date label is required.'
    if (!nextForm.location.trim()) nextErrors.location = 'Location is required.'
    if (!nextForm.scheduleLine.trim()) nextErrors.scheduleLine = 'Schedule line is required.'
    if (!nextForm.bookletScheduleNote.trim()) nextErrors.bookletScheduleNote = 'Booklet schedule note is required.'
    if (!nextForm.about.trim()) nextErrors.about = 'About this event is required.'
    if (!nextForm.experience.trim()) nextErrors.experience = 'What to expect is required.'
    if (!nextForm.imageUrl && !nextForm.imageFileData) nextErrors.image = 'Event image is required.'

    const validHighlights = nextForm.highlights.map((highlight) => highlight.trim()).filter(Boolean)
    if (!validHighlights.length) nextErrors.highlights = 'Add at least one highlight.'

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleImageFileChange = (event) => {
    const [file] = event.target.files ?? []

    if (!file) {
      setForm((current) => ({
        ...current,
        imageFileData: '',
        imageFileName: '',
      }))
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setForm((current) => ({
        ...current,
        imageFileData: typeof reader.result === 'string' ? reader.result : '',
        imageFileName: file.name,
        removeImage: false,
      }))
    }

    reader.onerror = () => {
      setErrorMessage('Unable to read the selected image file.')
    }

    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setForm((current) => ({
      ...current,
      imageUrl: '',
      imagePublicId: '',
      imageFileData: '',
      imageFileName: '',
      removeImage: true,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm(form)) {
      setErrorMessage('Please complete the required fields before saving.')
      return
    }
    setIsSubmitting(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const payload = toPayload(form)

      if (isEdit && eventId) {
        await updateAdminEvent(eventId, payload)
        navigate(`/events/${eventId}`)
      } else {
        const createdEvent = await createAdminEvent(payload)
        navigate(`/events/${createdEvent.id}`)
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!validateForm({ ...form, isPublished: false })) {
      setErrorMessage('Please complete the required fields before saving.')
      return
    }
    setIsSubmitting(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const payload = toPayload({ ...form, isPublished: false })

      if (isEdit && eventId) {
        await updateAdminEvent(eventId, payload)
        setForm((current) => ({ ...current, isPublished: false }))
        navigate(`/events/${eventId}`)
      } else {
        const createdEvent = await createAdminEvent(payload)
        navigate(`/events/${createdEvent.id}`)
      }
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!isEdit || !eventId) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      await deleteAdminEvent(eventId)
      setIsDeleteConfirmOpen(false)
      navigate('/events')
    } catch (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Event details"
        title={isEdit ? 'Edit event' : 'Create event'}
        description="Add the event information, upload its image, and control whether it stays as a draft or appears on the website."
      >
      </SectionCard>

      <SectionCard
        eyebrow="Event editor"
        title={isEdit ? 'Update event information' : 'Add a new event'}
        description="Complete the sections below to set the event card content, detail page content, image, highlights, and publish status."
      >
        {errorMessage ? (
          <div className="mb-4 rounded-2xl border border-[#ffb4a2]/20 bg-[#5a2318]/30 px-4 py-3 text-sm text-[#ffd5ca]">
            {errorMessage}
          </div>
        ) : null}
        {statusMessage ? (
          <div className="mb-4 rounded-2xl border border-[#f8d35c]/20 bg-[#f8d35c]/8 px-4 py-3 text-sm text-[#fff0b5]">
            {statusMessage}
          </div>
        ) : null}
        {isLoading ? (
          <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-6 text-sm text-[#b7c6bf]">
            Loading event details...
          </div>
        ) : null}
        {!isLoading ? (
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
                    {fieldErrors.title ? <p className="text-sm text-[#ffb4a2]">{fieldErrors.title}</p> : null}
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
                    {fieldErrors.date ? <p className="text-sm text-[#ffb4a2]">{fieldErrors.date}</p> : null}
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Location</span>
                    <input
                      value={form.location}
                      onChange={(event) => updateField('location', event.target.value)}
                      placeholder="Ujjain Sacred Circuit"
                      className={inputClassName}
                    />
                    {fieldErrors.location ? <p className="text-sm text-[#ffb4a2]">{fieldErrors.location}</p> : null}
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
                    {fieldErrors.description ? <p className="text-sm text-[#ffb4a2]">{fieldErrors.description}</p> : null}
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
                    {fieldErrors.scheduleLine ? <p className="text-sm text-[#ffb4a2]">{fieldErrors.scheduleLine}</p> : null}
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-[#b7c6bf]">Booklet schedule note</span>
                    <textarea
                      rows="4"
                      value={form.bookletScheduleNote}
                      onChange={(event) => updateField('bookletScheduleNote', event.target.value)}
                      placeholder="Used inside the event info card and related website content."
                      className={textareaClassName}
                    />
                    {fieldErrors.bookletScheduleNote ? (
                      <p className="text-sm text-[#ffb4a2]">{fieldErrors.bookletScheduleNote}</p>
                    ) : null}
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
                    {fieldErrors.about ? <p className="text-sm text-[#ffb4a2]">{fieldErrors.about}</p> : null}
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
                    {fieldErrors.experience ? <p className="text-sm text-[#ffb4a2]">{fieldErrors.experience}</p> : null}
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
                {fieldErrors.highlights ? <p className="mt-3 text-sm text-[#ffb4a2]">{fieldErrors.highlights}</p> : null}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Media and CTA</p>
                <div className="mt-5 space-y-4">
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Event image file</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-[#f8d35c] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#1b1b12]"
                    />
                    {fieldErrors.image ? <p className="text-sm text-[#ffb4a2]">{fieldErrors.image}</p> : null}
                  </label>
                  {form.imageFileName ? (
                    <p className="text-sm text-[#b7c6bf]">Selected file: {form.imageFileName}</p>
                  ) : null}
                  {form.imageUrl || form.imageFileData ? (
                    <div className="space-y-3">
                      <p className="text-sm text-[#b7c6bf]">Current image preview</p>
                      <img
                        src={form.imageFileData || form.imageUrl}
                        alt={form.title || 'Event preview'}
                        className="h-40 w-full rounded-[24px] border border-white/10 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : null}
                  <label className="space-y-2">
                    <span className="text-sm text-[#b7c6bf]">Registration URL</span>
                    <input
                      value={form.registrationUrl}
                      onChange={(event) => updateField('registrationUrl', event.target.value)}
                      placeholder="Google Form or registration page link"
                      className={inputClassName}
                    />
                  </label>
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

                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6 max-md:[&>*]:w-full">
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-[#f8d35c] px-5 py-3 font-medium text-[#1b1b12] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isEdit ? 'Save event changes' : 'Create event'}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              Save as draft
            </button>
            <button
              type="button"
              onClick={() => setIsDeleteConfirmOpen(true)}
              disabled={isSubmitting || !isEdit}
              className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              Delete event
            </button>
          </div>
        </form>
        ) : null}
      </SectionCard>

      {isDeleteConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06100d]/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#101815] p-6 shadow-2xl shadow-black/30">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Delete event</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Remove this event?</h3>
            <p className="mt-3 text-sm leading-6 text-[#b7c6bf]">
              This will permanently delete the event record and remove it from the admin list. This action cannot be
              undone.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 max-md:[&>*]:w-full">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="rounded-2xl bg-[#f8d35c] px-5 py-3 font-medium text-[#1b1b12] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Yes, delete event
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteConfirmOpen(false)}
                disabled={isSubmitting}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default EventEditorPage
