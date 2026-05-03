import { useEffect, useState } from 'react'
import SectionCard from '../components/SectionCard'
import { disableAdmin, enableAdmin, fetchAdmins, inviteAdmin, removeAdmin, resendAdminInvite } from '../lib/adminAdmins'

function AdminsPage() {
  const [admins, setAdmins] = useState([])
  const [status, setStatus] = useState({ loading: true, error: '', notice: '' })
  const [form, setForm] = useState({ name: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [inviteFallback, setInviteFallback] = useState(null)

  async function loadAdmins() {
    setStatus((current) => ({ ...current, loading: true, error: '' }))

    try {
      const items = await fetchAdmins()
      setAdmins(items)
      setStatus((current) => ({ ...current, loading: false }))
    } catch (error) {
      setStatus({ loading: false, error: error.message, notice: '' })
    }
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  async function handleInviteSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setInviteFallback(null)
    setStatus((current) => ({ ...current, error: '', notice: '' }))

    try {
      const result = await inviteAdmin(form)
      setForm({ name: '', email: '' })
      setStatus((current) => ({
        ...current,
        notice: result.message || 'Invite email sent successfully.',
      }))
      setInviteFallback(buildInviteFallback(result))
      await loadAdmins()
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRowAction(action) {
    setInviteFallback(null)
    setStatus((current) => ({ ...current, error: '', notice: '' }))

    try {
      const result = await action()
      if (result?.message) {
        setStatus((current) => ({ ...current, notice: result.message }))
      }
      setInviteFallback(buildInviteFallback(result))
      await loadAdmins()
    } catch (error) {
      setStatus((current) => ({ ...current, error: error.message }))
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard eyebrow="Admins" title="Manage admin access">
        {status.error ? (
          <div className="mb-4 rounded-2xl border border-[#ffb4a2]/20 bg-[#ffb4a2]/10 px-4 py-3 text-sm text-[#ffd7cd]">
            {status.error}
          </div>
        ) : null}

        {status.notice ? (
          <div className="mb-4 rounded-2xl border border-[#f8d35c]/20 bg-[#f8d35c]/10 px-4 py-3 text-sm text-[#f8e7ae]">
            {status.notice}
          </div>
        ) : null}

        {inviteFallback ? (
          <div className="mb-4 space-y-3 rounded-2xl border border-[#f8d35c]/20 bg-[#f8d35c]/10 px-4 py-4 text-sm text-[#f8e7ae]">
            <p>
              The invite link is ready for manual sharing with{' '}
              <span className="font-medium text-white">{inviteFallback.email}</span>.
            </p>
            <input
              readOnly
              value={inviteFallback.url}
              className="w-full rounded-2xl border border-white/10 bg-[#0f1513] px-4 py-3 text-white outline-none"
            />
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(inviteFallback.url)}
                className="rounded-2xl bg-[#f8d35c] px-4 py-2 text-sm font-medium text-[#1b1b12]"
              >
                Copy invite link
              </button>
              <div className="self-center text-xs text-[#d9c981]">
                Expires: {new Date(inviteFallback.expiresAt).toLocaleString()}
              </div>
            </div>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-[#91a39a]">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Last login</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-[#0f1513]">
                {status.loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-[#b7c6bf]">
                      Loading admins…
                    </td>
                  </tr>
                ) : admins.length ? (
                  admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="px-4 py-4 text-white">{admin.name || 'Not added yet'}</td>
                      <td className="px-4 py-4 text-[#b7c6bf]">{admin.email}</td>
                      <td className="px-4 py-4 text-[#b7c6bf]">{admin.role}</td>
                      <td className="px-4 py-4 text-[#b7c6bf]">{admin.status}</td>
                      <td className="px-4 py-4 text-[#b7c6bf]">
                        {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-3">
                          {admin.status === 'invited' ? (
                            <button
                              type="button"
                              onClick={() => handleRowAction(() => resendAdminInvite(admin.id))}
                              className="text-[#f8d35c] hover:text-[#ffbf2f]"
                            >
                              Resend invite
                            </button>
                          ) : null}
                          {admin.role !== 'superadmin' && admin.status === 'disabled' ? (
                            <button
                              type="button"
                              onClick={() => handleRowAction(() => enableAdmin(admin.id))}
                              className="text-[#7be0a7] hover:text-[#b7ffd0]"
                            >
                              Enable
                            </button>
                          ) : null}
                          {admin.role !== 'superadmin' && admin.status !== 'disabled' ? (
                            <button
                              type="button"
                              onClick={() => handleRowAction(() => disableAdmin(admin.id))}
                              className="text-[#f8d35c] hover:text-[#ffbf2f]"
                            >
                              Disable
                            </button>
                          ) : null}
                          {admin.role !== 'superadmin' ? (
                            <button
                              type="button"
                              onClick={() => handleRowAction(() => removeAdmin(admin.id))}
                              className="text-[#ffb4a2] hover:text-[#ffd7cd]"
                            >
                              Remove
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-[#b7c6bf]">
                      No admin records found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Invite admin"
        title="Invite a new admin"
        description="Only invited Google accounts can activate admin access."
      >
        <form onSubmit={handleInviteSubmit} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-[#b7c6bf]">Full name</span>
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              placeholder="Team member name"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[#b7c6bf]">Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              placeholder="name@example.com"
              required
            />
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3 max-md:[&>*]:w-full">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-[#f8d35c] px-5 py-3 font-medium text-[#1b1b12] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Sending invite…' : 'Send invite'}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}

function buildInviteFallback(result) {
  if (!result?.invite?.url || result?.invite?.emailDelivery?.delivered) {
    return null
  }

  return {
    email: result.item?.email || 'the invited admin',
    url: result.invite.url,
    expiresAt: result.invite.expiresAt,
  }
}

export default AdminsPage
