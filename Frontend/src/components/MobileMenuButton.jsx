function MobileMenuButton({ isOpen, onClick, label = 'Toggle menu' }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={isOpen}
      onClick={onClick}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 ease hover:scale-[1.05]"
    >
      <span
        className={`absolute h-0.5 w-[22px] rounded-full bg-current transition-all duration-300 ease ${
          isOpen ? 'translate-y-0 rotate-45' : '-translate-y-[6px] rotate-0'
        }`}
      />
      <span
        className={`absolute h-0.5 w-[22px] rounded-full bg-current transition-all duration-300 ease ${
          isOpen ? 'opacity-0' : 'opacity-100'
        }`}
      />
      <span
        className={`absolute h-0.5 w-[22px] rounded-full bg-current transition-all duration-300 ease ${
          isOpen ? 'translate-y-0 -rotate-45' : 'translate-y-[6px] rotate-0'
        }`}
      />
    </button>
  )
}

export default MobileMenuButton
