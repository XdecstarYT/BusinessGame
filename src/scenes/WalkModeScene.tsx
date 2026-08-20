import { Physics, RigidBody } from '@react-three/rapier'
import { CustomersLayer } from '../components/3d/CustomersLayer'
import { DustMotes } from '../components/3d/DustMotes'
import { Ground } from '../components/3d/Ground'
import { LayoutRenderer } from '../components/3d/LayoutRenderer'
import { Player } from '../components/3d/Player'
import { LODTestProps } from '../components/3d/LODTestProps'
import { SkyGradient } from '../components/3d/SkyGradient'
import { GRID_WIDTH, GRID_DEPTH } from '../systems/grid'

export function WalkModeScene() {
  return (
    <>
      <SkyGradient />
      <ambientLight intensity={0.55} />
      <directionalLight position={[15, 20, 10]} intensity={1.3} castShadow shadow-mapSize={[2048, 2048]} />
      <Physics gravity={[0, -9.81, 0]}>
        <Player spawn={[2, 1, 2]} />
        <RigidBody type="fixed" colliders="cuboid">
          <Ground />
        </RigidBody>
        <LayoutRenderer withPhysics />
      </Physics>
      <CustomersLayer />
      <LODTestProps />
      <DustMotes areaSize={[GRID_WIDTH, 3.5, GRID_DEPTH]} center={[GRID_WIDTH / 2, 2, GRID_DEPTH / 2]} />
    </>
  )
}
