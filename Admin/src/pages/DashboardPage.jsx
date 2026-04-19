import SectionCard from '../components/SectionCard'
import StatsGrid from '../components/StatsGrid'

function DashboardPage() {
  return (
    <div className="space-y-6">
      <StatsGrid />

      <SectionCard
        eyebrow="Overview"
        title="Manage your website content in one place"
        description="Use this workspace to manage events, popup content, gallery collections, and admin access from a single panel."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <h4 className="text-lg font-medium text-white">What you can manage</h4>
            <ul className="mt-4 space-y-3 text-sm text-[#b7c6bf]">
              <li>Admin access and allowed email accounts</li>
              <li>Event creation, updates, publishing, and removal</li>
              <li>Gallery collection details and media organization</li>
              <li>Popup visibility and popup content</li>
              <li>Website content updates without editing code directly</li>
            </ul>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-5">
            <h4 className="text-lg font-medium text-white">How to use this panel</h4>
            <p className="mt-4 text-sm leading-6 text-[#b7c6bf]">
              Start by creating or updating content sections, then publish only the items that should appear on the
              public website. Draft items stay available in admin without appearing to visitors.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

export default DashboardPage
