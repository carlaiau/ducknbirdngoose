import type { InputDirection } from '../types/game'
import { useGameStore } from '../store/gameStore'

const DIRECTION_LABELS: Record<InputDirection, string> = {
  up: '▲',
  right: '▶',
  down: '▼',
  left: '◀',
}

export const DPad = () => {
  const input = useGameStore((state) => state.input)
  const setDirectionalInput = useGameStore((state) => state.setDirectionalInput)

  const bindDirection = (direction: InputDirection, pressed: boolean) => {
    setDirectionalInput(direction, pressed)
  }

  return (
    <div className="dpad" aria-label="Movement controls">
      <div className="dpad-grid">
        {(['up', 'right', 'down', 'left'] as const).map((direction) => (
          <button
            key={direction}
            className={`dpad-button ${input[direction] ? 'is-active' : ''}`}
            data-direction={direction}
            type="button"
            onPointerDown={(event) => {
              event.preventDefault()
              bindDirection(direction, true)
            }}
            onPointerUp={() => bindDirection(direction, false)}
            onPointerLeave={() => bindDirection(direction, false)}
            onPointerCancel={() => bindDirection(direction, false)}
          >
            <span>{DIRECTION_LABELS[direction]}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
