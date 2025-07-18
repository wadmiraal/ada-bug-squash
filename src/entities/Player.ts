import Phaser from "phaser";

export class Player extends Phaser.Physics.Arcade.Sprite {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  speed: number;
  jumpVelocity: number;

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
    // Set up simple animation for ada (if multiple frames exist)
    scene.anims.create({
      key: "idle",
      frames: scene.anims.generateFrameNumbers("ada", { start: 0, end: 0 }),
      frameRate: 1,
      repeat: -1,
    });
    this.play("idle");
  }

  update() {
    if (!this.body) return;
    // Horizontal movement
    if (this.cursors.left && this.cursors.left.isDown) {
      this.setVelocityX(-this.speed);
      this.setFlipX(false);
    } else if (this.cursors.right && this.cursors.right.isDown) {
      this.setVelocityX(this.speed);
      this.setFlipX(true);
    } else {
      this.setVelocityX(0);
    }
    // Jump
    if (
      this.cursors.up &&
      this.cursors.up.isDown &&
      (this.body as Phaser.Physics.Arcade.Body).blocked.down
    ) {
      this.setVelocityY(this.jumpVelocity);
    }
  }
}
