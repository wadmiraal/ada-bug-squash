import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { CursorsState, PlayerState } from "./Player";
import { PlayerHealthManager, updatePlayerMovement } from "./Player";

// Pure movement logic tests

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

// Health and grace period logic tests

describe("PlayerHealthManager", () => {
  let healthManager: PlayerHealthManager;
  let onDeath: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onDeath = vi.fn();
    healthManager = new PlayerHealthManager(onDeath, 5);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with 5 health", () => {
    expect(healthManager.health).toBe(5);
  });

  it("takes damage and decreases health", () => {
    healthManager.takeDamage(1);
    expect(healthManager.health).toBe(4);
  });

  it("does not take damage during grace period", () => {
    healthManager.takeDamage(1);
    expect(healthManager.health).toBe(4);
    healthManager.takeDamage(1);
    expect(healthManager.health).toBe(4);
  });

  it("can take damage again after grace period", () => {
    healthManager.takeDamage(1);
    expect(healthManager.health).toBe(4);
    vi.advanceTimersByTime(5000);
    healthManager.takeDamage(1);
    expect(healthManager.health).toBe(3);
  });

  it("resets health and calls onDeath when health reaches 0", () => {
    healthManager.health = 1;
    healthManager.takeDamage(1);
    expect(onDeath).toHaveBeenCalled();
    expect(healthManager.health).toBe(5);
  });

  it("reset() restores health and grace", () => {
    healthManager.takeDamage(1);
    expect(healthManager.health).toBe(4);
    healthManager.reset();
    expect(healthManager.health).toBe(5);
    expect(healthManager.grace).toBe(false);
  });
});
