import type { Hat, SpecialAbility } from "./types";

export const BASE_HATS: Hat[] = ["none", "crown", "cap", "headband"];
export const LOCKABLE_HATS: Hat[] = [
  "wizard",
  "viking",
  "ninja",
  "cowboy",
  "party",
  "bunny",
  "beret",
  "topHat",
  "pirate",
  "alien",
  "knight",
  "santa",
  "graduation",
  "chef",
  "police",
  "detective",
  "horns",
  "halo",
  "mushroom",
  "flower",
  "feather",
  "mohawk",
  "bandana",
  "propeller",
  "football",
  "baseball",
  "samurai",
  "pharaoh",
  "jester",
  "robot",
  "tiara",
  "hardhat",
  "sombrero",
  "beanie",
  "deerstalker",
  "laurel",
];

export const BASE_ABILITIES: SpecialAbility[] = [
  "dash",
  "groundSlam",
  "energyBlast",
];
export const LOCKABLE_ABILITIES: SpecialAbility[] = [
  "teleport",
  "shield",
  "speedBoost",
  "iceFrost",
  "fireSpin",
  "vampireDrain",
  "rocketLaunch",
  "lightningBolt",
  "blackHole",
  "clone",
  "berserker",
  "hookShot",
  "boomerang",
  "poisonCloud",
  "earthquakeStrike",
  "timeSlowdown",
  "invisibility",
  "magneticPull",
  "reflectShield",
  "spikeWall",
  "airSlash",
  "healingAura",
  "ragePunch",
  "smokeBomb",
  "grenadeThrow",
  "shockwave",
  "windBlast",
  "chainLightning",
  "iceWall",
  "flameThrow",
  "shadowStep",
  "armorBreak",
  "vortex",
  "doubleJump",
  "groundSpike",
  "thunderClap",
  "icicleSpear",
  "laserBeam",
  "explosionRing",
  "energyField",
  "blink",
  "combatRoll",
  "lifesteal",
  "powerSlam",
  "sonicBoom",
  "meteorStrike",
  "briefcaseSmash",
];

const LS_HATS = "sf_unlocked_hats";
const LS_ABILITIES = "sf_unlocked_abilities";

export interface UnlockedItems {
  hats: Hat[];
  abilities: SpecialAbility[];
}

export function loadUnlocked(): UnlockedItems {
  try {
    const hatsRaw = localStorage.getItem(LS_HATS);
    const abilitiesRaw = localStorage.getItem(LS_ABILITIES);
    const hats: Hat[] = hatsRaw ? JSON.parse(hatsRaw) : [...BASE_HATS];
    const abilities: SpecialAbility[] = abilitiesRaw
      ? JSON.parse(abilitiesRaw)
      : [...BASE_ABILITIES];
    for (const h of BASE_HATS) if (!hats.includes(h)) hats.push(h);
    for (const a of BASE_ABILITIES)
      if (!abilities.includes(a)) abilities.push(a);
    return { hats, abilities };
  } catch {
    return { hats: [...BASE_HATS], abilities: [...BASE_ABILITIES] };
  }
}

export function saveUnlocked(hats: Hat[], abilities: SpecialAbility[]): void {
  try {
    localStorage.setItem(LS_HATS, JSON.stringify(hats));
    localStorage.setItem(LS_ABILITIES, JSON.stringify(abilities));
  } catch {
    // ignore storage errors
  }
}

export function getRandomLocked(unlocked: Hat[], lockable: Hat[]): Hat | null;
export function getRandomLocked(
  unlocked: SpecialAbility[],
  lockable: SpecialAbility[],
): SpecialAbility | null;
export function getRandomLocked(
  unlocked: string[],
  lockable: string[],
): string | null {
  const available = lockable.filter((item) => !unlocked.includes(item));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
