import { useSyncExternalStore } from 'react'

export const useCoarsePointer = () => {
  const subscribe = (onStoreChange: () => void) => {
    if (typeof window === 'undefined') {
      return () => undefined
    }

    const mediaQuery = window.matchMedia('(pointer: coarse)')
    mediaQuery.addEventListener('change', onStoreChange)

    return () => mediaQuery.removeEventListener('change', onStoreChange)
  }

  const getSnapshot = () =>
    typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false

  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
