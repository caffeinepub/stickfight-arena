import { computeAIControls, resetAI } from "@/game/ai";
import {
  CANVAS_W,
  createGameState,
  triggerFinisher,
  updateGame,
} from "@/game/engine";
import { renderFrame } from "@/game/renderer";
import type {
  Controls,
  GameMode,
  GameState,
  Platform,
  PlayerCustomization,
} from "@/game/types";
import { PLAYER_COLOR_HEX } from "@/game/types";
import { useCallback, useEffect, useRef, useState } from "react";

const CANVAS_H = 450;

interface GameScreenProps {
  mode: GameMode;
  p1Custom: PlayerCustomization;
  p2Custom: PlayerCustomization;
  initialP1Wins?: number;
  initialP2Wins?: number;
  initialRound?: number;
  mapPlatforms?: Platform[];
  mapBgColor?: string;
  onGameOver: (p1Wins: number, p2Wins: number) => void;
  onRoundEnd?: (winner: 0 | 1 | 2, p1Wins: number, p2Wins: number) => void;
}

export default function GameScreen({
  mode,
  p1Custom,
  p2Custom,
  initialP1Wins = 0,
  initialP2Wins = 0,
  initialRound = 1,
  mapPlatforms,
  mapBgColor,
  onGameOver,
  onRoundEnd,
}: GameScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(
    createGameState(
      p1Custom,
      p2Custom,
      initialP1Wins,
      initialP2Wins,
      initialRound,
      mapPlatforms,
      mapBgColor,
    ),
  );
  const keysRef = useRef<Set<string>>(new Set());
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const tickRef = useRef<number>(0);
  const gameOverCalledRef = useRef(false);
  const roundEndCalledRef = useRef(false);

  // Reactive finisher availability for UI
  const [finisherAvailable, setFinisherAvailable] = useState<0 | 1 | 2>(0);
  const [finisherActive, setFinisherActive] = useState(false);

  const getP1Controls = useCallback((): Controls => {
    const keys = keysRef.current;
    return {
      left: keys.has("a") || keys.has("A"),
      right: keys.has("d") || keys.has("D"),
      jump: keys.has("w") || keys.has("W"),
      attack: keys.has("f") || keys.has("F"),
      special: keys.has("g") || keys.has("G"),
    };
  }, []);

  const getP2Controls = useCallback((): Controls => {
    const keys = keysRef.current;
    return {
      left: keys.has("ArrowLeft"),
      right: keys.has("ArrowRight"),
      jump: keys.has("ArrowUp"),
      attack: keys.has("l") || keys.has("L"),
      special: keys.has("k") || keys.has("K"),
    };
  }, []);

  const handleFinisher = useCallback((playerNum: 1 | 2) => {
    const newState = triggerFinisher(stateRef.current, playerNum);
    stateRef.current = newState;
    setFinisherAvailable(0);
    setFinisherActive(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
      ) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: game loop runs once on mount
  useEffect(() => {
    stateRef.current = createGameState(
      p1Custom,
      p2Custom,
      initialP1Wins,
      initialP2Wins,
      initialRound,
      mapPlatforms,
      mapBgColor,
    );
    resetAI();
    gameOverCalledRef.current = false;
    roundEndCalledRef.current = false;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = (time: number) => {
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;
      tickRef.current += dt;

      const p1Controls = getP1Controls();
      const p2Controls =
        mode === "ai"
          ? computeAIControls(stateRef.current, dt)
          : getP2Controls();

      stateRef.current = updateGame(
        stateRef.current,
        p1Controls,
        p2Controls,
        dt,
      );

      // Update React state for finisher UI (throttled to avoid too many re-renders)
      const fa = stateRef.current.finisherAvailable;
      const fActive = stateRef.current.finisherActive;
      setFinisherAvailable((prev) => (prev !== fa ? fa : prev));
      setFinisherActive((prev) => (prev !== fActive ? fActive : prev));

      if (
        stateRef.current.phase === "roundEnd" &&
        !roundEndCalledRef.current &&
        onRoundEnd
      ) {
        roundEndCalledRef.current = true;
        const { roundWinner, p1Wins, p2Wins } = stateRef.current;
        onRoundEnd(roundWinner, p1Wins, p2Wins);
      }

      if (stateRef.current.phase === "fighting") {
        roundEndCalledRef.current = false;
      }

      if (stateRef.current.phase === "gameOver" && !gameOverCalledRef.current) {
        gameOverCalledRef.current = true;
        onGameOver(stateRef.current.p1Wins, stateRef.current.p2Wins);
      }

      renderFrame(ctx, stateRef.current, tickRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const p1Color = PLAYER_COLOR_HEX[p1Custom.color];
  const p2Color = PLAYER_COLOR_HEX[p2Custom.color];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3">
      {/* Finisher buttons */}
      {!finisherActive && finisherAvailable !== 0 && (
        <div className="flex gap-6 items-center animate-pulse">
          {finisherAvailable === 1 && (
            <button
              type="button"
              onClick={() => handleFinisher(1)}
              className="px-6 py-3 rounded-xl font-black text-white text-lg uppercase tracking-widest border-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${p1Color}cc, ${p1Color})`,
                borderColor: p1Color,
                boxShadow: `0 0 24px ${p1Color}99, 0 4px 16px rgba(0,0,0,0.5)`,
                textShadow: "0 1px 4px rgba(0,0,0,0.7)",
              }}
            >
              ☠ P1 FINISHER
            </button>
          )}
          <div
            className="text-center font-black text-2xl tracking-widest"
            style={{
              color: "#ff2200",
              textShadow: "0 0 16px #ff220088",
            }}
          >
            FINISH HIM!
          </div>
          {finisherAvailable === 2 && (
            <button
              type="button"
              onClick={() => handleFinisher(2)}
              className="px-6 py-3 rounded-xl font-black text-white text-lg uppercase tracking-widest border-2 shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${p2Color}cc, ${p2Color})`,
                borderColor: p2Color,
                boxShadow: `0 0 24px ${p2Color}99, 0 4px 16px rgba(0,0,0,0.5)`,
                textShadow: "0 1px 4px rgba(0,0,0,0.7)",
              }}
            >
              ☠ P2 FINISHER
            </button>
          )}
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="rounded-lg"
        style={{
          maxWidth: "100%",
          boxShadow:
            "0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(216,195,138,0.08)",
        }}
      />

      {/* Controls reminder */}
      <div className="flex gap-8 text-xs opacity-40 text-white font-mono">
        <span>P1: WASD move · F attack · G special</span>
        <span>P2: Arrows move · L attack · K special</span>
      </div>
    </div>
  );
}
