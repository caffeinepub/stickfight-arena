import type { Hat, Shoe, SpecialAbility } from "./types";

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

export const BASE_SHOES: Shoe[] = ["none", "sneakers"];
export const LOCKABLE_SHOES: Shoe[] = [
  "boots",
  "sandals",
  "cleats",
  "heels",
  "skates",
  "flipFlops",
  "slippers",
  "rocketBoots",
];

const LS_HATS = "sf_unlocked_hats";
const LS_ABILITIES = "sf_unlocked_abilities";
const LS_SHOES = "sf_unlocked_shoes";

export interface UnlockedItems {
  hats: Hat[];
  abilities: SpecialAbility[];
  shoes: Shoe[];
}

export function loadUnlocked(): UnlockedItems {
  try {
    const hatsRaw = localStorage.getItem(LS_HATS);
    const abilitiesRaw = localStorage.getItem(LS_ABILITIES);
    const shoesRaw = localStorage.getItem(LS_SHOES);
    const hats: Hat[] = hatsRaw ? JSON.parse(hatsRaw) : [...BASE_HATS];
    const abilities: SpecialAbility[] = abilitiesRaw
      ? JSON.parse(abilitiesRaw)
      : [...BASE_ABILITIES];
    const shoes: Shoe[] = shoesRaw ? JSON.parse(shoesRaw) : [...BASE_SHOES];
    for (const h of BASE_HATS) if (!hats.includes(h)) hats.push(h);
    for (const a of BASE_ABILITIES)
      if (!abilities.includes(a)) abilities.push(a);
    for (const s of BASE_SHOES) if (!shoes.includes(s)) shoes.push(s);
    return { hats, abilities, shoes };
  } catch {
    return {
      hats: [...BASE_HATS],
      abilities: [...BASE_ABILITIES],
      shoes: [...BASE_SHOES],
    };
  }
}

export function saveUnlocked(
  hats: Hat[],
  abilities: SpecialAbility[],
  shoes: Shoe[],
): void {
  try {
    localStorage.setItem(LS_HATS, JSON.stringify(hats));
    localStorage.setItem(LS_ABILITIES, JSON.stringify(abilities));
    localStorage.setItem(LS_SHOES, JSON.stringify(shoes));
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
  unlocked: Shoe[],
  lockable: Shoe[],
): Shoe | null;
export function getRandomLocked(
  unlocked: string[],
  lockable: string[],
): string | null {
  const available = lockable.filter((item) => !unlocked.includes(item));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
