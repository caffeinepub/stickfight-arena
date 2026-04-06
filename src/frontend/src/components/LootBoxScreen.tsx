import { Button } from "@/components/ui/button";
import {
  LOCKABLE_ABILITIES,
  LOCKABLE_HATS,
  LOCKABLE_SHOES,
  getRandomLocked,
} from "@/game/lootbox";
import { playLootBox } from "@/game/sounds";
import type { Hat, Shoe, SpecialAbility } from "@/game/types";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

const HAT_INFO: Record<Hat, { emoji: string; label: string }> = {
  none: { emoji: "—", label: "No Hat" },
  crown: { emoji: "👑", label: "Crown" },
  cap: { emoji: "🧢", label: "Cap" },
  headband: { emoji: "🎽", label: "Headband" },
  wizard: { emoji: "🧙", label: "Wizard Hat" },
  viking: { emoji: "⚔️", label: "Viking Helmet" },
  ninja: { emoji: "🥷", label: "Ninja Mask" },
  cowboy: { emoji: "🤠", label: "Cowboy Hat" },
  party: { emoji: "🎉", label: "Party Hat" },
  bunny: { emoji: "🐰", label: "Bunny Ears" },
  beret: { emoji: "🎩", label: "Beret" },
  topHat: { emoji: "🎩", label: "Top Hat" },
  pirate: { emoji: "🏴‍☠️", label: "Pirate Hat" },
  alien: { emoji: "👽", label: "Alien Head" },
  knight: { emoji: "⚔️", label: "Knight Helm" },
  santa: { emoji: "🎅", label: "Santa Hat" },
  graduation: { emoji: "🎓", label: "Grad Cap" },
  chef: { emoji: "👨‍🍳", label: "Chef Hat" },
  police: { emoji: "👮", label: "Police Cap" },
  detective: { emoji: "🕵️", label: "Detective Hat" },
  horns: { emoji: "😈", label: "Devil Horns" },
  halo: { emoji: "😇", label: "Halo" },
  mushroom: { emoji: "🍄", label: "Mushroom Cap" },
  flower: { emoji: "🌸", label: "Flower Crown" },
  feather: { emoji: "🪶", label: "Feather" },
  mohawk: { emoji: "🤘", label: "Mohawk" },
  bandana: { emoji: "🎗️", label: "Bandana" },
  propeller: { emoji: "🚁", label: "Propeller Hat" },
  football: { emoji: "🏈", label: "Football Helm" },
  baseball: { emoji: "⚾", label: "Baseball Cap" },
  samurai: { emoji: "🗡️", label: "Samurai Helm" },
  pharaoh: { emoji: "👑", label: "Pharaoh Crown" },
  jester: { emoji: "🃏", label: "Jester Hat" },
  robot: { emoji: "🤖", label: "Robot Head" },
  tiara: { emoji: "💎", label: "Tiara" },
  hardhat: { emoji: "👷", label: "Hard Hat" },
  sombrero: { emoji: "🪅", label: "Sombrero" },
  beanie: { emoji: "🧤", label: "Beanie" },
  deerstalker: { emoji: "🔍", label: "Deerstalker" },
  laurel: { emoji: "🌿", label: "Laurel Wreath" },
};

const SHOE_INFO: Record<Shoe, { emoji: string; label: string; desc: string }> =
  {
    none: { emoji: "🦶", label: "Bare Feet", desc: "Going au naturel" },
    sneakers: {
      emoji: "👟",
      label: "Sneakers",
      desc: "Classic white kicks with colored stripe",
    },
    boots: {
      emoji: "👢",
      label: "Boots",
      desc: "Tough dark brown stompers",
    },
    sandals: {
      emoji: "🩴",
      label: "Sandals",
      desc: "Breezy tan sandals",
    },
    cleats: {
      emoji: "⚽",
      label: "Cleats",
      desc: "Grip spikes for extra traction",
    },
    heels: {
      emoji: "👠",
      label: "Heels",
      desc: "Pink stilettos — deadly and fabulous",
    },
    skates: {
      emoji: "⛸️",
      label: "Ice Skates",
      desc: "Blue blades for slippery combat",
    },
    flipFlops: {
      emoji: "🩴",
      label: "Flip Flops",
      desc: "Casual chaos on the battlefield",
    },
    slippers: {
      emoji: "🥿",
      label: "Slippers",
      desc: "Soft comfort fighter footwear",
    },
    rocketBoots: {
      emoji: "🚀",
      label: "Rocket Boots",
      desc: "Orange boots with afterburner flames",
    },
  };

