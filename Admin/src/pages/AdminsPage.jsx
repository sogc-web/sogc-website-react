import { useEffect, useMemo, useState } from 'react'
import SectionCard from '../components/SectionCard'
import {
  disableAdmin,
  enableAdmin,
  fetchAdmins,
  inviteAdmin,
  removeAdmin,
  resendAdminInvite,
} from '../lib/adminAdmins'

function AdminsPage() {
  const [admins, setAdmins] = useState([])
  const [status, setStatus] = useState({ loading: true, error: '', notice: '' })
  const [form, setForm] = useState({ name: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [inviteFallback, setInviteFallback] = useState(null)

  const stats = useMemo(() => {
    const total = admins.length
    const active = admins.filter((admin) => admin.status === 'active').length
    const invited = admins.filter((admin) => admin.status === 'invited').length
    const disabled = admins.filter((admin) => admin.status === 'disabled').length

    return [
      { label: 'Total admins', value: total },
      { label: 'Active access', value: active },
      { label: 'Invites pending', value: invited },
      { label: 'Disabled', value: disabled },
    ]
  }, [admins])

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
        notice: result.message || 'Invitation processed successfully.',
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
      <SectionCard
        eyebrow="Admins"
        title="Manage privileged access"
        description="Invite trusted teammates, oversee active access, and keep every admin route tied to approved Google accounts only."
      >
        {status.error ? (
          <Notice tone="danger">{status.error}</Notice>
        ) : null}

        {status.notice ? (
          <Notice tone="gold">{status.notice}</Notice>
        ) : null}

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(248,211,92,0.12),transparent_45%),linear-gradient(180deg,rgba(16,24,21,0.98),rgba(10,15,13,0.98))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.22)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#f8d35c]">Access overview</p>
                <h4 className="mt-3 text-2xl font-semibold text-white">A tighter, cleaner admin roster</h4>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#9db0a7]">
                  Every admin signs in with Google, every write action is traceable, and every account stays
                  within a clear invite-only lifecycle.
                </p>
              </div>
              <div className="rounded-full border border-[#f8d35c]/25 bg-[#f8d35c]/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-[#f3dc85]">
                Superadmin controlled
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-white/10 bg-[#0f1513]/90 px-4 py-4 shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
                >
                  <div className="text-xs uppercase tracking-[0.28em] text-[#8da096]">{item.label}</div>
                  <div className="mt-3 text-3xl font-semibold text-white">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <AccessRule
                title="Invite-only activation"
                body="No password login, no open signup, and no hidden bypasses. Every new admin starts with a signed invite."
              />
              <AccessRule
                title="Traceable changes"
                body="Events, popups, and gallery updates remain linked to the admin email that performed each operation."
              />
            </div>
          </div>

          <div className="rounded-[28px] border border-[#f8d35c]/16 bg-[linear-gradient(180deg,rgba(18,24,22,0.98),rgba(12,18,16,0.98))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.24)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-[#f8d35c]">Invite admin</p>
                <h4 className="mt-3 text-2xl font-semibold text-white">Grant access with a secure link</h4>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#93a59c]">
                Google only
              </div>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#9db0a7]">
              Use the admin&apos;s Google email. If automatic delivery fails, you will still receive a secure invite
              link for manual sharing.
            </p>

            <form onSubmit={handleInviteSubmit} className="mt-6 space-y-4">
              <label className="space-y-2">
                <span className="text-sm text-[#b7c6bf]">Full name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#f8d35c]/40 focus:bg-white/7"
                  placeholder="Team member name"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm text-[#b7c6bf]">Google email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#f8d35c]/40 focus:bg-white/7"
                  placeholder="name@example.com"
                  required
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-[#f8d35c] px-5 py-3 font-medium text-[#1b1b12] shadow-[0_18px_40px_rgba(248,211,92,0.18)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? 'Sending invite...' : 'Send secure invite'}
              </button>
            </form>

            {inviteFallback ? (
              <div className="mt-6 rounded-[24px] border border-[#f8d35c]/20 bg-[#f8d35c]/8 p-4 text-sm text-[#f3e7b2]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-[#f8d35c]">Manual fallback</div>
                    <p className="mt-2 leading-6 text-[#f7edd0]">
                      Automatic delivery did not complete for{' '}
                      <span className="font-medium text-white">{inviteFallback.email}</span>. Share this secure link
                      manually.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-[#111715] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-[#d8c878]">
                    Expires {new Date(inviteFallback.expiresAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-[#0f1513] px-4 py-3 text-white break-all">
                  {inviteFallback.url}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(inviteFallback.url)}
                    className="rounded-full border border-[#f8d35c]/40 bg-[#f8d35c] px-4 py-2 text-sm font-medium text-[#1b1b12]"
                  >
                    Copy invite link
                  </button>
                  {inviteFallback.error ? (
                    <div className="self-center text-xs text-[#cdbf89]">{inviteFallback.error}</div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Access roster"
        title="Current admin directory"
        description="Review every privileged account, its current status, last successful login, and the next control action available to you."
      >
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0f1513] shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] divide-y divide-white/10 text-left text-sm">
              <thead className="bg-white/5 text-[#91a39a]">
                <tr>
                  <th className="px-5 py-4 font-medium">Admin</th>
                  <th className="px-5 py-4 font-medium">Role</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Last login</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {status.loading ? (
                  <tr>
                    <td colSpan="5" className="px-5 py-10 text-center text-[#b7c6bf]">
                      Loading admins...
                    </td>
                  </tr>
                ) : admins.length ? (
                  admins.map((admin) => (
                    <tr key={admin.id} className="align-top">
                      <td className="px-5 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#f8d35c]/20 bg-[#171e1b] text-sm font-semibold text-[#f8e7ae]">
                            {getInitials(admin.name || admin.email)}
                          </div>
                          <div>
                            <div className="text-base font-medium text-white">{admin.name || 'Pending profile name'}</div>
                            <div className="mt-1 text-sm text-[#b7c6bf]">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-5">
                        <RoleBadge role={admin.role} />
                      </td>
                      <td className="px-5 py-5">
                        <StatusBadge status={admin.status} />
                      </td>
                      <td className="px-5 py-5 text-[#b7c6bf]">
                        {admin.lastLoginAt ? formatDateTime(admin.lastLoginAt) : 'Never'}
                      </td>
                      <td className="px-5 py-5">
                        <div className="flex flex-wrap gap-2">
                          {admin.status === 'invited' ? (
                            <ActionButton
                              label="Resend invite"
                              tone="gold"
                              onClick={() => handleRowAction(() => resendAdminInvite(admin.id))}
                            />
                          ) : null}

                          {admin.role !== 'superadmin' && admin.status === 'disabled' ? (
                            <ActionButton
                              label="Enable"
                              tone="green"
                              onClick={() => handleRowAction(() => enableAdmin(admin.id))}
                            />
                          ) : null}

                          {admin.role !== 'superadmin' && admin.status !== 'disabled' ? (
                            <ActionButton
                              label="Disable"
                              tone="neutral"
                              onClick={() => handleRowAction(() => disableAdmin(admin.id))}
                            />
                          ) : null}

                          {admin.role !== 'superadmin' ? (
                            <ActionButton
                              label="Remove"
                              tone="danger"
                              onClick={() => handleRowAction(() => removeAdmin(admin.id))}
                            />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-5 py-10 text-center text-[#b7c6bf]">
                      No admin records found yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

function Notice({ children, tone }) {
  const tones = {
    danger: 'border-[#ffb4a2]/20 bg-[#ffb4a2]/10 text-[#ffd7cd]',
    gold: 'border-[#f8d35c]/20 bg-[#f8d35c]/10 text-[#f8e7ae]',
  }

  return (
    <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${tones[tone] || tones.gold}`}>
      {children}
    </div>
  )
}

function AccessRule({ title, body }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-[#0d1311] px-4 py-4">
      <div className="text-sm font-medium text-white">{title}</div>
      <p className="mt-2 text-sm leading-6 text-[#91a39a]">{body}</p>
    </div>
  )
}

function RoleBadge({ role }) {
  const className =
    role === 'superadmin'
      ? 'border-[#f8d35c]/25 bg-[#f8d35c]/10 text-[#f3dc85]'
      : 'border-white/10 bg-white/5 text-[#d8e4de]'

  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.24em] ${className}`}>
      {role}
    </span>
  )
}

function StatusBadge({ status }) {
  const tones = {
    active: 'border-[#79d89f]/20 bg-[#79d89f]/10 text-[#b9f2cf]',
    invited: 'border-[#f8d35c]/20 bg-[#f8d35c]/10 text-[#f3dc85]',
    disabled: 'border-[#ffb4a2]/20 bg-[#ffb4a2]/10 text-[#ffd7cd]',
  }

  return (
    <span className={`inline-flex rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.24em] ${tones[status] || 'border-white/10 bg-white/5 text-[#d8e4de]'}`}>
      {status}
    </span>
  )
}

function ActionButton({ label, onClick, tone }) {
  const tones = {
    gold: 'border-[#f8d35c]/30 bg-[#f8d35c]/10 text-[#f8d35c] hover:border-[#f8d35c]/45 hover:bg-[#f8d35c]/16',
    green: 'border-[#79d89f]/25 bg-[#79d89f]/10 text-[#b9f2cf] hover:border-[#79d89f]/40 hover:bg-[#79d89f]/16',
    neutral: 'border-white/10 bg-white/5 text-[#dbe4df] hover:border-white/20 hover:bg-white/8',
    danger: 'border-[#ffb4a2]/25 bg-[#ffb4a2]/10 text-[#ffd7cd] hover:border-[#ffb4a2]/38 hover:bg-[#ffb4a2]/16',
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-2 text-xs font-medium uppercase tracking-[0.2em] transition ${tones[tone] || tones.neutral}`}
    >
      {label}
    </button>
  )
}

function getInitials(value = '') {
  const parts = value.trim().split(/\s+/).filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return value.slice(0, 2).toUpperCase()
}

function formatDateTime(value) {
  return new Date(value).toLocaleString([], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function buildInviteFallback(result) {
  if (!result?.invite?.url || result?.invite?.emailDelivery?.delivered) {
    return null
  }

  return {
    email: result.item?.email || 'the invited admin',
    url: result.invite.url,
    expiresAt: result.invite.expiresAt,
    error: result.invite.emailDelivery?.error || '',
  }
}

export default AdminsPage
