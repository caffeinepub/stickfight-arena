import { playHit, playJump, playSpecial } from "./sounds";
import type {
  Controls,
  GamePhase,
  GameState,
  Particle,
  Platform,
  Player,
  Projectile,
} from "./types";
import { PLAYER_COLOR_HEX } from "./types";

export const CANVAS_W = 800;
export const CANVAS_H = 450;
const GRAVITY = 0.55;
const MOVE_SPEED = 4.5;
const JUMP_FORCE = -13.5;
const ATTACK_RANGE = 72;
const KICK_DAMAGE = 8;
const KICK_RANGE = 50;
const KICK_DURATION = 0.2;
const KICK_COOLDOWN = 0.35;
const ATTACK_DAMAGE = 12;
const ATTACK_DURATION = 0.25;
const ATTACK_COOLDOWN = 0.5;
const SPECIAL_COOLDOWN = 6;
const DASH_SPEED = 14;
const DASH_DURATION = 0.18;
const ROUND_END_DELAY = 2.5;
const FINISHER_HP_THRESHOLD = 20;
export const FINISHER_DURATION = 3.0;
const PLAYER_W = 20;
const PLAYER_H = 70;

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function spawnParticles(
  particles: Particle[],
  x: number,
  y: number,
  color: string,
  count: number,
  speed = 4,
): void {
  for (let i = 0; i < count; i++) {
    const angle = rand(0, Math.PI * 2);
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * rand(1, speed),
      vy: Math.sin(angle) * rand(1, speed) - rand(1, 3),
      color,
      life: rand(0.4, 0.9),
      maxLife: rand(0.4, 0.9),
      size: rand(2, 6),
    });
  }
}

export function makePlatforms(): Platform[] {
  return [
    { x: 0, y: 405, w: CANVAS_W, h: 45 },
    { x: 60, y: 300, w: 170, h: 14 },
    { x: CANVAS_W - 230, y: 300, w: 170, h: 14 },
    { x: 290, y: 230, w: 220, h: 14 },
  ];
}

function makePlayer(id: 1 | 2, custom: Player["customization"]): Player {
  const x = id === 1 ? 140 : CANVAS_W - 140;
  return {
    id,
    pos: { x, y: 310 },
    vel: { x: 0, y: 0 },
    facing: id === 1 ? 1 : -1,
    hp: 100,
    maxHp: 100,
    onGround: false,
    animState: "idle",
    animTimer: 0,
    attackCooldown: 0,
    specialCooldown: 0,
    customization: custom,
    isAttacking: false,
    attackHitbox: null,
    isInvincible: false,
    invincibleTimer: 0,
    isDashing: false,
    dashTimer: 0,
    isGroundSlamming: false,
    groundSlamPhase: "none",
    isBlocking: false,
    blockTimer: 0,
    isKicking: false,
    kickCooldown: 0,
    kickHitbox: null,
    frozen: false,
    frozenTimer: 0,
    shielded: false,
    shieldTimer: 0,
    speedBoosted: false,
    speedBoostTimer: 0,
    fireSpinActive: false,
    fireSpinTimer: 0,
    berserkerActive: false,
    berserkerTimer: 0,
    invisible: false,
    invisibleTimer: 0,
    reflected: false,
    reflectTimer: 0,
    armorBroken: false,
    armorBrokenTimer: 0,
    poisoned: false,
    poisonTimer: 0,
    slowed: false,
    slowedTimer: 0,
  };
}

export function createGameState(
  p1Custom: Player["customization"],
  p2Custom: Player["customization"],
  initialP1Wins = 0,
  initialP2Wins = 0,
  initialRound = 1,
  platforms?: Platform[],
  bgColor?: string,
): GameState {
  return {
    players: [makePlayer(1, p1Custom), makePlayer(2, p2Custom)],
    platforms: platforms ?? makePlatforms(),
    projectiles: [],
    particles: [],
    phase: "fighting",
    round: initialRound,
    maxRounds: 3,
    timer: 60,
    p1Wins: initialP1Wins,
    p2Wins: initialP2Wins,
    winner: 0,
    roundEndTimer: 0,
    roundWinner: 0,
    bgColor: bgColor ?? "#1a2030",
    finisherAvailable: 0,
    finisherActive: false,
    finisherTimer: 0,
    finisherAttacker: 0,
  };
}

export function resetRound(state: GameState): GameState {
  const [p1, p2] = state.players;
  return {
    ...state,
    players: [makePlayer(1, p1.customization), makePlayer(2, p2.customization)],
    projectiles: [],
    particles: [],
    phase: "fighting",
    timer: 60,
    roundEndTimer: 0,
    roundWinner: 0,
    finisherAvailable: 0,
    finisherActive: false,
    finisherTimer: 0,
    finisherAttacker: 0,
  };
}

function playerRect(p: Player) {
  return {
    x: p.pos.x - PLAYER_W / 2,
    y: p.pos.y - PLAYER_H,
    w: PLAYER_W,
    h: PLAYER_H,
  };
}

function resolvePlayerPlatforms(p: Player, platforms: Platform[]): Player {
  let { x, y } = p.pos;
  let { x: vx, y: vy } = p.vel;
  let onGround = false;

  for (const plat of platforms) {
    const px = x - PLAYER_W / 2;
    const py = y - PLAYER_H;
    const pw = PLAYER_W;
    const ph = PLAYER_H;

    const overlapX = px + pw > plat.x && px < plat.x + plat.w;
    if (!overlapX) continue;

    const prevY = py + ph - vy;
    const topOfPlat = plat.y;
    if (prevY <= topOfPlat && py + ph >= topOfPlat && vy >= 0) {
      y = topOfPlat;
      vy = 0;
      onGround = true;
    }
  }

  if (x < PLAYER_W / 2) {
    x = PLAYER_W / 2;
    vx = 0;
  }
  if (x > CANVAS_W - PLAYER_W / 2) {
    x = CANVAS_W - PLAYER_W / 2;
    vx = 0;
  }
  if (y > CANVAS_H + 100) {
    y = 405;
    vy = 0;
    onGround = true;
  }

  return { ...p, pos: { x, y }, vel: { x: vx, y: vy }, onGround };
}

