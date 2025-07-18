import Phaser from "phaser";
import { GameScene } from "./scenes/GameScene";

const SCALE = 4;
const TILE_SIZE = 16;
const MAP_WIDTH = 10;
const MAP_HEIGHT = 8;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: MAP_WIDTH * TILE_SIZE * SCALE,
  height: MAP_HEIGHT * TILE_SIZE * SCALE,
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
