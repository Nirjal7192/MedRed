/**
 * AnimatedBackground
 *
 * Renders a full-screen LineWaves WebGL animation fixed behind all content.
 * It sits at z-index 0 with pointer-events disabled so it never blocks clicks
 * or scroll.
 *
 * Tweak the visual appearance by adjusting the props passed to <LineWaves>:
 *   - speed          → animation playback speed (default 0.3)
 *   - brightness     → overall brightness 0–1 (default 0.2 = subtle)
 *   - color1/2/3     → hex colours for the wave palette
 *   - rotation       → angle of the wave field in degrees
 *   - warpIntensity  → how much the waves warp / distort
 *   - innerLineCount / outerLineCount → density of lines in the centre/edge
 *   - colorCycleSpeed → how fast the colours shift over time
 */
import LineWaves from './ui/LineWaves';

export default function AnimatedBackground() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    >
      <LineWaves
        speed={0.3}
        innerLineCount={6}
        outerLineCount={6}
        warpIntensity={1}
        rotation={-147}
        edgeFadeWidth={0}
        colorCycleSpeed={1}
        brightness={0.2}
        color1="#ef0b0b"
        color2="#ecb1b1"
        color3="#f5f5fa"
        enableMouseInteraction={false}
        mouseInfluence={0.1}
      />
    </div>
  );
}