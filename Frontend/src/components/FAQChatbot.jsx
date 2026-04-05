import React, { useState, useEffect, useRef } from 'react';
import './FAQChatbot.css';

const FAQ_DATA = {
    initial: {
        question: "How can I help you today?",
        options: [
            { label: "What is SOGC?", next: "about" },
            { label: "How to join a ride?", next: "join" },
            { label: "Upcoming events", next: "events" },
            { label: "Volunteer with us", next: "volunteer" }
        ]
    },
    about: {
        answer: "Society of Global Cycle (SOGC) is an NGO dedicated to promoting sustainable mobility and cycling culture in Ujjain. We believe in building a healthier city through everyday cycling.",
        link: { label: "Learn more", href: "#story" },
        options: [
            { label: "Our mission", next: "mission" },
            { label: "See our timeline", next: "timeline" },
            { label: "Back to main", next: "initial" }
        ]
    },
    mission: {
        answer: "Our mission is to create safer streets, advocate for cycling infrastructure, and inspire citizens to adopt cycling for health and environment.",
        link: { label: "View Mission", href: "#story" },
        options: [
            { label: "How to help?", next: "volunteer" },
            { label: "Back to main", next: "initial" }
        ]
    },
    join: {
        answer: "Joining a ride is easy! We have regular Sunday rides. You can simply show up at the starting point or register through our website's 'Join a Ride' button.",
        link: { label: "Go to Hero Section", href: "#hero" },
        options: [
            { label: "Where is the start?", next: "location" },
            { label: "Back to main", next: "initial" }
        ]
    },
    location: {
        answer: "Our major rides usually start from Tower Chowk or Nana Kheda. Follow our social media for exact location pins before each ride!",
        link: { label: "Find us on map", href: "#contact" },
        options: [
            { label: "Social links", next: "socials" },
            { label: "Back to main", next: "initial" }
        ]
    },
    events: {
        answer: "We organize Cyclothons, night rides, and awareness campaigns. Check the 'Events' section on our homepage for the latest schedule.",
        link: { label: "Browse Events", href: "#events" },
        options: [
            { label: "Past events", next: "gallery" },
            { label: "Back to main", next: "initial" }
        ]
    },
    volunteer: {
        answer: "We're always looking for passionate volunteers for event management, photography, and social media. Click the 'Volunteer' button in the header to apply!",
        link: { label: "Join as Volunteer", action: "open-volunteer-popup" },
        options: [
            { label: "Back to main", next: "initial" }
        ]
    },
    timeline: {
        answer: "SOGC has been active since 2017, completing over 100+ Sunday rides and several major cycle yatras across India.",
        link: { label: "View Timeline", href: "#timeline" },
        options: [
            { label: "Back to main", next: "initial" }
        ]
    },
    gallery: {
        answer: "Visit our Gallery section to see thousands of photos from our previous rides and campaigns.",
        link: { label: "Open Gallery", href: "#gallery" },
        options: [
            { label: "Back to main", next: "initial" }
        ]
    },
    socials: {
        answer: "You can find us on Instagram, Facebook, X (Twitter), and YouTube. Links are available in the 'Follow us' section of the Hero area.",
        options: [
            { label: "Back to main", next: "initial" }
        ]
    }
};

const FAQChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [history, setHistory] = useState([{ type: 'bot', ...FAQ_DATA.initial }]);
    const chatEndRef = useRef(null);
    const chatbotRef = useRef(null);

    const scrollToBottom = (instant = false) => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({
                behavior: instant ? "auto" : "smooth",
                block: "end"
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            // Tiny delay to ensure DOM is ready and animation has started
            const timer = setTimeout(() => scrollToBottom(), 50);
            return () => clearTimeout(timer);
        }
    }, [history, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event) => {
            if (chatbotRef.current && !chatbotRef.current.contains(event.target)) {
                toggleChatbot();
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, [isOpen]);

    const handleOptionClick = (option) => {
        const nextStep = FAQ_DATA[option.next];
        if (!nextStep) return;

        // Add user message
        const newHistory = [...history, { type: 'user', text: option.label }];

        // Add bot response after a small delay
        setTimeout(() => {
            setHistory(prev => [...prev, {
                type: 'bot',
                answer: nextStep.answer,
                question: nextStep.question,
                options: nextStep.options,
                link: nextStep.link
            }]);
        }, 400);

        setHistory(newHistory);
    };

    const toggleChatbot = () => {
        if (isOpen) {
            // When closing, reset to initial state
            setHistory([{ type: 'bot', ...FAQ_DATA.initial }]);
        }
        setIsOpen(!isOpen);
    };

    return (
        <div className="faq-chatbot" ref={chatbotRef}>
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <h3>SOGC Assistant</h3>
                        <button onClick={toggleChatbot} className="close-btn">&times;</button>
                    </div>
                    <div className="chatbot-messages">
                        {history.map((msg, idx) => (
                            <div key={idx} className={`message-group ${msg.type}`}>
                                {msg.type === 'bot' && (
                                    <>
                                        {msg.answer && (
                                            <div className="bot-bubble">
                                                {msg.answer}
                                                {msg.link && (
                                                    <a
                                                        href={msg.link.href || '#'}
                                                        className="bot-link"
                                                        onClick={(e) => {
                                                            if (msg.link.action === 'open-volunteer-popup') {
                                                                e.preventDefault();
                                                                window.dispatchEvent(new CustomEvent('open-volunteer-popup'));
                                                            }
                                                            if (msg.link.href?.startsWith('#') || msg.link.action) {
                                                                setIsOpen(false);
                                                                setHistory([{ type: 'bot', ...FAQ_DATA.initial }]);
                                                            }
                                                        }}
                                                    >
                                                        {msg.link.label} →
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        {msg.question && <div className="bot-bubble">{msg.question}</div>}
                                        {msg.options && (
                                            <div className="options-container">
                                                {msg.options.map((opt, i) => (
                                                    <button
                                                        key={i}
                                                        className="option-btn"
                                                        onClick={() => handleOptionClick(opt)}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                                {msg.type === 'user' && (
                                    <div className="user-bubble">{msg.text}</div>
                                )}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                </div>
            )}
            <button
                className={`chatbot-trigger ${isOpen ? 'active' : ''}`}
                onClick={toggleChatbot}
                aria-label="Toggle FAQ Chatbot"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </button>
        </div>
    );
};

export default FAQChatbot;
