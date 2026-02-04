# Predator Pounce

A 2D action prototype built with Phaser 3 demonstrating a trajectory-based pouncing mechanic.

## Game Overview

Jump from platform to platform using precision aiming to reach and pounce on the target. The player controls a circle that must navigate through elevated platforms to reach a stationary square target.

## How to Play

### Controls

| Input | Action |
|-------|--------|
| **Hold Left Click** | Show trajectory preview |
| **Drag Mouse** | Adjust aim direction and power |
| **Release** | Launch jump |
| **R** or **Space** | Reset game |

### Objective

Navigate through the platforms and land on the red target square to flatten it.

## Level Layout

```
                                    ┌─────┐
                                    │ 🎯  │  Target
                              ══════════════  Target Platform

                        ════════════          Platform 2

              ════════════                    Platform 1

    ⚫                                        Player Start
════════════════════════════════════════════  Ground
```

## Running the Game

1. Clone the repository
2. Serve the files using a local web server (required for ES modules)
   - VS Code: Use the "Live Server" extension
   - Python: `python -m http.server 8000`
   - Node.js: `npx serve`
3. Open `index.html` in your browser

**Note:** Opening the HTML file directly (`file://`) may not work due to browser security restrictions.

## Project Structure

```
/project
  ├── index.html          # Entry point
  ├── js/
  │   ├── config.js       # Game configuration and constants
  │   └── game.js         # Main game scene and logic
  ├── predator-pounce-design-doc.md
  └── README.md
```

## Technical Details

- **Engine:** Phaser 3
- **Physics:** Manual kinematic calculations (not using Arcade physics body)
- **Resolution:** 800x600 pixels

## Configuration

Key game parameters can be adjusted in `js/config.js`:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `gravity` | 800 | Gravity in pixels/sec² |
| `minJumpPower` | 300 | Minimum launch velocity |
| `maxJumpPower` | 1200 | Maximum launch velocity |
| `powerScale` | 0.8 | Mouse distance to power ratio |
| `trajectoryDots` | 50 | Number of preview dots |
