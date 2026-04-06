import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BASE_ABILITIES,
  BASE_HATS,
  BASE_SHOES,
  LOCKABLE_ABILITIES,
  LOCKABLE_HATS,
  LOCKABLE_SHOES,
  saveUnlocked,
} from "@/game/lootbox";
import type { Hat, Shoe, SpecialAbility } from "@/game/types";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

interface CheatCodeScreenProps {
  onClose: () => void;
  onCheatActivated: (
    newHats: Hat[],
    newAbilities: SpecialAbility[],
    newShoes: Shoe[],
  ) => void;
}

const unlockAll = () => {
  const hats = [...BASE_HATS, ...LOCKABLE_HATS];
  const abilities = [...BASE_ABILITIES, ...LOCKABLE_ABILITIES];
  const shoes = [...BASE_SHOES, ...LOCKABLE_SHOES];
  return {
    hats,
    abilities,
    shoes,
    message: "All cosmetics, shoes and abilities unlocked!",
  };
};

const CHEAT_CODES: Record<
  string,
  () => {
    hats: Hat[];
    abilities: SpecialAbility[];
    shoes: Shoe[];
    message: string;
  }
> = {
  STICKGOD2026: unlockAll,
  UNLOCKALL: unlockAll,
};

export default function CheatCodeScreen({
  onClose,
  onCheatActivated,
}: CheatCodeScreenProps) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleActivate = () => {
    const normalized = code
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");
    const cheat = CHEAT_CODES[normalized];
    if (cheat) {
      const { hats, abilities, shoes, message } = cheat();
      saveUnlocked(hats, abilities, shoes);
      setResult({ type: "success", message: `\u2705 ${message}` });
      onCheatActivated(hats, abilities, shoes);
    } else {
      setResult({ type: "error", message: "\u274C Invalid code" });
    }
    setCode("");
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ background: "rgba(0,0,0,0.92)" }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(64,200,96,0.025) 2px, rgba(64,200,96,0.025) 4px)",
        }}
      />

      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start px-4 py-8">
        <motion.div
          className="relative w-full max-w-md rounded-xl overflow-hidden"
          initial={{ scale: 0.85, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.85, y: 40 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          style={{
            background: "rgba(8,16,10,0.97)",
            border: "1.5px solid rgba(64,200,96,0.45)",
            boxShadow:
              "0 0 60px rgba(64,200,96,0.18), 0 0 120px rgba(64,200,96,0.08)",
          }}
        >
          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg, transparent, #40cc60, transparent)",
            }}
          />

          <div className="p-6">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <motion.h1
                className="text-4xl font-black tracking-widest mb-1"
                style={{ color: "#40cc60" }}
                animate={{
                  textShadow: [
                    "0 0 20px rgba(64,200,96,0.4)",
                    "0 0 40px rgba(64,200,96,0.8)",
                    "0 0 20px rgba(64,200,96,0.4)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                CHEAT CODES
              </motion.h1>
              <p
                className="text-xs tracking-[0.3em] uppercase"
                style={{ color: "rgba(64,200,96,0.5)" }}
              >
                Enter a secret code to unlock rewards
              </p>
            </motion.div>

            <motion.form
              className="mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (code.trim()) handleActivate();
              }}
            >
              <Input
                ref={inputRef}
                data-ocid="cheats.input"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setResult(null);
                }}
                placeholder="TYPE CODE HERE..."
                className="h-14 text-center text-lg font-mono font-bold tracking-widest"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "1.5px solid rgba(64,200,96,0.4)",
                  color: "#40cc60",
                  caretColor: "#40cc60",
                  fontSize: "1.1rem",
                  textTransform: "uppercase",
                }}
                type="text"
                inputMode="text"
                enterKeyHint="go"
                autoCapitalize="characters"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                type="submit"
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                }}
                aria-hidden
              />
            </motion.form>

            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key={result.message}
                  data-ocid={
                    result.type === "success"
                      ? "cheats.success_state"
                      : "cheats.error_state"
                  }
                  className="mb-4 rounded-lg px-4 py-3 text-center font-bold text-sm"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  style={{
                    background:
                      result.type === "success"
                        ? "rgba(64,200,96,0.15)"
                        : "rgba(200,50,50,0.15)",
                    border:
                      result.type === "success"
                        ? "1px solid rgba(64,200,96,0.4)"
                        : "1px solid rgba(200,50,50,0.4)",
                    color: result.type === "success" ? "#40cc60" : "#cc4040",
                  }}
                >
                  {result.message}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="flex flex-col gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  data-ocid="cheats.submit_button"
                  className="w-full h-14 text-base font-black tracking-widest relative overflow-hidden"
                  style={{
                    background: "rgba(64,200,96,0.12)",
                    border: "1.5px solid #40cc60",
                    color: "#40cc60",
                  }}
                  onClick={handleActivate}
                  disabled={!code.trim()}
                >
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(64,200,96,0.2), transparent)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                  />
                  ACTIVATE
                </Button>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  data-ocid="cheats.close_button"
                  className="w-full h-12 text-sm font-bold tracking-wide"
                  style={{
                    background: "rgba(216,195,138,0.06)",
                    border: "1px solid rgba(216,195,138,0.25)",
                    color: "rgba(216,195,138,0.6)",
                  }}
                  onClick={onClose}
                >
                  BACK TO MENU
                </Button>
              </motion.div>
            </motion.div>
          </div>

          <div
            style={{
              height: 2,
              background:
                "linear-gradient(90deg, transparent, #40cc60, transparent)",
            }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
