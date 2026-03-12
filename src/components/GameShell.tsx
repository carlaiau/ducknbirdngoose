import { lazy, Suspense, useState } from 'react'
import { GAME_CONFIG } from '../config/gameConfig'
import { useGameStore } from '../store/gameStore'
import { useGameInput } from '../hooks/useGameInput'
import { useCoarsePointer } from '../hooks/useCoarsePointer'
import { delayImport } from '../utils/delayImport'
import { DPad } from './DPad'
import { Hud } from './Hud'
import { LoadingScreen } from './LoadingScreen'
import { SelectionPanel } from './SelectionPanel'

const LazyGameScene = lazy(() => delayImport(import('../scene/GameScene'), 720))

export const GameShell = () => {
  useGameInput()

  const isCoarsePointer = useCoarsePointer()
  const phase = useGameStore((state) => state.phase)
  const roundPhase = useGameStore((state) => state.round.phase)
  const roundNumber = useGameStore((state) => state.round.number)
  const cameraZoom = useGameStore((state) => state.cameraZoom)
  const adjustCameraZoom = useGameStore((state) => state.adjustCameraZoom)
  const resetSession = useGameStore((state) => state.resetSession)
  const [controlsDismissed, setControlsDismissed] = useState(false)
  const [waterfallDismissed, setWaterfallDismissed] = useState(false)
  const [controlsPinnedOpen, setControlsPinnedOpen] = useState(false)
  const [waterfallPinnedOpen, setWaterfallPinnedOpen] = useState(false)

  const zoomPercent = Math.round((cameraZoom / GAME_CONFIG.cameraZoom.default) * 100)
  const showControlsCard =
    phase === 'playing' && ((controlsPinnedOpen || !isCoarsePointer) && !controlsDismissed)
  const showWaterfallCard =
    phase === 'playing' && ((waterfallPinnedOpen || !isCoarsePointer) && !waterfallDismissed)

  return (
    <div
      className="app-shell"
      onWheelCapture={(event) => {
        if (phase !== 'playing') {
          return
        }

        event.preventDefault()
        adjustCameraZoom(-Math.sign(event.deltaY) * GAME_CONFIG.cameraZoom.step)
      }}
    >
      <Suspense fallback={<LoadingScreen message="Loading Frankie’s farm..." />}>
        <LazyGameScene />
      </Suspense>

      {phase === 'menu' ? <SelectionPanel /> : null}

      <div className="hud-layer">
        {phase === 'playing' ? <Hud /> : <div />}

        {phase === 'playing' ? (
          <div className="bottom-tools">
            {(showControlsCard || showWaterfallCard) ? (
              <div className="instructions-bar">
                {showControlsCard ? (
                  <div className="instructions-card">
                    <div className="card-header">
                      <div className="eyebrow">Controls</div>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => {
                          setControlsDismissed(true)
                          setControlsPinnedOpen(false)
                        }}
                        aria-label="Hide controls panel"
                      >
                        ×
                      </button>
                    </div>
                    <p>
                      Desktop: move with <strong>WASD</strong> or arrow keys. Mobile: use the on-screen diamond pad.
                    </p>
                    <p>
                      Walk through worms to collect them, then stand next to any hungry baby to auto-feed.
                    </p>
                  </div>
                ) : null}

                {showWaterfallCard ? (
                  <div className="instructions-card">
                    <div className="card-header">
                      <div className="status-pill">Pond edge live</div>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => {
                          setWaterfallDismissed(true)
                          setWaterfallPinnedOpen(false)
                        }}
                        aria-label="Hide waterfall panel"
                      >
                        ×
                      </button>
                    </div>
                    <p>
                      The far bank now reserves a slot for the requested marketplace waterfall.
                    </p>
                    <p>
                      Procedural scenery keeps the game playable until the purchased/downloaded waterfall mesh is dropped in locally.
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div />
            )}

            <div className="tool-tray">
              <div className="zoom-control" role="group" aria-label="Camera zoom controls">
                <button
                  type="button"
                  className="tool-button"
                  onClick={() => adjustCameraZoom(-GAME_CONFIG.cameraZoom.step)}
                  aria-label="Zoom out"
                >
                  -
                </button>
                <div className="zoom-readout">
                  <span className="metric-label">Zoom</span>
                  <strong>{zoomPercent}%</strong>
                </div>
                <button
                  type="button"
                  className="tool-button"
                  onClick={() => adjustCameraZoom(GAME_CONFIG.cameraZoom.step)}
                  aria-label="Zoom in"
                >
                  +
                </button>
              </div>

              <div className="chip-row">
                {!showControlsCard ? (
                  <button
                    type="button"
                    className="chip-button"
                    onClick={() => {
                      setControlsDismissed(false)
                      setControlsPinnedOpen(true)
                    }}
                  >
                    Show controls
                  </button>
                ) : null}
                {!showWaterfallCard ? (
                  <button
                    type="button"
                    className="chip-button"
                    onClick={() => {
                      setWaterfallDismissed(false)
                      setWaterfallPinnedOpen(true)
                    }}
                  >
                    Show pond edge
                  </button>
                ) : null}
                <button type="button" className="chip-button" onClick={resetSession}>
                  Back to picker
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {phase === 'playing' && roundPhase === 'round-clear' ? (
        <div className="round-banner-wrap">
          <div className="round-banner">
            <div className="eyebrow">Round cleared</div>
            <strong>Round {roundNumber + 1} is arriving</strong>
          </div>
        </div>
      ) : null}

      {phase === 'playing' && isCoarsePointer ? <DPad /> : null}
    </div>
  )
}
