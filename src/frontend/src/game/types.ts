export type Hat =
  | "none"
  | "crown"
  | "cap"
  | "headband"
  | "wizard"
  | "viking"
  | "ninja"
  | "cowboy"
  | "party"
  | "bunny"
  | "beret"
  | "topHat"
  | "pirate"
  | "alien"
  | "knight"
  | "santa"
  | "graduation"
  | "chef"
  | "police"
  | "detective"
  | "horns"
  | "halo"
  | "mushroom"
  | "flower"
  | "feather"
  | "mohawk"
  | "bandana"
  | "propeller"
  | "football"
  | "baseball"
  | "samurai"
  | "pharaoh"
  | "jester"
  | "robot"
  | "tiara"
  | "hardhat"
  | "sombrero"
  | "beanie"
  | "deerstalker"
  | "laurel";

export type CharacterSkin = "none" | "bizSuit" | "jobApp";

export type Shoe =
  | "none"
  | "sneakers"
  | "boots"
  | "sandals"
  | "cleats"
  | "heels"
  | "skates"
  | "flipFlops"
  | "slippers"
  | "rocketBoots";

export type SpecialAbility =
  | "dash"
  | "groundSlam"
  | "energyBlast"
  | "teleport"
  | "shield"
  | "speedBoost"
  | "iceFrost"
  | "fireSpin"
  | "vampireDrain"
  | "rocketLaunch"
  | "lightningBolt"
  | "blackHole"
  | "clone"
  | "berserker"
  | "hookShot"
  | "boomerang"
  | "poisonCloud"
  | "earthquakeStrike"
  | "timeSlowdown"
  | "invisibility"
  | "magneticPull"
  | "reflectShield"
  | "spikeWall"
  | "airSlash"
  | "healingAura"
  | "ragePunch"
  | "smokeBomb"
  | "grenadeThrow"
  | "shockwave"
  | "windBlast"
  | "chainLightning"
  | "iceWall"
  | "flameThrow"
  | "shadowStep"
  | "armorBreak"
  | "vortex"
  | "doubleJump"
  | "groundSpike"
  | "thunderClap"
  | "icicleSpear"
  | "laserBeam"
  | "explosionRing"
  | "energyField"
  | "blink"
  | "combatRoll"
  | "lifesteal"
  | "powerSlam"
  | "sonicBoom"
  | "meteorStrike"
  | "briefcaseSmash";

export type PlayerColor =
  | "red"
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "cyan";

export const PLAYER_COLOR_HEX: Record<PlayerColor, string> = {
  red: "#e05050",
  blue: "#5080e0",
  green: "#50c850",
  purple: "#a050d0",
  orange: "#e08830",
  cyan: "#30c8d0",
};

export interface PlayerCustomization {
  color: PlayerColor;
  hat: Hat;
  special: SpecialAbility;
  character: CharacterSkin;
  shoe: Shoe;
}

export interface Vec2 {
  x: number;
  y: number;
}

export type AnimationState =
  | "idle"
  | "walk"
  | "jump"
  | "attack"
  | "special"
  | "hurt"
  | "dead"
  | "block"
  | "kick";

export interface AttackHitbox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Player {
  id: 1 | 2;
  pos: Vec2;
  vel: Vec2;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  onGround: boolean;
  animState: AnimationState;
  animTimer: number;
  attackCooldown: number;
  specialCooldown: number;
  customization: PlayerCustomization;
  isAttacking: boolean;
  attackHitbox: AttackHitbox | null;
  isInvincible: boolean;
  invincibleTimer: number;
  isDashing: boolean;
  dashTimer: number;
  isGroundSlamming: boolean;
  groundSlamPhase: "up" | "down" | "none";
  // blocking & kicking
  isBlocking: boolean;
  blockTimer: number;
  isKicking: boolean;
  kickCooldown: number;
  kickHitbox: AttackHitbox | null;
  // status effects
  frozen: boolean;
  frozenTimer: number;
  shielded: boolean;
  shieldTimer: number;
  speedBoosted: boolean;
  speedBoostTimer: number;
  fireSpinActive: boolean;
  fireSpinTimer: number;
  // new status effects
  berserkerActive: boolean;
  berserkerTimer: number;
  invisible: boolean;
  invisibleTimer: number;
  reflected: boolean;
  reflectTimer: number;
  armorBroken: boolean;
  armorBrokenTimer: number;
  poisoned: boolean;
  poisonTimer: number;
  slowed: boolean;
  slowedTimer: number;
}

export interface Projectile {
  x: number;
  y: number;
  vx: number;
  vy: number;
  owner: 1 | 2;
  timer: number;
  active: boolean;
  color: string;
  type?:
    | "energy"
    | "frost"
    | "rocket"
    | "boomerang"
    | "grenade"
    | "sonic"
    | "icicle"
    | "bullet"
    | "spikewall"
    | "briefcase";
  boomerangReturning?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  life: number;
  maxLife: number;
  size: number;
}

export interface HitFlash {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  color: string;
  radius: number;
  type: "punch" | "kick";
}

export interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type GamePhase = "fighting" | "roundEnd" | "gameOver";

export interface GameState {
  players: [Player, Player];
  platforms: Platform[];
  projectiles: Projectile[];
  particles: Particle[];
  hitFlashes: HitFlash[];
  phase: GamePhase;
  round: number;
  maxRounds: number;
  timer: number;
  p1Wins: number;
  p2Wins: number;
  winner: 0 | 1 | 2;
  roundEndTimer: number;
  roundWinner: 0 | 1 | 2;
  bgColor: string;
  // Finisher system
  finisherAvailable: 0 | 1 | 2; // which player can trigger a finisher (0 = none)
  finisherActive: boolean; // is a finisher animation playing
  finisherTimer: number; // counts down from FINISHER_DURATION to 0
  finisherAttacker: 0 | 1 | 2; // who triggered the finisher
}

export interface Controls {
  left: boolean;
  right: boolean;
  jump: boolean;
  attack: boolean;
  special: boolean;
  block: boolean;
  kick: boolean;
}

export type GameMode = "local" | "ai";

export interface MapDefinition {
  id: string;
  name: string;
  emoji: string;
  bgColor: string;
  platforms: Platform[];
}
