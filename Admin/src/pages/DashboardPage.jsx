import SectionCard from '../components/SectionCard'
import StatsGrid from '../components/StatsGrid'

function DashboardPage() {
  return (
    <div className="space-y-6">
      <StatsGrid />

      <SectionCard
        eyebrow="Launch order"
        title="Build the smallest useful admin first"
        description="This scaffold follows the roadmap: auth, events, popup, then gallery. The public frontend should only change at the data layer."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <h4 className="text-lg font-medium text-white">Version 1 scope</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#b7c6bf]">
              <li>Admin management with whitelist control</li>
              <li>Google-only admin login with whitelist</li>
              <li>Events CRUD with publish and ordering</li>
              <li>Gallery CRUD with collection and media management</li>
              <li>Popup mode control for volunteer or custom campaigns</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <h4 className="text-lg font-medium text-white">Integration note</h4>
            <p className="mt-4 text-sm leading-6 text-[#b7c6bf]">
              Until the Node and Express backend exists, these pages are UI shells. The next real step is wiring routes,
              auth state, and API clients to Mongo-backed endpoints.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export default DashboardPage
