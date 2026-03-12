import { Html } from '@react-three/drei'
import { useGameStore } from '../store/gameStore'
import { FollowerFlock } from './FollowerFlock'
import { NestCluster } from './NestCluster'
import { PlayerAvatar } from './PlayerAvatar'
import { WormField } from './WormField'

const unlockRounds = {
  reeds: 3,
  dock: 5,
} as const

const WaterfallStandIn = () => (
  <group position={[5.8, 0.15, -8.9]}>
    {[[-0.9, 1.5, 0], [0, 1.2, 0.18], [0.9, 1.4, -0.1], [0.4, 0.8, 0.8], [-0.6, 0.9, 0.6]].map(
      (position, index) => (
        <mesh key={`rock-${index + 1}`} castShadow receiveShadow position={position as [number, number, number]}>
          <icosahedronGeometry args={[index === 1 ? 0.95 : 1.1, 0]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#657b87' : '#7a9098'} flatShading />
        </mesh>
      ),
    )}
    <mesh position={[0, 0.9, 0.35]} rotation={[-0.12, 0, 0]}>
      <boxGeometry args={[1.35, 3.1, 0.12]} />
      <meshStandardMaterial color="#7fd7ef" transparent opacity={0.76} flatShading />
    </mesh>
    <mesh position={[0.22, 0.1, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.55, 1.95, 18]} />
      <meshStandardMaterial color="#9cecff" transparent opacity={0.6} flatShading />
    </mesh>
  </group>
)

const FrankieHouse = () => (
  <group position={[-13.6, 0.2, -0.4]}>
    <mesh castShadow receiveShadow position={[0, 1.3, 0]}>
      <boxGeometry args={[2.9, 2.2, 2.6]} />
      <meshStandardMaterial color="#e7b880" flatShading />
    </mesh>
    <mesh castShadow position={[0, 2.7, 0]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[2.3, 1.8, 4]} />
      <meshStandardMaterial color="#914f3f" flatShading />
    </mesh>
    <mesh position={[1.15, 1.2, 1.31]} scale={[0.5, 1.1, 0.08]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#4a3321" flatShading />
    </mesh>
    <mesh position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[3.8, 18]} />
      <meshStandardMaterial color="#839b5e" flatShading />
    </mesh>
  </group>
)

const DockArea = ({ isUnlocked }: { isUnlocked: boolean }) => (
  <group position={[10.2, 0.05, 2.4]}>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <planeGeometry args={[7.4, 6.4]} />
      <meshStandardMaterial color={isUnlocked ? '#90a779' : '#5a6555'} flatShading />
    </mesh>
    {[[-1.6, 0.3, -1.8], [-0.8, 0.38, -0.2], [0.8, 0.44, 0.9], [2, 0.55, 1.8]].map((position, index) => (
      <mesh key={`rock-${index + 1}`} castShadow position={position as [number, number, number]}>
        <dodecahedronGeometry args={[0.55 + index * 0.1, 0]} />
        <meshStandardMaterial color="#73818a" flatShading />
      </mesh>
    ))}
    {[[0.8, 0.16, -1.5], [2.2, 0.16, -1], [3.6, 0.16, -0.5]].map((position, index) => (
      <mesh key={`plank-${index + 1}`} castShadow position={position as [number, number, number]}>
        <boxGeometry args={[1.2, 0.16, 0.55]} />
        <meshStandardMaterial color="#8a6447" flatShading />
      </mesh>
    ))}
  </group>
)

const ReedBank = ({ isUnlocked }: { isUnlocked: boolean }) => (
  <group position={[0.8, 0.04, 6.1]}>
    {[[-2.2, 0, -0.8], [-0.8, 0, -0.4], [0.8, 0, -0.2], [2.4, 0, 0.1]].map((position, index) => (
      <group key={`reed-clump-${index + 1}`} position={position as [number, number, number]}>
        {Array.from({ length: 4 }, (_, stemIndex) => (
          <mesh
            key={`stem-${stemIndex + 1}`}
            castShadow
            position={[stemIndex * 0.12 - 0.18, 0.65 + stemIndex * 0.08, stemIndex * 0.03]}
            rotation={[0, 0, stemIndex * 0.06 - 0.09]}
          >
            <boxGeometry args={[0.08, 1.35 + stemIndex * 0.14, 0.08]} />
            <meshStandardMaterial color={isUnlocked ? '#7da56b' : '#4f6751'} flatShading />
          </mesh>
        ))}
      </group>
    ))}
  </group>
)

const ZoneTag = ({
  position,
  label,
  isUnlocked,
}: {
  position: [number, number, number]
  label: string
  isUnlocked: boolean
}) => (
  <group position={position}>
    <mesh castShadow position={[0, 0.8, 0]}>
      <boxGeometry args={[0.22, 1.7, 0.22]} />
      <meshStandardMaterial color="#66432a" flatShading />
    </mesh>
    <mesh castShadow position={[0, 1.55, 0]} scale={[1.8, 0.9, 0.1]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={isUnlocked ? '#f5c36f' : '#58656c'} flatShading />
    </mesh>
    <Html position={[0, 1.55, 0]} center>
      <div className={`zone-tag ${isUnlocked ? 'is-live' : ''}`}>{label}</div>
    </Html>
  </group>
)

export const FarmWorld = () => {
  const unlockedZones = useGameStore((state) => state.round.unlockedZones)

  const reedsUnlocked = unlockedZones.includes('reeds')
  const dockUnlocked = unlockedZones.includes('dock')

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[38, 30]} />
        <meshStandardMaterial color="#87ad74" flatShading />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[1.9, 0.04, -0.2]} scale={[1.1, 1.25, 1]}>
        <circleGeometry args={[5.3, 48]} />
        <meshStandardMaterial color="#68bfd6" flatShading />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[1.9, 0.045, -0.2]} scale={[0.8, 0.95, 1]}>
        <circleGeometry args={[4.1, 42]} />
        <meshStandardMaterial color="#3c799b" flatShading />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[-2.2, 0.03, -1.8]}>
        <planeGeometry args={[10.4, 3.3]} />
        <meshStandardMaterial color="#c7b17c" flatShading />
      </mesh>

      <FrankieHouse />
      <ReedBank isUnlocked={reedsUnlocked} />
      <DockArea isUnlocked={dockUnlocked} />
      <WaterfallStandIn />

      <ZoneTag
        position={[-0.2, 0.1, 7.6]}
        label={reedsUnlocked ? 'Reed Bank Open' : `Opens Round ${unlockRounds.reeds}`}
        isUnlocked={reedsUnlocked}
      />
      <ZoneTag
        position={[10.2, 0.1, 7.9]}
        label={dockUnlocked ? 'Waterfall Bank Open' : `Opens Round ${unlockRounds.dock}`}
        isUnlocked={dockUnlocked}
      />

      <NestCluster />
      <WormField />
      <FollowerFlock />
      <PlayerAvatar />
    </group>
  )
}
