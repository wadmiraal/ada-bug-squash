import { beforeEach, describe, expect, it } from "vitest";
import type { CursorsState, PlayerState } from "./Player";
import { updatePlayerMovement } from "./Player";

describe("updatePlayerMovement", () => {
  let state: PlayerState;
  let cursors: CursorsState;

  beforeEach(() => {
    state = {
      velocity: { x: 0, y: 0 },
      speed: 300,
      jumpVelocity: -1000,
      onGround: true,
      facing: "left",
    };
    cursors = {
      left: { isDown: false },
      right: { isDown: false },
      up: { isDown: false },
    };
  });

  it("moves right when right key is pressed", () => {
    cursors.right.isDown = true;
    updatePlayerMovement(state, cursors);
    expect(state.velocity.x).toBe(state.speed);
    expect(state.facing).toBe("right");
  });

  it("moves left when left key is pressed", () => {
    cursors.left.isDown = true;
    updatePlayerMovement(state, cursors);
    expect(state.velocity.x).toBe(-state.speed);
    expect(state.facing).toBe("left");
  });

  it("jumps when up key is pressed and on the ground", () => {
    cursors.up.isDown = true;
    updatePlayerMovement(state, cursors);
    expect(state.velocity.y).toBe(state.jumpVelocity);
  });

  it("does not move when no key is pressed", () => {
    updatePlayerMovement(state, cursors);
    expect(state.velocity.x).toBe(0);
  });
});
