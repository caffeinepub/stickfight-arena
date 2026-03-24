import { Button } from "@/components/ui/button";
import { ALL_MAPS } from "@/game/maps";
import type { MapDefinition, Platform } from "@/game/types";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  onSelect: (map: MapDefinition) => void;
  onCustom: () => void;
  onBack: () => void;
}

function MapPreview({ platforms }: { platforms: Platform[] }) {
  const scaleX = 80 / 800;
  const scaleY = 50 / 450;
  return (
    <svg
      width={80}
      height={50}
      style={{ display: "block" }}
      aria-label="Map preview"
    >
      <title>Map preview</title>
      <rect width={80} height={50} fill="rgba(0,0,0,0.4)" rx={4} />
      {platforms.map((p) => (
        <rect
          key={`${p.x}-${p.y}-${p.w}`}
          x={p.x * scaleX}
          y={p.y * scaleY}
          width={p.w * scaleX}
          height={Math.max(2, p.h * scaleY)}
          fill="#888"
          rx={1}
        />
      ))}
    </svg>
  );
}

export default function MapSelectScreen({ onSelect, onCustom, onBack }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 py-8 overflow-y-auto">
        <motion.div
          className="w-full max-w-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black" style={{ color: "#D8C38A" }}>
              SELECT MAP
            </h1>
            <p className="text-muted-foreground mt-1">
              Choose your battlefield
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            {/* Custom map card */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              onClick={onCustom}
              onMouseEnter={() => setHovered("custom-builder")}
              onMouseLeave={() => setHovered(null)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all cursor-pointer"
              style={{
                background:
                  hovered === "custom-builder"
                    ? "rgba(216,195,138,0.12)"
                    : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${hovered === "custom-builder" ? "#D8C38A" : "rgba(255,255,255,0.1)"}`,
              }}
            >
              <div className="text-3xl">🗺️</div>
              <MapPreview platforms={[{ x: 0, y: 405, w: 800, h: 45 }]} />
              <p
                className="text-xs font-bold text-center"
                style={{ color: "#D8C38A" }}
              >
                Custom Map
              </p>
              <p className="text-xs text-muted-foreground text-center">
                Build your own
              </p>
            </motion.button>

            {ALL_MAPS.map((map) => (
              <motion.button
                key={map.id}
                type="button"
                whileHover={{ scale: 1.04 }}
                onClick={() => onSelect(map)}
                onMouseEnter={() => setHovered(map.id)}
                onMouseLeave={() => setHovered(null)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg transition-all cursor-pointer"
                style={{
                  background:
                    hovered === map.id
                      ? `${map.bgColor}88`
                      : "rgba(255,255,255,0.03)",
                  border: `1.5px solid ${hovered === map.id ? "#D8C38A" : "rgba(255,255,255,0.1)"}`,
                }}
              >
                <div className="text-2xl">{map.emoji}</div>
                <MapPreview platforms={map.platforms} />
                <p
                  className="text-xs font-bold text-center leading-tight"
                  style={{ color: hovered === map.id ? "#D8C38A" : "#ccc" }}
                >
                  {map.name}
                </p>
              </motion.button>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={onBack} className="w-32">
              ← Back
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
