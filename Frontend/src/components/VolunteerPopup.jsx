import React, { useState, useEffect, useRef } from 'react'
import { submitVolunteerForm } from '../lib/publicForms'

const VOLUNTEER_POPUP_SESSION_KEY = 'volunteer_popup_seen'

export default function VolunteerPopup({ enableScrollTrigger = true }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isRendered, setIsRendered] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
    const [submitState, setSubmitState] = useState('idle')
    const [statusMessage, setStatusMessage] = useState('')

    const modalRef = useRef(null)
    const firstInputRef = useRef(null)
    const closeTimeoutRef = useRef(null)

    const handleClose = () => {
        setIsOpen(false)
        closeTimeoutRef.current = window.setTimeout(() => setIsRendered(false), 300)
    }

    useEffect(() => {
        const handleOpenPopup = () => {
            window.clearTimeout(closeTimeoutRef.current)
            setIsRendered(true)
            setTimeout(() => setIsOpen(true), 10)
            sessionStorage.setItem(VOLUNTEER_POPUP_SESSION_KEY, 'true')
        }
        window.addEventListener('open-volunteer-popup', handleOpenPopup)
        return () => window.removeEventListener('open-volunteer-popup', handleOpenPopup)
    }, [])

    useEffect(() => {
        if (!enableScrollTrigger) {
            return undefined
        }

        if (typeof window !== 'undefined' && sessionStorage.getItem(VOLUNTEER_POPUP_SESSION_KEY)) {
            return undefined
        }

        const handleScroll = () => {
            if (window.scrollY <= window.innerHeight || isOpen) {
                return
            }

            window.clearTimeout(closeTimeoutRef.current)
            setIsRendered(true)
            window.setTimeout(() => setIsOpen(true), 10)
            sessionStorage.setItem(VOLUNTEER_POPUP_SESSION_KEY, 'true')
            window.removeEventListener('scroll', handleScroll)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [enableScrollTrigger, isOpen])

    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') handleClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    useEffect(() => {
        if (isOpen && firstInputRef.current) {
            firstInputRef.current.focus()
        }
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

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
        if (submitState !== 'idle') {
            setSubmitState('idle')
            setStatusMessage('')
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setSubmitState('submitting')
        setStatusMessage('')

        try {
            await submitVolunteerForm({
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
            })

            setSubmitState('success')
            setStatusMessage('Thanks for signing up. We have received your details and will reach out soon.')
            setFormData({ name: '', email: '', phone: '' })
            window.setTimeout(() => {
                handleClose()
                setSubmitState('idle')
                setStatusMessage('')
            }, 1600)
        } catch (error) {
            setSubmitState('error')
            setStatusMessage(error.message || 'Unable to submit the volunteer form right now.')
        }
    }

    const isFormValid = formData.name.trim() && formData.email.trim() && formData.phone.trim()

    if (!isRendered) return null

    return (
        <div
            className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-opacity duration-300 ease-in-out font-sans ${isOpen ? 'opacity-100' : 'opacity-0'
                }`}
            onMouseDown={handleBackdropClick}
        >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

            <div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby="volunteer-popup-title"
                className={`relative w-full max-w-[400px] rounded-[36px] p-8 backdrop-blur-xl transition-all duration-300 ease-out ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
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
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#f8d35c]"
                    aria-label="Close popup"
                >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-7 text-center">
                    <h2 id="volunteer-popup-title" className="mb-2 font-serif text-2xl font-bold text-white tracking-wide">
                        Become a Cycle Mitra
                    </h2>
                    <p className="text-sm text-gray-400">
                        Join our mission and make cycling safer for everyone.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="volunteer-name" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-300">
                            Name
                        </label>
                        <input
                            ref={firstInputRef}
                            id="volunteer-name"
                            name="name"
                            type="text"
                            required={true}
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:border-[#f8d35c]/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#f8d35c]/50"
                            placeholder="Your full name"
                        />
                    </div>

                    <div>
                        <label htmlFor="volunteer-email" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-300">
                            Email
                        </label>
                        <input
                            id="volunteer-email"
                            name="email"
                            type="email"
                            required={true}
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:border-[#f8d35c]/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#f8d35c]/50"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="volunteer-phone" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-gray-300">
                            Phone
                        </label>
                        <input
                            id="volunteer-phone"
                            name="phone"
                            type="tel"
                            required={true}
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 transition-all focus:border-[#f8d35c]/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-[#f8d35c]/50"
                            placeholder="+91 00000 00000"
                        />
                    </div>

                    {statusMessage ? (
                        <div
                            className={`rounded-xl border px-4 py-3 text-sm ${submitState === 'error'
                                    ? 'border-[#ffb4a2]/20 bg-[#ffb4a2]/10 text-[#ffd7cd]'
                                    : 'border-[#f8d35c]/20 bg-[#f8d35c]/10 text-[#f3e7b2]'
                                }`}
                        >
                            {statusMessage}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={!isFormValid || submitState === 'submitting'}
                        className="mt-3 w-full rounded-xl bg-[#f8d35c] px-4 py-3.5 text-sm font-bold text-[#0b1410] shadow-[0_0_20px_rgba(248,211,92,0.15)] transition-all duration-200 hover:bg-[#f9da75] hover:shadow-[0_0_25px_rgba(248,211,92,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    >
                        {submitState === 'submitting' ? 'Submitting...' : 'I want to become a Cycle Mitra'}
                    </button>
                </form>
            </div>
        </div>
    )
}
