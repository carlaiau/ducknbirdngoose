import { useGameStore } from '../store/gameStore'

const zoneCopy = {
  1: 'Frankie House Yard',
  2: 'Reed Bank Open',
  3: 'Dock and Rock Bank Open',
} as const

export const Hud = () => {
  const roundNumber = useGameStore((state) => state.round.number)
  const clutchSize = useGameStore((state) => state.round.clutchSize)
  const unlockedZoneCount = useGameStore((state) => state.round.unlockedZones.length)
  const inventory = useGameStore((state) => state.inventory.worms)
  const eggs = useGameStore((state) => state.eggs)
  const followerCount = useGameStore((state) => state.followers.length)
  const totalWormsDelivered = useGameStore((state) => state.metrics.totalWormsDelivered)
  const fedCount = clutchSize - eggs.length

  return (
    <div className="hud-top">
      <div className="hud-card">
        <span className="metric-label">Round</span>
        <div className="metric-value">{roundNumber}</div>
      </div>
      <div className="hud-card">
        <span className="metric-label">Worm Bag</span>
        <div className="metric-value">{inventory} / 4</div>
      </div>
      <div className="hud-card">
        <span className="metric-label">Babies Fed</span>
        <div className="metric-value">{fedCount} / {clutchSize}</div>
      </div>
      <div className="hud-card">
        <span className="metric-label">Zones</span>
        <div className="metric-value">
          {unlockedZoneCount} / 3
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
            {zoneCopy[unlockedZoneCount as 1 | 2 | 3]}
          </div>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--accent-soft)', marginTop: '0.3rem' }}>
          Total worms served: {totalWormsDelivered}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.15rem' }}>
          Followers: {followerCount}
        </div>
      </div>
    </div>
  )
}
