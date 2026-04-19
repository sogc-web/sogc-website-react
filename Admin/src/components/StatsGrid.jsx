function StatsGrid({ stats = [] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
          <p className="text-sm text-[#91a39a]">{stat.label}</p>
          <p className="mt-3 text-2xl font-semibold text-white md:text-3xl">{stat.value}</p>
          {stat.helper ? <p className="mt-2 text-xs uppercase tracking-[0.2em] text-[#b7c6bf]">{stat.helper}</p> : null}
        </div>
      ))}
    </div>
  )
}

export default StatsGrid
