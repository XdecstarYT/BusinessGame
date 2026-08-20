import { Physics, RigidBody } from '@react-three/rapier'
import { CustomersLayer } from '../components/3d/CustomersLayer'
import { DustMotes } from '../components/3d/DustMotes'
import { Ground } from '../components/3d/Ground'
import { LayoutRenderer } from '../components/3d/LayoutRenderer'
import { Player } from '../components/3d/Player'
import { LODTestProps } from '../components/3d/LODTestProps'
import { SalePopsLayer } from '../components/3d/SalePopsLayer'
import { SkyGradient } from '../components/3d/SkyGradient'
import { StaffLayer } from '../components/3d/StaffLayer'
import { StoreLighting } from '../components/3d/StoreLighting'
import { GRID_WIDTH, GRID_DEPTH } from '../systems/grid'

export function WalkModeScene() {
  return (
    <>
      <SkyGradient />
      <StoreLighting directionalPosition={[15, 20, 10]} />
      <Physics gravity={[0, -9.81, 0]}>
        <Player spawn={[2, 1, 2]} />
        <RigidBody type="fixed" colliders="cuboid">
          <Ground />
        </RigidBody>
        <LayoutRenderer withPhysics />
      </Physics>
      <CustomersLayer />
      <StaffLayer />
      <SalePopsLayer />
      <LODTestProps />
      <DustMotes areaSize={[GRID_WIDTH, 3.5, GRID_DEPTH]} center={[GRID_WIDTH / 2, 2, GRID_DEPTH / 2]} />
    </>
  )
}
