import { Physics, RigidBody } from '@react-three/rapier'
import { LayoutRenderer } from '../components/3d/LayoutRenderer'
import { Player } from '../components/3d/Player'
import { LODTestProps } from '../components/3d/LODTestProps'
import { GRID_WIDTH, GRID_DEPTH } from '../systems/grid'

export function WalkModeScene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[15, 20, 10]} intensity={1.3} castShadow shadow-mapSize={[2048, 2048]} />
      <Physics gravity={[0, -9.81, 0]}>
        <Player spawn={[2, 1, 2]} />
        <RigidBody type="fixed" colliders="cuboid">
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GRID_WIDTH / 2, 0, GRID_DEPTH / 2]} receiveShadow>
            <planeGeometry args={[GRID_WIDTH, GRID_DEPTH]} />
            <meshStandardMaterial color="#4a4a4a" roughness={0.95} />
          </mesh>
        </RigidBody>
        <LayoutRenderer withPhysics />
      </Physics>
      <LODTestProps />
    </>
  )
}
