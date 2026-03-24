import { Button } from "@/components/ui/button";
import type { GameMode } from "@/game/types";
import { PLAYER_COLOR_HEX } from "@/game/types";
import { motion, useAnimationFrame } from "motion/react";
import { useRef, useState } from "react";

interface MenuScreenProps {
  onStart: (mode: GameMode) => void;
}

function FightingStick({
  x,
  color,
  flip,
  offset = 0,
}: {
  x: number;
  color: string;
  flip: boolean;
  offset?: number;
}) {
  const tickRef = useRef(0);
  const [tick, setTick] = useState(0);
  useAnimationFrame((t) => {
    tickRef.current = t / 1000 + offset;
    setTick(tickRef.current);
  });

  const t = tick;
  const walkCycle = Math.sin(t * 3) * 18;
  const armSwing = Math.sin(t * 3 + Math.PI) * 28;
  const bodyBob = Math.abs(Math.sin(t * 3)) * -3;
  const scaleX = flip ? -1 : 1;

  const HEAD_R = 18;
  const shoulderY = 180 + bodyBob;
  const hipY = 222 + bodyBob;
  const midBodyY = (shoulderY + hipY) / 2;
  const headY = shoulderY - HEAD_R * 1.4;
  const feetY = 265;

  const leftLegA = (walkCycle * Math.PI) / 180;
  const rightLegA = (-walkCycle * Math.PI) / 180;

  return (
    <g
      transform={`translate(${x}, 0) scale(${scaleX}, 1)`}
      style={{
        transformBox: "fill-box" as React.CSSProperties["transformBox"],
      }}
    >
      <circle cx={0} cy={headY} r={30} fill={color} opacity={0.08} />
      <circle
        cx={0}
        cy={headY}
        r={HEAD_R}
        stroke={color}
        strokeWidth={3}
        fill="none"
      />
      <circle cx={6} cy={headY - 3} r={2.5} fill={color} />
      <line
        x1={0}
        y1={shoulderY}
        x2={0}
        y2={hipY}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line
        x1={0}
        y1={midBodyY}
        x2={-28 - armSwing * 0.2}
        y2={midBodyY + 10}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line
        x1={0}
        y1={midBodyY}
        x2={32 + armSwing * 0.3}
        y2={midBodyY - 8}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line
        x1={0}
        y1={hipY}
        x2={Math.sin(leftLegA) * 36}
        y2={feetY}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <line
        x1={0}
        y1={hipY}
        x2={Math.sin(rightLegA) * 36}
        y2={feetY}
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
      />
    </g>
  );
}

interface SparkProps {
  id: number;
  xPct: number;
  yPct: number;
  color: string;
  delay: number;
}

