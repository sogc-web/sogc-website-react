import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SectionCard from '../components/SectionCard'
import { fetchAdminEvents } from '../lib/adminEvents'
import { createAdminPopup, fetchAdminPopup, updateAdminPopup } from '../lib/adminPopup'

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const textareaClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-[#6e8178]'

const staticEventOptions = [
  {
    slug: 'char-dwar-cycle-yatra',
    title: 'Char Dwar Cycle Yatra',
    description:
      'A full-day, 118 km heritage ride across Ujjain\'s sacred route that blends endurance, devotion, and public visibility.',
    source: 'Website event',
  },
  {
    slug: 'cyclodaya-vichar-vimarsh',
    title: 'Cyclodaya (Vichar-Vimarsh)',
    description: 'Cyclodaya creates public conversations around cycling, health, youth, and the environment.',
    source: 'Website event',
  },
  {
    slug: 'sunday-cycle-ride',
    title: 'Sunday Cycle Ride',
    description: 'Weekly community rides that keep the movement active and make cycling a familiar public habit.',
    source: 'Website event',
  },
  {
    slug: 'ride-for-nation',
    title: 'Ride For Nation',
    description: 'An Independence Day ride linking clean mobility with civic pride and public participation.',
    source: 'Website event',
  },
  {
    slug: 'cycle-gair',
    title: 'Cycle Gair',
    description: 'A festive cycle procession that carries messages of water conservation and community awareness.',
    source: 'Website event',
  },
]

const defaultFormState = {
  title: 'Ride For Nation',
  description: 'Celebrate with SOGC and explore this event in detail before you join the ride.',
  buttonText: 'View event details',
  linkedEventSlug: 'ride-for-nation',
  linkedEventTitle: 'Ride For Nation',
  imageUrl: '',
  imagePublicId: '',
  imageFileData: '',
  imageFileName: '',
  removeImage: false,
  isActive: false,
  openOnScroll: true,
  openOnManualTrigger: true,
  sessionStorageKey: 'event_popup_seen',
}

function PopupPage({ mode }) {
  const isEdit = mode === 'edit'
  const navigate = useNavigate()
  const { popupId } = useParams()
  const [form, setForm] = useState(defaultFormState)
  const [adminEvents, setAdminEvents] = useState([])
  const [status, setStatus] = useState('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEdit)
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false)
  const eventDropdownRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    fetchAdminEvents()
      .then((items) => {
        if (!isMounted) return
        setAdminEvents(items)
        setStatus('ready')
      })
      .catch(() => {
        if (!isMounted) return
        setAdminEvents([])
        setStatus('error')
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isEventDropdownOpen) {
      return undefined
    }

    const handleOutsideClick = (event) => {
      if (!eventDropdownRef.current?.contains(event.target)) {
        setIsEventDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    document.addEventListener('touchstart', handleOutsideClick)

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      document.removeEventListener('touchstart', handleOutsideClick)
    }
  }, [isEventDropdownOpen])

  useEffect(() => {
    if (!isEdit || !popupId) {
      return
    }

    let isMounted = true

    fetchAdminPopup(popupId)
      .then((item) => {
        if (!isMounted) return
        setForm({
          title: item.title ?? '',
          description: item.description ?? '',
          buttonText: item.buttonText ?? '',
          linkedEventSlug: item.linkedEventSlug ?? '',
          linkedEventTitle: item.linkedEventTitle ?? '',
          imageUrl: item.imageUrl ?? '',
          imagePublicId: item.imagePublicId ?? '',
          imageFileData: '',
          imageFileName: '',
          removeImage: false,
          isActive: Boolean(item.isActive),
          openOnScroll: Boolean(item.openOnScroll),
          openOnManualTrigger: Boolean(item.openOnManualTrigger),
          sessionStorageKey: item.sessionStorageKey ?? 'event_popup_seen',
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
  }, [isEdit, popupId])

  const eventOptions = useMemo(() => {
    const seenSlugs = new Set()
    const mergedEvents = []

    staticEventOptions.forEach((event) => {
      if (!event.slug || seenSlugs.has(event.slug)) {
        return
      }

      seenSlugs.add(event.slug)
      mergedEvents.push(event)
    })

    adminEvents.forEach((event) => {
      if (!event?.slug || seenSlugs.has(event.slug) || !event.isPublished) {
        return
      }

      seenSlugs.add(event.slug)
      mergedEvents.push({
        slug: event.slug,
        title: event.title,
        description: event.description ?? '',
        source: 'Admin event - Published',
      })
    })

    return mergedEvents
  }, [adminEvents])

  useEffect(() => {
    if (!eventOptions.length) {
      return
    }

    const linkedEventExists = eventOptions.some((event) => event.slug === form.linkedEventSlug)

    if (!linkedEventExists) {
      const firstEvent = eventOptions[0]

      setForm((current) => ({
        ...current,
        linkedEventSlug: firstEvent.slug,
        linkedEventTitle: firstEvent.title,
        title: current.title || firstEvent.title,
        description: current.description || firstEvent.description || '',
      }))
    }
  }, [eventOptions, form.linkedEventSlug])

  const selectedEvent = eventOptions.find((event) => event.slug === form.linkedEventSlug) ?? null
  const eventLinkPreview = selectedEvent ? `/#event/${selectedEvent.slug}` : ''

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleLinkedEventChange = (slug) => {
    const nextEvent = eventOptions.find((event) => event.slug === slug)

    setForm((current) => ({
      ...current,
      linkedEventSlug: slug,
      linkedEventTitle: nextEvent?.title ?? '',
      title: nextEvent?.title ?? current.title,
      description: nextEvent?.description ?? current.description,
    }))
    setIsEventDropdownOpen(false)
  }

  const handleImageFileChange = (event) => {
    const [file] = event.target.files ?? []

    if (!file) {
      setForm((current) => ({
        ...current,
        imageFileData: '',
        imageFileName: '',
        removeImage: false,
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
      setErrorMessage('Unable to read the selected popup image.')
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
    setErrorMessage('')
    setStatusMessage('')
    setIsSubmitting(true)

    try {
      const payload = {
        ...form,
        linkedEventTitle: selectedEvent?.title ?? form.linkedEventTitle,
      }

      const savedPopup = isEdit && popupId
        ? await updateAdminPopup(popupId, payload)
        : await createAdminPopup(payload)

      setStatusMessage('Popup settings saved successfully.')
      navigate(`/popup/${savedPopup.id}`)
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Popup details"
        title={isEdit ? 'Edit popup' : 'Create popup'}
        description="Choose an event, auto-fill the popup content from it, then save this popup for review or activation."
      />

      <SectionCard
        eyebrow="Popup editor"
        title={isEdit ? 'Update popup content' : 'Add a new popup'}
        description="Only one popup can be live on the website at a time. If you mark this popup as live, any other live popup will be turned off automatically."
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
            Loading popup details...
          </div>
        ) : null}
        {!isLoading ? (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <div className="space-y-6">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Popup content</p>
                  <div className="mt-5 space-y-4">
                    <label className="space-y-2">
                      <span className="text-sm text-[#b7c6bf]">Popup title</span>
                      <input
                        value={form.title}
                        onChange={(event) => updateField('title', event.target.value)}
                        placeholder="Ride For Nation"
                        className={inputClassName}
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm text-[#b7c6bf]">Popup description</span>
                      <textarea
                        rows="4"
                        value={form.description}
                        onChange={(event) => updateField('description', event.target.value)}
                        placeholder="Invite visitors to learn more and join the event."
                        className={textareaClassName}
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm text-[#b7c6bf]">Button label</span>
                      <input
                        value={form.buttonText}
                        onChange={(event) => updateField('buttonText', event.target.value)}
                        placeholder="View event details"
                        className={inputClassName}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Popup behavior</p>
                  <div className="mt-5 space-y-4">
                    <label className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-[#0f1513] p-4">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(event) => updateField('isActive', event.target.checked)}
                        className="mt-1 h-4 w-4 accent-[#f8d35c]"
                      />
                      <span>
                        <span className="block text-sm font-medium text-white">Show this popup on website</span>
                        <span className="mt-1 block text-sm text-[#9db0a7]">
                          If enabled, this popup becomes the only live popup on the website.
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
                        <span className="block text-sm font-medium text-white">Allow popup to open from site actions</span>
                        <span className="mt-1 block text-sm text-[#9db0a7]">
                          Lets website buttons or actions open this popup directly.
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
                        <span className="block text-sm font-medium text-white">Open after scroll</span>
                        <span className="mt-1 block text-sm text-[#9db0a7]">
                          Shows the popup after a visitor scrolls down the page.
                        </span>
                      </span>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm text-[#b7c6bf]">Visitor memory key</span>
                      <input
                        value={form.sessionStorageKey}
                        onChange={(event) => updateField('sessionStorageKey', event.target.value)}
                        placeholder="event_popup_seen"
                        className={inputClassName}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Linked event</p>
                  <div className="mt-5 space-y-4">
                    <div ref={eventDropdownRef} className="space-y-2">
                      <span className="text-sm text-[#b7c6bf]">Select event</span>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsEventDropdownOpen((current) => !current)}
                          className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-white outline-none transition hover:border-white/15 hover:bg-white/7"
                        >
                          <span className="truncate">{selectedEvent?.title || 'Select an event'}</span>
                          <svg
                            className={`h-5 w-5 shrink-0 text-[#f8d35c] transition-transform ${isEventDropdownOpen ? 'rotate-180' : ''}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </button>

                        {isEventDropdownOpen ? (
                          <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#101815] p-2 shadow-2xl shadow-black/30">
                            {eventOptions.map((event) => {
                              const isSelected = event.slug === form.linkedEventSlug

                              return (
                                <button
                                  key={event.slug}
                                  type="button"
                                  onClick={() => handleLinkedEventChange(event.slug)}
                                  className={`w-full rounded-xl px-4 py-3 text-left transition ${
                                    isSelected
                                      ? 'bg-[#f8d35c]/12 text-[#f8d35c]'
                                      : 'text-white hover:bg-white/5'
                                  }`}
                                >
                                  <span className="block text-sm font-medium">{event.title}</span>
                                  <span className="mt-1 block text-xs text-[#91a39a]">{event.source}</span>
                                </button>
                              )
                            })}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {status === 'loading' ? (
                      <p className="text-sm text-[#b7c6bf]">Loading static and admin event options...</p>
                    ) : null}
                    {status === 'error' ? (
                      <p className="text-sm text-[#ffb4a2]">
                        Admin-created events could not be loaded right now. Static website events are still available in
                        the dropdown.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="rounded-[24px] border border-white/10 bg-white/5 p-4 md:rounded-[28px] md:p-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Popup image</p>
                  <div className="mt-5 space-y-4">
                    <label className="space-y-2">
                      <span className="text-sm text-[#b7c6bf]">Image file</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white file:mr-4 file:rounded-xl file:border-0 file:bg-[#f8d35c] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#1b1b12]"
                      />
                    </label>

                    {form.imageFileName ? <p className="text-sm text-[#b7c6bf]">Selected file: {form.imageFileName}</p> : null}

                    {form.imageUrl || form.imageFileData ? (
                      <div className="space-y-3">
                        <img
                          src={form.imageFileData || form.imageUrl}
                          alt={form.title || 'Popup preview'}
                          className="h-48 w-full rounded-[24px] border border-white/10 object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                        >
                          Remove image
                        </button>
                      </div>
                    ) : (
                      <div className="rounded-[24px] border border-dashed border-white/15 bg-[#0f1513] px-4 py-10 text-center text-sm text-[#9db0a7]">
                        Upload an image to preview how the popup visual can look.
                      </div>
                    )}
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
                {isEdit ? 'Save popup changes' : 'Create popup'}
              </button>
              <button type="button" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white">
                Preview popup
              </button>
            </div>
          </form>
        ) : null}
      </SectionCard>
    </div>
  )
}

export default PopupPage
