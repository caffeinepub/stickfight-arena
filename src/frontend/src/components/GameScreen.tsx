import { computeAIControls, resetAI } from "@/game/ai";
import {
  CANVAS_W,
  createGameState,
  triggerFinisher,
  updateGame,
} from "@/game/engine";
import { renderFrame } from "@/game/renderer";
import { playFinisher, playRoundEnd, playVictory } from "@/game/sounds";
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
const JOYSTICK_RADIUS = 52;
const INNER_RADIUS = 22;

interface JoystickPos {
  x: number;
  y: number;
}

interface GameScreenProps {
  mode: GameMode;
  platformMode?: "mobile" | "pc";
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
  platformMode = "pc",
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

  // Mobile controls state
  const mobileRef = useRef({
    left: false,
    right: false,
    jump: false,
    attack: false,
    special: false,
    block: false,
    kick: false,
  });
  const joystickOriginRef = useRef<{ x: number; y: number } | null>(null);
  const [joystickPos, setJoystickPos] = useState<JoystickPos>({ x: 0, y: 0 });

  // Reactive finisher availability for UI
  const [finisherAvailable, setFinisherAvailable] = useState<0 | 1 | 2>(0);
  const [finisherActive, setFinisherActive] = useState(false);

  const getP1Controls = useCallback((): Controls => {
    if (platformMode === "mobile") {
      return { ...mobileRef.current };
    }
    const keys = keysRef.current;
    return {
      left: keys.has("a") || keys.has("A"),
      right: keys.has("d") || keys.has("D"),
      jump: keys.has("w") || keys.has("W"),
      attack: keys.has("f") || keys.has("F"),
      special: keys.has("g") || keys.has("G"),
      block: keys.has("s") || keys.has("S"),
      kick: keys.has("h") || keys.has("H"),
    };
  }, [platformMode]);

  const getP2Controls = useCallback((): Controls => {
    const keys = keysRef.current;
    return {
      left: keys.has("ArrowLeft"),
      right: keys.has("ArrowRight"),
      jump: keys.has("ArrowUp"),
      attack: keys.has("l") || keys.has("L"),
      special: keys.has("k") || keys.has("K"),
      block: keys.has("ArrowDown"),
      kick: keys.has(";") || keys.has(":"),
    };
  }, []);

