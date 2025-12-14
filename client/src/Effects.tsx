import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode } from 'postprocessing'

export function Effects() {
  return (
    <EffectComposer disableNormalPass>
      <Bloom
        luminanceThreshold={1.1} // Only very bright things glow
        mipmapBlur
        intensity={0.8}
        radius={0.4}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette offset={0.1} darkness={0.7} />
    </EffectComposer>
  )
}
