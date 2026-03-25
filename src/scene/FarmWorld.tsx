import { Html } from '@react-three/drei'
import { TREE_OBSTACLES } from '../data/obstacles'
import { useGameStore } from '../store/gameStore'
import { ChickFlock } from './ChickFlock'
import { HouseModel } from './HouseModel'
import { NestCluster } from './NestCluster'
import { PlayerAvatar } from './PlayerAvatar'
import { WormField } from './WormField'

const unlockRounds = {
  reeds: 3,
  dock: 5,
} as const

const LowPolyTree = ({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) => (
  <group position={position} scale={[scale, scale, scale]}>
    <mesh castShadow receiveShadow position={[0, 0.52, 0]}>
      <boxGeometry args={[0.3, 1.05, 0.3]} />
      <meshStandardMaterial color="#7a5233" flatShading />
    </mesh>
    <mesh castShadow position={[0, 1.7, 0]}>
      <coneGeometry args={[1.15, 1.5, 6]} />
      <meshStandardMaterial color="#4a7c45" flatShading />
    </mesh>
    <mesh castShadow position={[0, 2.6, 0]}>
      <coneGeometry args={[0.8, 1.25, 6]} />
      <meshStandardMaterial color="#5c9652" flatShading />
    </mesh>
    <mesh castShadow position={[0, 3.3, 0]}>
      <coneGeometry args={[0.45, 0.9, 5]} />
      <meshStandardMaterial color="#6aad5e" flatShading />
    </mesh>
  </group>
)

const LowPolyRock = ({
  position,
  size = 0.55,
  color = '#8a9ba3',
}: {
  position: [number, number, number]
  size?: number
  color?: string
}) => (
  <mesh castShadow receiveShadow position={position}>
    <icosahedronGeometry args={[size, 0]} />
    <meshStandardMaterial color={color} flatShading />
  </mesh>
)

const SmallPond = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2.2, 10]} />
      <meshStandardMaterial color="#68bfd6" flatShading />
    </mesh>
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} scale={0.65}>
      <circleGeometry args={[2.2, 8]} />
      <meshStandardMaterial color="#3c799b" flatShading />
    </mesh>
  </group>
)

const ReedClump = ({
  position,
  count = 3,
  color = '#7da56b',
}: {
  position: [number, number, number]
  count?: number
  color?: string
}) => (
  <group position={position}>
    {Array.from({ length: count }, (_, i) => (
      <mesh
        key={i}
        castShadow
        position={[i * 0.14 - (count * 0.07), 0.55 + i * 0.09, i * 0.04]}
        rotation={[0, 0, i * 0.07 - 0.07]}
      >
        <boxGeometry args={[0.07, 1.2 + i * 0.12, 0.07]} />
        <meshStandardMaterial color={color} flatShading />
      </mesh>
    ))}
  </group>
)

const TreeGrove = () => (
  <group>
    {/* West tree line (beyond Frankie's house) */}
    <LowPolyTree position={[-20, 0, -10]} scale={0.9} />
    <LowPolyTree position={[-21, 0, -5.5]} />
    <LowPolyTree position={[-20.5, 0, 0]} scale={1.1} />
    <LowPolyTree position={[-21, 0, 5]} scale={0.85} />
    <LowPolyTree position={[-19.5, 0, 10]} />
    <LowPolyTree position={[-17.5, 0, -13]} scale={0.95} />
    <LowPolyTree position={[-19, 0, -7.5]} scale={0.88} />
    <LowPolyTree position={[-20, 0, 2.5]} scale={0.78} />
    <LowPolyTree position={[-18.5, 0, 7.5]} scale={1.05} />
    <LowPolyTree position={[-16.5, 0, -11]} scale={0.9} />
    {/* East tree line (beyond dock) */}
    <LowPolyTree position={[18.5, 0, -11]} scale={0.9} />
    <LowPolyTree position={[20, 0, -6]} />
    <LowPolyTree position={[21, 0, -1]} scale={1.1} />
    <LowPolyTree position={[20, 0, 4.5]} scale={0.88} />
    <LowPolyTree position={[19, 0, 10.5]} />
    <LowPolyTree position={[17, 0, 14]} scale={0.95} />
    <LowPolyTree position={[19.5, 0, -8.5]} scale={0.85} />
    <LowPolyTree position={[21, 0, 2]} scale={0.8} />
    <LowPolyTree position={[20, 0, 8]} scale={1.0} />
    <LowPolyTree position={[17.5, 0, -13]} scale={0.92} />
    {/* North tree line */}
    <LowPolyTree position={[-15, 0, 14.5]} scale={0.9} />
    <LowPolyTree position={[-11, 0, 16]} scale={0.85} />
    <LowPolyTree position={[-8, 0, 15.5]} />
    <LowPolyTree position={[-4.5, 0, 16]} scale={0.95} />
    <LowPolyTree position={[-1, 0, 14.5]} scale={1.05} />
    <LowPolyTree position={[2.5, 0, 16]} scale={0.88} />
    <LowPolyTree position={[6, 0, 15]} scale={0.92} />
    <LowPolyTree position={[9.5, 0, 16]} scale={0.85} />
    <LowPolyTree position={[13, 0, 14.5]} />
    <LowPolyTree position={[-18, 0, 13]} scale={0.82} />
    {/* South tree line */}
    <LowPolyTree position={[-16, 0, -13]} scale={0.9} />
    <LowPolyTree position={[-12, 0, -15]} scale={0.85} />
    <LowPolyTree position={[-8.5, 0, -14.5]} />
    <LowPolyTree position={[-4.5, 0, -16]} scale={0.95} />
    <LowPolyTree position={[-1, 0, -15]} scale={1.0} />
    <LowPolyTree position={[2.5, 0, -16]} scale={0.88} />
    <LowPolyTree position={[6, 0, -14.5]} scale={0.93} />
    <LowPolyTree position={[10, 0, -15.5]} scale={0.87} />
    <LowPolyTree position={[13.5, 0, -14]} />
    <LowPolyTree position={[17, 0, -14.5]} scale={0.9} />
    {/* Corner fills */}
    <LowPolyTree position={[-19, 0, 13]} scale={0.82} />
    <LowPolyTree position={[19, 0, 13]} scale={0.85} />
    <LowPolyTree position={[-19, 0, -12]} scale={0.8} />
    <LowPolyTree position={[19, 0, -12]} scale={0.9} />
    {/* Second-row and inland trees are rendered by ObstacleTrees (from TREE_OBSTACLES) */}
  </group>
)

