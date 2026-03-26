import { Button } from "@/components/ui/button";
import type {
  CharacterSkin,
  GameMode,
  Hat,
  PlayerColor,
  PlayerCustomization,
  SpecialAbility,
} from "@/game/types";
import { PLAYER_COLOR_HEX } from "@/game/types";
import { motion } from "motion/react";
import { useState } from "react";

interface CustomizeScreenProps {
  mode: GameMode;
  unlockedHats: Hat[];
  unlockedAbilities: SpecialAbility[];
  onReady: (p1: PlayerCustomization, p2: PlayerCustomization) => void;
  onBack: () => void;
}

const COLORS: PlayerColor[] = [
  "red",
  "blue",
  "green",
  "purple",
  "orange",
  "cyan",
];

const ALL_HATS: { id: Hat; label: string; emoji: string }[] = [
  { id: "none", label: "None", emoji: "—" },
  { id: "crown", label: "Crown", emoji: "👑" },
  { id: "cap", label: "Cap", emoji: "🧢" },
  { id: "headband", label: "Headband", emoji: "🎽" },
  { id: "wizard", label: "Wizard", emoji: "🧙" },
  { id: "viking", label: "Viking", emoji: "⚔️" },
  { id: "ninja", label: "Ninja", emoji: "🥷" },
  { id: "cowboy", label: "Cowboy", emoji: "🤠" },
  { id: "party", label: "Party", emoji: "🎉" },
  { id: "bunny", label: "Bunny", emoji: "🐰" },
  { id: "beret", label: "Beret", emoji: "🎩" },
  { id: "topHat", label: "Top Hat", emoji: "🎩" },
  { id: "pirate", label: "Pirate", emoji: "🏴‍☠️" },
  { id: "alien", label: "Alien", emoji: "👽" },
  { id: "knight", label: "Knight", emoji: "⚔️" },
  { id: "santa", label: "Santa", emoji: "🎅" },
  { id: "graduation", label: "Grad Cap", emoji: "🎓" },
  { id: "chef", label: "Chef", emoji: "👨‍🍳" },
  { id: "police", label: "Police", emoji: "👮" },
  { id: "detective", label: "Detective", emoji: "🕵️" },
  { id: "horns", label: "Horns", emoji: "😈" },
  { id: "halo", label: "Halo", emoji: "😇" },
  { id: "mushroom", label: "Mushroom", emoji: "🍄" },
  { id: "flower", label: "Flower", emoji: "🌸" },
  { id: "feather", label: "Feather", emoji: "🪶" },
  { id: "mohawk", label: "Mohawk", emoji: "🤘" },
  { id: "bandana", label: "Bandana", emoji: "🎗️" },
  { id: "propeller", label: "Propeller", emoji: "🚁" },
  { id: "football", label: "Football", emoji: "🏈" },
  { id: "baseball", label: "Baseball", emoji: "⚾" },
  { id: "samurai", label: "Samurai", emoji: "🗡️" },
  { id: "pharaoh", label: "Pharaoh", emoji: "👑" },
  { id: "jester", label: "Jester", emoji: "🃏" },
  { id: "robot", label: "Robot", emoji: "🤖" },
  { id: "tiara", label: "Tiara", emoji: "💎" },
  { id: "hardhat", label: "Hard Hat", emoji: "👷" },
  { id: "sombrero", label: "Sombrero", emoji: "🪅" },
  { id: "beanie", label: "Beanie", emoji: "🧤" },
  { id: "deerstalker", label: "Deerstalker", emoji: "🔍" },
  { id: "laurel", label: "Laurel", emoji: "🌿" },
];

