/**
 * Predator Pounce - Main Game Scene
 * Trajectory-based pouncing mechanic prototype
 */

// Player states
const PlayerState = {
    IDLE: 'idle',
    AIMING: 'aiming',
    JUMPING: 'jumping',
    LANDED: 'landed'
};

// Target states
const TargetState = {
    INTACT: 'intact',
    FLATTENED: 'flattened'
};

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');

        // State tracking
        this.playerState = PlayerState.IDLE;
        this.targetState = TargetState.INTACT;

        // Physics tracking (manual control)
        this.velocityX = 0;
        this.velocityY = 0;
    }

    create() {
        // Create game objects
        this.createGround();
        this.createPlayer();
        this.createTarget();
        this.createUI();

        // Graphics for trajectory preview
        this.trajectoryGraphics = this.add.graphics();

        // Input handling
        this.input.on('pointerdown', this.startAiming, this);
        this.input.on('pointerup', this.jump, this);

        // Keyboard - R and SPACE to reset
        this.resetKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update(time, delta) {
        // Convert delta to seconds for physics calculations
        const dt = delta / 1000;

        // Update trajectory preview while aiming
        if (this.playerState === PlayerState.AIMING) {
            this.updateTrajectory();
        }

        // Update player position while jumping
        if (this.playerState === PlayerState.JUMPING) {
            this.updateJump(dt);
            this.checkTargetCollision();
            this.checkGroundCollision();
        }

        // Handle reset input
        if (Phaser.Input.Keyboard.JustDown(this.resetKey) ||
            Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.reset();
        }
    }

    // ===================
    // Object Creation
    // ===================

    createGround() {
        this.ground = this.add.rectangle(
            GAME_CONFIG.width / 2,
            GAME_CONFIG.groundY + GAME_CONFIG.groundHeight / 2,
            GAME_CONFIG.width,
            GAME_CONFIG.groundHeight,
            GAME_CONFIG.groundColor
        );
    }

    createPlayer() {
        // Main circle
        this.player = this.add.circle(
            GAME_CONFIG.playerStartX,
            GAME_CONFIG.playerStartY,
            GAME_CONFIG.playerRadius,
            GAME_CONFIG.playerColor
        );

        // Outline
        this.player.setStrokeStyle(2, GAME_CONFIG.playerOutline);
    }

    createTarget() {
        // Main square
        this.target = this.add.rectangle(
            GAME_CONFIG.targetX,
            GAME_CONFIG.targetY,
            GAME_CONFIG.targetSize,
            GAME_CONFIG.targetSize,
            GAME_CONFIG.targetColor
        );

        // Outline
        this.target.setStrokeStyle(2, GAME_CONFIG.targetOutline);
    }

    createUI() {
        // Instructions at top
        this.instructionText = this.add.text(
            GAME_CONFIG.width / 2,
            30,
            'Hold LEFT CLICK and drag to aim\nRelease to jump',
            {
                fontFamily: 'Arial',
                fontSize: '18px',
                color: '#FFFFFF',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);

        // Reset instruction at bottom
        this.resetText = this.add.text(
            GAME_CONFIG.width - 10,
            GAME_CONFIG.height - 10,
            'Press R or SPACE to reset',
            {
                fontFamily: 'Arial',
                fontSize: '16px',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 1
            }
        ).setOrigin(1, 1);

        // Feedback text (hidden initially)
        this.feedbackText = this.add.text(
            GAME_CONFIG.width / 2,
            GAME_CONFIG.height / 2 - 50,
            '',
            {
                fontFamily: 'Arial',
                fontSize: '48px',
                fontStyle: 'bold',
                color: '#FFFFFF',
                stroke: '#000000',
                strokeThickness: 4
            }
        ).setOrigin(0.5).setAlpha(0);
    }

    // ===================
    // Aiming System
    // ===================

    startAiming(pointer) {
        // Only allow aiming when idle or landed
        if (this.playerState === PlayerState.JUMPING) {
            return;
        }

        this.playerState = PlayerState.AIMING;
    }

    updateTrajectory() {
        const pointer = this.input.activePointer;

        // Calculate velocity from player to mouse
        const velocity = this.getVelocityFromMouse(
            this.player.x,
            this.player.y,
            pointer.x,
            pointer.y
        );

        // Calculate trajectory points
        const points = this.calculateTrajectoryPoints(velocity.vx, velocity.vy);

        // Draw the trajectory
        this.drawTrajectory(points);
    }

    getVelocityFromMouse(playerX, playerY, mouseX, mouseY) {
        // Direction vector
        const dx = mouseX - playerX;
        const dy = mouseY - playerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Avoid division by zero
        if (distance === 0) {
            return { vx: 0, vy: 0 };
        }

        // Calculate power based on distance, using config constant
        let power = Phaser.Math.Clamp(
            distance / GAME_CONFIG.powerScale,
            GAME_CONFIG.minJumpPower,
            GAME_CONFIG.maxJumpPower
        );

        // Normalize and scale by power
        let velocityX = (dx / distance) * power;
        let velocityY = (dy / distance) * power;

        // FIX: Clamp velocityY to only allow upward jumps (negative Y is up in Phaser)
        // Allow slight downward angle but prevent pure downward jumps
        if (velocityY > 0) {
            velocityY = Math.min(velocityY, power * 0.3);  // Limit downward component
        }

        return { vx: velocityX, vy: velocityY };
    }

    calculateTrajectoryPoints(velocityX, velocityY) {
        const points = [];
        const startX = this.player.x;
        const startY = this.player.y;
        const gravity = GAME_CONFIG.gravity;
        const steps = GAME_CONFIG.trajectoryDots;
        const timeStep = GAME_CONFIG.trajectoryTimeStep;  // Seconds

        for (let i = 0; i < steps; i++) {
            const time = i * timeStep;

            // Kinematic equations: x = x0 + vx*t, y = y0 + vy*t + 0.5*g*t^2
            const x = startX + velocityX * time;
            const y = startY + velocityY * time + 0.5 * gravity * time * time;

            // Stop if trajectory goes below ground level
            if (y >= GAME_CONFIG.groundY - GAME_CONFIG.playerRadius) {
                // Add the ground intersection point
                points.push({ x, y: GAME_CONFIG.groundY - GAME_CONFIG.playerRadius });
                break;
            }

            points.push({ x, y });
        }

        return points;
    }

    drawTrajectory(points) {
        this.trajectoryGraphics.clear();

        if (points.length === 0) return;

        this.trajectoryGraphics.fillStyle(
            GAME_CONFIG.trajectoryColor,
            GAME_CONFIG.trajectoryAlpha
        );

        // Draw dots along trajectory
        for (const point of points) {
            this.trajectoryGraphics.fillCircle(
                point.x,
                point.y,
                GAME_CONFIG.trajectoryDotRadius
            );
        }
    }

    clearTrajectory() {
        this.trajectoryGraphics.clear();
    }

    // ===================
    // Jump System
    // ===================

    jump(pointer) {
        // Only jump if we were aiming
        if (this.playerState !== PlayerState.AIMING) {
            return;
        }

        // Calculate launch velocity
        const velocity = this.getVelocityFromMouse(
            this.player.x,
            this.player.y,
            pointer.x,
            pointer.y
        );

        // Set velocity for manual physics
        this.velocityX = velocity.vx;
        this.velocityY = velocity.vy;

        // Clear trajectory preview
        this.clearTrajectory();

        // Change state
        this.playerState = PlayerState.JUMPING;
    }

    updateJump(dt) {
        // Apply gravity to velocity (in seconds)
        this.velocityY += GAME_CONFIG.gravity * dt;

        // Update position
        this.player.x += this.velocityX * dt;
        this.player.y += this.velocityY * dt;
    }

    // ===================
    // Collision Detection
    // ===================

    checkTargetCollision() {
        // Skip if target already flattened
        if (this.targetState === TargetState.FLATTENED) {
            return;
        }

        // Get bounds
        const playerBounds = this.player.getBounds();
        const targetBounds = this.target.getBounds();

        // Check overlap using Phaser's geometry
        if (Phaser.Geom.Intersects.RectangleToRectangle(playerBounds, targetBounds)) {
            // Optional: Only register hit when falling (velocityY > 0)
            // Removed this restriction to allow hits on upward arc too
            this.flattenTarget();
            this.showFeedback('HIT!', GAME_CONFIG.successColor);
        }
    }

    checkGroundCollision() {
        const groundLevel = GAME_CONFIG.groundY - GAME_CONFIG.playerRadius;

        if (this.player.y >= groundLevel) {
            // Snap to ground
            this.player.y = groundLevel;

            // Stop movement
            this.velocityX = 0;
            this.velocityY = 0;

            // Change state
            this.playerState = PlayerState.LANDED;

            // Show miss if target wasn't hit
            if (this.targetState === TargetState.INTACT) {
                this.showFeedback('MISS', GAME_CONFIG.missColor);
            }
        }
    }

    // ===================
    // Effects & Feedback
    // ===================

    flattenTarget() {
        this.targetState = TargetState.FLATTENED;

        // Resize to flattened dimensions
        this.target.setSize(
            GAME_CONFIG.targetSize,
            GAME_CONFIG.targetFlattenedHeight
        );

        // Adjust position so bottom stays on ground
        this.target.y = GAME_CONFIG.groundY - GAME_CONFIG.targetFlattenedHeight / 2;
    }

    showFeedback(message, color) {
        this.feedbackText.setText(message);
        this.feedbackText.setColor(color);
        this.feedbackText.setAlpha(1);

        // Fade out after duration
        this.tweens.add({
            targets: this.feedbackText,
            alpha: 0,
            duration: 500,
            delay: GAME_CONFIG.feedbackDuration,
            ease: 'Power2'
        });
    }

    // ===================
    // Reset
    // ===================

    reset() {
        // Reset player position and state
        this.player.x = GAME_CONFIG.playerStartX;
        this.player.y = GAME_CONFIG.playerStartY;
        this.playerState = PlayerState.IDLE;
        this.velocityX = 0;
        this.velocityY = 0;

        // Reset target
        this.targetState = TargetState.INTACT;
        this.target.setSize(GAME_CONFIG.targetSize, GAME_CONFIG.targetSize);
        this.target.x = GAME_CONFIG.targetX;
        this.target.y = GAME_CONFIG.targetY;

        // Clear visuals
        this.clearTrajectory();
        this.feedbackText.setAlpha(0);

        // Kill any running tweens on feedback
        this.tweens.killTweensOf(this.feedbackText);
    }
}

// Add scene to config and start game
phaserConfig.scene = [GameScene];
const game = new Phaser.Game(phaserConfig);
