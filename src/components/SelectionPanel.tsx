import { startTransition } from 'react'
import { SPECIES } from '../data/species'
import { useGameStore } from '../store/gameStore'

export const SelectionPanel = () => {
  const selectedSpeciesId = useGameStore((state) => state.selectedSpeciesId)
  const characterMode = useGameStore((state) => state.characterMode)
  const selectSpecies = useGameStore((state) => state.selectSpecies)
  const selectCharacterMode = useGameStore((state) => state.selectCharacterMode)
  const startSession = useGameStore((state) => state.startSession)

  const isPerson = characterMode === 'person'

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
                    className={`species-card ${!isPerson && selectedSpeciesId === entry.id ? 'is-selected' : ''}`}
                    onClick={() => {
                      selectSpecies(entry.id)
                      selectCharacterMode('bird')
                    }}
                  >
                    <span className="eyebrow">{entry.id}</span>
                    <h3 className="species-title">{entry.name}</h3>
                    <p className="species-body">{entry.blurb}</p>
                  </button>
                ))}
                <button
                  type="button"
                  className={`species-card ${isPerson ? 'is-selected' : ''}`}
                  onClick={() => selectCharacterMode('person')}
                >
                  <span className="eyebrow">person</span>
                  <h3 className="species-title">The Catcher</h3>
                  <p className="species-body">Wait for a bird to ask to be picked up, carry it home, and keep it as a pet.</p>
                </button>
              </div>
            </div>
          </div>

          <div className="panel-column">
            <div className="instructions-card">
              <div className="status-pill">Mobile-first controls enabled</div>
              {isPerson ? (
                <>
                  <h2 className="section-title" style={{ marginTop: '0.85rem' }}>How homing works</h2>
                  <ul className="help-list">
                    <li>Eggs hatch and birds feed themselves — no worms needed from you.</li>
                    <li>Watch for a speech bubble above a bird's head — that means it wants to be picked up.</li>
                    <li>Walk up to a bubbling bird and it will follow you.</li>
                    <li>Carry it to any house on the map to give it a home as your pet.</li>
                    <li>Home every bird in the clutch to clear the round. Pets stay forever.</li>
                  </ul>
                </>
              ) : (
                <>
                  <h2 className="section-title" style={{ marginTop: '0.85rem' }}>How the farm works</h2>
                  <ul className="help-list">
                    <li>Every round brings in a clutch of 3 to 6 eggs.</li>
                    <li>Each chick keeps its own number label, and hungry roaming chicks show that label again later.</li>
                    <li>Some eggs hatch in 5 to 10 seconds, while others can take a couple of minutes.</li>
                    <li>Every baby or hungry roaming chick needs exactly 4 worms. You can feed them in any order.</li>
                    <li>Zone two opens after round 2, zone three after round 4, and the waterfall sits across the pond.</li>
                  </ul>
                </>
              )}
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
                  {isPerson ? 'Start catching' : 'Start the farm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
