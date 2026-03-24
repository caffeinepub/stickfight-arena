import { Button } from "@/components/ui/button";
import type { PlayerCustomization } from "@/game/types";
import { PLAYER_COLOR_HEX } from "@/game/types";
import { motion } from "motion/react";

interface GameOverScreenProps {
  p1Wins: number;
  p2Wins: number;
  p1Custom: PlayerCustomization;
  p2Custom: PlayerCustomization;
  mode: "local" | "ai";
  onRematch: () => void;
  onMenu: () => void;
}

export default function GameOverScreen({
  p1Wins,
  p2Wins,
  p1Custom,
  p2Custom,
  mode,
  onRematch,
  onMenu,
}: GameOverScreenProps) {
  const winner = p1Wins > p2Wins ? 1 : p2Wins > p1Wins ? 2 : 0;
  const winnerColor =
    winner === 1
      ? PLAYER_COLOR_HEX[p1Custom.color]
      : winner === 2
        ? PLAYER_COLOR_HEX[p2Custom.color]
        : "#D8C38A";
  const winnerLabel =
    winner === 0
      ? "DRAW!"
      : mode === "ai" && winner === 2
        ? "AI WINS!"
        : `PLAYER ${winner} WINS!`;

  const particles = Array.from({ length: 24 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 4 + Math.random() * 8,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Confetti particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: "-20px",
            width: p.size,
            height: p.size,
            background: ["#D8C38A", "#e05050", "#5080e0", "#50c850"][p.id % 4],
          }}
          animate={{
            y: ["0vh", "120vh"],
            opacity: [1, 0],
            rotate: [0, 360 * (p.id % 2 === 0 ? 1 : -1)],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      ))}

      <motion.div
        className="text-center z-10"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
      >
        <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Game Over
        </div>
        <h1
          className="text-7xl font-black mb-2"
          style={{
            color: winnerColor,
            textShadow: `0 0 40px ${winnerColor}80, 0 0 80px ${winnerColor}40`,
          }}
        >
          {winnerLabel}
        </h1>

        {/* Score */}
        <div className="flex items-center justify-center gap-8 my-8">
          <div className="text-center">
            <div
              className="text-5xl font-black"
              style={{ color: PLAYER_COLOR_HEX[p1Custom.color] }}
            >
              {p1Wins}
            </div>
            <div className="text-sm font-semibold text-muted-foreground mt-1">
              Player 1
            </div>
          </div>
          <div className="text-3xl text-muted-foreground font-thin">—</div>
          <div className="text-center">
            <div
              className="text-5xl font-black"
              style={{ color: PLAYER_COLOR_HEX[p2Custom.color] }}
            >
              {p2Wins}
            </div>
            <div className="text-sm font-semibold text-muted-foreground mt-1">
              {mode === "ai" ? "AI" : "Player 2"}
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            data-ocid="gameover.rematch_button"
            className="w-40 h-12 text-base font-bold"
            style={{ background: "#D8C38A", color: "#1b242a" }}
            onClick={onRematch}
          >
            ⚔️ Rematch
          </Button>
          <Button
            data-ocid="gameover.menu_button"
            variant="outline"
            className="w-40 h-12 text-base font-bold"
            onClick={onMenu}
          >
            🏠 Main Menu
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