function Spark({ xPct, yPct, color, delay }: SparkProps) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${xPct}%`,
        top: `${yPct}%`,
        width: 6,
        height: 6,
        background: color,
      }}
      animate={{
        y: [0, -120, -200],
        opacity: [0, 1, 0],
        scale: [0.5, 1.2, 0],
      }}
      transition={{
        duration: 2.4 + Math.random(),
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeOut",
      }}
    />
  );
}

const SPARKS: SparkProps[] = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  xPct: 10 + Math.random() * 80,
  yPct: 20 + Math.random() * 60,
  color: ["#D8C38A", "#e05050", "#5080e0", "#50c850", "#ff6020"][i % 5],
  delay: Math.random() * 3,
}));

const H_LINES = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  top: 8 + i * 10,
  alpha: 0.02 + (i % 3) * 0.01,
  dir: i % 2 === 0,
}));
const V_LINES = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  left: 6 + i * 13,
  alpha: 0.015 + (i % 2) * 0.01,
  dir: i % 2 === 0,
}));
const CLASH_SPARKS = Array.from({ length: 5 }, (_, i) => ({
  id: i,
  cx: 400 + (Math.random() * 40 - 20),
  cy: 200 + (Math.random() * 30 - 15),
  r: 3 + Math.random() * 4,
  color: ["#D8C38A", "#ff6020", "#ffffff"][i % 3],
  duration: 0.8 + i * 0.3,
  delay: i * 0.4,
}));

const ABILITY_ICONS = [
  { id: "dash", icon: "⚡", label: "Dash", color: "#D8C38A" },
  { id: "slam", icon: "💥", label: "Ground Slam", color: "#e08830" },
  { id: "blast", icon: "🔮", label: "Energy Blast", color: "#a050d0" },
  { id: "teleport", icon: "✨", label: "Teleport", color: "#30c8d0" },
  { id: "shield", icon: "🛡️", label: "Shield", color: "#5080e0" },
  { id: "frost", icon: "❄️", label: "Ice Frost", color: "#80d8ff" },
  { id: "fire", icon: "🔥", label: "Fire Spin", color: "#ff6020" },
  { id: "vampire", icon: "🧛", label: "Vampire Drain", color: "#c020c0" },
];

import type React from "react";

export default function MenuScreen({ onStart }: MenuScreenProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Deep background radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(216,195,138,0.07) 0%, transparent 65%)",
        }}
      />

      {/* Animated grid lines */}
      {H_LINES.map((line) => (
        <motion.div
          key={`hline-${line.id}`}
          className="absolute w-full h-px pointer-events-none"
          style={{
            top: `${line.top}%`,
            background: `rgba(216,195,138,${line.alpha})`,
          }}
          animate={{ x: ["0%", line.dir ? "1.5%" : "-1.5%", "0%"] }}
          transition={{
            duration: 5 + line.id * 0.7,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
      {V_LINES.map((line) => (
        <motion.div
          key={`vline-${line.id}`}
          className="absolute h-full w-px pointer-events-none"
          style={{
            left: `${line.left}%`,
            background: `rgba(216,195,138,${line.alpha})`,
          }}
          animate={{ y: ["0%", line.dir ? "1%" : "-1%", "0%"] }}
          transition={{
            duration: 6 + line.id,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating sparks */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ overflow: "hidden" }}
      >
        {SPARKS.map((s) => (
          <Spark
            key={s.id}
            id={s.id}
            xPct={s.xPct}
            yPct={s.yPct}
            color={s.color}
            delay={s.delay}
          />
        ))}
      </div>

      {/* Animated fighters SVG */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <svg
          width="100%"
          height="300"
          viewBox="0 0 800 300"
          preserveAspectRatio="xMidYMax meet"
          aria-hidden="true"
        >
          <line
            x1={0}
            y1={266}
            x2={800}
            y2={266}
            stroke="rgba(216,195,138,0.12)"
            strokeWidth={2}
          />
          <FightingStick
            x={240}
            color={PLAYER_COLOR_HEX.red}
            flip={false}
            offset={0}
          />
          <FightingStick
            x={560}
            color={PLAYER_COLOR_HEX.blue}
            flip={true}
            offset={1.5}
          />
          <text
            x={400}
            y={230}
            textAnchor="middle"
            fill="rgba(216,195,138,0.25)"
            fontFamily="sans-serif"
            fontWeight="bold"
            fontSize={48}
          >
            VS
          </text>
          {CLASH_SPARKS.map((s) => (
            <motion.circle
              key={`clash-${s.id}`}
              cx={s.cx}
              cy={s.cy}
              r={s.r}
              fill={s.color}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{
                duration: s.duration,
                delay: s.delay,
                repeat: Number.POSITIVE_INFINITY,
              }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -50, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.7,
            type: "spring",
            stiffness: 180,
            damping: 14,
          }}
        >
          <motion.h1
            className="text-7xl font-black tracking-tight leading-none"
            style={{
              color: "#D8C38A",
              textShadow:
                "0 0 60px rgba(216,195,138,0.6), 0 0 120px rgba(216,195,138,0.25)",
            }}
            animate={{
              textShadow: [
                "0 0 40px rgba(216,195,138,0.5), 0 0 80px rgba(216,195,138,0.2)",
                "0 0 80px rgba(216,195,138,0.8), 0 0 160px rgba(216,195,138,0.35)",
                "0 0 40px rgba(216,195,138,0.5), 0 0 80px rgba(216,195,138,0.2)",
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            STICK FIGHT
          </motion.h1>
          <motion.h2
            className="text-xl font-bold tracking-[0.4em] uppercase mt-1"
            style={{ color: "rgba(216,195,138,0.5)" }}
            animate={{ opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            A R E N A
          </motion.h2>
        </motion.div>

        {/* Ability icons */}
        <motion.div
          className="flex gap-3 mb-8 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {ABILITY_ICONS.map((ab, i) => (
            <motion.div
              key={ab.id}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.07 }}
            >
              <motion.div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                style={{
                  background: `${ab.color}18`,
                  border: `1px solid ${ab.color}40`,
                }}
                animate={{
                  boxShadow: [
                    `0 0 0px ${ab.color}00`,
                    `0 0 12px ${ab.color}60`,
                    `0 0 0px ${ab.color}00`,
                  ],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.25,
                  repeat: Number.POSITIVE_INFINITY,
                }}
                whileHover={{
                  scale: 1.15,
                  boxShadow: `0 0 20px ${ab.color}80`,
                }}
              >
                {ab.icon}
              </motion.div>
              <span
                className="text-[9px] font-medium"
                style={{ color: `${ab.color}99` }}
              >
                {ab.label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex flex-col gap-3 w-72"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              data-ocid="menu.local_button"
              className="w-full h-14 text-lg font-bold tracking-wide relative overflow-hidden"
              style={{
                background: "rgba(216,195,138,0.12)",
                border: "1.5px solid #D8C38A",
                color: "#D8C38A",
              }}
              onClick={() => onStart("local")}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(216,195,138,0.15), transparent)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
              ⚔️ 2 Player Local
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              data-ocid="menu.ai_button"
              className="w-full h-14 text-lg font-bold tracking-wide relative overflow-hidden"
              style={{
                background: "rgba(80,100,200,0.12)",
                border: "1.5px solid #5080e0",
                color: "#7090f0",
              }}
              onClick={() => onStart("ai")}
            >
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(80,128,224,0.18), transparent)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                  delay: 1,
                }}
              />
              🤖 vs AI
            </Button>
          </motion.div>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <div className="grid grid-cols-2 gap-8 text-xs text-muted-foreground">
            <div>
              <p
                className="font-bold mb-1.5 text-[11px] tracking-widest uppercase"
                style={{ color: "#e05050" }}
              >
                Player 1
              </p>
              <p>A / D — Move</p>
              <p>W — Jump</p>
              <p>F — Attack &nbsp; G — Special</p>
            </div>
            <div>
              <p
                className="font-bold mb-1.5 text-[11px] tracking-widest uppercase"
                style={{ color: "#5080e0" }}
              >
                Player 2
              </p>
              <p>← / → — Move</p>
              <p>↑ — Jump</p>
              <p>L — Attack &nbsp; K — Special</p>
            </div>
          </div>
        </motion.div>

        <motion.p
          className="mt-6 text-xs font-medium tracking-wider"
          style={{ color: "rgba(216,195,138,0.45)" }}
          animate={{ opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
        >
          📦 Win rounds to unlock new hats &amp; abilities
        </motion.p>
      </div>

      <footer className="absolute bottom-4 text-xs text-muted-foreground z-10">
        © {new Date().getFullYear()}. Built with{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          className="underline"
          target="_blank"
          rel="noreferrer"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
