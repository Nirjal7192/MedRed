# MedRed - AI Powered Medicine Reminder Portal

MedRed is a modern medicine reminder web app built with React that helps users manage medications, set smart reminders, and track adherence. It features a clean UI, responsive design, and simulated authentication without backend dependency.

## Animated Background

The app uses a full-screen WebGL wave animation ([react-bits LineWaves](https://reactbits.dev/backgrounds/line-waves)) rendered behind all content.

**Component:** `src/components/AnimatedBackground.jsx`  
**Renderer:** `src/components/ui/LineWaves.jsx` (requires [`ogl`](https://npmjs.com/package/ogl))

### Customising the animation

Open `src/components/AnimatedBackground.jsx` and tweak the props on `<LineWaves>`:

| Prop | Default | Description |
|---|---|---|
| `speed` | `0.3` | Playback speed — increase for faster waves |
| `brightness` | `0.2` | Overall brightness (0–1). Raise to make waves more vivid |
| `color1` | `#ef0b0b` | Primary wave colour (hex) |
| `color2` | `#ecb1b1` | Secondary wave colour (hex) |
| `color3` | `#f5f5fa` | Tertiary wave colour (hex) |
| `rotation` | `-147` | Angle of the wave field in degrees |
| `warpIntensity` | `1` | Amount of wave distortion |
| `innerLineCount` | `6` | Line density in the centre |
| `outerLineCount` | `6` | Line density at the edges |
| `colorCycleSpeed` | `1` | How fast the palette shifts over time |
| `enableMouseInteraction` | `false` | Enable/disable mouse-driven warp |
| `mouseInfluence` | `0.1` | Strength of the mouse warp effect |