function dealDamage(
  attacker: Player,
  defender: Player,
  baseDmg: number,
  particles: Particle[],
  knockVx = 0,
  knockVy = -5,
): Player {
  if (defender.isInvincible || defender.shielded) return defender;
  if (defender.isBlocking) {
    const reducedDmg = Math.floor(baseDmg * 0.2);
    spawnParticles(
      particles,
      defender.pos.x,
      defender.pos.y - 40,
      "#80c8ff",
      6,
      3,
    );
    return {
      ...defender,
      hp: Math.max(0, defender.hp - reducedDmg),
    };
  }
  let dmg = baseDmg;
  if (attacker.berserkerActive) dmg *= 2;
  if (defender.armorBroken) dmg *= 1.5;
  const newHp = Math.max(0, defender.hp - dmg);
  spawnParticles(
    particles,
    defender.pos.x,
    defender.pos.y - 40,
    "#ff4444",
    8,
    4,
  );
  return {
    ...defender,
    hp: newHp,
    animState: newHp <= 0 ? "dead" : "hurt",
    animTimer: 0.3,
    isInvincible: true,
    invincibleTimer: 0.4,
    vel: { x: knockVx, y: knockVy },
  };
}

function applyControls(
  p: Player,
  controls: Controls,
  dt: number,
  particles: Particle[],
  projectiles: Projectile[],
  opponent: Player,
): Player {
  let np = { ...p, vel: { ...p.vel }, pos: { ...p.pos } };

  // timers
  if (np.attackCooldown > 0) np.attackCooldown -= dt;
  if (np.specialCooldown > 0) np.specialCooldown -= dt;
  if (np.animTimer > 0) np.animTimer -= dt;
  if (np.invincibleTimer > 0) np.invincibleTimer -= dt;
  if (np.invincibleTimer <= 0) np.isInvincible = false;
  if (np.dashTimer > 0) np.dashTimer -= dt;
  if (np.dashTimer <= 0) np.isDashing = false;
  if (np.frozenTimer > 0) np.frozenTimer -= dt;
  if (np.frozenTimer <= 0) np.frozen = false;
  if (np.shieldTimer > 0) np.shieldTimer -= dt;
  if (np.shieldTimer <= 0) np.shielded = false;
  if (np.speedBoostTimer > 0) np.speedBoostTimer -= dt;
  if (np.speedBoostTimer <= 0) np.speedBoosted = false;
  if (np.fireSpinTimer > 0) np.fireSpinTimer -= dt;
  if (np.fireSpinTimer <= 0) np.fireSpinActive = false;
  if (np.berserkerTimer > 0) np.berserkerTimer -= dt;
  if (np.berserkerTimer <= 0) np.berserkerActive = false;
  if (np.invisibleTimer > 0) np.invisibleTimer -= dt;
  if (np.invisibleTimer <= 0) np.invisible = false;
  if (np.reflectTimer > 0) np.reflectTimer -= dt;
  if (np.reflectTimer <= 0) np.reflected = false;
  if (np.armorBrokenTimer > 0) np.armorBrokenTimer -= dt;
  if (np.armorBrokenTimer <= 0) np.armorBroken = false;
  if (np.poisonTimer > 0) np.poisonTimer -= dt;
  if (np.poisonTimer <= 0) np.poisoned = false;
  if (np.slowedTimer > 0) np.slowedTimer -= dt;
  if (np.slowedTimer <= 0) np.slowed = false;
  if (np.kickCooldown > 0) np.kickCooldown -= dt;
  if (np.blockTimer > 0) np.blockTimer -= dt;
  if (np.blockTimer <= 0 && np.isBlocking && !controls.block)
    np.isBlocking = false;

  // poison damage over time
  if (np.poisoned && !np.isInvincible) {
    np.hp = Math.max(0, np.hp - 12 * dt);
  }

  // frozen: can't move
  if (np.frozen) return np;

  const speed = np.speedBoosted
    ? MOVE_SPEED * 2
    : np.slowed
      ? MOVE_SPEED * 0.35
      : MOVE_SPEED;

  if (np.animState !== "dead" && np.animState !== "hurt") {
    if (!np.isDashing) {
      if (controls.left) {
        np.vel.x = -speed;
        np.facing = -1;
        if (np.onGround) np.animState = "walk";
      } else if (controls.right) {
        np.vel.x = speed;
        np.facing = 1;
        if (np.onGround) np.animState = "walk";
      } else {
        np.vel.x *= 0.75;
        if (np.onGround) np.animState = "idle";
      }
    }

    if (controls.jump && np.onGround) {
      np.vel.y = JUMP_FORCE;
      playJump();
      np.onGround = false;
      np.animState = "jump";
    }
    if (!np.onGround) np.animState = "jump";

    // Blocking
    if (controls.block && !np.isDashing) {
      np.isBlocking = true;
      np.blockTimer = 0.1;
      np.animState = "block";
      np.vel.x *= 0.5;
    } else if (!controls.block && np.blockTimer <= 0) {
      if (np.isBlocking) {
        np.isBlocking = false;
        if (np.animState === "block")
          np.animState = np.onGround ? "idle" : "jump";
      }
    }

    // Kick
    if (
      controls.kick &&
      np.kickCooldown <= 0 &&
      !np.isDashing &&
      !np.isBlocking
    ) {
      np.kickCooldown = KICK_COOLDOWN;
      np.isKicking = true;
      np.animState = "kick";
      np.animTimer = KICK_DURATION;
      np.kickHitbox = {
        x: np.pos.x + np.facing * 15,
        y: np.pos.y - 70 * 0.3,
        w: KICK_RANGE * np.facing,
        h: 35,
      };
      spawnParticles(
        particles,
        np.pos.x + np.facing * 30,
        np.pos.y - 70 * 0.3,
        PLAYER_COLOR_HEX[np.customization.color],
        4,
        3,
      );
    }
    if (np.animTimer <= 0 && np.animState === "kick") {
      np.isKicking = false;
      np.kickHitbox = null;
      np.animState = np.onGround ? "idle" : "jump";
    }

    if (
      controls.attack &&
      np.attackCooldown <= 0 &&
      !np.isDashing &&
      !np.isBlocking
    ) {
      np.attackCooldown = ATTACK_COOLDOWN;
      np.isAttacking = true;
      np.animState = "attack";
      np.animTimer = ATTACK_DURATION;
      np.attackHitbox = {
        x: np.pos.x + np.facing * 20,
        y: np.pos.y - PLAYER_H * 0.6,
        w: ATTACK_RANGE * np.facing,
        h: 40,
      };
      spawnParticles(
        particles,
        np.pos.x + np.facing * 30,
        np.pos.y - PLAYER_H * 0.5,
        PLAYER_COLOR_HEX[np.customization.color],
        5,
        3,
      );
    }

    if (np.animTimer <= 0 && np.animState === "attack") {
      np.isAttacking = false;
      np.attackHitbox = null;
      np.animState = np.onGround ? "idle" : "jump";
    }

    if (controls.special && np.specialCooldown <= 0) {
      np.specialCooldown = SPECIAL_COOLDOWN;
      playSpecial();
      np.animState = "special";
      np.animTimer = 0.5;
      const color = PLAYER_COLOR_HEX[np.customization.color];
      const opp = opponent;
      const dist = Math.abs(np.pos.x - opp.pos.x);

      switch (np.customization.special) {
        case "dash":
          np.isDashing = true;
          np.dashTimer = DASH_DURATION;
          np.vel.x = np.facing * DASH_SPEED;
          np.isInvincible = true;
          np.invincibleTimer = DASH_DURATION + 0.1;
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            color,
            12,
            5,
          );
          break;

        case "groundSlam":
          np.isGroundSlamming = true;
          np.groundSlamPhase = "up";
          np.vel.y = -16;
          np.vel.x = 0;
          break;

        case "energyBlast":
          projectiles.push({
            x: np.pos.x + np.facing * 20,
            y: np.pos.y - PLAYER_H * 0.55,
            vx: np.facing * 10,
            vy: 0,
            owner: np.id,
            timer: 1.8,
            active: true,
            color,
            type: "energy",
          });
          break;

        case "teleport": {
          np.pos.x = CANVAS_W - np.pos.x;
          np.vel.x = 0;
          np.isInvincible = true;
          np.invincibleTimer = 0.5;
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            color,
            16,
            6,
          );
          spawnParticles(
            particles,
            CANVAS_W - np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#ffffff",
            8,
            4,
          );
          break;
        }

        case "shield":
          np.shielded = true;
          np.shieldTimer = 2.5;
          np.isInvincible = true;
          np.invincibleTimer = 2.5;
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#80c8ff",
            14,
            3,
          );
          break;

        case "speedBoost":
          np.speedBoosted = true;
          np.speedBoostTimer = 3.0;
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#ffff40",
            10,
            5,
          );
          break;

        case "iceFrost":
          projectiles.push({
            x: np.pos.x + np.facing * 20,
            y: np.pos.y - PLAYER_H * 0.55,
            vx: np.facing * 6,
            vy: 0,
            owner: np.id,
            timer: 2.5,
            active: true,
            color: "#80d8ff",
            type: "frost",
          });
          break;

        case "fireSpin":
          np.fireSpinActive = true;
          np.fireSpinTimer = 2.0;
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#ff6020",
            16,
            5,
          );
          break;

        case "vampireDrain":
          if (dist < 150 && !opp.isInvincible && opp.hp > 0) {
            spawnParticles(
              particles,
              np.pos.x,
              np.pos.y - PLAYER_H * 0.5,
              "#c020c0",
              12,
              4,
            );
          }
          break;

        // --- NEW ABILITIES ---
        case "rocketLaunch":
          projectiles.push({
            x: np.pos.x + np.facing * 20,
            y: np.pos.y - PLAYER_H * 0.55,
            vx: np.facing * 13,
            vy: -3,
            owner: np.id,
            timer: 1.5,
            active: true,
            color: "#ff8800",
            type: "rocket",
          });
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#ff6600",
            8,
            4,
          );
          break;

        case "lightningBolt":
          if (!opp.isInvincible && !opp.shielded) {
            // instant hit regardless of distance
            spawnParticles(
              particles,
              opp.pos.x,
              opp.pos.y - 40,
              "#ffff00",
              14,
              6,
            );
            spawnParticles(particles, np.pos.x, np.pos.y - 40, "#ffff88", 6, 3);
          }
          break;

        case "blackHole":
          // Pulls opponent toward player (engine handles via returned state)
          spawnParticles(
            particles,
            np.pos.x + np.facing * 80,
            np.pos.y - PLAYER_H / 2,
            "#8800ff",
            20,
            3,
          );
          break;

        case "clone":
          // Explosion at opponent location
          spawnParticles(particles, opp.pos.x, opp.pos.y - 40, color, 18, 5);
          spawnParticles(particles, np.pos.x, np.pos.y - 40, "#ffffff", 10, 4);
          break;

        case "berserker":
          np.berserkerActive = true;
          np.berserkerTimer = 4.0;
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#ff2200",
            20,
            7,
          );
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#ff8800",
            12,
            5,
          );
          break;

        case "hookShot":
          // Pull opponent toward player
          spawnParticles(
            particles,
            (np.pos.x + opp.pos.x) / 2,
            np.pos.y - PLAYER_H / 2,
            "#aaaaaa",
            12,
            4,
          );
          break;

        case "boomerang":
          projectiles.push({
            x: np.pos.x + np.facing * 20,
            y: np.pos.y - PLAYER_H * 0.55,
            vx: np.facing * 8,
            vy: 0,
            owner: np.id,
            timer: 3.0,
            active: true,
            color: "#c8a030",
            type: "boomerang",
            boomerangReturning: false,
          });
          break;

        case "poisonCloud":
          spawnParticles(
            particles,
            np.pos.x + np.facing * 50,
            np.pos.y - PLAYER_H / 2,
            "#40c040",
            20,
            3,
          );
          break;

        case "earthquakeStrike":
          if (np.onGround) {
            spawnParticles(particles, np.pos.x, np.pos.y, "#a06030", 20, 6);
            spawnParticles(particles, np.pos.x - 80, np.pos.y, "#a06030", 8, 3);
            spawnParticles(particles, np.pos.x + 80, np.pos.y, "#a06030", 8, 3);
          }
          break;

        case "timeSlowdown":
          spawnParticles(
            particles,
            opp.pos.x,
            opp.pos.y - 40,
            "#8888ff",
            14,
            3,
          );
          break;

        case "invisibility":
          np.invisible = true;
          np.invisibleTimer = 3.0;
          np.isInvincible = true;
          np.invincibleTimer = 3.0;
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#ffffff",
            12,
            4,
          );
          break;

        case "magneticPull":
          // Pull + clear opponent projectiles
          for (const proj of projectiles) {
            if (proj.owner !== np.id) proj.active = false;
          }
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#8888ff",
            18,
            5,
          );
          break;

        case "reflectShield":
          np.reflected = true;
          np.reflectTimer = 2.0;
          np.isInvincible = true;
          np.invincibleTimer = 2.0;
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#00ffff",
            14,
            3,
          );
          break;

        case "spikeWall":
          spawnParticles(particles, opp.pos.x, opp.pos.y, "#888888", 16, 5);
          break;

        case "airSlash":
          // Wide-range melee
          np.isAttacking = true;
          np.animTimer = ATTACK_DURATION;
          np.attackCooldown = ATTACK_COOLDOWN;
          np.attackHitbox = {
            x: np.pos.x + np.facing * 20,
            y: np.pos.y - PLAYER_H * 0.8,
            w: 120 * np.facing,
            h: 60,
          };
          spawnParticles(
            particles,
            np.pos.x + np.facing * 60,
            np.pos.y - PLAYER_H * 0.5,
            "#ffffff",
            12,
            6,
          );
          break;

        case "healingAura":
          np.hp = Math.min(np.maxHp, np.hp + 25);
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#40ff80",
            16,
            3,
          );
          break;

        case "ragePunch":
          np.isAttacking = true;
          np.animTimer = ATTACK_DURATION;
          np.attackCooldown = ATTACK_COOLDOWN;
          np.attackHitbox = {
            x: np.pos.x + np.facing * 10,
            y: np.pos.y - PLAYER_H * 0.7,
            w: 50 * np.facing,
            h: 50,
          };
          spawnParticles(
            particles,
            np.pos.x + np.facing * 30,
            np.pos.y - PLAYER_H * 0.5,
            "#ff2200",
            14,
            6,
          );
          break;

        case "smokeBomb":
          np.isInvincible = true;
          np.invincibleTimer = 1.0;
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#555555",
            20,
            4,
          );
          spawnParticles(
            particles,
            opp.pos.x,
            opp.pos.y - 40,
            "#555555",
            12,
            3,
          );
          break;

        case "grenadeThrow":
          projectiles.push({
            x: np.pos.x + np.facing * 20,
            y: np.pos.y - PLAYER_H * 0.55,
            vx: np.facing * 7,
            vy: -6,
            owner: np.id,
            timer: 2.0,
            active: true,
            color: "#886600",
            type: "grenade",
          });
          break;

        case "shockwave":
          if (dist < 200 && !opp.isInvincible) {
            spawnParticles(
              particles,
              (np.pos.x + opp.pos.x) / 2,
              np.pos.y - 20,
              "#ffcc00",
              22,
              8,
            );
            spawnParticles(
              particles,
              np.pos.x,
              np.pos.y - 20,
              "#ffaa00",
              12,
              5,
            );
          }
          break;

        case "windBlast":
          spawnParticles(
            particles,
            np.pos.x + np.facing * 50,
            np.pos.y - PLAYER_H / 2,
            "#88ccff",
            16,
            5,
          );
          break;

        case "chainLightning":
          spawnParticles(
            particles,
            opp.pos.x,
            opp.pos.y - 40,
            "#ffff44",
            18,
            6,
          );
          spawnParticles(particles, np.pos.x, np.pos.y - 40, "#ffff88", 8, 3);
          break;

        case "iceWall":
          for (let i = -1; i <= 1; i++) {
            projectiles.push({
              x: np.pos.x + np.facing * 20,
              y: np.pos.y - PLAYER_H * 0.55,
              vx: np.facing * 6,
              vy: i * 3,
              owner: np.id,
              timer: 2.0,
              active: true,
              color: "#aaddff",
              type: "frost",
            });
          }
          break;

        case "flameThrow":
          spawnParticles(
            particles,
            np.pos.x + np.facing * 40,
            np.pos.y - PLAYER_H * 0.5,
            "#ff4400",
            20,
            5,
          );
          spawnParticles(
            particles,
            np.pos.x + np.facing * 70,
            np.pos.y - PLAYER_H * 0.5,
            "#ff8800",
            12,
            4,
          );
          break;

        case "shadowStep": {
          // Teleport behind opponent
          const behindX = opp.pos.x + opp.facing * -60;
          const clampedX = Math.max(30, Math.min(CANVAS_W - 30, behindX));
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#333333",
            12,
            4,
          );
          np.pos.x = clampedX;
          np.vel.x = 0;
          np.isInvincible = true;
          np.invincibleTimer = 0.4;
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#9900cc",
            12,
            4,
          );
          break;
        }

        case "armorBreak":
          spawnParticles(
            particles,
            opp.pos.x,
            opp.pos.y - 40,
            "#ff6600",
            14,
            5,
          );
          break;

        case "vortex":
          if (dist < 200) {
            spawnParticles(
              particles,
              (np.pos.x + opp.pos.x) / 2,
              np.pos.y - PLAYER_H / 2,
              "#cc44ff",
              18,
              5,
            );
          }
          break;

        case "doubleJump":
          np.vel.y = JUMP_FORCE;
          np.onGround = false;
          spawnParticles(particles, np.pos.x, np.pos.y, "#88ffff", 10, 4);
          break;

        case "groundSpike":
          if (opp.onGround) {
            spawnParticles(particles, opp.pos.x, opp.pos.y, "#888888", 14, 5);
          }
          break;

        case "thunderClap":
          if (dist < 150) {
            spawnParticles(
              particles,
              (np.pos.x + opp.pos.x) / 2,
              np.pos.y - PLAYER_H / 2,
              "#ffffaa",
              18,
              7,
            );
          }
          break;

        case "icicleSpear":
          projectiles.push({
            x: np.pos.x + np.facing * 20,
            y: np.pos.y - PLAYER_H * 0.55,
            vx: np.facing * 12,
            vy: 0,
            owner: np.id,
            timer: 1.5,
            active: true,
            color: "#aaddff",
            type: "icicle",
          });
          break;

        case "laserBeam":
          spawnParticles(
            particles,
            np.pos.x + np.facing * 200,
            np.pos.y - PLAYER_H * 0.55,
            "#ff00ff",
            20,
            5,
          );
          spawnParticles(
            particles,
            opp.pos.x,
            opp.pos.y - 40,
            "#ff00ff",
            12,
            5,
          );
          break;

        case "explosionRing":
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#ff6600",
            30,
            8,
          );
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#ffcc00",
            20,
            6,
          );
          break;

        case "energyField":
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#00ffff",
            20,
            7,
          );
          spawnParticles(
            particles,
            np.pos.x,
            np.pos.y - PLAYER_H / 2,
            "#88ffff",
            14,
            4,
          );
          break;

        case "blink": {
          // Teleport to random safe location
          const bx = rand(100, CANVAS_W - 100);
          np.pos.x = bx;
          np.vel.x = 0;
          np.isInvincible = true;
          np.invincibleTimer = 0.5;
          spawnParticles(
            particles,
            bx,
            np.pos.y - PLAYER_H / 2,
            "#ffffff",
            14,
            5,
          );
          break;
        }

        case "combatRoll":
          np.isDashing = true;
          np.dashTimer = DASH_DURATION * 1.5;
          np.vel.x = np.facing * DASH_SPEED * 0.8;
          np.isInvincible = true;
          np.invincibleTimer = DASH_DURATION * 1.5;
          spawnParticles(particles, np.pos.x, np.pos.y, color, 10, 4);
          break;

        case "lifesteal":
          if (!opp.isInvincible && !opp.shielded) {
            const lsDmg = 20;
            np.hp = Math.min(np.maxHp, np.hp + lsDmg);
            spawnParticles(
              particles,
              opp.pos.x,
              opp.pos.y - 40,
              "#ff44aa",
              12,
              4,
            );
            spawnParticles(particles, np.pos.x, np.pos.y - 40, "#ff44aa", 8, 3);
          }
          break;

        case "powerSlam":
          np.isGroundSlamming = true;
          np.groundSlamPhase = "up";
          np.vel.y = -18;
          np.vel.x = np.facing * 3;
          break;

        case "sonicBoom":
          projectiles.push({
            x: np.pos.x + np.facing * 20,
            y: np.pos.y - PLAYER_H * 0.55,
            vx: np.facing * 11,
            vy: 0,
            owner: np.id,
            timer: 1.5,
            active: true,
            color: "#ffffff",
            type: "sonic",
          });
          break;

        case "meteorStrike":
          // Big damage if enemy is center
          if (opp.pos.x > 250 && opp.pos.x < 550) {
            spawnParticles(
              particles,
              opp.pos.x,
              opp.pos.y - 60,
              "#ff4400",
              25,
              8,
            );
            spawnParticles(particles, opp.pos.x, 0, "#ff8800", 15, 5);
          } else {
            spawnParticles(
              particles,
              np.pos.x + np.facing * 100,
              0,
              "#ff4400",
              15,
              5,
            );
          }
          break;

        case "briefcaseSmash":
          // Hurl a briefcase projectile - deals 20 damage and stuns on hit
          projectiles.push({
            x: np.pos.x + np.facing * 24,
            y: np.pos.y - PLAYER_H * 0.5,
            vx: np.facing * 9,
            vy: -1,
            owner: np.id,
            timer: 1.5,
            active: true,
            color: "#8B4513",
            type: "briefcase",
          });
          spawnParticles(
            particles,
            np.pos.x + np.facing * 28,
            np.pos.y - PLAYER_H * 0.5,
            "#a0522d",
            10,
            4,
          );
          break;
      }
    }

    if (np.animTimer <= 0 && np.animState === "special") {
      np.animState = np.onGround ? "idle" : "jump";
    }

    if (np.isGroundSlamming && np.groundSlamPhase === "up" && np.vel.y >= 0) {
      np.groundSlamPhase = "down";
      np.vel.y = 18;
      np.vel.x = 0;
    }
    if (np.isGroundSlamming && np.groundSlamPhase === "down" && np.onGround) {
      np.isGroundSlamming = false;
      np.groundSlamPhase = "none";
      spawnParticles(particles, np.pos.x, np.pos.y, "#ffffff", 20, 6);
    }
  }

  if (!np.onGround) np.vel.y += GRAVITY;
  np.pos.x += np.vel.x;
  np.pos.y += np.vel.y;

  return np;
}

