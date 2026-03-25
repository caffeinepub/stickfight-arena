# StickFight Arena

## Current State
The app starts directly at MenuScreen which shows 2 Player Local and vs AI buttons. GameScreen uses keyboard-only controls (WASD/F/G for P1, Arrows/L/K for P2). There is no platform detection or touch controls.

## Requested Changes (Diff)

### Add
- PlatformSelectScreen: a new first screen that asks the user to choose "Mobile" or "PC" before anything else
- Mobile virtual controls overlay in GameScreen: a virtual joystick on the left (move left/right + swipe up for jump) and Attack + Special buttons on the right, rendered as a transparent overlay on top of the canvas
- Pass `platformMode: 'mobile' | 'pc'` through App state and into GameScreen
- In mobile mode, auto-set game mode to 'ai' (single player vs AI) since two players on one phone is impractical
- In mobile mode, hide the keyboard controls reminder at the bottom of GameScreen

### Modify
- App.tsx: add `platformSelect` as the initial AppScreen, add `platformMode` state, route through PlatformSelectScreen first
- MenuScreen: no changes needed (still shows after platform select)
- GameScreen: accept optional `platformMode` prop; when mobile, render touch joystick overlay and wire touch events into P1 controls (P2 is always AI in mobile mode)

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/components/PlatformSelectScreen.tsx` with Mobile and PC buttons, matching the existing gold/dark visual style
2. Update `App.tsx`: add `platformSelect` screen, `platformMode` state, pass `platformMode` to GameScreen, force `mode='ai'` when platformMode is 'mobile'
3. Update `GameScreen.tsx`: accept `platformMode?: 'mobile' | 'pc'` prop; when mobile, render a virtual joystick (left side) and attack/special buttons (right side) as an absolutely-positioned overlay; hook touch events to update a mobileControlsRef that feeds into getP1Controls
