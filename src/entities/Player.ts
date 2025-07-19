import Phaser from "phaser";

export interface PlayerState {
  velocity: { x: number; y: number };
  speed: number;
  jumpVelocity: number;
  onGround: boolean;
  facing: "left" | "right";
}

export interface CursorsState {
  left: { isDown: boolean };
  right: { isDown: boolean };
  up: { isDown: boolean };
}

export function updatePlayerMovement(
  state: PlayerState,
  cursors: CursorsState
) {
  // Horizontal movement
  if (cursors.left.isDown) {
    state.velocity.x = -state.speed;
    state.facing = "left";
  } else if (cursors.right.isDown) {
    state.velocity.x = state.speed;
    state.facing = "right";
  } else {
    state.velocity.x = 0;
  }
  // Jump
  if (cursors.up.isDown && state.onGround) {
    state.velocity.y = state.jumpVelocity;
  }
}

export class PlayerHealthManager {
  health: number;
  grace: boolean;
  graceTimeout?: ReturnType<typeof setTimeout>;
  onDeath: () => void;

  constructor(onDeath: () => void, initialHealth = 5) {
    this.health = initialHealth;
    this.grace = false;
    this.onDeath = onDeath;
  }

  takeDamage(amount: number) {
    if (this.grace) return;
    this.health -= amount;
    this.grace = true;
    if (this.graceTimeout) clearTimeout(this.graceTimeout);
    this.graceTimeout = setTimeout(() => {
      this.grace = false;
    }, 5000);
    if (this.health <= 0) {
      this.onDeath();
      this.health = 5;
    }
  }

  reset() {
    this.health = 5;
    this.grace = false;
    if (this.graceTimeout) clearTimeout(this.graceTimeout);
  }
}

export class Player extends Phaser.Physics.Arcade.Sprite {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  speed: number;
  jumpVelocity: number;
  healthManager: PlayerHealthManager;
  blinkTimer?: ReturnType<typeof setInterval>;

  constructor(scene: Phaser.Scene, x: number, y: number, scale: number) {
    super(scene, x, y, "ada", 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(scale);
    this.setCollideWorldBounds(true);
    this.cursors = (scene.input.keyboard ??
      scene.input.keyboard)!.createCursorKeys();
    this.speed = 300;
    this.jumpVelocity = -1000;
    this.healthManager = new PlayerHealthManager(() => {
      alert("You're dead");
    });
    // Set up simple animation for ada (if multiple frames exist)
    scene.anims.create({
      key: "idle",
      frames: scene.anims.generateFrameNumbers("ada", { start: 0, end: 0 }),
      frameRate: 1,
      repeat: -1,
    });
    this.play("idle");
  }

  get health() {
    return this.healthManager.health;
  }

  takeDamage(amount: number) {
    if (this.healthManager.grace) return;
    this.healthManager.takeDamage(amount);
    // Start blinking
    if (this.blinkTimer) clearInterval(this.blinkTimer);
    let visible = true;
    this.blinkTimer = setInterval(() => {
      visible = !visible;
      this.setAlpha(visible ? 1 : 0.7);
      // If grace is over, stop blinking
      if (!this.healthManager.grace) {
        clearInterval(this.blinkTimer!);
        this.setAlpha(1);
      }
    }, 125); // 8 times per second
    // Recoil movement: jump backwards and up
    const recoilSpeed = 600;
    const recoilJump = -450;
    if (this.body) {
      const direction = this.flipX ? -1 : 1; // flipX true = facing right, so go left
      (this.body as Phaser.Physics.Arcade.Body).setVelocityX(
        recoilSpeed * direction
      );
      (this.body as Phaser.Physics.Arcade.Body).setVelocityY(recoilJump);
    }
  }

  update() {
    if (!this.body) return;
    // If grace is over but alpha is not reset, ensure alpha is 1
    if (!this.healthManager.grace && this.alpha !== 1) {
      this.setAlpha(1);
      if (this.blinkTimer) {
        clearInterval(this.blinkTimer);
        this.blinkTimer = undefined;
      }
    }
    const state: PlayerState = {
      velocity: {
        x: (this.body as Phaser.Physics.Arcade.Body).velocity.x,
        y: (this.body as Phaser.Physics.Arcade.Body).velocity.y,
      },
      speed: this.speed,
      jumpVelocity: this.jumpVelocity,
      onGround: (this.body as Phaser.Physics.Arcade.Body).blocked.down,
      facing: this.flipX ? "right" : "left",
    };
    const cursors: CursorsState = {
      left: { isDown: !!this.cursors.left && this.cursors.left.isDown },
      right: { isDown: !!this.cursors.right && this.cursors.right.isDown },
      up: { isDown: !!this.cursors.up && this.cursors.up.isDown },
    };
    updatePlayerMovement(state, cursors);
    this.setVelocityX(state.velocity.x);
    if (
      state.velocity.y !== (this.body as Phaser.Physics.Arcade.Body).velocity.y
    ) {
      this.setVelocityY(state.velocity.y);
    }
    this.setFlipX(state.facing === "right");
  }
}
