import Phaser from "phaser";
import "./style.css";

const SCALE = 4;
const TILE_SIZE = 16;
const MAP_WIDTH = 10;
const MAP_HEIGHT = 8;

class GameScene extends Phaser.Scene {
  player!: Phaser.Physics.Arcade.Sprite;
  cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  constructor() {
    super("GameScene");
  }

  preload() {
    // Load tilesets and character sprite
    this.load.image("tileset-blocks", "src/assets/tileset-blocks.png");
    this.load.image("tileset-elements", "src/assets/tileset-elements.png");
    this.load.spritesheet("ada", "src/assets/ada.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
  }

  create() {
    // Create a simple tilemap (10x8 tiles, 16x16 each)
    const mapData = [
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 2], // wall, empty, ..., wall
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 2],
      [1, 3, 3, 3, 3, 3, 3, 3, 3, 2], // wall, floor, ..., wall
    ];
    // 0: empty, 1: left wall, 2: right wall, 3: floor
    for (let y = 0; y < mapData.length; y++) {
      for (let x = 0; x < mapData[y].length; x++) {
        const tile = mapData[y][x];
        if (tile === 1) {
          this.add
            .image(
              x * TILE_SIZE * SCALE,
              y * TILE_SIZE * SCALE,
              "tileset-blocks"
            )
            .setFrame(0)
            .setOrigin(0)
            .setScale(SCALE);
        } else if (tile === 2) {
          this.add
            .image(
              x * TILE_SIZE * SCALE,
              y * TILE_SIZE * SCALE,
              "tileset-blocks"
            )
            .setFrame(1)
            .setOrigin(0)
            .setScale(SCALE);
        } else if (tile === 3) {
          this.add
            .image(
              x * TILE_SIZE * SCALE,
              y * TILE_SIZE * SCALE,
              "tileset-blocks"
            )
            .setFrame(2)
            .setOrigin(0)
            .setScale(SCALE);
        }
      }
    }

    // Add the player sprite (ada) at a starting position
    this.player = this.physics.add
      .sprite(48 * SCALE, 48 * SCALE, "ada", 0)
      .setScale(SCALE);
    this.player.setCollideWorldBounds(true);

    // Set up cursor keys
    this.cursors = this.input.keyboard.createCursorKeys();

    // Set up simple animation for ada (if multiple frames exist)
    this.anims.create({
      key: "idle",
      frames: this.anims.generateFrameNumbers("ada", { start: 0, end: 0 }),
      frameRate: 1,
      repeat: -1,
    });
    this.player.play("idle");
  }

  update() {
    if (!this.cursors || !this.player) return;
    if (!this.player.body) return;
    const speed = 300;
    // Horizontal movement
    if (this.cursors && this.cursors.left && this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
      this.player.setFlipX(false); // Face left (default)
    } else if (
      this.cursors &&
      this.cursors.right &&
      this.cursors.right.isDown
    ) {
      this.player.setVelocityX(speed);
      this.player.setFlipX(true); // Face right
    } else {
      this.player.setVelocityX(0);
    }
    // Jump
    if (
      this.cursors &&
      this.cursors.up &&
      this.cursors.up.isDown &&
      (this.player.body as Phaser.Physics.Arcade.Body).blocked.down
    ) {
      this.player.setVelocityY(-1000);
    }
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: MAP_WIDTH * TILE_SIZE * SCALE, // 10 tiles * 16px * 4
  height: MAP_HEIGHT * TILE_SIZE * SCALE, // 8 tiles * 16px * 4
  backgroundColor: "#222",
  parent: "app",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 4000 },
      debug: false,
    },
  },
  scene: GameScene,
};

new Phaser.Game(config);
