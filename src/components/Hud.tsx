import { useState } from 'react'
import { GAME_CONFIG } from '../config/gameConfig'
import { useCoarsePointer } from '../hooks/useCoarsePointer'
import { useGameStore } from '../store/gameStore'

const zoneCopy = {
  1: "Frankie's House Yard",
  2: 'Reed Bank Open',
  3: 'Dock and Rock Bank Open',
} as const

type MetricId = 'round' | 'bag' | 'fed' | 'zones'

export const Hud = () => {
  const isCoarsePointer = useCoarsePointer()
  const roundNumber = useGameStore((state) => state.round.number)
  const clutchSize = useGameStore((state) => state.round.clutchSize)
  const unlockedZoneCount = useGameStore((state) => state.round.unlockedZones.length)
  const characterMode = useGameStore((state) => state.characterMode)
  const inventory = useGameStore((state) => state.inventory.worms)
  const caughtBirds = useGameStore((state) => state.inventory.caughtBirds)
  const eggs = useGameStore((state) => state.eggs)
  const chicks = useGameStore((state) => state.chicks)
  const totalWormsDelivered = useGameStore((state) => state.metrics.totalWormsDelivered)
  const roamingCount = chicks.filter((chick) => chick.mode === 'patrol').length
  const hungryRoamingCount = chicks.filter(
    (chick) => chick.mode === 'patrol' && chick.hungerState === 'hungry',
  ).length
  const pendingFeedCount = eggs.length + hungryRoamingCount
  const zoneStatus = zoneCopy[Math.min(unlockedZoneCount, 3) as 1 | 2 | 3]
  const [activeMetric, setActiveMetric] = useState<MetricId | null>(null)
  const isPerson = characterMode === 'person'

  const mobileMetrics = isPerson
    ? ([
        {
          id: 'round',
          value: `${roundNumber}`,
          title: 'Round',
          summary: `Clutch: ${clutchSize} birds to catch`,
          detail: 'Birds hatch and feed themselves. Walk up to a roaming bird to cage it.',
        },
        {
          id: 'bag',
          value: `${caughtBirds}/${clutchSize}`,
          title: 'Caught',
          summary: `${caughtBirds} of ${clutchSize} birds caught`,
          detail: 'Catch every bird in the clutch to clear the round.',
        },
        {
          id: 'fed',
          value: `${eggs.length + roamingCount}`,
          title: 'Loose birds',
          summary: `${eggs.length} hatching, ${roamingCount} roaming`,
          detail: 'Roaming birds are fully fed and can be caught. Hatching birds will join them soon.',
        },
        {
          id: 'zones',
          value: `${unlockedZoneCount}/3`,
          title: 'Zones open',
          summary: zoneStatus,
          detail: 'More zones give birds more space to roam. Pinch anywhere to zoom.',
        },
      ] as const)
    : ([
        {
          id: 'round',
          value: `${roundNumber}`,
          title: 'Round',
          summary: `Fresh clutch: ${clutchSize} eggs`,
          detail: 'Every round can also pull roaming chicks back into the feeding queue when they get hungry again.',
        },
        {
          id: 'bag',
          value: `${inventory}/${GAME_CONFIG.carryCapacity}`,
          title: 'Worm bag',
          summary: `Carrying ${inventory} of ${GAME_CONFIG.carryCapacity} worms`,
          detail: 'Walk over grass worms to fill the bag. Feeding happens automatically beside a baby.',
        },
        {
          id: 'fed',
          value: `${pendingFeedCount}`,
          title: 'Need feeding',
          summary: `${eggs.length} nest chicks and ${hungryRoamingCount} roamers still need worms`,
          detail: 'Round clear only happens when every current egg/baby and every re-hungry roaming chick is full.',
        },
        {
          id: 'zones',
          value: `${unlockedZoneCount}/3`,
          title: 'Zones open',
          summary: zoneStatus,
          detail: `Roaming chicks: ${roamingCount}. Worms served: ${totalWormsDelivered}. Pinch anywhere to zoom.`,
        },
      ] as const)

  const activeMobileMetric =
    activeMetric == null ? null : mobileMetrics.find((metric) => metric.id === activeMetric) ?? null

  if (isCoarsePointer) {
    return (
      <div className="hud-mobile" data-ui-touch="true">
        <div className="hud-mobile-row">
          {mobileMetrics.map((metric) => {
            const isActive = activeMetric === metric.id

            return (
              <button
                key={metric.id}
                type="button"
                className={`hud-mobile-button${isActive ? ' is-active' : ''}`}
                aria-label={`${metric.title}: ${metric.summary}`}
                aria-pressed={isActive}
                onClick={() => {
                  setActiveMetric((currentMetric) => (currentMetric === metric.id ? null : metric.id))
                }}
              >
                <span className="hud-mobile-value">{metric.value}</span>
              </button>
            )
          })}
        </div>

        {activeMobileMetric ? (
          <div className="hud-mobile-detail" role="status" aria-live="polite">
            <span className="metric-label">{activeMobileMetric.title}</span>
            <strong>{activeMobileMetric.summary}</strong>
            <p>{activeMobileMetric.detail}</p>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="hud-top">
      <div className="hud-card">
        <span className="metric-label">Round</span>
        <div className="metric-value">{roundNumber}</div>
      </div>
      {isPerson ? (
        <div className="hud-card">
          <span className="metric-label">Caught</span>
          <div className="metric-value">{caughtBirds} / {clutchSize}</div>
        </div>
      ) : (
        <div className="hud-card">
          <span className="metric-label">Worm Bag</span>
          <div className="metric-value">{inventory} / {GAME_CONFIG.carryCapacity}</div>
        </div>
      )}
      <div className="hud-card">
        {isPerson ? (
          <>
            <span className="metric-label">Loose Birds</span>
            <div className="metric-value">{eggs.length + roamingCount}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
              Hatching: {eggs.length} • Roaming: {roamingCount}
            </div>
          </>
        ) : (
          <>
            <span className="metric-label">Need Feeding</span>
            <div className="metric-value">{pendingFeedCount}</div>
            <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
              Nest: {eggs.length} • Roaming: {hungryRoamingCount}
            </div>
          </>
        )}
      </div>
      <div className="hud-card">
        <span className="metric-label">Zones</span>
        <div className="metric-value">
          {unlockedZoneCount} / 3
          <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
            {zoneStatus}
          </div>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--accent-soft)', marginTop: '0.3rem' }}>
          Total worms served: {totalWormsDelivered}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '0.15rem' }}>
          Roaming chicks: {roamingCount}
        </div>
      </div>
    </div>
  )
}
