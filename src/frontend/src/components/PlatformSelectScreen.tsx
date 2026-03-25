import { playMenuClick } from "@/game/sounds";
import { PLAYER_COLOR_HEX } from "@/game/types";
import { motion } from "motion/react";
import { useRef } from "react";

interface PlatformSelectScreenProps {
  onSelect: (mode: "mobile" | "pc") => void;
}

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

const SPARKS = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  xPct: 10 + ((i * 37 + 11) % 80),
  yPct: 20 + ((i * 23 + 7) % 60),
  color: ["#D8C38A", "#e05050", "#5080e0", "#50c850", "#ff6020"][i % 5],
  delay: (i * 0.4) % 3,
}));

export default function PlatformSelectScreen({
  onSelect,
}: PlatformSelectScreenProps) {
  const handleSelect = (mode: "mobile" | "pc") => {
    playMenuClick();
    onSelect(mode);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Radial bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(216,195,138,0.07) 0%, transparent 65%)",
        }}
      />

      {/* Grid lines */}
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

      {/* Sparks */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {SPARKS.map((s) => (
          <motion.div
            key={s.id}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${s.xPct}%`,
              top: `${s.yPct}%`,
              width: 6,
              height: 6,
              background: s.color,
            }}
            animate={{
              y: [0, -120, -200],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0],
            }}
            transition={{
              duration: 2.4 + (s.id % 3) * 0.5,
              delay: s.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -40, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.6,
            type: "spring",
            stiffness: 180,
            damping: 14,
          }}
        >
          <motion.h1
            className="text-6xl sm:text-7xl font-black tracking-tight leading-none"
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

        {/* Prompt */}
        <motion.p
          className="text-2xl font-bold tracking-widest uppercase mb-8"
          style={{ color: "rgba(216,195,138,0.75)" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          How are you playing?
        </motion.p>

        {/* Cards */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {/* Mobile Card */}
          <motion.button
            data-ocid="platform.mobile_button"
            type="button"
            className="relative flex flex-col items-center justify-center gap-4 w-52 h-64 rounded-2xl font-bold cursor-pointer overflow-hidden"
            style={{
              background: "rgba(80,100,200,0.1)",
              border: "2px solid #5080e0",
              color: "#7090f0",
            }}
            whileHover={{ scale: 1.05, borderColor: "#90b0ff" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect("mobile")}
          >
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(80,128,224,0.15), transparent)",
              }}
              animate={{ x: ["-100%", "200%"] }}
              transition={{
                duration: 2.8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
            <span className="text-6xl">📱</span>
            <span className="text-2xl tracking-widest uppercase">Mobile</span>
            <span
              className="text-xs tracking-wide text-center px-4"
              style={{ color: "rgba(112,144,240,0.65)" }}
            >
              Touch joystick &amp; buttons
            </span>
          </motion.button>

          {/* PC Card */}
          <motion.button
            data-ocid="platform.pc_button"
            type="button"
            className="relative flex flex-col items-center justify-center gap-4 w-52 h-64 rounded-2xl font-bold cursor-pointer overflow-hidden"
            style={{
              background: "rgba(216,195,138,0.08)",
              border: "2px solid #D8C38A",
              color: "#D8C38A",
            }}
            whileHover={{ scale: 1.05, borderColor: "#f0d9a0" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelect("pc")}
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
                delay: 0.8,
              }}
            />
            <span className="text-6xl">🖥️</span>
            <span className="text-2xl tracking-widest uppercase">PC</span>
            <span
              className="text-xs tracking-wide text-center px-4"
              style={{ color: "rgba(216,195,138,0.55)" }}
            >
              Keyboard controls
            </span>
          </motion.button>
        </motion.div>
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