const ALL_SPECIALS: {
  id: SpecialAbility;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  {
    id: "dash",
    label: "Dash",
    desc: "Sprint through enemies with invincibility",
    emoji: "⚡",
  },
  {
    id: "groundSlam",
    label: "Ground Slam",
    desc: "Leap and crash down dealing AoE damage",
    emoji: "💥",
  },
  {
    id: "energyBlast",
    label: "Energy Blast",
    desc: "Fire a powerful energy projectile",
    emoji: "🔮",
  },
  {
    id: "teleport",
    label: "Teleport",
    desc: "Blink to the other side of the arena",
    emoji: "✨",
  },
  {
    id: "shield",
    label: "Shield",
    desc: "Block all damage and deflect projectiles",
    emoji: "🛡️",
  },
  {
    id: "speedBoost",
    label: "Speed Boost",
    desc: "Double movement speed for 3 seconds",
    emoji: "💨",
  },
  {
    id: "iceFrost",
    label: "Ice Frost",
    desc: "Fire a frost bolt that freezes enemies",
    emoji: "❄️",
  },
  {
    id: "fireSpin",
    label: "Fire Spin",
    desc: "Surround yourself with burning flames",
    emoji: "🔥",
  },
  {
    id: "vampireDrain",
    label: "Vampire Drain",
    desc: "Drain HP from nearby enemies",
    emoji: "🧙",
  },
  {
    id: "rocketLaunch",
    label: "Rocket Launch",
    desc: "Fire a fast angled rocket",
    emoji: "🚀",
  },
  {
    id: "lightningBolt",
    label: "Lightning Bolt",
    desc: "Instant lightning hit + brief stun",
    emoji: "⚡",
  },
  {
    id: "blackHole",
    label: "Black Hole",
    desc: "Pull enemy toward you and deal damage",
    emoji: "🌑",
  },
  {
    id: "clone",
    label: "Clone",
    desc: "Summon a decoy explosion on the enemy",
    emoji: "👥",
  },
  {
    id: "berserker",
    label: "Berserker",
    desc: "Double all damage for 4 seconds",
    emoji: "🖤",
  },
  {
    id: "hookShot",
    label: "Hook Shot",
    desc: "Pull the enemy toward you",
    emoji: "⚓",
  },
  {
    id: "boomerang",
    label: "Boomerang",
    desc: "Throw a projectile that returns",
    emoji: "🪃",
  },
  {
    id: "poisonCloud",
    label: "Poison Cloud",
    desc: "Poison nearby enemy for 3 seconds",
    emoji: "☠️",
  },
  {
    id: "earthquakeStrike",
    label: "Earthquake",
    desc: "AoE shockwave if both on ground",
    emoji: "🌍",
  },
  {
    id: "timeSlowdown",
    label: "Time Slowdown",
    desc: "Freeze enemy for 1.5 seconds",
    emoji: "⏰",
  },
  {
    id: "invisibility",
    label: "Invisibility",
    desc: "Become invisible and invincible for 3s",
    emoji: "👻",
  },
  {
    id: "magneticPull",
    label: "Magnetic Pull",
    desc: "Destroy enemy projectiles",
    emoji: "🧲",
  },
  {
    id: "reflectShield",
    label: "Reflect Shield",
    desc: "Bounce projectiles back for 2s",
    emoji: "⚡",
  },
  {
    id: "spikeWall",
    label: "Spike Wall",
    desc: "Damage enemy if they're close",
    emoji: "🚧",
  },
  {
    id: "airSlash",
    label: "Air Slash",
    desc: "Wide-range instant slash attack",
    emoji: "🌪️",
  },
  {
    id: "healingAura",
    label: "Healing Aura",
    desc: "Restore 25 HP instantly",
    emoji: "💚",
  },
  {
    id: "ragePunch",
    label: "Rage Punch",
    desc: "Massive close-range punch",
    emoji: "👊",
  },
  {
    id: "smokeBomb",
    label: "Smoke Bomb",
    desc: "Become briefly invincible",
    emoji: "💨",
  },
  {
    id: "grenadeThrow",
    label: "Grenade",
    desc: "Arc-projectile that explodes on landing",
    emoji: "💣",
  },
  {
    id: "shockwave",
    label: "Shockwave",
    desc: "Blast enemy back with force",
    emoji: "💥",
  },
  {
    id: "windBlast",
    label: "Wind Blast",
    desc: "Push enemy far away",
    emoji: "🌬️",
  },
  {
    id: "chainLightning",
    label: "Chain Lightning",
    desc: "Big instant lightning hit",
    emoji: "⚡",
  },
  {
    id: "iceWall",
    label: "Ice Wall",
    desc: "Freeze enemy for 2 seconds",
    emoji: "🧊",
  },
  {
    id: "flameThrow",
    label: "Flame Throw",
    desc: "Burst of fire at close range",
    emoji: "🔥",
  },
  {
    id: "shadowStep",
    label: "Shadow Step",
    desc: "Teleport behind the enemy",
    emoji: "🌑",
  },
  {
    id: "armorBreak",
    label: "Armor Break",
    desc: "Enemy takes 50% more damage for 5s",
    emoji: "🛡️",
  },
  {
    id: "vortex",
    label: "Vortex",
    desc: "Spin enemy and deal damage",
    emoji: "🌀",
  },
  {
    id: "doubleJump",
    label: "Double Jump",
    desc: "Instantly jump high",
    emoji: "⬆️",
  },
  {
    id: "groundSpike",
    label: "Ground Spike",
    desc: "Spike from below if enemy is grounded",
    emoji: "⚡",
  },
  {
    id: "thunderClap",
    label: "Thunder Clap",
    desc: "Close-range thunder hit",
    emoji: "🌩️",
  },
  {
    id: "icicleSpear",
    label: "Icicle Spear",
    desc: "Fast spear that freezes on hit",
    emoji: "🧸",
  },
  {
    id: "laserBeam",
    label: "Laser Beam",
    desc: "Instant-hit laser across arena",
    emoji: "🔵",
  },
  {
    id: "explosionRing",
    label: "Explosion Ring",
    desc: "Massive AoE explosion",
    emoji: "💥",
  },
  {
    id: "energyField",
    label: "Energy Field",
    desc: "Heal self + damage nearby enemy",
    emoji: "⚡",
  },
  {
    id: "blink",
    label: "Blink",
    desc: "Teleport to random location",
    emoji: "✨",
  },
  {
    id: "combatRoll",
    label: "Combat Roll",
    desc: "Invincible roll across the arena",
    emoji: "🔄",
  },
  {
    id: "lifesteal",
    label: "Lifesteal",
    desc: "Deal 20 dmg and heal yourself",
    emoji: "❤️",
  },
  {
    id: "powerSlam",
    label: "Power Slam",
    desc: "Leap and slam forward",
    emoji: "⬇️",
  },
  {
    id: "sonicBoom",
    label: "Sonic Boom",
    desc: "Fast projectile that stuns on hit",
    emoji: "💨",
  },
  {
    id: "meteorStrike",
    label: "Meteor Strike",
    desc: "40 damage if enemy is in center",
    emoji: "☄️",
  },
  {
    id: "briefcaseSmash",
    label: "Briefcase Smash",
    desc: "Hurl a heavy briefcase that stuns on impact",
    emoji: "💼",
  },
];

