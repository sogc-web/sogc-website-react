import React from 'react'
import './AnnouncementBar.css'

function AnnouncementBar({ t }) {
    const announcementItems = [t.events.featured.title, ...(t.events.items ?? []).map((item) => item.title)]

    return (
        <div className="announcement-bar" aria-label="Event announcements">
            <div className="announcement-track">
                {[...announcementItems, ...announcementItems, ...announcementItems, ...announcementItems].map((item, index) => (
                    <span key={`${item}-${index}`} className="announcement-item">
                        {item}
                    </span>
                ))}
            </div>
        </div>
    )
}

export default AnnouncementBar
