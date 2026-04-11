import { useMemo, useState } from 'react'
import SectionHeader from './SectionHeader'
import './AboutUsSection.css'

function getAboutDetailHash(tab) {
  return `#about/${tab.slug ?? tab.id}`
}

function splitParagraphs(paragraphs = []) {
  if (paragraphs.length <= 1) {
    return [paragraphs, []]
  }

  const midpoint = Math.ceil(paragraphs.length / 2)
  return [paragraphs.slice(0, midpoint), paragraphs.slice(midpoint)]
}

function AboutUsSection({ t }) {
  const tabs = t.aboutUs.tabs
  const [activeTabId, setActiveTabId] = useState(tabs[0]?.id ?? 'introduction')

  const activeIndex = useMemo(
    () => tabs.findIndex((tab) => tab.id === activeTabId),
    [activeTabId, tabs],
  )

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId) ?? tabs[0],
    [activeTabId, tabs],
  )

  const progressPercent = tabs.length > 1 ? (activeIndex / (tabs.length - 1)) * 100 : 0

  const handleExplore = (tab) => {
    if (typeof window !== 'undefined') {
      window.location.hash = getAboutDetailHash(tab)
    }
  }

  if (!activeTab) {
    return null
  }

  return (
    <section id="about-us" className="section about-us-section">
      <div className="about-us-section__header">
        <SectionHeader eyebrow={t.aboutUs.eyebrow} title={t.aboutUs.title} />
      </div>

      <div className="about-us-stepper reveal" role="tablist" aria-label={t.aboutUs.title}>
        <div className="about-us-stepper__track" aria-hidden="true">
          <span className="about-us-stepper__progress" style={{ width: `${progressPercent}%` }} />
        </div>

        {tabs.map((tab, index) => {
          const isActive = tab.id === activeTab.id
          const isCompleted = index < activeIndex

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={[
                'about-us-step',
                isActive ? 'about-us-step--active' : '',
                isCompleted ? 'about-us-step--completed' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setActiveTabId(tab.id)}
            >
              <span className="about-us-step__button-text">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="about-us-panel reveal" key={activeTab.id}>
        <div className="about-us-panel__copy">
          <p className="about-us-panel__eyebrow about-us-panel__eyebrow--white">{activeTab.kicker}</p>
          <h3>{activeTab.title}</h3>
          <p className="about-us-panel__summary">{activeTab.previewSummary ?? activeTab.summary}</p>

          {activeTab.previewHighlights?.length ? (
            <ul className="about-us-panel__list about-us-panel__list--compact">
              {activeTab.previewHighlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}

          <button
            type="button"
            className="primary-btn about-us-panel__cta"
            onClick={() => handleExplore(activeTab)}
          >
            {t.aboutUs.exploreCta}
          </button>
        </div>

        <aside className="about-us-panel__aside">
          {activeTab.visual ? (
            <article className="about-us-visual-card">
              <span className="about-us-visual-card__eyebrow about-us-visual-card__eyebrow--white">
                {activeTab.visual.eyebrow}
              </span>
              <h4 className="about-us-visual-card__title about-us-visual-card__title--white">
                {activeTab.visual.title}
              </h4>
              <p className="about-us-visual-card__caption about-us-visual-card__caption--white">
                {activeTab.visual.caption}
              </p>
              {activeTab.visual.tags?.length ? (
                <div className="about-us-visual-card__tags">
                  {activeTab.visual.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </article>
          ) : null}

          {activeTab.stats?.length ? (
            <div className="about-us-stat-grid">
              {activeTab.stats.slice(0, 4).map((stat) => (
                <article key={`${stat.value}-${stat.label}`} className="about-us-stat-card">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </article>
              ))}
            </div>
          ) : null}

          {activeTab.badges?.length ? (
            <div className="about-us-badges">
              {activeTab.badges.map((badge) => (
                <span key={badge} className="about-us-badge">
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  )
}

function AboutDetailPage({ t, tab }) {
  if (!tab) {
    return null
  }

  const [detailPartOne, detailPartTwo] = splitParagraphs(tab.paragraphs)

  return (
    <section className="about-detail-page">
      <div className="about-detail-page__layout">
        <div className="about-detail-page__column about-detail-page__column--left">
          <article className="about-detail-card about-detail-card--intro">
            <a href="#about-us" className="about-detail-page__back">{t.aboutUs.backToAbout}</a>
            <div className="about-detail-page__eyebrow-row">
              <span className="eyebrow about-detail-page__kicker about-detail-page__kicker--white">
                {tab.kicker}
              </span>
              {tab.stats?.[0] ? <span className="about-detail-page__spotlight">{tab.stats[0].value}</span> : null}
            </div>
            <h1>{tab.title}</h1>
            <p className="about-detail-page__intro">{tab.summary}</p>
          </article>

          {tab.visual ? (
            <article className="about-detail-card about-detail-card--visual">
              <span className="about-us-visual-card__eyebrow about-us-visual-card__eyebrow--white">
                {tab.visual.eyebrow}
              </span>
              <h2 className="about-us-visual-card__title about-us-visual-card__title--white">
                {tab.visual.title}
              </h2>
              <p className="about-us-visual-card__caption about-us-visual-card__caption--white">
                {tab.visual.caption}
              </p>
              {tab.visual.tags?.length ? (
                <div className="about-us-visual-card__tags">
                  {tab.visual.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              ) : null}
            </article>
          ) : null}
        </div>

        <div className="about-detail-page__column about-detail-page__column--middle">
          {detailPartOne.length ? (
            <article className="about-detail-card about-detail-card--detail">
              <h2>{t.aboutUs.detailSections.storyBeginning}</h2>
              <div className="about-detail-page__paragraphs">
                {detailPartOne.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ) : null}

          {detailPartTwo.length ? (
            <article className="about-detail-card about-detail-card--detail">
              <h2>{t.aboutUs.detailSections.storyShaped}</h2>
              <div className="about-detail-page__paragraphs">
                {detailPartTwo.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </article>
          ) : null}

          {tab.items?.length ? (
            <article className="about-detail-card about-detail-card--list">
              <h2>{t.aboutUs.detailSections.highlights}</h2>
              <ul className="about-us-panel__list">
                {tab.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>

        <div className="about-detail-page__column about-detail-page__column--right">
          {tab.badges?.length ? (
            <article className="about-detail-card about-detail-card--badges">
              <h2>{t.aboutUs.detailSections.badges}</h2>
              <div className="about-detail-page__chips">
                {tab.badges.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
            </article>
          ) : null}

          {tab.stats?.length ? (
            <article className="about-detail-card about-detail-card--stats">
              <h2>Stats</h2>
              <div className="about-detail-page__stat-grid">
                {tab.stats.map((stat) => (
                  <div key={`${stat.value}-${stat.label}`} className="about-detail-page__stat-tile">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </div>

      {tab.footnote ? <p className="about-detail-page__footnote">{tab.footnote}</p> : null}
    </section>
  )
}

export { AboutDetailPage, getAboutDetailHash }
export default AboutUsSection