function checkAttackHit(
  attacker: Player,
  defender: Player,
  particles: Particle[],
): [Player, Player] {
  if (
    !attacker.isAttacking ||
    !attacker.attackHitbox ||
    defender.isInvincible ||
    defender.shielded
  ) {
    return [attacker, defender];
  }

  const hb = attacker.attackHitbox;
  const hbX = hb.w > 0 ? hb.x : hb.x + hb.w;
  const hbW = Math.abs(hb.w);

  const dr = playerRect(defender);
  const hit =
    hbX < dr.x + dr.w &&
    hbX + hbW > dr.x &&
    hb.y < dr.y + dr.h &&
    hb.y + hb.h > dr.y;

  if (hit) {
    let dmg = ATTACK_DAMAGE;
    if (attacker.berserkerActive) dmg *= 2;
    if (defender.armorBroken) dmg *= 1.5;
    const newHp = Math.max(0, defender.hp - dmg);
    const newDefender: Player = {
      ...defender,
      hp: newHp,
      animState: newHp <= 0 ? "dead" : "hurt",
      animTimer: 0.3,
      isInvincible: true,
      invincibleTimer: 0.4,
      vel: { x: attacker.facing * 4, y: -4 },
    };
    const newAttacker: Player = {
      ...attacker,
      isAttacking: false,
      attackHitbox: null,
    };
    spawnParticles(
      particles,
      defender.pos.x,
      defender.pos.y - PLAYER_H * 0.5,
      "#ff4444",
      8,
      4,
    );
    playHit();
    return [newAttacker, newDefender];
  }
  return [attacker, defender];
}

