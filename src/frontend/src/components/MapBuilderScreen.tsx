import { Button } from "@/components/ui/button";
import type { Platform } from "@/game/types";
import { motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

const CANVAS_W = 800;
const CANVAS_H = 450;
const COLS = 20;
const ROWS = 20;
const CELL_W = CANVAS_W / COLS; // 40
const CELL_H = CANVAS_H / ROWS; // 22.5

type Cell = { col: number; row: number };

function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

function cellsToPlatforms(cells: Cell[]): Platform[] {
  // Group consecutive cells in same row into one platform
  const byRow: Map<number, number[]> = new Map();
  for (const c of cells) {
    if (!byRow.has(c.row)) byRow.set(c.row, []);
    byRow.get(c.row)!.push(c.col);
  }
  const platforms: Platform[] = [];
  byRow.forEach((cols, row) => {
    const sorted = [...cols].sort((a, b) => a - b);
    let start = sorted[0];
    let end = sorted[0];
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === end + 1) {
        end = sorted[i];
      } else {
        platforms.push({
          x: start * CELL_W,
          y: row * CELL_H,
          w: (end - start + 1) * CELL_W,
          h: Math.max(8, CELL_H * 0.5),
        });
        start = sorted[i];
        end = sorted[i];
      }
    }
    platforms.push({
      x: start * CELL_W,
      y: row * CELL_H,
      w: (end - start + 1) * CELL_W,
      h: Math.max(8, CELL_H * 0.5),
    });
  });
  return platforms;
}

interface Props {
  onPlay: (platforms: Platform[], bgColor: string) => void;
  onBack: () => void;
}

export default function MapBuilderScreen({ onPlay, onBack }: Props) {
  // Ground row is always filled (row 18 = y ~405)
  const groundRow = 18;
  const [cells, setCells] = useState<Set<string>>(
    () => new Set(Array.from({ length: COLS }, (_, c) => `${c},${groundRow}`)),
  );
  const [bgColor, setBgColor] = useState("#101820");
  const isDrawingRef = useRef(false);
  const drawModeRef = useRef<"add" | "remove">("add");

  const toggleCell = useCallback(
    (col: number, row: number, mode: "add" | "remove") => {
      if (row === groundRow) return; // can't remove ground
      setCells((prev) => {
        const next = new Set(prev);
        if (mode === "add") next.add(cellKey(col, row));
        else next.delete(cellKey(col, row));
        return next;
      });
    },
    [],
  );

  const handleMouseDown = (col: number, row: number) => {
    isDrawingRef.current = true;
    const key = cellKey(col, row);
    drawModeRef.current = cells.has(key) ? "remove" : "add";
    toggleCell(col, row, drawModeRef.current);
  };

  const handleMouseEnter = (col: number, row: number) => {
    if (isDrawingRef.current) {
      toggleCell(col, row, drawModeRef.current);
    }
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
  };

  const handleClear = () => {
    setCells(
      new Set(Array.from({ length: COLS }, (_, c) => cellKey(c, groundRow))),
    );
  };

  const handlePlay = () => {
    const platforms = cellsToPlatforms(
      Array.from(cells).map((k) => {
        const [c, r] = k.split(",").map(Number);
        return { col: c, row: r };
      }),
    );
    onPlay(platforms, bgColor);
  };

  const nonGroundCount = Array.from(cells).filter(
    (k) => !k.endsWith(`,${groundRow}`),
  ).length;

  const SCALE = Math.min(1, 680 / CANVAS_W);
  const displayW = CANVAS_W * SCALE;
  const displayH = CANVAS_H * SCALE;
  const cellDisplayW = CELL_W * SCALE;
  const cellDisplayH = CELL_H * SCALE;

  const bgColors = [
    "#101820",
    "#0d2010",
    "#050515",
    "#1a1520",
    "#0a1525",
    "#2a0a00",
    "#150800",
    "#050520",
    "#0a0a0a",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 px-4">
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-4xl font-black" style={{ color: "#D8C38A" }}>
            MAP BUILDER
          </h1>
          <p className="text-muted-foreground mt-1">
            Click/drag to place or remove platforms
          </p>
        </div>

        <div className="flex gap-4 mb-4 justify-center flex-wrap">
          <span className="text-sm text-muted-foreground">
            Platforms:{" "}
            <span style={{ color: "#D8C38A" }}>{nonGroundCount}</span> cells
          </span>
          <div className="flex gap-2 items-center">
            <span className="text-sm text-muted-foreground">Background:</span>
            {bgColors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setBgColor(c)}
                className="w-6 h-6 rounded border-2 transition-transform hover:scale-110"
                style={{
                  background: c,
                  borderColor: bgColor === c ? "#D8C38A" : "transparent",
                }}
                title={c}
              />
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div
          className="mx-auto rounded-lg overflow-hidden"
          style={{
            width: displayW,
            height: displayH,
            background: bgColor,
            border: "1px solid rgba(255,255,255,0.1)",
            cursor: "crosshair",
            userSelect: "none",
          }}
          onMouseLeave={handleMouseUp}
          onMouseUp={handleMouseUp}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${COLS}, ${cellDisplayW}px)`,
              gridTemplateRows: `repeat(${ROWS}, ${cellDisplayH}px)`,
              width: displayW,
              height: displayH,
            }}
          >
            {Array.from({ length: ROWS }, (_, row) =>
              Array.from({ length: COLS }, (_, col) => {
                const key = cellKey(col, row);
                const filled = cells.has(key);
                const isGround = row === groundRow;
                return (
                  <div
                    key={key}
                    onMouseDown={() => handleMouseDown(col, row)}
                    onMouseEnter={() => handleMouseEnter(col, row)}
                    style={{
                      width: cellDisplayW,
                      height: cellDisplayH,
                      background: filled
                        ? isGround
                          ? "#556677"
                          : "#8899aa"
                        : "rgba(255,255,255,0.02)",
                      border: "0.5px solid rgba(255,255,255,0.04)",
                      boxSizing: "border-box",
                    }}
                  />
                );
              }),
            )}
          </div>
        </div>

        <div className="flex gap-4 mt-6 justify-center">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <Button
            variant="outline"
            onClick={handleClear}
            style={{ borderColor: "rgba(255,80,80,0.4)", color: "#ff8080" }}
          >
            Clear
          </Button>
          <Button
            onClick={handlePlay}
            style={{ background: "#D8C38A", color: "#1b242a" }}
            className="font-bold px-8"
          >
            ⚔️ Play This Map!
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
