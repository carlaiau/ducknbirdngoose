export const PersonModel = () => (
  <group>
    {/* Head */}
    <mesh castShadow position={[0, 1.58, 0]}>
      <boxGeometry args={[0.42, 0.42, 0.38]} />
      <meshStandardMaterial color="#e8c9a0" flatShading />
    </mesh>
    {/* Hair / cap */}
    <mesh castShadow position={[0, 1.82, 0]}>
      <boxGeometry args={[0.46, 0.14, 0.42]} />
      <meshStandardMaterial color="#4a3321" flatShading />
    </mesh>
    {/* Torso */}
    <mesh castShadow position={[0, 1.08, 0]}>
      <boxGeometry args={[0.52, 0.58, 0.3]} />
      <meshStandardMaterial color="#3a7abf" flatShading />
    </mesh>
    {/* Left arm */}
    <mesh castShadow position={[-0.36, 1.06, 0]} rotation={[0, 0, 0.18]}>
      <boxGeometry args={[0.17, 0.52, 0.2]} />
      <meshStandardMaterial color="#3a7abf" flatShading />
    </mesh>
    {/* Right arm — extended forward holding cage */}
    <mesh castShadow position={[0.36, 0.98, 0.28]} rotation={[0.55, 0, -0.18]}>
      <boxGeometry args={[0.17, 0.52, 0.2]} />
      <meshStandardMaterial color="#3a7abf" flatShading />
    </mesh>
    {/* Left leg */}
    <mesh castShadow position={[-0.14, 0.42, 0]}>
      <boxGeometry args={[0.22, 0.72, 0.24]} />
      <meshStandardMaterial color="#2c3e50" flatShading />
    </mesh>
    {/* Right leg */}
    <mesh castShadow position={[0.14, 0.42, 0]}>
      <boxGeometry args={[0.22, 0.72, 0.24]} />
      <meshStandardMaterial color="#2c3e50" flatShading />
    </mesh>
    {/* Cage held out front */}
    <group position={[0.42, 0.78, 0.62]}>
      {/* Cage bars wireframe */}
      <mesh>
        <boxGeometry args={[0.48, 0.42, 0.48]} />
        <meshStandardMaterial color="#c8a84a" wireframe />
      </mesh>
      {/* Cage solid bottom */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.5, 0.04, 0.5]} />
        <meshStandardMaterial color="#b8943a" flatShading />
      </mesh>
    </group>
  </group>
)
