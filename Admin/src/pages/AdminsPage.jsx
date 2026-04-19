import SectionCard from '../components/SectionCard'

const adminRows = [
  {
    id: 'primary-admin',
    name: 'Primary Admin',
    email: 'admin@example.com',
    status: 'Active',
    createdBy: 'System seed',
  },
]

function AdminsPage() {
  return (
    <div className="space-y-6">
      <SectionCard
        eyebrow="Admins"
        title="Manage admin access"
      >
        <div className="overflow-hidden rounded-[24px] border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] divide-y divide-white/10 text-left text-sm">
            <thead className="bg-white/5 text-[#91a39a]">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created by</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-[#0f1513]">
              {adminRows.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-4 py-4 text-white">{admin.name}</td>
                  <td className="px-4 py-4 text-[#b7c6bf]">{admin.email}</td>
                  <td className="px-4 py-4 text-[#b7c6bf]">{admin.status}</td>
                  <td className="px-4 py-4 text-[#b7c6bf]">{admin.createdBy}</td>
                  <td className="px-4 py-4">
                    <button type="button" className="text-[#f8d35c] hover:text-[#ffbf2f]">
                      Disable
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Add admin"
        title="Create a new admin"
        description="Add a team member who should be allowed to access the admin panel."
      >
        <form className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-[#b7c6bf]">Full name</span>
            <input className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
          </label>
          <label className="space-y-2">
            <span className="text-sm text-[#b7c6bf]">Email</span>
            <input type="email" className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm text-[#b7c6bf]">Status</span>
            <select className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-3 max-md:[&>*]:w-full">
            <button type="submit" className="rounded-2xl bg-[#f8d35c] px-5 py-3 font-medium text-[#1b1b12]">
              Create admin
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  )
}

export default AdminsPage
