import { startTransition } from 'react'
import { SPECIES } from '../data/species'
import { useGameStore } from '../store/gameStore'

export const SelectionPanel = () => {
  const selectedSpeciesId = useGameStore((state) => state.selectedSpeciesId)
  const selectSpecies = useGameStore((state) => state.selectSpecies)
  const startSession = useGameStore((state) => state.startSession)

  return (
    <div className="selection-wrap">
      <section className="selection-panel">
        <h1 className="hero-title">DucknBirdnGoose</h1>

        <div className="selection-grid">
          <div className="panel-column">
            <div className="selection-subpanel">
              
              <div className="species-grid">
                {SPECIES.map((entry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={`species-card ${selectedSpeciesId === entry.id ? 'is-selected' : ''}`}
                    onClick={() => selectSpecies(entry.id)}
                  >
                    <span className="eyebrow">{entry.id}</span>
                    <h3 className="species-title">{entry.name}</h3>
                    <p className="species-body">{entry.blurb}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="panel-column">
            <div className="instructions-card">
              <div className="status-pill">Mobile-first controls enabled</div>
              <h2 className="section-title" style={{ marginTop: '0.85rem' }}>How the farm works</h2>
              <ul className="help-list">
                <li>Every round brings in a smaller clutch of 3 to 6 eggs.</li>
                <li>Each chick keeps its own number label, and hungry roaming chicks show that label again later.</li>
                <li>Some eggs hatch in 5 to 10 seconds, while others can take a couple of minutes.</li>
                <li>Every baby or hungry roaming chick needs exactly 4 worms. You can feed them in any order.</li>
                <li>Zone two opens after round 2, zone three after round 4, and the new waterfall sits across the pond.</li>
              </ul>
              <div className="cta-row">
                <button
                  type="button"
                  className="primary-button"
                  onClick={() =>
                    startTransition(() => {
                      startSession()
                    })
                  }
                >
                  Start the farm
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