const ABILITY_INFO: Record<
  SpecialAbility,
  { emoji: string; label: string; desc: string }
> = {
  dash: { emoji: "⚡", label: "Dash", desc: "Sprint through enemies" },
  groundSlam: {
    emoji: "💥",
    label: "Ground Slam",
    desc: "Leap and crash down",
  },
  energyBlast: {
    emoji: "🔮",
    label: "Energy Blast",
    desc: "Fire energy projectile",
  },
  teleport: { emoji: "✨", label: "Teleport", desc: "Blink to other side" },
  shield: { emoji: "🛡️", label: "Shield", desc: "Block all damage" },
  speedBoost: {
    emoji: "💨",
    label: "Speed Boost",
    desc: "Double speed for 3s",
  },
  iceFrost: { emoji: "❄️", label: "Ice Frost", desc: "Freeze enemies" },
  fireSpin: {
    emoji: "🔥",
    label: "Fire Spin",
    desc: "Burning flames around you",
  },
  vampireDrain: {
    emoji: "🧙",
    label: "Vampire Drain",
    desc: "Drain HP from enemies",
  },
  rocketLaunch: {
    emoji: "🚀",
    label: "Rocket Launch",
    desc: "Fire a fast rocket",
  },
  lightningBolt: {
    emoji: "⚡",
    label: "Lightning Bolt",
    desc: "Instant lightning hit",
  },
  blackHole: {
    emoji: "🌑",
    label: "Black Hole",
    desc: "Pull enemy toward you",
  },
  clone: { emoji: "👥", label: "Clone", desc: "Decoy explosion on enemy" },
  berserker: { emoji: "🖤", label: "Berserker", desc: "Double damage for 4s" },
  hookShot: { emoji: "⚓", label: "Hook Shot", desc: "Pull enemy toward you" },
  boomerang: { emoji: "🪃", label: "Boomerang", desc: "Returning projectile" },
  poisonCloud: {
    emoji: "☠️",
    label: "Poison Cloud",
    desc: "Poison nearby enemy",
  },
  earthquakeStrike: {
    emoji: "🌍",
    label: "Earthquake",
    desc: "AoE ground shockwave",
  },
  timeSlowdown: {
    emoji: "⏰",
    label: "Time Slowdown",
    desc: "Freeze enemy for 1.5s",
  },
  invisibility: {
    emoji: "👻",
    label: "Invisibility",
    desc: "Invisible + invincible 3s",
  },
  magneticPull: {
    emoji: "🧲",
    label: "Magnetic Pull",
    desc: "Destroy enemy projectiles",
  },
  reflectShield: {
    emoji: "⚡",
    label: "Reflect Shield",
    desc: "Bounce projectiles back",
  },
  spikeWall: { emoji: "🚧", label: "Spike Wall", desc: "Damage nearby enemy" },
  airSlash: {
    emoji: "🌪️",
    label: "Air Slash",
    desc: "Wide-range instant slash",
  },
  healingAura: { emoji: "💚", label: "Healing Aura", desc: "Restore 25 HP" },
  ragePunch: {
    emoji: "👊",
    label: "Rage Punch",
    desc: "Massive close-range punch",
  },
  smokeBomb: { emoji: "💨", label: "Smoke Bomb", desc: "Brief invincibility" },
  grenadeThrow: {
    emoji: "💣",
    label: "Grenade",
    desc: "Arc-projectile explosion",
  },
  shockwave: { emoji: "💥", label: "Shockwave", desc: "Blast enemy back" },
  windBlast: { emoji: "🌬️", label: "Wind Blast", desc: "Push enemy far away" },
  chainLightning: {
    emoji: "⚡",
    label: "Chain Lightning",
    desc: "Big lightning hit",
  },
  iceWall: { emoji: "🧊", label: "Ice Wall", desc: "Freeze enemy for 2s" },
  flameThrow: {
    emoji: "🔥",
    label: "Flame Throw",
    desc: "Fire burst at close range",
  },
  shadowStep: {
    emoji: "🌑",
    label: "Shadow Step",
    desc: "Teleport behind enemy",
  },
  armorBreak: {
    emoji: "🛡️",
    label: "Armor Break",
    desc: "Enemy takes +50% damage",
  },
  vortex: { emoji: "🌀", label: "Vortex", desc: "Spin enemy and deal damage" },
  doubleJump: { emoji: "⬆️", label: "Double Jump", desc: "Instantly jump high" },
  groundSpike: { emoji: "⚡", label: "Ground Spike", desc: "Spike from below" },
  thunderClap: {
    emoji: "🌩️",
    label: "Thunder Clap",
    desc: "Close-range thunder",
  },
  icicleSpear: {
    emoji: "🧸",
    label: "Icicle Spear",
    desc: "Fast spear, freezes on hit",
  },
  laserBeam: { emoji: "🔵", label: "Laser Beam", desc: "Instant-hit laser" },
  explosionRing: {
    emoji: "💥",
    label: "Explosion Ring",
    desc: "Massive AoE explosion",
  },
  energyField: {
    emoji: "⚡",
    label: "Energy Field",
    desc: "Heal self + damage enemy",
  },
  blink: { emoji: "✨", label: "Blink", desc: "Teleport to random spot" },
  combatRoll: { emoji: "🔄", label: "Combat Roll", desc: "Invincible roll" },
  lifesteal: { emoji: "❤️", label: "Lifesteal", desc: "Deal 20 dmg, heal self" },
  powerSlam: { emoji: "⬇️", label: "Power Slam", desc: "Leap and slam forward" },
  sonicBoom: { emoji: "💨", label: "Sonic Boom", desc: "Fast stun projectile" },
  meteorStrike: {
    emoji: "☄️",
    label: "Meteor Strike",
    desc: "40 dmg if enemy is center",
  },
  briefcaseSmash: {
    emoji: "💼",
    label: "Briefcase Smash",
    desc: "Hurl a heavy briefcase that stuns on impact",
  },
};

