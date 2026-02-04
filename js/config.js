/**
 * Predator Pounce - Game Configuration
 * All game constants and Phaser config
 */

const GAME_CONFIG = {
    // Canvas dimensions
    width: 800,
    height: 600,

    // Physics
    gravity: 800,  // pixels per second squared

    // Player (circle) properties
    playerStartX: 200,
    playerStartY: 470,  // Center position: groundY - playerRadius = 500 - 30
    playerRadius: 30,

    // Target (square) properties
    targetX: 600,
    targetY: 480,       // FIX: Center position: groundY - (targetSize/2) = 500 - 20
    targetSize: 40,
    targetFlattenedHeight: 10,

    // Ground
    groundY: 500,       // Top surface of ground
    groundHeight: 100,

    // Jump mechanics
    minJumpPower: 150,
    maxJumpPower: 500,
    powerScale: 2,      // mouse distance / powerScale = launch power

    // Trajectory preview
    trajectoryDots: 30,         // Increased from 20 for longer arcs
    trajectoryTimeStep: 0.05,   // Seconds per step
    trajectoryDotRadius: 4,

    // Feedback
    feedbackDuration: 1000,     // Milliseconds before feedback fades

    // Colors
    bgColor: 0x87CEEB,          // Light blue sky
    playerColor: 0x4A90E2,      // Blue
    playerOutline: 0x2E5A8C,    // Dark blue
    targetColor: 0xE74C3C,      // Red
    targetOutline: 0x922B21,    // Dark red
    groundColor: 0x8B4513,      // Brown
    trajectoryColor: 0xFFFFFF,  // White
    trajectoryAlpha: 0.5,
    successColor: '#2ECC71',    // Green (CSS format for text)
    missColor: '#E74C3C'        // Red (CSS format for text)
};

// Phaser 3 configuration
const phaserConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    parent: 'game-container',
    backgroundColor: GAME_CONFIG.bgColor,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },  // We control gravity manually for the player
            debug: false
        }
    },
    scene: []  // Will be populated in game.js
};
