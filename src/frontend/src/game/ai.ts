import type { Controls, GameState } from "./types";

type AIState = "pursue" | "attack" | "retreat" | "dodge" | "jump_attack";

interface AIBrain {
  state: AIState;
  stateTimer: number;
  reactionTimer: number;
  thinkTimer: number;
}

const brains = new WeakMap<object, AIBrain>();
let brainKey: object = {};

export function resetAI() {
  brainKey = {};
  brains.set(brainKey, makeBrain());
}

function makeBrain(): AIBrain {
  return {
    state: "pursue",
    stateTimer: 0,
    reactionTimer: 0.15,
    thinkTimer: 0,
  };
}

function getBrain(): AIBrain {
  if (!brains.has(brainKey)) {
    brains.set(brainKey, makeBrain());
  }
  return brains.get(brainKey)!;
}

export function computeAIControls(state: GameState, dt: number): Controls {
  const brain = getBrain();
  const ai = state.players[1]; // P2 is AI
  const player = state.players[0]; // P1 is human

  const controls: Controls = {
    left: false,
    right: false,
    jump: false,
    attack: false,
    special: false,
    block: false,
    kick: false,
  };

  if (ai.animState === "dead" || state.phase !== "fighting") {
    return controls;
  }

  brain.reactionTimer -= dt;
  brain.thinkTimer -= dt;
  brain.stateTimer -= dt;

  if (brain.reactionTimer > 0) {
    return controls;
  }

  const dx = player.pos.x - ai.pos.x;
  const dy = player.pos.y - ai.pos.y;
  const dist = Math.abs(dx);
  const hpRatio = ai.hp / ai.maxHp;

  // AI block: if opponent is attacking and close, ~30% chance per reaction tick
  if (
    (player.isAttacking || player.isKicking) &&
    dist < 100 &&
    !ai.isBlocking &&
    Math.random() < 0.3
  ) {
    controls.block = true;
  }

  // State machine transition
  if (brain.thinkTimer <= 0) {
    brain.thinkTimer = 0.3 + Math.random() * 0.3;

    const prevState = brain.state;
    if (hpRatio < 0.25 && Math.random() < 0.6) {
      brain.state = "retreat";
    } else if (dist < 80 && player.isAttacking && Math.random() < 0.55) {
      brain.state = "dodge";
      brain.stateTimer = 0.4;
    } else if (dist < 90 && Math.random() < 0.7) {
      brain.state = Math.random() < 0.4 ? "jump_attack" : "attack";
    } else {
      brain.state = "pursue";
    }
    if (prevState !== brain.state) {
      brain.stateTimer = 0.5 + Math.random() * 0.5;
    }
  }

  switch (brain.state) {
    case "pursue": {
      // Move toward player, prefer center platforms
      if (dx > 10) controls.right = true;
      else if (dx < -10) controls.left = true;
      // jump if player is above
      if (dy < -60 && ai.onGround && Math.random() < 0.4) controls.jump = true;
      // jump onto platform
      if (!ai.onGround && Math.abs(dy) > 50 && Math.random() < 0.1)
        controls.jump = true;
      break;
    }
    case "attack": {
      if (dist < 90) {
        controls.attack = Math.random() < 0.5;
        // Use kick occasionally when close
        if (dist < 70 && ai.kickCooldown <= 0 && Math.random() < 0.25) {
          controls.kick = true;
          controls.attack = false;
        }
        if (ai.specialCooldown <= 0 && Math.random() < 0.3)
          controls.special = true;
      } else {
        brain.state = "pursue";
      }
      // close gap
      if (dist > 50) {
        if (dx > 0) controls.right = true;
        else controls.left = true;
      }
      break;
    }
    case "jump_attack": {
      if (ai.onGround && Math.random() < 0.6) controls.jump = true;
      if (dx > 0) controls.right = true;
      else controls.left = true;
      if (dist < 100) controls.attack = Math.random() < 0.4;
      // Kick when airborne and close
      if (
        !ai.onGround &&
        dist < 80 &&
        ai.kickCooldown <= 0 &&
        Math.random() < 0.2
      ) {
        controls.kick = true;
        controls.attack = false;
      }
      break;
    }
    case "retreat": {
      // Move away from player
      if (dx > 0) controls.left = true;
      else controls.right = true;
      // don't retreat off edge
      if (ai.pos.x < 80) controls.right = true;
      if (ai.pos.x > 720) controls.left = true;
      // heal time - use special defensively
      if (ai.specialCooldown <= 0 && Math.random() < 0.15)
        controls.special = true;
      break;
    }
    case "dodge": {
      if (brain.stateTimer > 0) {
        // Jump away
        if (ai.onGround) controls.jump = true;
        if (dx > 0) controls.left = true;
        else controls.right = true;
      } else {
        brain.state = "pursue";
      }
      break;
    }
  }

  // Don't block and attack/kick simultaneously
  if (controls.block) {
    controls.attack = false;
    controls.kick = false;
  }

  // Reaction delay randomness
  brain.reactionTimer = 0.05 + Math.random() * 0.1;

  return controls;
}