function checkGroundSlamHit(
  attacker: Player,
  defender: Player,
  particles: Particle[],
): Player {
  if (!attacker.isGroundSlamming || attacker.groundSlamPhase !== "down")
    return defender;
  const dist = Math.abs(attacker.pos.x - defender.pos.x);
  if (
    dist < 100 &&
    attacker.onGround &&
    !defender.isInvincible &&
    !defender.shielded
  ) {
    let dmg = 20;
    if (attacker.berserkerActive) dmg *= 2;
    if (defender.armorBroken) dmg *= 1.5;
    const newHp = Math.max(0, defender.hp - dmg);
    spawnParticles(
      particles,
      defender.pos.x,
      defender.pos.y - 20,
      "#ff8800",
      12,
      6,
    );
    return {
      ...defender,
      hp: newHp,
      animState: newHp <= 0 ? "dead" : "hurt",
      animTimer: 0.4,
      isInvincible: true,
      invincibleTimer: 0.5,
      vel: { x: (defender.pos.x > attacker.pos.x ? 1 : -1) * 6, y: -8 },
    };
  }
  return defender;
}

function checkFireSpin(
  attacker: Player,
  defender: Player,
  particles: Particle[],
  dt: number,
): Player {
  if (!attacker.fireSpinActive || defender.isInvincible || defender.shielded)
    return defender;
  const dist = Math.sqrt(
    (attacker.pos.x - defender.pos.x) ** 2 +
      (attacker.pos.y - defender.pos.y) ** 2,
  );
  if (dist < 90) {
    const dmg = 20 * dt;
    const newHp = Math.max(0, defender.hp - dmg);
    if (Math.random() < 0.3) {
      spawnParticles(
        particles,
        defender.pos.x,
        defender.pos.y - 30,
        "#ff6020",
        3,
        3,
      );
    }
    return {
      ...defender,
      hp: newHp,
      animState: newHp <= 0 ? "dead" : defender.animState,
    };
  }
  return defender;
}