function StickPreview({ custom }: { custom: PlayerCustomization }) {
  const color = PLAYER_COLOR_HEX[custom.color];
  return (
    <svg
      width="60"
      height="80"
      viewBox="0 0 60 80"
      role="img"
      aria-label="Stick figure preview"
    >
      {custom.hat === "crown" && (
        <polygon
          points="22,18 26,10 30,14 34,10 38,18"
          fill="#D8C38A"
          stroke="#b8a060"
          strokeWidth="1"
        />
      )}
      {custom.hat === "cap" && (
        <ellipse cx="30" cy="18" rx="14" ry="7" fill={color} opacity="0.9" />
      )}
      {custom.hat === "headband" && (
        <path
          d="M 18,22 Q 30,16 42,22"
          stroke={color}
          strokeWidth="4"
          fill="none"
        />
      )}
      {custom.hat === "wizard" && (
        <>
          <polygon
            points="16,22 30,2 44,22"
            fill="#6030a0"
            stroke="#9060d0"
            strokeWidth="1"
          />
          <ellipse cx="30" cy="22" rx="14" ry="4" fill="#7040b0" />
        </>
      )}
      {custom.hat === "viking" && (
        <>
          <ellipse
            cx="30"
            cy="17"
            rx="13"
            ry="7"
            fill="#888"
            stroke="#555"
            strokeWidth="1"
          />
          <path
            d="M 17,17 Q 8,8 12,2"
            stroke="#ccc"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 43,17 Q 52,8 48,2"
            stroke="#ccc"
            strokeWidth="3"
            fill="none"
          />
        </>
      )}
      {custom.hat === "ninja" && (
        <rect x="16" y="14" width="28" height="10" fill="#222" rx="2" />
      )}
      {custom.hat === "cowboy" && (
        <>
          <ellipse cx="30" cy="19" rx="10" ry="8" fill="#8B5E3C" />
          <ellipse cx="30" cy="19" rx="18" ry="4" fill="#8B5E3C" />
        </>
      )}
      {custom.hat === "party" && (
        <polygon
          points="18,22 30,4 42,22"
          fill="#ff4080"
          stroke="#ff6020"
          strokeWidth="1"
        />
      )}
      {custom.hat === "bunny" && (
        <>
          <path
            d="M 22,20 Q 16,8 20,2"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d="M 38,20 Q 44,8 40,2"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
          />
        </>
      )}
      {/* New hats - simple shapes */}
      {custom.hat === "beret" && (
        <ellipse cx="30" cy="16" rx="13" ry="6" fill="#c04040" />
      )}
      {custom.hat === "topHat" && (
        <>
          <rect x="20" y="6" width="20" height="16" fill="#222" />
          <rect x="15" y="21" width="30" height="4" fill="#333" />
        </>
      )}
      {custom.hat === "pirate" && (
        <>
          <rect x="16" y="10" width="28" height="14" fill="#222" rx="2" />
          <text x="30" y="21" textAnchor="middle" fontSize="8" fill="white">
            ☠
          </text>
        </>
      )}
      {custom.hat === "alien" && (
        <ellipse cx="30" cy="14" rx="12" ry="10" fill="#40c040" />
      )}
      {custom.hat === "knight" && (
        <>
          <rect x="18" y="10" width="24" height="16" fill="#888" rx="2" />
          <rect x="24" y="10" width="12" height="8" fill="#aaa" />
        </>
      )}
      {custom.hat === "santa" && (
        <>
          <ellipse cx="30" cy="16" rx="12" ry="8" fill="#cc2020" />
          <circle cx="38" cy="8" r="4" fill="white" />
        </>
      )}
      {custom.hat === "graduation" && (
        <>
          <rect x="18" y="16" width="24" height="8" fill="#222" />
          <polygon points="14,16 30,8 46,16" fill="#222" />
        </>
      )}
      {custom.hat === "chef" && (
        <>
          <ellipse cx="30" cy="20" rx="12" ry="5" fill="white" />
          <ellipse cx="30" cy="14" rx="9" ry="8" fill="white" />
        </>
      )}
      {custom.hat === "police" && (
        <>
          <ellipse
            cx="30"
            cy="17"
            rx="13"
            ry="7"
            fill="#334488"
            stroke="#556699"
            strokeWidth="1"
          />
          <rect x="26" y="12" width="8" height="4" fill="#ffcc00" rx="1" />
        </>
      )}
      {custom.hat === "detective" && (
        <>
          <ellipse cx="30" cy="19" rx="14" ry="5" fill="#6b5640" />
          <ellipse cx="30" cy="14" rx="9" ry="7" fill="#6b5640" />
        </>
      )}
      {custom.hat === "horns" && (
        <>
          <path
            d="M 18,22 Q 10,8 16,4"
            stroke="#cc3300"
            strokeWidth="3"
            fill="none"
          />
          <path
            d="M 42,22 Q 50,8 44,4"
            stroke="#cc3300"
            strokeWidth="3"
            fill="none"
          />
        </>
      )}
      {custom.hat === "halo" && (
        <ellipse
          cx="30"
          cy="10"
          rx="14"
          ry="4"
          fill="none"
          stroke="#ffff80"
          strokeWidth="3"
        />
      )}
      {custom.hat === "mushroom" && (
        <>
          <ellipse cx="30" cy="18" rx="14" ry="8" fill="#cc2020" />
          <ellipse cx="30" cy="22" rx="10" ry="5" fill="#ffeecc" />
          <circle cx="24" cy="16" r="2" fill="white" />
          <circle cx="34" cy="14" r="2" fill="white" />
        </>
      )}
      {custom.hat === "flower" && (
        <>
          <circle cx="30" cy="12" r="5" fill="#ff80a0" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <circle
              key={a}
              cx={30 + 8 * Math.cos((a * Math.PI) / 180)}
              cy={12 + 8 * Math.sin((a * Math.PI) / 180)}
              r="4"
              fill="#ff80a0"
            />
          ))}
          <circle cx="30" cy="12" r="3" fill="#ffff40" />
        </>
      )}
      {custom.hat === "feather" && (
        <path d="M 30,22 Q 22,10 26,2 Q 32,8 30,22" fill="#80c080" />
      )}
      {custom.hat === "mohawk" && (
        <path d="M 22,22 Q 24,8 30,4 Q 36,8 38,22" fill={color} />
      )}
      {custom.hat === "bandana" && (
        <path
          d="M 16,22 Q 30,14 44,22"
          stroke="#cc4040"
          strokeWidth="5"
          fill="none"
        />
      )}
      {custom.hat === "propeller" && (
        <>
          <circle cx="30" cy="14" r="4" fill="#888" />
          <ellipse cx="30" cy="8" rx="8" ry="3" fill="#aaa" />
          <ellipse cx="30" cy="20" rx="8" ry="3" fill="#aaa" />
        </>
      )}
      {custom.hat === "football" && (
        <ellipse
          cx="30"
          cy="15"
          rx="12"
          ry="9"
          fill="#8B5E3C"
          stroke="white"
          strokeWidth="1"
        />
      )}
      {custom.hat === "baseball" && (
        <>
          <ellipse
            cx="30"
            cy="17"
            rx="13"
            ry="7"
            fill="white"
            stroke="#999"
            strokeWidth="1"
          />
          <path
            d="M 20,14 Q 22,18 20,22"
            stroke="#cc4040"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M 40,14 Q 38,18 40,22"
            stroke="#cc4040"
            strokeWidth="1.5"
            fill="none"
          />
        </>
      )}
      {custom.hat === "samurai" && (
        <>
          <polygon
            points="14,24 30,4 46,24"
            fill="#222"
            stroke="#cc2020"
            strokeWidth="1"
          />
          <rect x="16" y="22" width="28" height="5" fill="#444" />
        </>
      )}
      {custom.hat === "pharaoh" && (
        <>
          <polygon
            points="18,24 30,6 42,24"
            fill="#D8C38A"
            stroke="#b8a060"
            strokeWidth="1"
          />
          <rect x="22" y="18" width="16" height="4" fill="#cc8800" />
        </>
      )}
      {custom.hat === "jester" && (
        <>
          <polygon points="14,22 22,6 30,18" fill="#ff4080" />
          <polygon points="30,18 38,6 46,22" fill="#4080ff" />
          <circle cx="22" cy="6" r="3" fill="#ffff40" />
          <circle cx="38" cy="6" r="3" fill="#ffff40" />
        </>
      )}
      {custom.hat === "robot" && (
        <>
          <rect x="16" y="10" width="28" height="16" fill="#666" rx="2" />
          <rect x="20" y="13" width="6" height="4" fill="#88ccff" rx="1" />
          <rect x="34" y="13" width="6" height="4" fill="#88ccff" rx="1" />
        </>
      )}
      {custom.hat === "tiara" && (
        <>
          <path
            d="M 16,22 Q 30,10 44,22"
            stroke="#D8C38A"
            strokeWidth="2.5"
            fill="none"
          />
          <circle cx="30" cy="12" r="3" fill="#ff80ff" />
          <circle cx="22" cy="16" r="2" fill="#D8C38A" />
          <circle cx="38" cy="16" r="2" fill="#D8C38A" />
        </>
      )}
      {custom.hat === "hardhat" && (
        <>
          <ellipse cx="30" cy="16" rx="14" ry="8" fill="#f0a020" />
          <rect x="14" y="20" width="32" height="4" fill="#cc8800" />
        </>
      )}
      {custom.hat === "sombrero" && (
        <>
          <ellipse cx="30" cy="18" rx="8" ry="7" fill="#c08040" />
          <ellipse cx="30" cy="20" rx="18" ry="5" fill="#c08040" />
        </>
      )}
      {custom.hat === "beanie" && (
        <>
          <ellipse cx="30" cy="16" rx="12" ry="8" fill={color} />
          <circle cx="30" cy="8" r="3" fill={color} />
        </>
      )}
      {custom.hat === "deerstalker" && (
        <>
          <ellipse cx="30" cy="16" rx="13" ry="7" fill="#8B6B40" />
          <polygon points="16,16 8,10 18,14" fill="#8B6B40" />
          <polygon points="44,16 52,10 42,14" fill="#8B6B40" />
        </>
      )}
      {custom.hat === "laurel" && (
        <>
          <path
            d="M 14,22 Q 8,12 14,6"
            stroke="#50aa50"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 46,22 Q 52,12 46,6"
            stroke="#50aa50"
            strokeWidth="2"
            fill="none"
          />
          {[0, 1, 2].map((i) => (
            <ellipse
              key={i}
              cx={16 + i * 3}
              cy={20 - i * 4}
              rx="3"
              ry="2"
              fill="#50aa50"
            />
          ))}
          {[0, 1, 2].map((i) => (
            <ellipse
              key={i}
              cx={44 - i * 3}
              cy={20 - i * 4}
              rx="3"
              ry="2"
              fill="#50aa50"
            />
          ))}
        </>
      )}
      {/* Head and body */}
      <circle
        cx="30"
        cy="22"
        r="12"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
      />
      <circle cx="34" cy="20" r="2" fill={color} />
      <line
        x1="30"
        y1="34"
        x2="30"
        y2="54"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="30"
        y1="40"
        x2="16"
        y2="50"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="30"
        y1="40"
        x2="44"
        y2="48"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="30"
        y1="54"
        x2="20"
        y2="72"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <line
        x1="30"
        y1="54"
        x2="40"
        y2="72"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

