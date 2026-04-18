function SectionCard({ eyebrow, title, description, children, action }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-[#101815]/80 p-4 shadow-xl shadow-black/10 md:rounded-[28px] md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? <p className="text-xs uppercase tracking-[0.3em] text-[#f8d35c]">{eyebrow}</p> : null}
          <h3 className="mt-3 text-xl font-semibold text-white md:text-2xl">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-6 text-[#9db0a7]">{description}</p> : null}
        </div>
        {action ? <div className="shrink-0 max-md:w-full max-md:[&>*]:w-full max-md:[&>*]:justify-center">{action}</div> : null}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  )
}

export default SectionCard
