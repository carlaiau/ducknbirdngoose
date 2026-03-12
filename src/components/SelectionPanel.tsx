import { startTransition } from 'react'
import { ASSET_MANIFEST } from '../data/assetManifest'
import { SPECIES_BY_ID, SPECIES } from '../data/species'
import { useGameStore } from '../store/gameStore'

export const SelectionPanel = () => {
  const selectedSpeciesId = useGameStore((state) => state.selectedSpeciesId)
  const selectedPaletteId = useGameStore((state) => state.selectedPaletteId)
  const selectSpecies = useGameStore((state) => state.selectSpecies)
  const selectPalette = useGameStore((state) => state.selectPalette)
  const startSession = useGameStore((state) => state.startSession)

  const species = SPECIES_BY_ID[selectedSpeciesId]

  return (
    <div className="selection-wrap">
      <section className="selection-panel">
        <div className="eyebrow">ThreeJS isometric caretaker game</div>
        <h1 className="hero-title">Frankie&apos;s Ducks and Birds House</h1>
        <p className="hero-copy">
          Pick your bird, duck, or goose, choose a playful color palette, then sprint around the pond edge collecting worms for each new wave of hatchlings.
        </p>

        <div className="selection-grid">
          <div className="panel-column">
            <div className="selection-subpanel">
              <h2 className="section-title">Choose Frankie&apos;s species</h2>
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

            <div className="selection-subpanel">
              <h2 className="section-title">Choose colors</h2>
              <div className="palette-grid">
                {species.palettes.map((palette) => (
                  <button
                    key={palette.id}
                    type="button"
                    className={`palette-button ${selectedPaletteId === palette.id ? 'is-selected' : ''}`}
                    onClick={() => selectPalette(palette.id)}
                  >
                    <div>
                      <strong>{palette.name}</strong>
                      <div style={{ color: 'var(--ink-muted)', fontSize: '0.84rem' }}>
                        Body, wings, accent, and beak recolor together
                      </div>
                    </div>
                    <div className="palette-swatches">
                      {Object.values(palette.colors)
                        .slice(0, 4)
                        .map((color) => (
                          <span
                            key={color}
                            className="palette-swatch"
                            style={{ background: color }}
                          />
                        ))}
                    </div>
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
                <li>Every round spawns either 5 or 10 eggs.</li>
                <li>The number above each egg is the hatch order label, not the worm total.</li>
                <li>After a short staggered hatch, every baby needs exactly 4 worms.</li>
                <li>You can feed babies in any order. Walk over worms to collect and stand near babies to deliver.</li>
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

            <div className="asset-card">
              <h2 className="section-title">Marketplace asset slots</h2>
              <p>
                The manifest is wired to the requested Sketchfab listings. Runtime uses procedural stand-ins until those marketplace files are manually downloaded and converted locally.
              </p>
              <ul className="manifest-list" style={{ marginTop: '0.8rem' }}>
                {ASSET_MANIFEST.map((asset) => (
                  <li key={asset.id}>
                    <a className="manifest-link" href={asset.sourceUrl} target="_blank" rel="noreferrer">
                      {asset.id}
                    </a>
                    {' '}
                    <span style={{ color: 'var(--ink-muted)' }}>{asset.notes}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
