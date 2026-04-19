import React, { useEffect, useRef, useState } from 'react'

export default function AdminPopup({ popup }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isRendered, setIsRendered] = useState(false)

    const modalRef = useRef(null)
    const closeTimeoutRef = useRef(null)

    const handleClose = () => {
        setIsOpen(false)
        closeTimeoutRef.current = window.setTimeout(() => setIsRendered(false), 300)
    }

    useEffect(() => {
        if (!popup?.isActive || !popup.openOnScroll) {
            return undefined
        }

        if (typeof window !== 'undefined' && popup.sessionStorageKey && sessionStorage.getItem(popup.sessionStorageKey)) {
            return undefined
        }

        const handleScroll = () => {
            if (window.scrollY > window.innerHeight && !isOpen) {
                setIsRendered(true)
                window.setTimeout(() => setIsOpen(true), 10)
                if (popup.sessionStorageKey) {
                    sessionStorage.setItem(popup.sessionStorageKey, 'true')
                }
                window.removeEventListener('scroll', handleScroll)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isOpen, popup])

    useEffect(() => {
        if (!isOpen) return undefined

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                handleClose()
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    useEffect(() => {
        return () => {
            window.clearTimeout(closeTimeoutRef.current)
        }
    }, [])

    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            handleClose()
        }
    }

    const handleOpenEvent = () => {
        if (popup?.linkedEventSlug) {
            window.location.hash = `#event/${popup.linkedEventSlug}`
        }
        handleClose()
    }

    const promoBadgeLabel = popup?.linkedEventTitle ? 'Upcoming Event' : 'New'

    if (!popup?.isActive || !isRendered) return null

    return (
        <div
            className={`fixed inset-0 z-[999] flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out font-sans ${isOpen ? 'opacity-100' : 'opacity-0'
                }`}
            onMouseDown={handleBackdropClick}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="site-popup-title"
                className={`relative w-full max-w-[440px] overflow-hidden rounded-[36px] backdrop-blur-xl transition-all duration-300 ease-out ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
                    }`}
                style={{
                    background: 'var(--section-shell-bg)',
                    border: '1px solid var(--section-shell-border)',
                    boxShadow: 'var(--section-shell-shadow)',
                }}
            >
                <button
                    type="button"
                    onClick={handleClose}
                    className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-gray-200 transition-transform duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#f8d35c]"
                    aria-label="Close popup"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="absolute top-8 z-20">
                    <div className="rotate-[-25deg] rounded-full bg-[#f8d35c] px-4 py-2 shadow-[0_10px_24px_rgba(248,211,92,0.28)]">
                        <span className="block text-[10px] font-black uppercase tracking-[0.24em] text-[#173126]">
                            {promoBadgeLabel}
                        </span>
                    </div>
                </div>

                {popup.imageUrl ? (
                    <div className="h-52 w-full">
                        <img
                            src={popup.imageUrl}
                            alt={popup.imageAlt || popup.title}
                            className="h-full w-full object-cover"
                        />
                    </div>
                ) : null}

                <div className="p-8">
                    <div className="mb-6 text-center">
                        {popup.linkedEventTitle ? (
                            <p className="mb-3 text-[11px] uppercase tracking-[0.35em] text-[#f8d35c]">
                                {popup.linkedEventTitle}
                            </p>
                        ) : null}
                        <h2 id="site-popup-title" className="mb-3 font-serif text-2xl font-bold text-white tracking-wide">
                            {popup.title}
                        </h2>
                        <p className="text-sm leading-7 text-gray-300">
                            {popup.description}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenEvent}
                        className="w-full rounded-xl bg-[#f8d35c] px-4 py-3.5 text-sm font-bold text-[#0b1410] shadow-[0_0_20px_rgba(248,211,92,0.15)] transition-all duration-200 hover:bg-[#f9da75] hover:shadow-[0_0_25px_rgba(248,211,92,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                    >
                        {popup.buttonText}
                    </button>
                </div>
            </div>
        </div>
    )
}