type BoxType = "clothes" | "ability" | "shoe";

interface LootBoxScreenProps {
  winner: 1 | 2;
  mode: "local" | "ai";
  unlockedHats: Hat[];
  unlockedAbilities: SpecialAbility[];
  unlockedShoes: Shoe[];
  onDone: (
    newHats: Hat[],
    newAbilities: SpecialAbility[],
    newShoes: Shoe[],
  ) => void;
}

export default function LootBoxScreen({
  winner,
  mode,
  unlockedHats,
  unlockedAbilities,
  unlockedShoes,
  onDone,
}: LootBoxScreenProps) {
  const [phase, setPhase] = useState<"choose" | "opening" | "reveal">("choose");
  const [chosenBox, setChosenBox] = useState<BoxType | null>(null);
  const [revealedItem, setRevealedItem] = useState<string | null>(null);
  const [revealedLabel, setRevealedLabel] = useState("");
  const [revealedDesc, setRevealedDesc] = useState("");
  const [newHats, setNewHats] = useState<Hat[]>(unlockedHats);
  const [newAbilities, setNewAbilities] =
    useState<SpecialAbility[]>(unlockedAbilities);
  const [newShoes, setNewShoes] = useState<Shoe[]>(unlockedShoes);

  const winnerColor = winner === 1 ? "#e05050" : "#5080e0";
  const isHumanWinner = !(mode === "ai" && winner === 2);
  const allHatsUnlocked = LOCKABLE_HATS.every((h) => unlockedHats.includes(h));
  const allAbilitiesUnlocked = LOCKABLE_ABILITIES.every((a) =>
    unlockedAbilities.includes(a),
  );
  const allShoesUnlocked = LOCKABLE_SHOES.every((s) =>
    unlockedShoes.includes(s),
  );
  const allUnlocked =
    allHatsUnlocked && allAbilitiesUnlocked && allShoesUnlocked;
  const winnerLabel = mode === "ai" && winner === 2 ? "AI" : `PLAYER ${winner}`;

  const openBox = (type: BoxType) => {
    setChosenBox(type);
    setPhase("opening");
    playLootBox();
    setTimeout(() => {
      if (type === "clothes") {
        const unlocked = getRandomLocked(
          unlockedHats,
          LOCKABLE_HATS,
        ) as Hat | null;
        if (unlocked) {
          setNewHats([...unlockedHats, unlocked]);
          setRevealedItem(HAT_INFO[unlocked].emoji);
          setRevealedLabel(HAT_INFO[unlocked].label);
          setRevealedDesc("New hat unlocked!");
        } else {
          setRevealedItem("🎉");
          setRevealedLabel("Collection Complete!");
          setRevealedDesc("You have all the hats.");
        }
      } else if (type === "ability") {
        const unlocked = getRandomLocked(
          unlockedAbilities,
          LOCKABLE_ABILITIES,
        ) as SpecialAbility | null;
        if (unlocked) {
          setNewAbilities([...unlockedAbilities, unlocked]);
          setRevealedItem(ABILITY_INFO[unlocked].emoji);
          setRevealedLabel(ABILITY_INFO[unlocked].label);
          setRevealedDesc(ABILITY_INFO[unlocked].desc);
        } else {
          setRevealedItem("⚡");
          setRevealedLabel("Collection Complete!");
          setRevealedDesc("You have all the abilities.");
        }
      } else {
        const unlocked = getRandomLocked(
          unlockedShoes,
          LOCKABLE_SHOES,
        ) as Shoe | null;
        if (unlocked) {
          setNewShoes([...unlockedShoes, unlocked]);
          setRevealedItem(SHOE_INFO[unlocked].emoji);
          setRevealedLabel(SHOE_INFO[unlocked].label);
          setRevealedDesc(SHOE_INFO[unlocked].desc);
        } else {
          setRevealedItem("👟");
          setRevealedLabel("Collection Complete!");
          setRevealedDesc("You have all the shoes.");
        }
      }
      setPhase("reveal");
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 40%, ${winnerColor}18 0%, transparent 65%)`,
        }}
      />

      <motion.div
        className="text-center z-10 w-full max-w-lg px-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
      >
        <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Round Over
        </div>
        <h1
          className="text-5xl font-black mb-1"
          style={{
            color: winnerColor,
            textShadow: `0 0 40px ${winnerColor}60`,
          }}
        >
          {winnerLabel} WINS!
        </h1>

        {!isHumanWinner ? (
          <div className="mt-8">
            <p className="text-muted-foreground mb-6">
              The AI wins this round. Keep fighting!
            </p>
            <Button
              className="w-48 h-12 text-lg font-bold"
              style={{ background: "#D8C38A", color: "#1b242a" }}
              onClick={() => onDone(newHats, newAbilities, newShoes)}
            >
              Continue
            </Button>
          </div>
        ) : allUnlocked ? (
          <div className="mt-8">
            <p className="text-yellow-400 font-bold mb-2">
              🏆 Full Collection!
            </p>
            <p className="text-muted-foreground mb-6">
              You have unlocked everything!
            </p>
            <Button
              className="w-48 h-12 text-lg font-bold"
              style={{ background: "#D8C38A", color: "#1b242a" }}
              onClick={() => onDone(newHats, newAbilities, newShoes)}
            >
              Continue
            </Button>
          </div>
        ) : phase === "choose" ? (
          <div className="mt-8">
            <p className="text-muted-foreground mb-6 text-lg font-medium">
              Choose a box to open!
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              {[
                {
                  type: "clothes" as BoxType,
                  emoji: "📦",
                  label: "Clothes Box",
                  sub: "Unlock new hats & styles",
                  done: allHatsUnlocked,
                },
                {
                  type: "shoe" as BoxType,
                  emoji: "👟",
                  label: "Shoe Box",
                  sub: "Unlock new footwear",
                  done: allShoesUnlocked,
                },
                {
                  type: "ability" as BoxType,
                  emoji: "⚡",
                  label: "Ability Box",
                  sub: "Unlock new special moves",
                  done: allAbilitiesUnlocked,
                },
              ].map((box) => (
                <motion.button
                  key={box.type}
                  type="button"
                  className="flex flex-col items-center gap-3 p-5 rounded-xl cursor-pointer"
                  style={{
                    background: box.done
                      ? "rgba(255,255,255,0.02)"
                      : "rgba(255,255,255,0.06)",
                    border: `1.5px solid ${box.done ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.18)"}`,
                    opacity: box.done ? 0.45 : 1,
                    minWidth: 120,
                  }}
                  whileHover={box.done ? {} : { scale: 1.06, y: -4 }}
                  whileTap={box.done ? {} : { scale: 0.97 }}
                  onClick={() => !box.done && openBox(box.type)}
                  disabled={box.done}
                >
                  <motion.div
                    className="text-4xl"
                    animate={box.done ? {} : { rotate: [-3, 3, -3] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  >
                    {box.emoji}
                  </motion.div>
                  <div className="text-sm font-bold text-foreground">
                    {box.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{box.sub}</div>
                  {box.done && (
                    <div className="text-xs text-yellow-400 font-semibold">
                      Complete!
                    </div>
                  )}
                </motion.button>
              ))}
            </div>
            <button
              type="button"
              className="mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => onDone(newHats, newAbilities, newShoes)}
            >
              Skip →
            </button>
          </div>
        ) : phase === "opening" ? (
          <div className="mt-8">
            <p className="text-muted-foreground mb-6">
              Opening{" "}
              {chosenBox === "clothes"
                ? "Clothes Box"
                : chosenBox === "shoe"
                  ? "Shoe Box"
                  : "Ability Box"}
              ...
            </p>
            <div className="flex gap-4 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-20 h-28 rounded-xl flex items-center justify-center text-4xl font-black"
                  style={{
                    background: "rgba(216,195,138,0.08)",
                    border: "1.5px solid rgba(216,195,138,0.3)",
                    color: "rgba(216,195,138,0.6)",
                  }}
                  animate={{ rotateY: [0, 180, 360], scale: [1, 1.1, 1] }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.2,
                    repeat: Number.POSITIVE_INFINITY,
                  }}
                >
                  ?
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              key="reveal"
              className="mt-8"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 14 }}
            >
              <motion.div
                className="text-8xl mb-4"
                animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.6, repeat: 2 }}
              >
                {revealedItem}
              </motion.div>
              <h2
                className="text-2xl font-black mb-1"
                style={{ color: "#D8C38A" }}
              >
                {revealedLabel}
              </h2>
              <p className="text-muted-foreground mb-8">{revealedDesc}</p>
              <Button
                className="w-48 h-12 text-lg font-bold"
                style={{ background: "#D8C38A", color: "#1b242a" }}
                onClick={() => onDone(newHats, newAbilities, newShoes)}
              >
                Continue
              </Button>
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
