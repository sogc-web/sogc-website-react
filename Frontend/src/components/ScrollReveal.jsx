import { useEffect } from 'react'
import './ScrollReveal.css'
import useScrollDirection from './useScrollDirection'

const REVEAL_SELECTOR = [
    '.reveal',
    '.section-header',
    '.campaigns-luxe-header',
    '.story-stage-section__header',
    '.list-item',
    '.gallery-collection-card',
    '.timeline-item',
    '.press-masonry-card',
    '.media-coverage-card',
    '.testimonials-luxe-card',
    '.contact-form',
    '.cta',
    '.pillars article'
].join(', ');

const REVEAL_THRESHOLD = 0.05;

export default function ScrollReveal() {
    const scrollDirectionRef = useScrollDirection()

    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    const element = entry.target;

                    if (entry.isIntersecting) {
                        const direction = scrollDirectionRef.current === 'up' ? 'up' : 'down';

                        // Prevent re-triggering mid-animation if direction switches rapidly
                        if (!element.classList.contains('active')) {
                            element.classList.remove('reveal-up', 'reveal-down');
                            element.classList.add(direction === 'up' ? 'reveal-up' : 'reveal-down');

                            // Force a browser reflow to apply the translation before adding 'active'
                            void element.offsetWidth;

                            element.classList.add('active');
                        }
                    } else {
                        // Remove 'active' when it leaves the screen so it animates again
                        element.classList.remove('active');
                    }
                })
            },
            {
                root: null,
                threshold: REVEAL_THRESHOLD,
                rootMargin: '0px 0px -6% 0px',
            },
        )

        const observeRevealElements = () => {
            const elements = document.querySelectorAll(REVEAL_SELECTOR)

            elements.forEach((element) => {
                if (element.closest('#hero') || element.closest('.hero-stage') || element.closest('.subpage-stage')) {
                    return
                }

                // Auto-attach base CSS class so we don't have to rewrite the HTML manually
                if (!element.classList.contains('reveal')) {
                    element.classList.add('reveal');
                }

                if (element.dataset.revealObserved === 'true') {
                    return;
                }

                element.dataset.revealObserved = 'true'
                observer.observe(element)
            })
        }

        // Slight delay ensures the DOM is fully painted before attaching classes
        const timer = setTimeout(observeRevealElements, 100);

        const mutationObserver = new MutationObserver(() => {
            observeRevealElements()
        })

        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        })

        return () => {
            clearTimeout(timer);
            mutationObserver.disconnect()
            observer.disconnect()

            document.querySelectorAll('.reveal').forEach((element) => {
                element.classList.remove('reveal-up', 'reveal-down', 'active')
                delete element.dataset.revealObserved
            })
        }
    }, [scrollDirectionRef])

    return null
}

