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
    this.healthManager.takeDamage(amount);
  }

  update() {
    if (!this.body) return;
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
