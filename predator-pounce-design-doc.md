# Predator Pounce Prototype - Design Document

## Project Overview
**Engine:** Phaser 3
**Type:** 2D Action Prototype
**Core Mechanic:** Precision trajectory-based pouncing
**Status:** Implemented

---

## Game Concept

A prototype demonstrating a trajectory-based jump mechanic with platform navigation. A circle aims and jumps through elevated platforms to reach a stationary square target.

**Core Loop:**
1. Player (circle) stands on ground or platform
2. Player aims trajectory preview (hold mouse)
3. Player releases to jump
4. Player lands on platform or ground
5. Repeat until reaching the target
6. Successful hit = square flattens

---

## Technical Specifications

### Engine & Setup
- **Framework:** Phaser 3 (latest stable via CDN)
- **Physics:** Manual kinematic calculations (not using Arcade physics bodies)
- **Resolution:** 800x600 pixels
- **Rendering:** Canvas or WebGL (auto-detect)

### File Structure
```
/project
  ├── index.html              # Entry point with Phaser CDN
  ├── /js
  │   ├── game.js             # Main game scene and logic
  │   └── config.js           # Game configuration constants
  ├── predator-pounce-design-doc.md
  └── README.md
```

---

## Core Mechanics

### 1. Player Character (Circle)
**Visual:**
- Circle shape, 30px radius
- Color: Blue (#4A90E2)
- Outline: 2px dark blue (#2E5A8C)

**Physics Properties:**
- Starting position: (200, 470) - on ground, left side
- Gravity: 800 pixels/sec² (applied during jump)
- Manual velocity tracking (velocityX, velocityY)

**States:**
- `IDLE` - Standing, ready to aim
- `AIMING` - Holding mouse, showing trajectory
- `JUMPING` - In mid-air after launch
- `LANDED` - Returned to ground or platform

### 2. Target (Square)
**Visual:**
- Square shape, 40x40 pixels
- Color: Red (#E74C3C)
- Outline: 2px dark red (#922B21)

**Physics Properties:**
- Position: (700, 260) - on elevated target platform
- Completely stationary (no movement, no physics)

**States:**
- `INTACT` - Normal appearance
- `FLATTENED` - Hit by player (becomes flat rectangle 40x10)

### 3. Terrain

**Ground:**
- Rectangle: Full screen width (800px), 100px tall
- Position: y: 500 (top surface)
- Color: Brown (#8B4513)
- Static collision surface

**Platforms:**
| Platform | Position (x, y) | Size (w x h) |
|----------|-----------------|--------------|
| Platform 1 | (350, 420) | 100 x 20 |
| Platform 2 | (520, 340) | 100 x 20 |
| Target Platform | (680, 280) | 120 x 20 |

- Color: Dark brown (#654321)
- Outline: Darker brown (#3D2314)

### 4. Trajectory Preview System

**Visual Indicator:**
- Dotted line showing arc path from player toward cursor
- 50 dots along trajectory
- Dots: Circles (5px radius), yellow (#FFFF00) at 90% opacity
- Updates in real-time as mouse moves
- Only visible when mouse button is held

**Aiming Method:**
- **Direction:** Vector from player center to mouse position
- **Power:** Distance between player and mouse divided by powerScale
- **Clamped:** Between minJumpPower (300) and maxJumpPower (1200)
- **Downward limit:** velocityY clamped to prevent pure downward jumps

**Trajectory Calculation:**
```javascript
// Kinematic equations for each point
x = startX + velocityX * time;
y = startY + velocityY * time + 0.5 * gravity * time * time;
```

**Physics Values:**
- Min launch power: 300
- Max launch power: 1200
- Power scale: 0.8 (lower = more sensitive)
- Gravity: 800 pixels/sec²
- Trajectory time step: 0.04 seconds
- Total preview time: 2 seconds (50 dots x 0.04s)

### 5. Collision Detection

**Platform Collision:**
- Only checked when falling (velocityY > 0)
- Player must be within horizontal bounds of platform
- Landing tolerance: 20px window below platform top
- On landing: snap to platform, stop movement, change to LANDED state

**Ground Collision:**
- Only checked when falling (velocityY > 0)
- Ground level: y = 500 - playerRadius = 470
- Shows "MISS" feedback if target not hit

**Target Collision:**
- Checked using bounding rectangle intersection
- Triggers regardless of velocity direction (can hit on upward arc)
- Shows "HIT!" feedback and flattens target

---

## Level Layout

```
                                        ┌─────┐
                                        │ 🎯  │  Target (700, 260)
                                  ══════════════  Target Platform (680, 280)

                            ════════════          Platform 2 (520, 340)

                  ════════════                    Platform 1 (350, 420)

        ⚫                                        Player Start (200, 470)
════════════════════════════════════════════════  Ground (y: 500)
```

**Positions:**
- **Player starting position:** x: 200, y: 470
- **Platform 1:** x: 350, y: 420 (80px above ground)
- **Platform 2:** x: 520, y: 340 (160px above ground)
- **Target Platform:** x: 680, y: 280 (220px above ground)
- **Target:** x: 700, y: 260
- **Ground level:** y: 500 (top surface)

---

## Visual Design

### Color Palette
| Element | Color | Hex |
|---------|-------|-----|
| Background | Light blue sky | #87CEEB |
| Player | Blue | #4A90E2 |
| Player outline | Dark blue | #2E5A8C |
| Target | Red | #E74C3C |
| Target outline | Dark red | #922B21 |
| Ground | Brown | #8B4513 |
| Platforms | Dark brown | #654321 |
| Platform outline | Darker brown | #3D2314 |
| Trajectory dots | Yellow | #FFFF00 |
| Success text | Green | #2ECC71 |
| Miss text | Red | #E74C3C |

### UI Elements
- **Instructions:** Top center
  - "Hold LEFT CLICK and drag to aim"
  - "Release to jump"
  - Font: Arial, 18px, white with black stroke

- **Feedback Text:** Center screen (appears on hit/miss)
  - "HIT!" or "MISS"
  - Font: Arial, 48px, bold
  - Fades after 1 second

- **Reset:** Bottom right
  - "Press R or SPACE to reset"
  - Font: Arial, 16px, white

---

## Controls

### Mouse Controls
- **Hold Left Click** - Show trajectory preview
- **Drag mouse** - Adjust aim direction and power
- **Release** - Launch jump with calculated velocity

### Keyboard Controls
- **R** - Reset everything
- **SPACE** - Reset everything (alternative)

---

## Implementation Status

### Phase 1: Basic Setup - COMPLETE
- [x] Initialize Phaser 3 project with config
- [x] Create game scene with sky background
- [x] Draw ground rectangle
- [x] Draw player circle at start position
- [x] Draw target square at end position
- [x] Separate config.js for constants

### Phase 2: Trajectory System - COMPLETE
- [x] Detect mouse hold (pointer down event)
- [x] Calculate velocity from player to mouse position
- [x] Calculate trajectory arc points with physics
- [x] Draw dotted line during mouse hold
- [x] Clear trajectory on release
- [x] Yellow high-visibility dots

### Phase 3: Jump Physics - COMPLETE
- [x] Launch player with calculated velocity on release
- [x] Apply gravity during jump (manual physics)
- [x] Player follows parabolic arc
- [x] Detect ground collision
- [x] Return player to idle state on landing

### Phase 4: Collision & Feedback - COMPLETE
- [x] Detect player-target collision during jump
- [x] Flatten square on successful hit
- [x] Display "HIT!" message with fade
- [x] Display "MISS" message if no collision
- [x] Visual feedback timing (1 second)

### Phase 5: Platforms - COMPLETE
- [x] Add stepping stone platforms
- [x] Add target platform
- [x] Platform collision detection
- [x] Player can land on platforms
- [x] Jump from platform to platform

### Phase 6: Reset & Polish - COMPLETE
- [x] Implement reset function (R and SPACE keys)
- [x] Return player to start position
- [x] Un-flatten target square
- [x] Clear any messages
- [x] Add instruction text
- [x] Cache-busting for development

---

## Key Variables & Tuning

### Current Physics Constants
```javascript
const GAME_CONFIG = {
  width: 800,
  height: 600,
  gravity: 800,

  // Player
  playerStartX: 200,
  playerStartY: 470,
  playerRadius: 30,

  // Target
  targetX: 700,
  targetY: 260,
  targetSize: 40,
  targetFlattenedHeight: 10,

  // Target platform
  targetPlatformX: 680,
  targetPlatformY: 280,
  targetPlatformWidth: 120,
  targetPlatformHeight: 20,

  // Ground
  groundY: 500,
  groundHeight: 100,

  // Platforms
  platforms: [
    { x: 350, y: 420, width: 100, height: 20 },
    { x: 520, y: 340, width: 100, height: 20 }
  ],

  // Jump mechanics
  minJumpPower: 300,
  maxJumpPower: 1200,
  powerScale: 0.8,

  // Trajectory preview
  trajectoryDots: 50,
  trajectoryTimeStep: 0.04,
  trajectoryDotRadius: 5,

  // Feedback
  feedbackDuration: 1000
}
```

---

## Success Criteria

**MVP Complete:**
1. [x] Circle stands on ground or platforms
2. [x] Holding mouse shows trajectory preview
3. [x] Trajectory dots accurately show jump path
4. [x] Releasing mouse launches circle in parabolic arc
5. [x] Circle follows trajectory exactly
6. [x] Player can land on platforms
7. [x] Collision with square is detected
8. [x] Square flattens on hit
9. [x] Miss/Hit feedback displays correctly
10. [x] Reset (R/SPACE) works properly

---

## Testing Checklist

**Core Functionality:**
- [x] Trajectory preview appears on mouse hold
- [x] Trajectory updates as mouse moves
- [x] Trajectory disappears on release
- [x] Player launches when mouse released
- [x] Player follows trajectory path
- [x] Player stops at ground level
- [x] Player stops on platforms
- [x] Collision detects when hitting target
- [x] Square flattens only on direct hit
- [x] Feedback message displays correctly

**Platform Mechanics:**
- [x] Player can land on Platform 1
- [x] Player can land on Platform 2
- [x] Player can land on Target Platform
- [x] Player can jump from platform to platform
- [x] Player can reach target from platforms

---

## Development Notes

**Implementation Details:**
- Uses manual physics (velocityX, velocityY) rather than Phaser Arcade physics bodies
- Trajectory starts from i=1 to skip initial ground-level point
- Ground collision only triggers when falling (velocityY > 0)
- Platform collision uses 20px landing tolerance window

**Known Considerations:**
- Trajectory preview doesn't account for platform collisions (shows full arc)
- No score or attempt tracking
- Single target only

---

## Future Iteration Ideas

**Potential Enhancements:**
1. Moving targets (horizontal movement)
2. Multiple targets per level
3. Score system with attempt tracking
4. Different platform layouts (level system)
5. Particle effects on hit
6. Sound effects
7. Trajectory preview that stops at platforms
8. Time-based challenges

---

**Document Version:** 3.0
**Last Updated:** February 4, 2026
**Status:** Implemented
**Changes:** Added platforms, updated physics values, marked implementation complete
