import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SectionCard from '../components/SectionCard'
import { activateAdminPopup, deleteAdminPopup, fetchAdminPopup } from '../lib/adminPopup'

function PopupShowPage() {
  const navigate = useNavigate()
  const { popupId } = useParams()
  const [popup, setPopup] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  useEffect(() => {
    if (!popupId) {
      setIsLoading(false)
      setErrorMessage('Popup id is missing.')
      return
    }

    let isMounted = true

    fetchAdminPopup(popupId)
      .then((item) => {
        if (!isMounted) return
        setPopup(item)
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
  }, [popupId])

  const handleActivate = async () => {
    if (!popupId) return

    setIsSubmitting(true)
    setErrorMessage('')
    setStatusMessage('')

    try {
      const item = await activateAdminPopup(popupId)
      setPopup(item)
      setStatusMessage('This popup is now the live popup for the website.')
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!popupId) return

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      await deleteAdminPopup(popupId)
      navigate('/popup')
    } catch (error) {
      setErrorMessage(error.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Popup detail"
        title={
          <span className="flex flex-wrap items-center gap-3">
            <span>{popup?.title || 'Popup details'}</span>
            {popup ? (
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] ${
                  popup.isActive
                    ? 'border-[#f8d35c]/30 bg-[#f8d35c]/12 text-[#f8d35c]'
                    : 'border-white/10 bg-white/5 text-[#b7c6bf]'
                }`}
              >
                {popup.isActive ? 'Live' : 'Inactive'}
              </span>
            ) : null}
          </span>
        }
        description="Review this popup, confirm its linked event, and choose whether it should be the live popup shown on the website."
        action={
          popup ? (
            <div className="flex flex-wrap gap-3 max-md:[&>*]:w-full">
              <Link
                to="/popup"
                className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
              >
                Back to popups
              </Link>
              <Link
                to={`/popup/${popup.id}/edit`}
                className="inline-flex items-center justify-center rounded-2xl bg-[#f8d35c] px-4 py-3 text-sm font-medium text-[#1b1b12]"
              >
                Edit popup
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
        {statusMessage ? (
          <div className="rounded-2xl border border-[#f8d35c]/20 bg-[#f8d35c]/8 px-4 py-3 text-sm text-[#fff0b5]">
            {statusMessage}
          </div>
        ) : null}
        {isLoading ? (
          <div className="rounded-[24px] border border-white/10 bg-white/5 px-4 py-6 text-sm text-[#b7c6bf]">
            Loading popup details...
          </div>
        ) : null}
        {!isLoading && popup ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Status</p>
                <p className="mt-4 text-lg font-medium text-white">{popup.isActive ? 'Live on website' : 'Inactive'}</p>
                <p className="mt-2 text-sm text-[#b7c6bf]">Created: {new Date(popup.createdAt).toLocaleString()}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Linked event</p>
                <p className="mt-4 text-sm text-white">{popup.linkedEventTitle || 'No linked event'}</p>
                <p className="mt-2 text-sm text-[#b7c6bf]">Slug: {popup.linkedEventSlug || 'Not set'}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Popup behavior</p>
                <p className="mt-4 text-sm text-white">{popup.openOnScroll ? 'Opens on scroll' : 'No scroll open'}</p>
                <p className="mt-2 text-sm text-[#b7c6bf]">
                  {popup.openOnManualTrigger ? 'Manual open enabled' : 'Manual open disabled'}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <p className="text-xs uppercase tracking-[0.25em] text-[#f8d35c]">Website link</p>
                <p className="mt-4 text-sm text-[#b7c6bf]">{popup.linkedEventSlug ? `/#event/${popup.linkedEventSlug}` : 'Not available'}</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className="space-y-6">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Popup description</p>
                  <p className="mt-4 text-sm leading-7 text-[#e5ede8]">{popup.description}</p>
                </div>
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Button label</p>
                  <p className="mt-4 text-sm leading-7 text-[#e5ede8]">{popup.buttonText}</p>
                </div>
                <div className="rounded-[24px] border border-[#f8d35c]/20 bg-[#f8d35c]/8 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Live popup control</p>
                  <p className="mt-3 text-sm leading-6 text-[#e5ede8]">
                    Only one popup can be live on the website at a time. Activating this popup will automatically turn off any other live popup.
                  </p>
                  <button
                    type="button"
                    onClick={handleActivate}
                    disabled={isSubmitting || popup.isActive}
                    className="mt-4 rounded-2xl bg-[#f8d35c] px-5 py-3 font-medium text-[#1b1b12] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {popup.isActive ? 'Currently live' : 'Show this popup on website'}
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Popup image</p>
                  {popup.imageUrl ? (
                    <div className="mt-4 space-y-3">
                      <img
                        src={popup.imageUrl}
                        alt={popup.imageAlt || popup.title}
                        className="h-56 w-full rounded-[24px] border border-white/10 object-cover"
                      />
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-[#b7c6bf]">No image uploaded yet.</p>
                  )}
                </div>
                <div className="rounded-[24px] border border-[#f8d35c]/20 bg-[#f8d35c]/8 p-5">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Danger zone</p>
                  <p className="mt-3 text-sm leading-6 text-[#e5ede8]">
                    Delete this popup if it should be removed from admin management completely.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-white"
                  >
                    Delete popup
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
            <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">Delete popup</p>
            <h3 className="mt-3 text-2xl font-semibold text-white">Remove this popup?</h3>
            <p className="mt-3 text-sm leading-6 text-[#b7c6bf]">
              This will permanently delete the popup record and remove its image from Cloudinary. This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 max-md:[&>*]:w-full">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="rounded-2xl bg-[#f8d35c] px-5 py-3 font-medium text-[#1b1b12] disabled:cursor-not-allowed disabled:opacity-70"
              >
                Yes, delete popup
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

export default PopupShowPage