function applyVampireDrain(
  attacker: Player,
  defender: Player,
  particles: Particle[],
): [Player, Player] {
  if (attacker.customization.special !== "vampireDrain")
    return [attacker, defender];
  if (attacker.animState !== "special" || attacker.animTimer < 0.4)
    return [attacker, defender];
  const dist = Math.abs(attacker.pos.x - defender.pos.x);
  if (
    dist < 150 &&
    !defender.isInvincible &&
    !defender.shielded &&
    defender.hp > 0
  ) {
    const dmg = 15;
    const newDefHp = Math.max(0, defender.hp - dmg);
    const newAttHp = Math.min(attacker.maxHp, attacker.hp + dmg);
    spawnParticles(
      particles,
      defender.pos.x,
      defender.pos.y - 40,
      "#c020c0",
      10,
      4,
    );
    spawnParticles(
      particles,
      attacker.pos.x,
      attacker.pos.y - 40,
      "#ff40ff",
      6,
      2,
    );
    return [
      { ...attacker, hp: newAttHp },
      {
        ...defender,
        hp: newDefHp,
        animState: newDefHp <= 0 ? "dead" : "hurt",
        animTimer: 0.3,
      },
    ];
  }
  return [attacker, defender];
}

// Apply instant-hit abilities that deal damage to opponent
function applyInstantSpecials(
  attacker: Player,
  defender: Player,
  particles: Particle[],
): [Player, Player] {
  if (attacker.animState !== "special" || attacker.animTimer < 0.4)
    return [attacker, defender];

  let att = { ...attacker };
  let def = { ...defender };
  const dist = Math.abs(att.pos.x - def.pos.x);

  switch (att.customization.special) {
    case "lightningBolt":
      if (!def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 20, particles, att.facing * 5, -6);
        def = {
          ...def,
          frozen: true,
          frozenTimer: 0.5,
          isInvincible: true,
          invincibleTimer: 0.5,
        };
      }
      break;
    case "clone":
      if (!def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 10, particles, att.facing * 4, -4);
      }
      break;
    case "hookShot":
      // Pull toward player
      if (!def.isInvincible) {
        const pullDir = att.pos.x < def.pos.x ? -1 : 1;
        def = { ...def, vel: { x: pullDir * 8, y: -3 } };
      }
      break;
    case "poisonCloud":
      if (dist < 120 && !def.isInvincible && !def.shielded) {
        def = { ...def, poisoned: true, poisonTimer: 3.0 };
      }
      break;
    case "earthquakeStrike":
      if (
        att.onGround &&
        def.onGround &&
        dist < 200 &&
        !def.isInvincible &&
        !def.shielded
      ) {
        def = dealDamage(
          att,
          def,
          25,
          particles,
          def.pos.x > att.pos.x ? 6 : -6,
          -5,
        );
      }
      break;
    case "timeSlowdown":
      if (!def.isInvincible) {
        def = { ...def, slowed: true, slowedTimer: 3.0 };
        spawnParticles(particles, def.pos.x, def.pos.y - 40, "#8844ff", 8, 2);
      }
      break;
    case "spikeWall":
      if (dist < 100 && !def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 15, particles, att.facing * 3, -4);
      }
      break;
    case "shockwave":
      if (dist < 200 && !def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 15, particles, att.facing * 14, -7);
      }
      break;
    case "windBlast":
      if (dist < 180 && !def.isInvincible) {
        def = { ...def, vel: { x: att.facing * 12, y: def.vel.y } };
        def = dealDamage(att, def, 5, particles, att.facing * 12, -3);
      }
      break;
    case "chainLightning":
      if (!def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 25, particles, att.facing * 4, -5);
      }
      break;
    case "iceWall":
      if (dist < 150 && !def.isInvincible) {
        def = { ...def, frozen: true, frozenTimer: 2.0 };
      }
      break;
    case "flameThrow":
      if (dist < 130 && !def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 18, particles, att.facing * 4, -4);
      }
      break;
    case "armorBreak":
      if (dist < 180 && !def.isInvincible) {
        def = { ...def, armorBroken: true, armorBrokenTimer: 5.0 };
      }
      break;
    case "vortex":
      if (dist < 200 && !def.isInvincible && !def.shielded) {
        def = dealDamage(
          att,
          def,
          10,
          particles,
          (Math.random() > 0.5 ? 1 : -1) * 6,
          -8,
        );
      }
      break;
    case "groundSpike":
      if (def.onGround && dist < 120 && !def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 20, particles, att.facing * 3, -6);
      }
      break;
    case "thunderClap":
      if (dist < 150 && !def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 18, particles, att.facing * 6, -5);
      }
      break;
    case "laserBeam":
      if (!def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 22, particles, att.facing * 4, -4);
      }
      break;
    case "explosionRing":
      if (dist < 200 && !def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 30, particles, att.facing * 6, -7);
      }
      break;
    case "energyField":
      if (dist < 160 && !def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 20, particles, att.facing * 4, -4);
      }
      break;
    case "lifesteal":
      if (!def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 20, particles, att.facing * 4, -4);
      }
      break;
    case "blackHole":
      if (!def.isInvincible) {
        const bhDir = att.pos.x < def.pos.x ? -1 : 1;
        def = { ...def, vel: { x: bhDir * 6, y: def.vel.y } };
        if (!def.shielded)
          def = dealDamage(att, def, 8, particles, bhDir * 6, -2);
      }
      break;
    case "magneticPull":
      if (dist < 200 && !def.isInvincible) {
        const pullDir = att.pos.x < def.pos.x ? -1 : 1;
        def = { ...def, vel: { x: pullDir * 10, y: def.vel.y } };
        if (dist < 100 && !def.shielded) {
          def = dealDamage(att, def, 15, particles, pullDir * 6, -4);
        }
      }
      break;
    case "berserker":
      if (dist < 80 && !def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 15, particles, att.facing * 5, -5);
      }
      break;
    case "sonicBoom": // handled via projectile
      break;
    case "meteorStrike":
      if (
        def.pos.x > 250 &&
        def.pos.x < 550 &&
        !def.isInvincible &&
        !def.shielded
      ) {
        def = dealDamage(att, def, 40, particles, att.facing * 5, -8);
      }
      break;
    case "powerSlam":
      if (att.isDashing && dist < 50 && !def.isInvincible && !def.shielded) {
        def = dealDamage(att, def, 25, particles, att.facing * 8, -5);
      }
      break;
    case "ragePunch":
      // handled via attack hitbox in applyControls
      break;
  }

  return [att, def];
}

