import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SectionCard from '../components/SectionCard'
import { deleteAdminEvent, fetchAdminEvent } from '../lib/adminEvents'

function EventShowPage() {
  const navigate = useNavigate()
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    if (!eventId) {
      setIsLoading(false)
      setErrorMessage('Event id is missing.')
      return
    }

    let isMounted = true

    fetchAdminEvent(eventId)
      .then((item) => {
        if (!isMounted) return
        setEvent(item)
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
  }, [eventId])

  const handleDelete = async () => {
    if (!eventId) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

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
        eyebrow="Event detail"
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span>{event?.title || 'Event details'}</span>
            {event ? (
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${
                  event.isPublished
                    ? 'border-[#f8d35c]/30 bg-[#f8d35c]/12 text-[#f8d35c]'
                    : 'border-white/10 bg-white/5 text-[#b7c6bf]'
                }`}
              >
                {event.isPublished ? 'Published' : 'Draft'}
              </span>
            ) : null}
          </span>
        }
        description="Review the saved event information before making further changes or updating its publish status."
        action={
          event ? (
            <div className="flex flex-wrap gap-3 max-md:[&>*]:w-full">
              <Link
                to="/events"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                Back to events
              </Link>
              <Link
                to={`/events/${event.id}/edit`}
                className="inline-flex items-center justify-center rounded-2xl bg-[#f8d35c] px-4 py-3 text-sm font-medium text-[#1b1b12]"
              >
                Edit event
              </Link>
            </div>
          ) : null
        }
      >
        {errorMessage ? (
          <div className="rounded-2xl border border-[#ffb4a2]/20 bg-[#5a2318]/30 px-4 py-3 text-sm text-[#ffd5ca]">
            {errorMessage}
          </div>
        ) : null}
        {isLoading ? (
          <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-6 text-sm text-[#b7c6bf]">
            Loading event details...
          </div>
        ) : null}
        {!isLoading && event ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Status</p>
                <p className="mt-4 text-lg font-medium text-white">{event.isPublished ? 'Published' : 'Draft'}</p>
                <p className="mt-2 text-sm text-[#b7c6bf]">Created: {new Date(event.createdAt).toLocaleString()}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Card details</p>
                <p className="mt-4 text-sm text-white">{event.date}</p>
                <p className="mt-2 text-sm text-[#b7c6bf]">{event.location}</p>
                <p className="mt-2 text-sm text-[#b7c6bf]">Slug: {event.slug}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Hero</p>
                <p className="mt-4 text-sm text-white">{event.tag || 'No tag'}</p>
                <p className="mt-2 text-sm text-[#b7c6bf]">{event.scheduleLine || 'No schedule line'}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Registration</p>
                {event.registrationUrl ? (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex text-sm text-[#f8d35c] hover:text-[#ffbf2f]"
                  >
                    Open registration link
                  </a>
                ) : (
                  <p className="mt-4 text-sm text-[#b7c6bf]">No registration link yet.</p>
                )}
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <div className="space-y-6">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Card description</p>
                  <p className="mt-4 text-sm leading-7 text-[#e5ede8]">{event.description}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Booklet note</p>
                  <p className="mt-4 text-sm leading-7 text-[#e5ede8]">{event.bookletScheduleNote || 'Not set.'}</p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">About</p>
                    <p className="mt-4 text-sm leading-7 text-[#e5ede8]">{event.about || 'Not set.'}</p>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Experience</p>
                    <p className="mt-4 text-sm leading-7 text-[#e5ede8]">{event.experience || 'Not set.'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Event image</p>
                  {event.imageUrl ? (
                    <div className="mt-4 space-y-3">
                      <img
                        src={event.imageUrl}
                        alt={event.imageAlt || event.title}
                        className="h-56 w-full rounded-[24px] border border-white/10 object-cover"
                      />
                      <p className="text-sm text-[#b7c6bf]">Alt text: {event.imageAlt || 'Not set.'}</p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[#b7c6bf]">No image uploaded yet.</p>
                  )}
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Highlights</p>
                  {event.highlights?.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {event.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="rounded-full border border-white/10 bg-[#0f1513] px-3 py-2 text-sm text-[#e5ede8]"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[#b7c6bf]">No highlights added.</p>
                  )}
                </div>
                <div className="rounded-[24px] border border-[#f8d35c]/20 bg-[#f8d35c]/8 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Danger zone</p>
                  <p className="mt-3 text-sm leading-6 text-[#e5ede8]">
                    Delete this event if it should be removed from admin management completely.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white"
                  >
                    Delete event
                  </button>
                </div>
              </div>
            </div>
          </div>
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

export default EventShowPage
