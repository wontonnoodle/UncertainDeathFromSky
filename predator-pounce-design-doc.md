# Predator Pounce Prototype - Design Document

## Project Overview
**Engine:** Phaser 3  
**Type:** 2D Action Prototype  
**Core Mechanic:** Precision trajectory-based pouncing  
**Development Time:** 2-3 days for MVP

---

## Game Concept

A minimal viable prototype demonstrating a trajectory-based jump mechanic. A circle aims and jumps toward a stationary square target on flat terrain.

**Core Loop:**
1. Player (circle) stands on flat ground
2. Square target sits stationary on ground
3. Player aims trajectory preview
4. Player releases to jump
5. Successful hit = square flattens

---

## Technical Specifications

### Engine & Setup
- **Framework:** Phaser 3 (latest stable version)
- **Physics:** Arcade Physics
- **Resolution:** 800x600 pixels
- **Rendering:** Canvas or WebGL (auto-detect)

### File Structure
```
/project
  ├── index.html
  ├── /js
  │   ├── game.js (main game scene)
  │   └── config.js (Phaser config)
  └── README.md
```

---

## Core Mechanics

### 1. Player Character (Circle)
**Visual:**
- Circle shape, 30px radius
- Color: Blue (#4A90E2)
- Outline: 2px dark blue

**Physics Properties:**
- Starting position: (200, 470) - on ground, left side
- Gravity: 800 (when jumping)
- No movement except jumping

**States:**
- `IDLE` - Standing on ground
- `AIMING` - Holding mouse, showing trajectory
- `JUMPING` - In mid-air after launch
- `LANDED` - Returned to ground

### 2. Target (Square)
**Visual:**
- Square shape, 40x40 pixels
- Color: Red (#E74C3C)
- Outline: 2px dark red

**Physics Properties:**
- Position: (600, 460) - on ground, right side
- Completely stationary (no movement, no physics)
- Distance from player: ~400px

**States:**
- `INTACT` - Normal appearance
- `FLATTENED` - Hit by player (becomes flat rectangle 40x10)

### 3. Terrain
**Ground:**
- Rectangle: Full screen width (800px), 100px tall
- Position: x: 0, y: 500
- Color: Brown (#8B4513)
- Static (collision surface)

### 4. Trajectory Preview System

**Visual Indicator:**
- Dotted line showing arc path from player to cursor
- 20 dots along trajectory
- Dots: Small circles (4px radius), semi-transparent white (#FFFFFF80)
- Updates in real-time as mouse moves
- Only visible when mouse button is held

**Aiming Method:**
The trajectory is calculated from the player's position toward the mouse cursor position:
- **Direction:** Vector from player center to mouse position
- **Power:** Distance between player and mouse (clamped to min/max)
- **Longer drag** = more power = farther jump

**Trajectory Calculation:**
```javascript
// Calculate velocity based on mouse position
function getVelocityFromMouse(playerX, playerY, mouseX, mouseY) {
  // Direction vector
  let dx = mouseX - playerX;
  let dy = mouseY - playerY;
  let distance = Math.sqrt(dx * dx + dy * dy);
  
  // Normalize and scale by power
  let power = Phaser.Math.Clamp(distance / 2, MIN_POWER, MAX_POWER);
  let velocityX = (dx / distance) * power;
  let velocityY = (dy / distance) * power;
  
  return { vx: velocityX, vy: velocityY };
}

// Calculate arc trajectory points
function calculateTrajectory(startX, startY, velocityX, velocityY, gravity) {
  let points = [];
  let time = 0;
  let steps = 20;
  let timeStep = 0.05;
  
  for (let i = 0; i < steps; i++) {
    time = i * timeStep;
    let x = startX + velocityX * time;
    let y = startY + velocityY * time + 0.5 * gravity * time * time;
    
    // Stop drawing if trajectory goes below ground
    if (y >= 470) break;
    
    points.push({x, y});
  }
  return points;
}
```

**Physics Values:**
- Min launch power: 150
- Max launch power: 500
- Gravity: 800
- Launch direction: Toward mouse cursor

### 5. Collision Detection

**Success Condition:**
- Player's bounding circle overlaps square
- Player must be falling (velocity.y > 0)

**Success Effect:**
- Square transforms to flattened rectangle (40x10)
- Square stays in place (flattened)
- Success message appears: "HIT!" (green text)
- Player returns to ground

**Miss Condition:**
- Player lands without hitting square
- Message appears: "MISS" (red text)
- Player can immediately try again

---

## Level Layout

```
                    🎯
        ⚫          □         
    _____________________________  ← Ground (y: 500)
    
    Player (200, 470)
    Target (600, 460)
    Distance: ~400px
```

**Positions:**
- **Player starting position:** x: 200, y: 470
- **Target position:** x: 600, y: 460
- **Ground level:** y: 500 (top surface)

---

## Visual Design

### Color Palette
- **Background:** Light blue sky (#87CEEB)
- **Player (Circle):** Blue (#4A90E2)
- **Target (Square):** Red (#E74C3C)
- **Ground:** Brown (#8B4513)
- **Trajectory dots:** White 50% opacity (#FFFFFF80)
- **Success text:** Green (#2ECC71)
- **Miss text:** Red (#E74C3C)

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
  - "Press R to reset"
  - Font: Arial, 16px, white

---

## Controls

### Mouse Controls
- **Hold Left Click** → Show trajectory preview
- **Drag mouse** → Adjust aim direction and power
- **Release** → Launch jump with calculated velocity

### Keyboard Controls
- **R** → Reset everything (player returns to start, target un-flattens)
- **SPACE** → Alternative: Reset

---

## Implementation Phases

### Phase 1: Basic Setup (2 hours)
- [ ] Initialize Phaser 3 project with config
- [ ] Create game scene with sky background
- [ ] Draw ground rectangle
- [ ] Draw player circle at start position
- [ ] Draw target square at end position
- [ ] Add gravity to player (initially inactive)

### Phase 2: Trajectory System (3 hours)
- [ ] Detect mouse hold (pointer down event)
- [ ] Calculate velocity from player to mouse position
- [ ] Calculate trajectory arc points with physics
- [ ] Draw dotted line during mouse hold
- [ ] Clear trajectory on release
- [ ] Test various mouse positions

### Phase 3: Jump Physics (2 hours)
- [ ] Launch player with calculated velocity on release
- [ ] Apply gravity during jump
- [ ] Player follows parabolic arc
- [ ] Detect ground collision (stop at y: 470)
- [ ] Return player to idle state on landing

### Phase 4: Collision & Feedback (2 hours)
- [ ] Detect player-target collision during jump
- [ ] Flatten square on successful hit
- [ ] Display "HIT!" message with fade
- [ ] Display "MISS" message if no collision
- [ ] Add visual feedback timing

### Phase 5: Reset & Polish (1 hour)
- [ ] Implement reset function (R key)
- [ ] Return player to start position
- [ ] Un-flatten target square
- [ ] Clear any messages
- [ ] Add instruction text
- [ ] Final testing

---

## Key Variables & Tuning

### Physics Constants
```javascript
const GAME_CONFIG = {
  width: 800,
  height: 600,
  gravity: 800,
  
  // Positions
  playerStartX: 200,
  playerStartY: 470, // 30px radius = sits on ground at y:500
  targetX: 600,
  targetY: 460,      // 40px height = sits on ground at y:500
  groundY: 500,
  
  // Sizes
  playerRadius: 30,
  targetSize: 40,
  targetFlattenedHeight: 10,
  
  // Jump mechanics
  minJumpPower: 150,
  maxJumpPower: 500,
  powerScale: 2,     // mouse distance / powerScale = power
  
  // Trajectory preview
  trajectoryDots: 20,
  trajectoryTimeStep: 0.05,
  trajectoryDotRadius: 4,
  
  // Colors
  bgColor: '#87CEEB',
  playerColor: '#4A90E2',
  targetColor: '#E74C3C',
  groundColor: '#8B4513',
  trajectoryColor: '#FFFFFF',
  trajectoryAlpha: 0.5,
}
```

### Tuning Goals
- **Jump Arc:** Should look natural and parabolic
- **Trajectory Accuracy:** Dots show exactly where player will land
- **Aiming Feel:** Intuitive - drag far = jump far
- **Hit Detection:** 100% accurate (no phantom hits/misses)
- **Visual Feedback:** Clear success/failure indication

---

## Success Criteria

**MVP Complete When:**
1. ✓ Circle stands on flat ground
2. ✓ Holding mouse shows trajectory preview
3. ✓ Trajectory dots accurately show jump path
4. ✓ Releasing mouse launches circle in parabolic arc
5. ✓ Circle follows trajectory exactly
6. ✓ Collision with square is detected
7. ✓ Square flattens on hit
8. ✓ Miss/Hit feedback displays correctly
9. ✓ Reset (R key) works properly

**Not Needed for MVP:**
- Sound effects
- Particle effects
- Animation tweens
- Multiple attempts tracking
- Score system
- Moving targets
- Multiple targets

---

## Code Structure Overview

### Main Game Scene Structure
```javascript
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }
  
  create() {
    // Setup
    this.isAiming = false;
    this.isJumping = false;
    
    // Create objects
    this.createGround();
    this.createPlayer();
    this.createTarget();
    this.createUI();
    
    // Input
    this.input.on('pointerdown', this.startAiming, this);
    this.input.on('pointerup', this.jump, this);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.resetKey = this.input.keyboard.addKey('R');
    
    // Graphics for trajectory
    this.trajectoryGraphics = this.add.graphics();
  }
  
  update() {
    // Update trajectory preview while aiming
    if (this.isAiming && !this.isJumping) {
      this.updateTrajectory();
    }
    
    // Check collision while jumping
    if (this.isJumping) {
      this.checkTargetCollision();
      this.checkGroundCollision();
    }
    
    // Reset
    if (Phaser.Input.Keyboard.JustDown(this.resetKey)) {
      this.reset();
    }
  }
  
  // Methods
  createGround() { }
  createPlayer() { }
  createTarget() { }
  createUI() { }
  
  startAiming() { }
  updateTrajectory() { }
  calculateTrajectoryPoints(vx, vy) { }
  drawTrajectory(points) { }
  
  jump() { }
  checkTargetCollision() { }
  checkGroundCollision() { }
  
  flattenTarget() { }
  showFeedback(message, color) { }
  reset() { }
}
```

---

## Testing Checklist

**Core Functionality:**
- [ ] Trajectory preview appears on mouse hold
- [ ] Trajectory updates as mouse moves
- [ ] Trajectory disappears on release
- [ ] Player launches when mouse released
- [ ] Player follows trajectory path exactly
- [ ] Player arc matches preview dots
- [ ] Player stops at ground level
- [ ] Collision detects when hitting target
- [ ] Square flattens only on direct hit
- [ ] Feedback message displays correctly

**Edge Cases:**
- [ ] Clicking very close to player (minimal power)
- [ ] Clicking very far from player (max power)
- [ ] Clicking below ground level
- [ ] Releasing immediately (no drag)
- [ ] Rapid clicking while jumping
- [ ] Clicking during jump (should ignore)
- [ ] Reset during jump
- [ ] Reset after hit

**Physics Validation:**
- [ ] Arc looks natural (parabolic curve)
- [ ] Landing point matches last trajectory dot
- [ ] Gravity feels appropriate
- [ ] Jump height varies with mouse distance
- [ ] No weird behavior at edges

---

## Expected Behavior Examples

### Scenario 1: Short Jump
```
Mouse position: (300, 400) - close to player
Expected: Low, short arc that doesn't reach target
Result: "MISS" message
```

### Scenario 2: Perfect Hit
```
Mouse position: (500, 350) - medium distance, slight upward
Expected: Parabolic arc landing on target
Result: Square flattens, "HIT!" message
```

### Scenario 3: Overshoot
```
Mouse position: (700, 300) - far from player
Expected: High, long arc that passes over target
Result: "MISS" message
```

### Scenario 4: Reset
```
After hit/miss, press R
Expected: 
  - Player returns to x:200, y:470
  - Target returns to intact state at x:600, y:460
  - Feedback message clears
```

---

## Development Notes

**Simplifications from Original Spec:**
- ✓ Removed elevated platform
- ✓ Removed prey movement
- ✓ Removed respawn logic
- ✓ Removed score tracking
- ✓ Focus purely on jump + targeting mechanic

**What This Tests:**
- Trajectory prediction accuracy
- Physics feel (arc, gravity, landing)
- Aiming intuitiveness
- Visual feedback clarity
- Control responsiveness

**What to Learn:**
1. Is the trajectory preview easy to understand?
2. Does the jump feel satisfying?
3. Is aiming intuitive?
4. Does the physics look/feel right?
5. Is hit detection reliable?

---

## Next Iteration Ideas

**After This Prototype Works:**
1. Add second stationary target at different distance
2. Add moving target (horizontal movement)
3. Add elevated platform for player
4. Add multiple jump attempts
5. Add simple score counter
6. Expand to full predator ambush game

---

## Resources Needed

**Development:**
- Code editor (VS Code)
- Local web server (Live Server extension)
- Chrome DevTools

**External Libraries:**
- Phaser 3 (CDN: `https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.js`)

**Time Estimate:**
- Setup: 2 hours
- Trajectory: 3 hours
- Jump physics: 2 hours
- Collision: 2 hours
- Polish: 1 hour
- **Total:** ~10 hours for complete MVP

---

**Document Version:** 2.0  
**Last Updated:** February 4, 2026  
**Status:** Ready for Implementation  
**Changes:** Removed platform, removed movement, simplified to core mechanic only