function updateProjectiles(
  projectiles: Projectile[],
  players: [Player, Player],
  particles: Particle[],
  dt: number,
): { projectiles: Projectile[]; players: [Player, Player] } {
  let [p1, p2] = players;
  const updated: Projectile[] = [];

  for (const proj of projectiles) {
    if (!proj.active) continue;
    let np = { ...proj };
    np.x += np.vx;
    np.y += np.vy;
    np.timer -= dt;

    // Boomerang reversal
    if (np.type === "boomerang" && !np.boomerangReturning && np.timer < 1.8) {
      np.boomerangReturning = true;
      np.vx = -np.vx;
    }

    // Grenade gravity
    if (np.type === "grenade") {
      np.vy += 0.4;
    }

    if (np.timer <= 0 || np.x < 0 || np.x > CANVAS_W) {
      // Grenade explodes
      if (np.type === "grenade") {
        spawnParticles(particles, np.x, np.y, "#ff8800", 16, 6);
      }
      np.active = false;
      continue;
    }

    const targets: Player[] = np.owner === 1 ? [p2] : [p1];
    let hit = false;
    for (const t of targets) {
      if (t.isInvincible) continue;
      // Reflect projectiles back
      if (t.reflected) {
        np.vx = -np.vx;
        np.owner = t.id === 1 ? 2 : 1;
        spawnParticles(particles, np.x, np.y, "#00ffff", 8, 4);
        hit = false;
        break;
      }
      if (t.shielded) {
        np.active = false;
        spawnParticles(particles, np.x, np.y, "#80c8ff", 8, 4);
        hit = true;
        break;
      }
      const dr = playerRect(t);
      if (
        np.x > dr.x &&
        np.x < dr.x + dr.w &&
        np.y > dr.y &&
        np.y < dr.y + dr.h
      ) {
        let updatedTarget: Player;
        if (np.type === "frost" || np.type === "icicle") {
          updatedTarget = {
            ...t,
            frozen: true,
            frozenTimer: np.type === "icicle" ? 1.2 : 1.5,
            isInvincible: true,
            invincibleTimer: np.type === "icicle" ? 1.2 : 1.5,
          };
          spawnParticles(particles, np.x, np.y, "#80d8ff", 12, 3);
        } else if (np.type === "sonic") {
          const newHp = Math.max(0, t.hp - 15);
          updatedTarget = {
            ...t,
            hp: newHp,
            animState: newHp <= 0 ? "dead" : "hurt",
            animTimer: 0.3,
            frozen: true,
            frozenTimer: 0.8,
            isInvincible: true,
            invincibleTimer: 0.8,
            vel: { x: np.vx * 0.3, y: -5 },
          };
          spawnParticles(particles, np.x, np.y, "#ffffff", 12, 5);
        } else if (np.type === "grenade") {
          const newHp = Math.max(0, t.hp - 25);
          updatedTarget = {
            ...t,
            hp: newHp,
            animState: newHp <= 0 ? "dead" : "hurt",
            animTimer: 0.4,
            isInvincible: true,
            invincibleTimer: 0.5,
            vel: { x: np.vx * 0.5, y: -8 },
          };
          spawnParticles(particles, np.x, np.y, "#ff8800", 20, 7);
        } else if (np.type === "briefcase") {
          const newHp = Math.max(0, t.hp - 20);
          updatedTarget = {
            ...t,
            hp: newHp,
            animState: newHp <= 0 ? "dead" : "hurt",
            animTimer: 0.4,
            isInvincible: true,
            invincibleTimer: 0.5,
            frozen: true,
            frozenTimer: 0.8,
            vel: { x: np.vx * 0.2, y: -5 },
          };
          spawnParticles(particles, np.x, np.y, "#8B4513", 14, 5);
        } else if (np.type === "bullet") {
          const newHp = Math.max(0, t.hp - 20);
          updatedTarget = {
            ...t,
            hp: newHp,
            animState: newHp <= 0 ? "dead" : "hurt",
            animTimer: 0.25,
            isInvincible: true,
            invincibleTimer: 0.3,
            vel: { x: np.vx * 0.15, y: -3 },
          };
          spawnParticles(particles, np.x, np.y, "#ffcc00", 8, 3);
        } else {
          const newHp = Math.max(0, t.hp - 18);
          updatedTarget = {
            ...t,
            hp: newHp,
            animState: newHp <= 0 ? "dead" : "hurt",
            animTimer: 0.3,
            isInvincible: true,
            invincibleTimer: 0.4,
            vel: { x: np.vx * 0.3, y: -5 },
          };
          spawnParticles(particles, np.x, np.y, np.color, 10, 5);
        }
        if (np.owner === 1) p2 = updatedTarget;
        else p1 = updatedTarget;
        hit = true;
        np.active = false;
        break;
      }
    }
    if (!hit) updated.push(np);
  }

  return { projectiles: updated, players: [p1, p2] };
}