// Trees that correspond 1-to-1 with obstacle circles in obstacles.ts
const ObstacleTrees = () => (
  <group>
    {TREE_OBSTACLES.map((obs) => (
      <LowPolyTree key={`obs-tree-${obs.x}-${obs.z}`} position={[obs.x, 0, obs.z]} scale={0.9 + (Math.abs(obs.x * 7 + obs.z * 3) % 10) * 0.02} />
    ))}
  </group>
)

const HouseVillage = () => (
  <group>
    <HouseModel modelIndex={1} position={[-14.5, 0, -10.5]} rotationY={0.4} />
    <HouseModel modelIndex={2} position={[4.5,   0, -12.0]} rotationY={Math.PI * 0.15} />
    <HouseModel modelIndex={3} position={[10.0,  0, -11.5]} rotationY={Math.PI * 0.6} />
    <HouseModel modelIndex={4} position={[-18.5, 0,  -8.0]} rotationY={Math.PI * 0.9} />
    <HouseModel modelIndex={5} position={[-18.0, 0,   9.5]} rotationY={Math.PI * 1.2} />
    <HouseModel modelIndex={1} position={[5.5,   0,  11.0]} rotationY={Math.PI * 0.7} />
    <HouseModel modelIndex={2} position={[16.5,  0, -10.0]} rotationY={Math.PI * 1.4} />
    <HouseModel modelIndex={3} position={[17.0,  0,   9.5]} rotationY={Math.PI * 0.3} />
  </group>
)

const RockScatter = () => (
  <group>
    {/* Clusters near tree line borders */}
    <LowPolyRock position={[-18, 0.3, -3]} size={0.6} color="#7a8b93" />
    <LowPolyRock position={[-17.5, 0.25, -2]} size={0.38} color="#8a9ba3" />
    <LowPolyRock position={[-19, 0.3, 8]} size={0.7} color="#6e7e87" />
    <LowPolyRock position={[-18.5, 0.2, 9]} size={0.42} color="#7a8b93" />
    <LowPolyRock position={[17, 0.3, -9]} size={0.65} color="#7a8b93" />
    <LowPolyRock position={[17.5, 0.22, -8]} size={0.35} color="#8a9ba3" />
    <LowPolyRock position={[19, 0.28, 7]} size={0.58} color="#6e7e87" />
    <LowPolyRock position={[-5, 0.28, -13]} size={0.72} color="#7a8b93" />
    <LowPolyRock position={[-4.5, 0.2, -12.5]} size={0.4} color="#8a9ba3" />
    <LowPolyRock position={[9, 0.3, -13.5]} size={0.6} color="#7a8b93" />
    <LowPolyRock position={[-10, 0.28, 13]} size={0.65} color="#6e7e87" />
    <LowPolyRock position={[4, 0.3, 14.5]} size={0.55} color="#7a8b93" />
    <LowPolyRock position={[4.5, 0.22, 14]} size={0.3} color="#8a9ba3" />
    {/* Rocks near pond edges */}
    <LowPolyRock position={[5.5, 0.25, -2.5]} size={0.48} color="#8a9ba3" />
    <LowPolyRock position={[-1.5, 0.22, 2.8]} size={0.35} color="#7a8b93" />
    <LowPolyRock position={[-4, 0.28, -3.5]} size={0.52} color="#6e7e87" />
  </group>
)

const ExtraWaterFeatures = () => (
  <group>
    {/* Small pond in the north-east */}
    <SmallPond position={[14, 0.04, 11.5]} />
    <ReedClump position={[12.6, 0.05, 11.2]} count={4} />
    <ReedClump position={[15.2, 0.05, 12.4]} count={3} />
    {/* Shallow pool near south waterfall area */}
    <SmallPond position={[8, 0.04, -13]} />
    <ReedClump position={[6.8, 0.05, -12.6]} count={3} />
    <ReedClump position={[9.2, 0.05, -13.5]} count={4} />
    {/* Reeds along main pond edges */}
    <ReedClump position={[-3.5, 0.05, -1.5]} count={3} />
    <ReedClump position={[4.8, 0.05, 1.5]} count={4} />
    <ReedClump position={[3.2, 0.05, -3.8]} count={3} />
    <ReedClump position={[-1.8, 0.05, 2.6]} count={3} />
  </group>
)

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

const PondBackdrop = () => (
  <>
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
  </>
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
        <planeGeometry args={[54, 44]} />
        <meshStandardMaterial color="#87ad74" flatShading />
      </mesh>

      <PondBackdrop />

      <FrankieHouse />
      <ReedBank isUnlocked={reedsUnlocked} />
      <DockArea isUnlocked={dockUnlocked} />
      <WaterfallStandIn />

      <TreeGrove />
      <ObstacleTrees />
      <HouseVillage />
      <RockScatter />
      <ExtraWaterFeatures />


      <NestCluster />
      <WormField />
      <ChickFlock />
      <PlayerAvatar />
    </group>
  )
}
