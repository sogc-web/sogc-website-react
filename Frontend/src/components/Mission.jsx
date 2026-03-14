import SectionHeader from './SectionHeader'

function Mission({ t }) {
  return (
    <section id="mission" className="section mission">
      <SectionHeader
        eyebrow={t.mission.eyebrow}
        title={t.mission.title}
        description={t.mission.description}
      />
      <div className="pillars">
        {t.mission.pillars.map((pillar, index) => (
          <article
            key={pillar.title}
            className="reveal"
            style={{ animationDelay: `${0.1 + index * 0.1}s` }}
          >
            <h3>{pillar.title}</h3>
            <p>{pillar.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default Mission
