import { useEffect } from 'react'
import { Physics, RigidBody } from '@react-three/rapier'
import { CinematicCameraRig } from '../components/3d/CinematicCameraRig'
import { CustomersLayer } from '../components/3d/CustomersLayer'
import { DialogueBubblesLayer } from '../components/3d/DialogueBubblesLayer'
import { DustMotes } from '../components/3d/DustMotes'
import { Ground } from '../components/3d/Ground'
import { HeatmapOverlay } from '../components/3d/HeatmapOverlay'
import { LayoutRenderer } from '../components/3d/LayoutRenderer'
import { Player } from '../components/3d/Player'
import { LODTestProps } from '../components/3d/LODTestProps'
import { SalePopsLayer } from '../components/3d/SalePopsLayer'
import { SkyGradient } from '../components/3d/SkyGradient'
import { StaffLayer } from '../components/3d/StaffLayer'
import { StoreLighting } from '../components/3d/StoreLighting'
import { useGameMode } from '../stores/useGameMode'
import { useStoreLayout } from '../stores/useStoreLayout'
import { GRID_WIDTH, GRID_DEPTH, LEVEL_HEIGHT } from '../systems/grid'

export function WalkModeScene() {
  const maxLevel = useStoreLayout((s) => s.maxLevel)
  const setActiveLevel = useStoreLayout((s) => s.setActiveLevel)
  const phase = useGameMode((s) => s.phase)
  const cameraStyle = useGameMode((s) => s.cameraStyle)

  const cinematic = phase === 'play' && cameraStyle === 'cinematic'

  // Always walk in starting on the ground floor, regardless of whatever
  // level Build Mode was last editing — upper floors are reached via stairs.
  useEffect(() => {
    setActiveLevel(0)
  }, [setActiveLevel])

  return (
    <>
      <SkyGradient />
      <StoreLighting directionalPosition={[15, 20, 10]} />
      <Physics gravity={[0, -9.81, 0]}>
        {cinematic ? <CinematicCameraRig /> : <Player spawn={[2, 1, 2]} />}
        <RigidBody type="fixed" colliders="cuboid">
          <Ground />
        </RigidBody>
        {Array.from({ length: maxLevel + 1 }, (_, level) => (
          <group key={level} position={[0, level * LEVEL_HEIGHT, 0]}>
            <LayoutRenderer withPhysics level={level} />
          </group>
        ))}
      </Physics>
      <HeatmapOverlay />
      <CustomersLayer />
      <StaffLayer />
      <SalePopsLayer />
      {phase === 'play' && <DialogueBubblesLayer />}
      <LODTestProps />
      <DustMotes areaSize={[GRID_WIDTH, 3.5, GRID_DEPTH]} center={[GRID_WIDTH / 2, 2, GRID_DEPTH / 2]} />
    </>
  )
}