function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      vy: p.vy + 0.15,
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0);
}

export function triggerFinisher(
  state: GameState,
  attackerPlayer: 1 | 2,
): GameState {
  if (!state.finisherAvailable || state.finisherActive) return state;
  if (state.finisherAvailable !== attackerPlayer) return state;
  return {
    ...state,
    finisherActive: true,
    finisherTimer: FINISHER_DURATION,
    finisherAttacker: attackerPlayer,
    finisherAvailable: 0,
  };
}

export function updateGame(
  state: GameState,
  p1Controls: Controls,
  p2Controls: Controls,
  dt: number,
): GameState {
  // Handle finisher animation
  if (state.finisherActive) {
    const newFinisherTimer = state.finisherTimer - dt;
    const particles = updateParticles([...state.particles], dt);
    if (newFinisherTimer <= 0) {
      // Kill victim and trigger round end
      const attackerIdx = (state.finisherAttacker as number) - 1;
      const victimIdx = attackerIdx === 0 ? 1 : 0;
      const updatedPlayers = [...state.players] as [
        (typeof state.players)[0],
        (typeof state.players)[1],
      ];
      updatedPlayers[victimIdx] = {
        ...updatedPlayers[victimIdx],
        hp: 0,
        animState: "dead",
      };
      const roundWinner = state.finisherAttacker as 0 | 1 | 2;
      const p1Wins = roundWinner === 1 ? state.p1Wins + 1 : state.p1Wins;
      const p2Wins = roundWinner === 2 ? state.p2Wins + 1 : state.p2Wins;
      spawnParticles(particles, CANVAS_W / 2, CANVAS_H / 2, "#D8C38A", 30, 8);
      return {
        ...state,
        players: updatedPlayers,
        particles,
        finisherActive: false,
        finisherTimer: 0,
        phase: "roundEnd",
        roundWinner,
        p1Wins,
        p2Wins,
        roundEndTimer: ROUND_END_DELAY,
      };
    }
    return { ...state, finisherTimer: newFinisherTimer, particles };
  }

  if (state.phase !== "fighting") {
    if (state.phase === "roundEnd") {
      const newTimer = state.roundEndTimer - dt;
      if (newTimer <= 0) {
        const nextRound = state.round + 1;

        if (nextRound > state.maxRounds) {
          const overall =
            state.p1Wins > state.p2Wins
              ? 1
              : state.p2Wins > state.p1Wins
                ? 2
                : 0;
          return { ...state, phase: "gameOver", winner: overall as 0 | 1 | 2 };
        }
        const fresh = resetRound(state);
        return { ...fresh, round: nextRound };
      }
      return { ...state, roundEndTimer: newTimer };
    }
    return state;
  }

  const particles = [...state.particles];
  const projectiles = [...state.projectiles];
  let [p1, p2] = state.players;

  p1 = applyControls(p1, p1Controls, dt, particles, projectiles, p2);
  p2 = applyControls(p2, p2Controls, dt, particles, projectiles, p1);

  p1 = resolvePlayerPlatforms(p1, state.platforms);
  p2 = resolvePlayerPlatforms(p2, state.platforms);

  if (
    p1.animState !== "attack" &&
    p1.animState !== "special" &&
    p1.animState !== "block" &&
    p1.animState !== "kick" &&
    !p1.isDashing
  ) {
    p1 = { ...p1, facing: p1.pos.x < p2.pos.x ? 1 : -1 };
  }
  if (
    p2.animState !== "attack" &&
    p2.animState !== "special" &&
    p2.animState !== "block" &&
    p2.animState !== "kick" &&
    !p2.isDashing
  ) {
    p2 = { ...p2, facing: p2.pos.x < p1.pos.x ? 1 : -1 };
  }

  // attack hits
  let [np1, np2] = checkAttackHit(p1, p2, particles);
  [np2, np1] = checkAttackHit(np2, np1, particles);
  p1 = np1;
  p2 = np2;

  // kick hits
  if (p1.isKicking && p1.kickHitbox) {
    const hb = p1.kickHitbox;
    const hbX = hb.w > 0 ? hb.x : hb.x + hb.w;
    const hbW = Math.abs(hb.w);
    const r2 = { x: p2.pos.x - 10, y: p2.pos.y - 70, w: 20, h: 70 };
    if (
      hbX < r2.x + r2.w &&
      hbX + hbW > r2.x &&
      hb.y < r2.y + r2.h &&
      hb.y + hb.h > r2.y
    ) {
      p2 = dealDamage(p1, p2, KICK_DAMAGE, particles, p1.facing * 5, -10);
      p1 = { ...p1, isKicking: false, kickHitbox: null };
      playHit();
    }
  }
  if (p2.isKicking && p2.kickHitbox) {
    const hb = p2.kickHitbox;
    const hbX = hb.w > 0 ? hb.x : hb.x + hb.w;
    const hbW = Math.abs(hb.w);
    const r1 = { x: p1.pos.x - 10, y: p1.pos.y - 70, w: 20, h: 70 };
    if (
      hbX < r1.x + r1.w &&
      hbX + hbW > r1.x &&
      hb.y < r1.y + r1.h &&
      hb.y + hb.h > r1.y
    ) {
      p1 = dealDamage(p2, p1, KICK_DAMAGE, particles, p2.facing * 5, -10);
      p2 = { ...p2, isKicking: false, kickHitbox: null };
      playHit();
    }
  }

  // ground slam
  p2 = checkGroundSlamHit(p1, p2, particles);
  p1 = checkGroundSlamHit(p2, p1, particles);

  // fire spin
  p2 = checkFireSpin(p1, p2, particles, dt);
  p1 = checkFireSpin(p2, p1, particles, dt);

  // vampire drain
  [p1, p2] = applyVampireDrain(p1, p2, particles);
  [p2, p1] = applyVampireDrain(p2, p1, particles);

  // instant special abilities
  [p1, p2] = applyInstantSpecials(p1, p2, particles);
  [p2, p1] = applyInstantSpecials(p2, p1, particles);

  // projectiles
  const projResult = updateProjectiles(projectiles, [p1, p2], particles, dt);
  p1 = projResult.players[0];
  p2 = projResult.players[1];

  const updatedParticles = updateParticles(particles, dt);

  let timer = state.timer - dt;
  let phase: GamePhase = state.phase;
  let roundWinner: 0 | 1 | 2 = 0;
  let p1Wins = state.p1Wins;
  let p2Wins = state.p2Wins;
  let roundEndTimer = state.roundEndTimer;

  if (p1.hp <= 0 || p2.hp <= 0 || timer <= 0) {
    timer = Math.max(0, timer);
    if (p1.hp <= 0 && p2.hp <= 0) roundWinner = 0;
    else if (p2.hp <= 0) roundWinner = 1;
    else if (p1.hp <= 0) roundWinner = 2;
    else roundWinner = p1.hp >= p2.hp ? 1 : 2;
    if (roundWinner === 1) p1Wins++;
    else if (roundWinner === 2) p2Wins++;
    phase = "roundEnd";
    roundEndTimer = ROUND_END_DELAY;
    spawnParticles(
      updatedParticles,
      CANVAS_W / 2,
      CANVAS_H / 2,
      "#D8C38A",
      30,
      8,
    );
  }

  if (p1.animTimer <= 0 && p1.animState === "hurt") {
    p1 = {
      ...p1,
      animState: p1.hp <= 0 ? "dead" : p1.onGround ? "idle" : "jump",
    };
  }
  if (p2.animTimer <= 0 && p2.animState === "hurt") {
    p2 = {
      ...p2,
      animState: p2.hp <= 0 ? "dead" : p2.onGround ? "idle" : "jump",
    };
  }

  // Detect finisher availability: one player is very low, other is alive
  let finisherAvailable: 0 | 1 | 2 = 0;
  if (!state.finisherActive) {
    if (
      p2.hp > 0 &&
      p2.hp <= FINISHER_HP_THRESHOLD &&
      p1.hp > FINISHER_HP_THRESHOLD
    ) {
      finisherAvailable = 1;
      // Keep victim alive at 1hp until finisher window expires
      if (p2.hp < 1) p2 = { ...p2, hp: 1 };
    } else if (
      p1.hp > 0 &&
      p1.hp <= FINISHER_HP_THRESHOLD &&
      p2.hp > FINISHER_HP_THRESHOLD
    ) {
      finisherAvailable = 2;
      if (p1.hp < 1) p1 = { ...p1, hp: 1 };
    }
  }

  return {
    ...state,
    players: [p1, p2],
    projectiles: projResult.projectiles,
    particles: updatedParticles,
    timer,
    phase,
    p1Wins,
    p2Wins,
    roundWinner,
    roundEndTimer,
    finisherAvailable,
    finisherActive: state.finisherActive,
    finisherTimer: state.finisherTimer,
    finisherAttacker: state.finisherAttacker,
  };
}
