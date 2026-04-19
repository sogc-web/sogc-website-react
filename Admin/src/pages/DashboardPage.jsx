import { useEffect, useMemo, useState } from 'react'
import SectionCard from '../components/SectionCard'
import StatsGrid from '../components/StatsGrid'
import { fetchAdminEvents } from '../lib/adminEvents'
import { fetchAdminPopups } from '../lib/adminPopup'

function DashboardPage() {
  const [events, setEvents] = useState([])
  const [popups, setPopups] = useState([])
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    let isMounted = true

    Promise.all([fetchAdminEvents(), fetchAdminPopups()])
      .then(([eventItems, popupItems]) => {
        if (!isMounted) return
        setEvents(Array.isArray(eventItems) ? eventItems : [])
        setPopups(Array.isArray(popupItems) ? popupItems : [])
        setStatus('ready')
      })
      .catch(() => {
        if (!isMounted) return
        setEvents([])
        setPopups([])
        setStatus('error')
      })

    return () => {
      isMounted = false
    }
  }, [])

  const dashboardStats = useMemo(() => {
    const publishedEvents = events.filter((event) => event.isPublished).length
    const draftEvents = events.length - publishedEvents
    const activePopup = popups.find((popup) => popup.isActive)

    return [
      {
        label: 'Published events',
        value: String(publishedEvents),
        helper: `${draftEvents} draft${draftEvents === 1 ? '' : 's'} waiting in admin`,
      },
      {
        label: 'Total popups',
        value: String(popups.length),
        helper: activePopup ? 'One popup is currently live' : 'No popup is currently live',
      },
      {
        label: 'Live popup',
        value: activePopup ? activePopup.title : 'Default',
        helper: activePopup ? activePopup.linkedEventTitle || 'Custom popup content' : 'Static volunteer popup fallback',
      },
    ]
  }, [events, popups])

  const recentEvents = useMemo(
    () =>
      [...events]
        .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
        .slice(0, 3),
    [events],
  )

  const recentPopups = useMemo(
    () =>
      [...popups]
        .sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0))
        .slice(0, 3),
    [popups],
  )

  return (
    <div className="space-y-6">
      <StatsGrid stats={dashboardStats} />

      <SectionCard
        eyebrow="Overview"
        title="Manage your website content in one place"
        description="Use this workspace to manage events, popup content, gallery collections, and admin access from a single panel."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <h4 className="text-lg font-medium text-white">Current content snapshot</h4>
            {status === 'loading' ? (
              <p className="mt-4 text-sm text-[#b7c6bf]">Loading dashboard data from the backend...</p>
            ) : null}
            {status === 'error' ? (
              <p className="mt-4 text-sm text-[#ffb4a2]">Unable to load live dashboard data right now.</p>
            ) : null}
            {status === 'ready' ? (
              <ul className="mt-4 space-y-3 text-sm text-[#b7c6bf]">
                <li>{events.length} total event records in admin</li>
                <li>{events.filter((event) => event.isPublished).length} events are visible on the public website</li>
                <li>{popups.length} popup records created in admin</li>
                <li>{popups.some((popup) => popup.isActive) ? 'An admin popup is live on the website' : 'Static volunteer popup is currently the fallback'}</li>
                <li>Gallery management UI exists, but gallery data is still static for now</li>
              </ul>
            ) : null}
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <h4 className="text-lg font-medium text-white">Recent events</h4>
            {status === 'ready' && recentEvents.length > 0 ? (
              <div className="mt-4 space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{event.title}</p>
                      <span className="text-xs uppercase tracking-[0.2em] text-[#f8d35c]">
                        {event.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#b7c6bf]">{event.date || 'Date not set yet'}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {status === 'ready' && recentEvents.length === 0 ? (
              <p className="mt-4 text-sm text-[#b7c6bf]">No admin-created events yet.</p>
            ) : null}
            {status !== 'ready' ? null : null}
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <h4 className="text-lg font-medium text-white">Recent popups</h4>
            {status === 'ready' && recentPopups.length > 0 ? (
              <div className="mt-4 space-y-3">
                {recentPopups.map((popup) => (
                  <div key={popup.id} className="rounded-2xl border border-white/10 bg-black/10 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{popup.title}</p>
                      <span className="text-xs uppercase tracking-[0.2em] text-[#f8d35c]">
                        {popup.isActive ? 'Live' : 'Inactive'}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-[#b7c6bf]">
                      {popup.linkedEventTitle || 'No linked event selected'}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
            {status === 'ready' && recentPopups.length === 0 ? (
              <p className="mt-4 text-sm text-[#b7c6bf]">No admin-created popups yet.</p>
            ) : null}
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <h4 className="text-lg font-medium text-white">How to use this panel</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#b7c6bf]">
              <li>Create or update event records, then publish only the ones that should appear publicly</li>
              <li>Keep draft events in admin until the event details are ready for visitors</li>
              <li>Create multiple popups in admin, but keep only one marked live at a time</li>
              <li>When no popup is live, the website falls back to the default volunteer popup</li>
              <li>Gallery cards are still static right now, so dashboard gallery numbers remain placeholder-only</li>
            </ul>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export default DashboardPage