  const handleFinisher = useCallback((playerNum: 1 | 2) => {
    const newState = triggerFinisher(stateRef.current, playerNum);
    playFinisher();
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
        playRoundEnd();
        const { roundWinner, p1Wins, p2Wins } = stateRef.current;
        onRoundEnd(roundWinner, p1Wins, p2Wins);
      }

      if (stateRef.current.phase === "fighting") {
        roundEndCalledRef.current = false;
      }

      if (stateRef.current.phase === "gameOver" && !gameOverCalledRef.current) {
        gameOverCalledRef.current = true;
        onGameOver(stateRef.current.p1Wins, stateRef.current.p2Wins);
        playVictory();
      }

      renderFrame(ctx, stateRef.current, tickRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // ─── Joystick handlers ───────────────────────────────────────────────
  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    joystickOriginRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    // Reset state
    mobileRef.current.left = false;
    mobileRef.current.right = false;
    mobileRef.current.jump = false;
    setJoystickPos({ x: 0, y: 0 });
    // Process initial position
    const dx = touch.clientX - joystickOriginRef.current.x;
    const dy = touch.clientY - joystickOriginRef.current.y;
    applyJoystick(dx, dy);
  }, []);

  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickOriginRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - joystickOriginRef.current.x;
    const dy = touch.clientY - joystickOriginRef.current.y;
    applyJoystick(dx, dy);
  }, []);

  const handleJoystickEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    joystickOriginRef.current = null;
    mobileRef.current.left = false;
    mobileRef.current.right = false;
    mobileRef.current.jump = false;
    setJoystickPos({ x: 0, y: 0 });
  }, []);

  function applyJoystick(dx: number, dy: number) {
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxDist = JOYSTICK_RADIUS - INNER_RADIUS;
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);
    const nx = clampedDist * Math.cos(angle);
    const ny = clampedDist * Math.sin(angle);
    setJoystickPos({ x: nx, y: ny });

    // Dead zone: 25% of max dist
    const threshold = maxDist * 0.25;
    mobileRef.current.left = dx < -threshold;
    mobileRef.current.right = dx > threshold;
    // Jump if joystick angled significantly upward
    mobileRef.current.jump = dy < -(maxDist * 0.4);
  }

  const p1Color = PLAYER_COLOR_HEX[p1Custom.color];
  const p2Color = PLAYER_COLOR_HEX[p2Custom.color];
  const isMobile = platformMode === "mobile";

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
            style={{ color: "#ff2200", textShadow: "0 0 16px #ff220088" }}
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

      {/* Canvas container */}
      <div className="relative" style={{ maxWidth: "100%" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-lg block"
          style={{
            maxWidth: "100%",
            boxShadow:
              "0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(216,195,138,0.08)",
          }}
        />

        {/* Mobile touch overlay */}
        {isMobile && (
          <div
            className="absolute inset-0 rounded-lg"
            style={{ pointerEvents: "none" }}
          >
            {/* Left joystick zone */}
            <div
              className="absolute bottom-4 left-4"
              style={{ pointerEvents: "auto" }}
            >
              {/* Outer ring */}
              <div
                onTouchStart={handleJoystickStart}
                onTouchMove={handleJoystickMove}
                onTouchEnd={handleJoystickEnd}
                className="relative flex items-center justify-center select-none"
                style={{
                  width: JOYSTICK_RADIUS * 2,
                  height: JOYSTICK_RADIUS * 2,
                  borderRadius: "50%",
                  background: "rgba(216,195,138,0.08)",
                  border: "2px solid rgba(216,195,138,0.35)",
                  touchAction: "none",
                }}
              >
                {/* Inner dot */}
                <div
                  style={{
                    position: "absolute",
                    width: INNER_RADIUS * 2,
                    height: INNER_RADIUS * 2,
                    borderRadius: "50%",
                    background: "rgba(216,195,138,0.55)",
                    border: "2px solid rgba(216,195,138,0.8)",
                    transform: `translate(${joystickPos.x}px, ${joystickPos.y}px)`,
                    transition: joystickOriginRef.current
                      ? "none"
                      : "transform 0.15s ease",
                    pointerEvents: "none",
                  }}
                />
                {/* Directional hints */}
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    fontSize: 10,
                    color: "rgba(216,195,138,0.4)",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  ▲
                </span>
                <span
                  style={{
                    position: "absolute",
                    left: 2,
                    fontSize: 10,
                    color: "rgba(216,195,138,0.4)",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  ◀
                </span>
                <span
                  style={{
                    position: "absolute",
                    right: 2,
                    fontSize: 10,
                    color: "rgba(216,195,138,0.4)",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  ▶
                </span>
              </div>
            </div>

            {/* Right action buttons */}
            <div
              className="absolute bottom-4 right-4 flex flex-col gap-3"
              style={{ pointerEvents: "auto" }}
            >
              {/* Special button */}
              <button
                type="button"
                data-ocid="game.mobile_special_button"
                className="flex items-center justify-center font-black text-sm uppercase tracking-widest select-none"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(160,80,208,0.25)",
                  border: "2px solid rgba(160,80,208,0.7)",
                  color: "#c090ff",
                  touchAction: "none",
                  userSelect: "none",
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  mobileRef.current.special = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  mobileRef.current.special = false;
                }}
                onClick={(e) => e.preventDefault()}
              >
                SP
              </button>

              {/* Attack button */}
              <button
                type="button"
                data-ocid="game.mobile_attack_button"
                className="flex items-center justify-center font-black text-sm uppercase tracking-widest select-none"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(224,60,60,0.25)",
                  border: "2px solid rgba(224,60,60,0.7)",
                  color: "#ff8080",
                  touchAction: "none",
                  userSelect: "none",
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  mobileRef.current.attack = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  mobileRef.current.attack = false;
                }}
                onClick={(e) => e.preventDefault()}
              >
                ATK
              </button>

              {/* Block button */}
              <button
                type="button"
                data-ocid="game.mobile_block_button"
                className="flex items-center justify-center font-black text-sm uppercase tracking-widest select-none"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(80,160,224,0.25)",
                  border: "2px solid rgba(80,160,224,0.7)",
                  color: "#80c8ff",
                  touchAction: "none",
                  userSelect: "none",
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  mobileRef.current.block = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  mobileRef.current.block = false;
                }}
                onClick={(e) => e.preventDefault()}
              >
                BLK
              </button>

              {/* Kick button */}
              <button
                type="button"
                data-ocid="game.mobile_kick_button"
                className="flex items-center justify-center font-black text-sm uppercase tracking-widest select-none"
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(224,136,48,0.25)",
                  border: "2px solid rgba(224,136,48,0.7)",
                  color: "#ffaa60",
                  touchAction: "none",
                  userSelect: "none",
                }}
                onTouchStart={(e) => {
                  e.preventDefault();
                  mobileRef.current.kick = true;
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  mobileRef.current.kick = false;
                }}
                onClick={(e) => e.preventDefault()}
              >
                KICK
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls reminder — hidden on mobile */}
      {!isMobile && (
        <div className="flex gap-8 text-xs opacity-40 text-white font-mono">
          <span>P1: WASD move · F attack · H kick · S block · G special</span>
          <span>P2: Arrows move · L attack · ; kick · ↓ block · K special</span>
        </div>
      )}
    </div>
  );
}
