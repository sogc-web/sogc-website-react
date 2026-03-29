import { useEffect, useRef, useState } from 'react'
import SectionHeader from './SectionHeader'
import interviewVideo from '../assets/SOGC-Media/Utkarsh_ji_interview.mp4'
import storyThumbnail from '../assets/SOGC-Media/story_section_thumbnail.jpg'
import './GalleryStory.css'

const TEXT_EXIT_MS = 680

function GalleryStory({ t }) {
  const sectionRef = useRef(null)
  const mainVideoRef = useRef(null)
  const miniVideoRef = useRef(null)
  const transferRef = useRef({ time: 0, paused: false })
  const [isExiting, setIsExiting] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [useMiniPlayer, setUseMiniPlayer] = useState(false)

  const syncToTarget = (target) => {
    if (!target) {
      return
    }

    const { time, paused } = transferRef.current
    try {
      target.currentTime = time
    } catch {}

    if (paused) {
      target.pause()
      return
    }

    const playPromise = target.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {})
    }
  }

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextUseMiniPlayer = !entry.isIntersecting
        const currentPlayer = useMiniPlayer ? miniVideoRef.current : mainVideoRef.current

        if (nextUseMiniPlayer === useMiniPlayer || !currentPlayer) {
          return
        }

        transferRef.current = {
          time: currentPlayer.currentTime || 0,
          paused: currentPlayer.paused || isPaused,
        }
        currentPlayer.pause()
        setUseMiniPlayer(nextUseMiniPlayer)
      },
      {
        threshold: 0.35,
      },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [isPaused, isPlaying, useMiniPlayer])

  useEffect(() => {
    if (!isPlaying) {
      return
    }

    const activePlayer = useMiniPlayer ? miniVideoRef.current : mainVideoRef.current
    syncToTarget(activePlayer)
  }, [isPlaying, useMiniPlayer])

  const handlePlay = () => {
    if (isExiting || isPlaying) {
      return
    }

    setIsExiting(true)

    window.setTimeout(() => {
      transferRef.current = { time: 0, paused: false }
      setIsPaused(false)
      setIsPlaying(true)
    }, TEXT_EXIT_MS)
  }


  const handleStop = () => {
    ;[mainVideoRef.current, miniVideoRef.current].forEach((videoElement) => {
      if (!videoElement) {
        return
      }

      videoElement.pause()
      try {
        videoElement.currentTime = 0
      } catch {}
    })

    transferRef.current = { time: 0, paused: false }
    setIsPaused(false)
    setUseMiniPlayer(false)
    setIsPlaying(false)
    setIsExiting(false)
  }

  const handlePlayerState = (paused) => {
    setIsPaused(paused)
  }

  return (
    <section id="story" className="section story-stage-section" ref={sectionRef}>
      <div className="story-stage-section__header">
        <SectionHeader eyebrow={t.story.sectionEyebrow} title={t.story.sectionTitle} description={t.story.sectionDescription} />
        <p className="section-note">{t.story.sectionNote}</p>
      </div>

      <div className={`story-stage${isExiting ? ' story-stage--exiting' : ''}${isPlaying ? ' story-stage--playing' : ''}`}>
        <img className="story-stage__poster" src={storyThumbnail} alt="" aria-hidden="true" loading="lazy" />

        {!useMiniPlayer && (isExiting || isPlaying) ? (
          <video
            ref={mainVideoRef}
            className="story-stage__video"
            controls={isPlaying}
            playsInline
            preload="metadata"
            poster={storyThumbnail}
            onPlay={() => handlePlayerState(false)}
            onPause={() => handlePlayerState(true)}
          >
            <source src={interviewVideo} type="video/mp4" />
          </video>
        ) : null}

        <div className="story-stage__backdrop" aria-hidden="true" />
        <div className="story-stage__grain" aria-hidden="true" />

        <div className="story-stage__content">
          <div className="story-stage__overlay-copy">
            <div className="story-stage__copy-block story-stage__copy-block--left">
              <span className="story-stage__eyebrow story-stage__line story-stage__line--left">{t.story.eyebrow}</span>
              {t.story.titleLines.map((line) => (
                <span key={line} className="story-stage__title-line story-stage__line story-stage__line--left">
                  {line}
                </span>
              ))}
            </div>

            <div className="story-stage__copy-block story-stage__copy-block--right">
              {t.story.bodyLines.map((line, index) => (
                <span
                  key={line}
                  className={`story-stage__body-line story-stage__line ${index % 2 === 0 ? 'story-stage__line--right' : 'story-stage__line--left'}`}
                >
                  {line}
                </span>
              ))}
              <span className="story-stage__quote story-stage__line story-stage__line--right">{t.story.quote}</span>
            </div>
          </div>

          <button
            type="button"
            className="story-stage__play-button"
            onClick={handlePlay}
            aria-label={t.story.playLabel}
          >
            <span className="story-stage__play-icon" aria-hidden="true">
              <span className="story-stage__play-triangle" />
            </span>
            <span className="story-stage__play-text">{t.story.playLabel}</span>
          </button>


        </div>
      </div>

      {isPlaying && useMiniPlayer ? (
        <aside className="story-stage__pip" aria-label={t.story.pipLabel}>
          <button
            type="button"
            className="story-stage__pip-close"
            onClick={handleStop}
            aria-label={t.story.closeLabel}
          >
            x
          </button>
          <div className="story-stage__pip-video-shell">
            <video
              ref={miniVideoRef}
              className="story-stage__pip-video"
              controls
              playsInline
              preload="metadata"
              poster={storyThumbnail}
              onPlay={() => handlePlayerState(false)}
              onPause={() => handlePlayerState(true)}
            >
              <source src={interviewVideo} type="video/mp4" />
            </video>
          </div>

        </aside>
      ) : null}
    </section>
  )
}

export default GalleryStory