const CHARACTER_SKINS: {
  id: CharacterSkin;
  label: string;
  emoji: string;
  desc: string;
}[] = [
  { id: "none", label: "Default", emoji: "🥷", desc: "Standard stick fighter" },
  {
    id: "bizSuit",
    label: "Business Pro",
    emoji: "💼",
    desc: "Sharp suit, briefcase ready. Always dressed to impress.",
  },
  {
    id: "jobApp",
    label: "Job Application",
    emoji: "📄",
    desc: "Your whole body IS a job application. Printed, signed, and ready to fight.",
  },
];

function PlayerCustomizer({
  playerId,
  isAI,
  custom,
  unlockedHats,
  unlockedAbilities,
  onChange,
}: {
  playerId: 1 | 2;
  isAI: boolean;
  custom: PlayerCustomization;
  unlockedHats: Hat[];
  unlockedAbilities: SpecialAbility[];
  onChange: (c: PlayerCustomization) => void;
}) {
  const accentColor = playerId === 1 ? "#e05050" : "#5080e0";
  return (
    <div
      className="flex flex-col gap-5 p-6 rounded-lg"
      style={{
        border: `1.5px solid ${accentColor}33`,
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <div className="flex items-center gap-4">
        <StickPreview custom={custom} />
        <div>
          <h3 className="text-lg font-bold" style={{ color: accentColor }}>
            {isAI ? "🤖 AI Opponent" : `Player ${playerId}`}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isAI ? "Customize the AI's appearance" : "Customize your fighter"}
          </p>
        </div>
      </div>

      {/* Color */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          Color
        </p>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              data-ocid={`customize.p${playerId}_color`}
              onClick={() => onChange({ ...custom, color: c })}
              className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
              style={{
                background: PLAYER_COLOR_HEX[c],
                borderColor: custom.color === c ? "#fff" : "transparent",
                boxShadow:
                  custom.color === c
                    ? `0 0 10px ${PLAYER_COLOR_HEX[c]}`
                    : "none",
              }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Hat */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          Hat
        </p>
        <div className="flex gap-2 flex-wrap max-h-40 overflow-y-auto pr-1">
          {ALL_HATS.map((h) => {
            const isUnlocked = unlockedHats.includes(h.id);
            return (
              <button
                key={h.id}
                type="button"
                data-ocid={`customize.p${playerId}_hat`}
                onClick={() => isUnlocked && onChange({ ...custom, hat: h.id })}
                disabled={!isUnlocked}
                className="px-2 py-1 rounded text-sm font-medium transition-all relative"
                style={{
                  background: !isUnlocked
                    ? "rgba(255,255,255,0.02)"
                    : custom.hat === h.id
                      ? `${accentColor}33`
                      : "rgba(255,255,255,0.05)",
                  border: `1px solid ${
                    !isUnlocked
                      ? "rgba(255,255,255,0.06)"
                      : custom.hat === h.id
                        ? accentColor
                        : "rgba(255,255,255,0.1)"
                  }`,
                  color: !isUnlocked
                    ? "rgba(255,255,255,0.25)"
                    : custom.hat === h.id
                      ? accentColor
                      : "#aaa",
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                  fontSize: "0.75rem",
                }}
                title={!isUnlocked ? "Win rounds to unlock" : h.label}
              >
                {!isUnlocked ? "🔒" : h.emoji} {h.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Character Skin */}
      <div>
        <p
          className="text-xs font-semibold mb-2 uppercase tracking-wider flex items-center gap-2"
          style={{ color: "#ffd700" }}
        >
          <span>💼</span> Character Skin
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(255,215,0,0.15)",
              color: "#ffd700",
              border: "1px solid rgba(255,215,0,0.4)",
              fontSize: "0.6rem",
            }}
          >
            JOB APPLICATION UPDATE
          </span>
        </p>
        <div className="flex flex-col gap-1">
          {CHARACTER_SKINS.map((sk) => (
            <button
              key={sk.id}
              type="button"
              data-ocid={`customize.p${playerId}_skin`}
              onClick={() => onChange({ ...custom, character: sk.id })}
              className="text-left px-2 py-1.5 rounded transition-all"
              style={{
                background:
                  custom.character === sk.id
                    ? "rgba(255,215,0,0.12)"
                    : "rgba(255,255,255,0.04)",
                border: `1px solid ${custom.character === sk.id ? "#ffd700" : "rgba(255,255,255,0.08)"}`,
                cursor: "pointer",
              }}
            >
              <span
                className="text-xs font-bold"
                style={{
                  color: custom.character === sk.id ? "#ffd700" : "#ddd",
                }}
              >
                {sk.emoji} {sk.label}
              </span>
              <p
                className="text-xs text-muted-foreground mt-0.5"
                style={{ fontSize: "0.65rem" }}
              >
                {sk.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Special */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          Special Ability
        </p>
        <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
          {ALL_SPECIALS.map((s) => {
            const isUnlocked = unlockedAbilities.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                data-ocid={`customize.p${playerId}_special`}
                onClick={() =>
                  isUnlocked && onChange({ ...custom, special: s.id })
                }
                disabled={!isUnlocked}
                className="text-left px-2 py-1.5 rounded transition-all"
                style={{
                  background: !isUnlocked
                    ? "rgba(255,255,255,0.02)"
                    : custom.special === s.id
                      ? `${accentColor}22`
                      : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    !isUnlocked
                      ? "rgba(255,255,255,0.05)"
                      : custom.special === s.id
                        ? accentColor
                        : "rgba(255,255,255,0.08)"
                  }`,
                  cursor: isUnlocked ? "pointer" : "not-allowed",
                  opacity: isUnlocked ? 1 : 0.4,
                }}
                title={!isUnlocked ? "Win rounds to unlock" : s.label}
              >
                <span
                  className="text-xs font-bold"
                  style={{
                    color: !isUnlocked
                      ? "#666"
                      : custom.special === s.id
                        ? accentColor
                        : "#ddd",
                  }}
                >
                  {!isUnlocked ? "🔒" : s.emoji} {s.label}
                </span>
                {isUnlocked && (
                  <p
                    className="text-xs text-muted-foreground mt-0.5"
                    style={{ fontSize: "0.65rem" }}
                  >
                    {s.desc}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CustomizeScreen({
  mode,
  unlockedHats,
  unlockedAbilities,
  onReady,
  onBack,
}: CustomizeScreenProps) {
  const [p1, setP1] = useState<PlayerCustomization>({
    color: "red",
    hat: "none",
    special: "dash",
    character: "none",
  });
  const [p2, setP2] = useState<PlayerCustomization>({
    color: "blue",
    hat: "crown",
    special: "energyBlast",
    character: "none",
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black" style={{ color: "#D8C38A" }}>
              CUSTOMIZE FIGHTERS
            </h1>
            <p className="text-muted-foreground mt-1">
              {mode === "ai"
                ? "You vs AI — choose your fighter"
                : "Both players choose their fighter"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              🔒 Win rounds to unlock more hats and abilities!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlayerCustomizer
              playerId={1}
              isAI={false}
              custom={p1}
              unlockedHats={unlockedHats}
              unlockedAbilities={unlockedAbilities}
              onChange={setP1}
            />
            <PlayerCustomizer
              playerId={2}
              isAI={mode === "ai"}
              custom={p2}
              unlockedHats={unlockedHats}
              unlockedAbilities={unlockedAbilities}
              onChange={setP2}
            />
          </div>

          <div className="flex gap-4 mt-8 justify-center">
            <Button
              data-ocid="customize.back_button"
              variant="outline"
              className="w-32"
              onClick={onBack}
            >
              ← Back
            </Button>
            <Button
              data-ocid="customize.fight_button"
              className="w-48 h-12 text-lg font-bold"
              style={{ background: "#D8C38A", color: "#1b242a" }}
              onClick={() => onReady(p1, p2)}
            >
              ⚔️ Select Map!
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
