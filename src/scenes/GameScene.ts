import Phaser from "phaser";
import { Player } from "../entities/Player";
import { level1 } from "../levels/level1";

const SCALE = 4;
const TILE_SIZE = 16;

export class GameScene extends Phaser.Scene {
  player!: Player;
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
    // Create the tilemap from level1 data
    for (let y = 0; y < level1.length; y++) {
      for (let x = 0; x < level1[y].length; x++) {
        const tile = level1[y][x];
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
    this.player = new Player(this, 48 * SCALE, 48 * SCALE, SCALE);
  }

  update() {
    if (this.player) {
      this.player.update();
    }
  }
}
