function MobileMenuButton({ isOpen, onClick, label = 'Toggle menu' }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={isOpen}
      onClick={onClick}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 ease hover:scale-[1.05]"
    >
      <span className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-emerald-500/10 opacity-0 blur-md transition-opacity duration-300 ease group-hover:opacity-100" />
      <span
        className={`absolute h-0.5 w-[22px] rounded-full bg-slate-900 transition-all duration-300 ease ${
          isOpen ? 'translate-y-0 rotate-45' : '-translate-y-[6px] rotate-0'
        }`}
      />
      <span
        className={`absolute h-0.5 w-[22px] rounded-full bg-slate-900 transition-all duration-300 ease ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`absolute h-0.5 w-[22px] rounded-full bg-slate-900 transition-all duration-300 ease ${
          isOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[6px] rotate-0'
        }`}
      />
    </button>
  )
}

export default MobileMenuButton