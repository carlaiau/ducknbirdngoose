import { useEffect, useEffectEvent } from 'react'
import type { InputDirection } from '../types/game'
import { useGameStore } from '../store/gameStore'

const KEY_TO_DIRECTION: Record<string, InputDirection> = {
  arrowup: 'up',
  w: 'up',
  arrowright: 'right',
  d: 'right',
  arrowdown: 'down',
  s: 'down',
  arrowleft: 'left',
  a: 'left',
}

export const useGameInput = () => {
  const setDirectionalInput = useGameStore((state) => state.setDirectionalInput)
  const clearInput = useGameStore((state) => state.clearInput)

  const handleKey = useEffectEvent((event: KeyboardEvent, pressed: boolean) => {
    const direction = KEY_TO_DIRECTION[event.key.toLowerCase()]
    if (!direction) {
      return
    }

    event.preventDefault()
    setDirectionalInput(direction, pressed)
  })

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => handleKey(event, true)
    const onKeyUp = (event: KeyboardEvent) => handleKey(event, false)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', clearInput)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', clearInput)
    }
  }, [clearInput])
}
