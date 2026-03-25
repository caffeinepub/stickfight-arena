import { FINISHER_DURATION } from "./engine";
import type {
  GameState,
  Particle,
  Platform,
  Player,
  Projectile,
  SpecialAbility,
} from "./types";
import { PLAYER_COLOR_HEX } from "./types";

const CANVAS_W = 800;
const CANVAS_H = 450;

function colorToRgba(hex: string, alpha: number): string {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function drawBackground(
  ctx: CanvasRenderingContext2D,
  tick: number,
  bgColor = "#1b242a",
) {
  const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  bg.addColorStop(0, bgColor);
  bg.addColorStop(1, bgColor);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.strokeStyle = "rgba(216,195,138,0.04)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const y = 60 + i * 65 + Math.sin(tick * 0.3 + i) * 3;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_W, y);
    ctx.stroke();
  }

  const vignette = ctx.createRadialGradient(
    CANVAS_W / 2,
    CANVAS_H / 2,
    CANVAS_H * 0.2,
    CANVAS_W / 2,
    CANVAS_H / 2,
    CANVAS_H * 0.9,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
}

function drawPlatforms(ctx: CanvasRenderingContext2D, platforms: Platform[]) {
  for (const plat of platforms) {
    ctx.shadowColor = "rgba(216,195,138,0.3)";
    ctx.shadowBlur = 8;
    const isGround = plat.h > 20;
    if (isGround) {
      const grad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.h);
      grad.addColorStop(0, "#2a3540");
      grad.addColorStop(1, "#1a2228");
      ctx.fillStyle = grad;
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      ctx.fillStyle = "rgba(216,195,138,0.25)";
      ctx.fillRect(plat.x, plat.y, plat.w, 2);
    } else {
      ctx.fillStyle = "#2e3e4a";
      ctx.beginPath();
      ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 3);
      ctx.fill();
      ctx.fillStyle = "rgba(216,195,138,0.4)";
      ctx.fillRect(plat.x + 4, plat.y, plat.w - 8, 2);
    }
    ctx.shadowBlur = 0;
  }
}

function drawHat(
  ctx: CanvasRenderingContext2D,
  x: number,
  headTopY: number,
  hat: Player["customization"]["hat"],
  color: string,
  facing: number,
) {
  ctx.save();
  switch (hat) {
    case "crown": {
      const cw = 26;
      const ch = 14;
      ctx.fillStyle = "#D8C38A";
      ctx.strokeStyle = "#b8a060";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - cw / 2, headTopY);
      ctx.lineTo(x - cw / 2, headTopY - ch);
      ctx.lineTo(x - cw / 4, headTopY - ch * 0.5);
      ctx.lineTo(x, headTopY - ch);
      ctx.lineTo(x + cw / 4, headTopY - ch * 0.5);
      ctx.lineTo(x + cw / 2, headTopY - ch);
      ctx.lineTo(x + cw / 2, headTopY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ff6060";
      ctx.beginPath();
      ctx.arc(x, headTopY - ch + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "cap": {
      ctx.fillStyle = color;
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 16, 8, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = colorToRgba(color, 0.8);
      ctx.beginPath();
      ctx.ellipse(
        x + facing * 8,
        headTopY + 2,
        10,
        4,
        0.1 * facing,
        0,
        Math.PI,
      );
      ctx.fill();
      break;
    }
    case "headband": {
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(x, headTopY + 8, 14, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x + facing * 13, headTopY + 10, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "wizard": {
      ctx.fillStyle = "#6030a0";
      ctx.strokeStyle = "#9060d0";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 14, headTopY + 2);
      ctx.lineTo(x, headTopY - 26);
      ctx.lineTo(x + 14, headTopY + 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#7040b0";
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 17, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffe040";
      ctx.font = "8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("★", x, headTopY - 10);
      break;
    }
    case "viking": {
      ctx.fillStyle = "#888";
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 4, 15, 8, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#ccc";
      ctx.beginPath();
      ctx.moveTo(x - 13, headTopY + 2);
      ctx.quadraticCurveTo(x - 22, headTopY - 8, x - 18, headTopY - 18);
      ctx.quadraticCurveTo(x - 14, headTopY - 10, x - 10, headTopY);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 13, headTopY + 2);
      ctx.quadraticCurveTo(x + 22, headTopY - 8, x + 18, headTopY - 18);
      ctx.quadraticCurveTo(x + 14, headTopY - 10, x + 10, headTopY);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "ninja": {
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 10, 16, 12, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(x - 15, headTopY + 4, 30, 10);
      ctx.fillStyle = "#e05050";
      ctx.beginPath();
      ctx.ellipse(x + facing * 4, headTopY + 5, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "cowboy": {
      ctx.fillStyle = "#8B5E3C";
      ctx.strokeStyle = "#5C3D1E";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 12, 10, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 22, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#D8C38A";
      ctx.fillRect(x - 12, headTopY - 1, 24, 3);
      break;
    }
    case "party": {
      const colors = ["#ff4080", "#ffcc00", "#00ccff", "#ff6020"];
      ctx.fillStyle = colors[0];
      ctx.beginPath();
      ctx.moveTo(x - 12, headTopY + 2);
      ctx.lineTo(x, headTopY - 22);
      ctx.lineTo(x + 12, headTopY + 2);
      ctx.closePath();
      ctx.fill();
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = colors[i + 1];
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(x - 12 + i * 4, headTopY + 2);
        ctx.lineTo(x - 8 + i * 4, headTopY - 20);
        ctx.lineTo(x - 4 + i * 4, headTopY + 2);
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, headTopY - 22, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "bunny": {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 8, headTopY);
      ctx.quadraticCurveTo(x - 14, headTopY - 20, x - 8, headTopY - 28);
      ctx.stroke();
      ctx.strokeStyle = "#ffaacc";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 8, headTopY - 2);
      ctx.quadraticCurveTo(x - 12, headTopY - 16, x - 8, headTopY - 24);
      ctx.stroke();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 8, headTopY);
      ctx.quadraticCurveTo(x + 14, headTopY - 20, x + 8, headTopY - 28);
      ctx.stroke();
      ctx.strokeStyle = "#ffaacc";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x + 8, headTopY - 2);
      ctx.quadraticCurveTo(x + 12, headTopY - 16, x + 8, headTopY - 24);
      ctx.stroke();
      break;
    }
    case "beret": {
      ctx.fillStyle = "#8B0000";
      ctx.beginPath();
      ctx.ellipse(
        x - facing * 4,
        headTopY + 1,
        16,
        9,
        -0.2 * facing,
        Math.PI,
        0,
      );
      ctx.fill();
      ctx.fillStyle = "#aa2020";
      ctx.beginPath();
      ctx.arc(x + facing * 6, headTopY + 1, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "topHat": {
      ctx.fillStyle = "#111";
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1;
      ctx.fillRect(x - 10, headTopY - 24, 20, 24);
      ctx.strokeRect(x - 10, headTopY - 24, 20, 24);
      ctx.fillRect(x - 15, headTopY - 2, 30, 4);
      break;
    }
    case "pirate": {
      ctx.fillStyle = "#111";
      ctx.beginPath();
      ctx.moveTo(x - 18, headTopY + 2);
      ctx.lineTo(x - 10, headTopY - 18);
      ctx.lineTo(x + 10, headTopY - 18);
      ctx.lineTo(x + 18, headTopY + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f0f0f0";
      ctx.beginPath();
      ctx.arc(x, headTopY - 14, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.font = "bold 7px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("☠", x, headTopY - 11);
      break;
    }
    case "alien": {
      ctx.fillStyle = "#40e040";
      ctx.strokeStyle = "#208020";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, headTopY - 8, 12, 16, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#80ff80";
      ctx.beginPath();
      ctx.ellipse(x - 4, headTopY - 18, 3, 2, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x + 4, headTopY - 18, 3, 2, 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "knight": {
      ctx.fillStyle = "#999";
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, headTopY + 2, 15, Math.PI, 0);
      ctx.lineTo(x + 15, headTopY + 10);
      ctx.lineTo(x - 15, headTopY + 10);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#aaa";
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 15, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#cc4444";
      ctx.beginPath();
      ctx.moveTo(x - 2, headTopY - 14);
      ctx.quadraticCurveTo(x + 12, headTopY - 10, x + 18, headTopY - 18);
      ctx.quadraticCurveTo(x + 8, headTopY - 8, x + 2, headTopY - 14);
      ctx.fill();
      break;
    }
    case "santa": {
      ctx.fillStyle = "#cc2020";
      ctx.beginPath();
      ctx.moveTo(x - 14, headTopY + 2);
      ctx.lineTo(x - 4, headTopY - 22);
      ctx.lineTo(x + 14, headTopY + 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(x - 15, headTopY, 30, 5);
      ctx.beginPath();
      ctx.arc(x - 4, headTopY - 22, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "graduation": {
      ctx.fillStyle = "#111";
      ctx.fillRect(x - 14, headTopY - 2, 28, 6);
      ctx.fillRect(x - 10, headTopY - 14, 20, 12);
      ctx.fillStyle = "#FFD700";
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, headTopY - 2);
      ctx.lineTo(x + 18, headTopY - 8);
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(x + 18, headTopY - 8, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "chef": {
      ctx.fillStyle = "#f5f5f5";
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, headTopY - 10, 13, 18, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(x - 13, headTopY - 4, 26, 6);
      break;
    }
    case "police": {
      ctx.fillStyle = "#1a3a6a";
      ctx.strokeStyle = "#0a1a4a";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 1, 14, 9, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 1, 18, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(x, headTopY - 4, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "detective": {
      ctx.fillStyle = "#5a4030";
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, headTopY, 12, 10, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, headTopY, 20, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#222";
      ctx.fillRect(x - 12, headTopY - 3, 24, 3);
      break;
    }
    case "horns": {
      ctx.fillStyle = "#cc3333";
      ctx.strokeStyle = "#881111";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 10, headTopY);
      ctx.lineTo(x - 14, headTopY - 20);
      ctx.lineTo(x - 6, headTopY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + 10, headTopY);
      ctx.lineTo(x + 14, headTopY - 20);
      ctx.lineTo(x + 6, headTopY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "halo": {
      ctx.strokeStyle = "#FFD700";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#FFD700";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(x, headTopY - 8, 14, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;
    }
    case "mushroom": {
      ctx.fillStyle = "#dd2222";
      ctx.beginPath();
      ctx.arc(x, headTopY - 6, 16, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#f5f5f5";
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(x + i * 8, headTopY - 8, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "#f0e0c0";
      ctx.beginPath();
      ctx.ellipse(x, headTopY, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "flower": {
      const petalColors = [
        "#ff80c0",
        "#ff40a0",
        "#ffb0d0",
        "#ff60b0",
        "#ffc0e0",
      ];
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        ctx.fillStyle = petalColors[i];
        ctx.beginPath();
        ctx.ellipse(
          x + Math.cos(angle) * 10,
          headTopY - 6 + Math.sin(angle) * 8,
          5,
          4,
          angle,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(x, headTopY - 6, 6, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "feather": {
      ctx.strokeStyle = "#c0a040";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + facing * 6, headTopY + 2);
      ctx.quadraticCurveTo(
        x + facing * 12,
        headTopY - 12,
        x + facing * 8,
        headTopY - 28,
      );
      ctx.stroke();
      ctx.strokeStyle = "#e8c860";
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const t = i / 4;
        const px = x + facing * (6 + t * 2);
        const py = headTopY + 2 - t * 30;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + facing * 8, py - 4);
        ctx.stroke();
      }
      break;
    }
    case "mohawk": {
      const mColors = ["#ff2020", "#ff8020", "#ffff20", "#20ff20", "#2020ff"];
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = mColors[i];
        ctx.beginPath();
        ctx.moveTo(x - 5 + i * 2, headTopY);
        ctx.lineTo(x - 3 + i * 2, headTopY - 20 - Math.sin(i * 0.8) * 4);
        ctx.lineTo(x - 1 + i * 2, headTopY);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case "bandana": {
      ctx.fillStyle = "#cc2020";
      ctx.beginPath();
      ctx.arc(x, headTopY + 6, 16, Math.PI * 1.1, Math.PI * 1.9);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#cc2020";
      ctx.stroke();
      ctx.fillStyle = "#cc2020";
      ctx.fillRect(x - 16, headTopY + 2, 32, 6);
      ctx.fillStyle = "#dd4444";
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x - 14 + i * 8, headTopY + 2, 4, 6);
      }
      break;
    }
    case "propeller": {
      ctx.fillStyle = "#333";
      ctx.beginPath();
      ctx.arc(x, headTopY - 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#4488ff";
      ctx.save();
      ctx.translate(x, headTopY - 4);
      for (let i = 0; i < 4; i++) {
        ctx.rotate(Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(6, 0, 8, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
      break;
    }
    case "football": {
      ctx.fillStyle = "#8B4513";
      ctx.strokeStyle = "#5C2D00";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 1, 14, 10, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#f0f0f0";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 10, headTopY - 2);
      ctx.lineTo(x + 10, headTopY - 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, headTopY - 6);
      ctx.lineTo(x, headTopY + 2);
      ctx.stroke();
      break;
    }
    case "baseball": {
      ctx.fillStyle = "#f0f0f0";
      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 15, 9, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x + facing * 8, headTopY + 2, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#cc4444";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x - 4, headTopY - 2, 6, 0.5, 1.5);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 4, headTopY - 2, 6, 1.8, 2.8);
      ctx.stroke();
      break;
    }
    case "samurai": {
      ctx.fillStyle = "#2a2a2a";
      ctx.strokeStyle = "#111";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 16, 10, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#3a3a3a";
      ctx.beginPath();
      ctx.moveTo(x - 20, headTopY + 2);
      ctx.quadraticCurveTo(x, headTopY - 8, x + 20, headTopY + 2);
      ctx.fill();
      ctx.fillStyle = "#cc3333";
      ctx.fillRect(x - 16, headTopY - 1, 32, 3);
      break;
    }
    case "pharaoh": {
      ctx.fillStyle = "#DAA520";
      ctx.strokeStyle = "#8B6914";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 14, headTopY + 8);
      ctx.lineTo(x - 8, headTopY - 20);
      ctx.lineTo(x + 8, headTopY - 20);
      ctx.lineTo(x + 14, headTopY + 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 13 + i * 6, headTopY + 6);
        ctx.lineTo(x - 7 + i * 5, headTopY - 18);
        ctx.stroke();
      }
      ctx.fillStyle = "#cc3030";
      ctx.beginPath();
      ctx.moveTo(x, headTopY - 20);
      ctx.lineTo(x - 3, headTopY - 28);
      ctx.lineTo(x + 3, headTopY - 28);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "jester": {
      const jColors = ["#cc2020", "#2020cc", "#20cc20"];
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = jColors[i];
        const startAngle = (i / 3) * Math.PI + Math.PI;
        const endAngle = ((i + 1) / 3) * Math.PI + Math.PI;
        ctx.beginPath();
        ctx.moveTo(x, headTopY + 2);
        ctx.arc(x, headTopY + 2, 14, startAngle, endAngle);
        ctx.closePath();
        ctx.fill();
      }
      ctx.fillStyle = jColors[0];
      ctx.beginPath();
      ctx.moveTo(x - 10, headTopY - 2);
      ctx.lineTo(x - 14, headTopY - 18);
      ctx.lineTo(x - 6, headTopY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = jColors[1];
      ctx.beginPath();
      ctx.moveTo(x + 10, headTopY - 2);
      ctx.lineTo(x + 14, headTopY - 18);
      ctx.lineTo(x + 6, headTopY - 2);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#FFD700";
      ctx.beginPath();
      ctx.arc(x - 14, headTopY - 18, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 14, headTopY - 18, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "robot": {
      ctx.fillStyle = "#666";
      ctx.strokeStyle = "#888";
      ctx.lineWidth = 1.5;
      ctx.fillRect(x - 14, headTopY - 20, 28, 22);
      ctx.strokeRect(x - 14, headTopY - 20, 28, 22);
      ctx.fillStyle = "#222";
      ctx.fillRect(x - 10, headTopY - 16, 8, 6);
      ctx.fillRect(x + 2, headTopY - 16, 8, 6);
      ctx.fillStyle = "#00ff88";
      ctx.beginPath();
      ctx.arc(x - 6, headTopY - 13, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 6, headTopY - 13, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#888";
      ctx.fillRect(x - 6, headTopY - 22, 12, 4);
      break;
    }
    case "tiara": {
      ctx.fillStyle = "#FFD700";
      ctx.strokeStyle = "#b8860b";
      ctx.lineWidth = 1;
      ctx.fillRect(x - 14, headTopY - 1, 28, 4);
      const tPoints = [-10, -6, 0, 6, 10];
      const tHeights = [10, 6, 14, 6, 10];
      for (let i = 0; i < tPoints.length; i++) {
        ctx.fillStyle = i === 2 ? "#FFD700" : "#FFD700";
        ctx.beginPath();
        ctx.moveTo(x + tPoints[i] - 2, headTopY - 1);
        ctx.lineTo(x + tPoints[i], headTopY - tHeights[i]);
        ctx.lineTo(x + tPoints[i] + 2, headTopY - 1);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      ctx.fillStyle = "#ff69b4";
      ctx.beginPath();
      ctx.arc(x, headTopY - 14, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "hardhat": {
      ctx.fillStyle = "#FFD700";
      ctx.strokeStyle = "#CC9900";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 16, 10, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 20, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e5c200";
      ctx.fillRect(x - 10, headTopY - 6, 20, 4);
      break;
    }
    case "sombrero": {
      ctx.fillStyle = "#8B5E3C";
      ctx.strokeStyle = "#5C3D1E";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, headTopY, 12, 10, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, headTopY, 28, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#e8a040";
      ctx.strokeStyle = "#cc7020";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(x, headTopY, 14, 4, 0, Math.PI, 0);
      ctx.stroke();
      break;
    }
    case "beanie": {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 16, 12, 0, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.3)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(x - 16 + i * 10, headTopY - 4);
        ctx.lineTo(x - 14 + i * 10, headTopY + 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#f0f0f0";
      ctx.beginPath();
      ctx.arc(x, headTopY - 8, 4, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "deerstalker": {
      ctx.fillStyle = "#8B7355";
      ctx.strokeStyle = "#5C4D30";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 1, 14, 9, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 1, 20, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#7a6344";
      ctx.beginPath();
      ctx.moveTo(x - 6, headTopY - 4);
      ctx.quadraticCurveTo(x, headTopY - 14, x + 6, headTopY - 4);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "laurel": {
      ctx.strokeStyle = "#228B22";
      ctx.fillStyle = "#228B22";
      ctx.lineWidth = 2;
      for (let i = -3; i <= 3; i++) {
        const lx = x + i * 6;
        const ly = headTopY - Math.abs(i) * 1.5;
        ctx.beginPath();
        ctx.ellipse(lx - 2, ly - 4, 4, 6, i * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(lx + 2, ly - 4, 4, 6, -i * 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    default:
      break;
  }
  ctx.restore();
}

function drawStatusEffects(
  ctx: CanvasRenderingContext2D,
  player: Player,
  cx: number,
  cy: number,
  tick: number,
) {
  const PLAYER_H = 70;
  const midY = cy - PLAYER_H / 2;

  if (player.shielded) {
    const pulse = 0.7 + Math.sin(tick * 8) * 0.3;
    ctx.save();
    ctx.globalAlpha = pulse * 0.6;
    ctx.strokeStyle = "#80c8ff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#80c8ff";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(cx, midY, 38, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = pulse * 0.15;
    ctx.fillStyle = "#80c8ff";
    ctx.fill();
    ctx.restore();
  }

  if (player.frozen) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = "#80d8ff";
    ctx.fillRect(cx - 14, cy - PLAYER_H - 2, 28, PLAYER_H + 2);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.font = "16px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("❄", cx, cy - PLAYER_H - 8);
    ctx.restore();
  }

  if (player.speedBoosted) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = "#ffff40";
    ctx.lineWidth = 2;
    ctx.shadowColor = "#ffff40";
    ctx.shadowBlur = 8;
    const dir = player.facing;
    for (let i = 1; i <= 3; i++) {
      ctx.globalAlpha = 0.5 - i * 0.12;
      ctx.beginPath();
      ctx.moveTo(cx - dir * (i * 8), midY - 20);
      ctx.lineTo(cx - dir * (i * 8 + 6), midY + 10);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (player.fireSpinActive) {
    ctx.save();
    const spinAngle = tick * 6;
    for (let i = 0; i < 6; i++) {
      const angle = spinAngle + (i * Math.PI * 2) / 6;
      const fx = cx + Math.cos(angle) * 36;
      const fy = midY + Math.sin(angle) * 24;
      const pulse = 0.7 + Math.sin(tick * 10 + i) * 0.3;
      ctx.globalAlpha = pulse * 0.9;
      ctx.fillStyle = i % 2 === 0 ? "#ff6020" : "#ffcc00";
      ctx.shadowColor = "#ff6020";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(fx, fy, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawStickFigure(
  ctx: CanvasRenderingContext2D,
  player: Player,
  tick: number,
) {
  const { pos, facing, animState, customization } = player;
  const color = PLAYER_COLOR_HEX[customization.color];
  const cx = pos.x;
  const feet = pos.y;

  drawStatusEffects(ctx, player, cx, feet, tick);

  if (player.isInvincible && !player.shielded) {
    ctx.globalAlpha = 0.4 + Math.sin(tick * 20) * 0.3;
  } else if (player.frozen) {
    ctx.globalAlpha = 0.7;
  }

  const HEAD_R = 15;
  const BODY_LEN = 42;
  const ARM_LEN = 28;
  const LEG_LEN = 32;
  const headY = feet - BODY_LEN - HEAD_R * 1.3;
  const shoulderY = headY + HEAD_R * 1.5;
  const hipY = shoulderY + BODY_LEN;
  const midBodyY = (shoulderY + hipY) / 2;

  let walkCycle = 0;
  let armSwing = 0;
  let bodyBob = 0;

  if (animState === "walk") {
    walkCycle = Math.sin(tick * 12) * 18;
    armSwing = Math.sin(tick * 12 + Math.PI) * 25;
    bodyBob = Math.abs(Math.sin(tick * 12)) * -2;
  } else if (animState === "attack") {
    armSwing = facing * 40;
    bodyBob = -3;
  } else if (animState === "special") {
    armSwing = facing * 50;
    bodyBob = -5;
  } else if (animState === "jump") {
    walkCycle = -20;
    armSwing = -30;
  } else if (animState === "hurt") {
    bodyBob = 5;
  }

  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = player.frozen ? 0 : 6;

  ctx.beginPath();
  ctx.moveTo(cx, shoulderY + bodyBob);
  ctx.lineTo(cx, hipY + bodyBob);
  ctx.stroke();

  ctx.shadowBlur = player.frozen ? 0 : 10;
  ctx.beginPath();
  ctx.arc(cx, headY + bodyBob, HEAD_R, 0, Math.PI * 2);
  ctx.stroke();

  const eyeOffset = facing * 4;
  ctx.fillStyle = color;
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(cx + eyeOffset, headY + bodyBob - 3, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowBlur = 4;
  if (animState === "attack" || animState === "special") {
    ctx.beginPath();
    ctx.moveTo(cx, midBodyY + bodyBob);
    ctx.lineTo(
      cx + facing * ARM_LEN * 0.8 + armSwing * 0.5,
      midBodyY - 10 + bodyBob,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, midBodyY + bodyBob);
    ctx.lineTo(
      cx + facing * ARM_LEN * 0.6 + armSwing * 0.3,
      midBodyY + 12 + bodyBob,
    );
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(cx, midBodyY + bodyBob);
    ctx.lineTo(
      cx - facing * ARM_LEN * 0.5 - armSwing * 0.2,
      midBodyY + 8 + bodyBob,
    );
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, midBodyY + bodyBob);
    ctx.lineTo(
      cx + facing * ARM_LEN * 0.5 + armSwing * 0.2,
      midBodyY + 6 + bodyBob,
    );
    ctx.stroke();
  }

  const leftLegAngle = animState === "idle" ? 0.2 : (walkCycle * Math.PI) / 180;
  const rightLegAngle =
    animState === "idle" ? -0.2 : (-walkCycle * Math.PI) / 180;

  ctx.beginPath();
  ctx.moveTo(cx, hipY + bodyBob);
  ctx.lineTo(cx + Math.sin(leftLegAngle) * LEG_LEN, feet);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, hipY + bodyBob);
  ctx.lineTo(cx + Math.sin(rightLegAngle) * LEG_LEN, feet);
  ctx.stroke();

  ctx.shadowBlur = 0;
  drawHat(ctx, cx, headY + bodyBob - HEAD_R, customization.hat, color, facing);
  ctx.globalAlpha = 1;

  if (player.attackCooldown <= 0) {
    ctx.strokeStyle = colorToRgba(color, 0.15);
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 5]);
    ctx.beginPath();
    ctx.arc(cx, midBodyY, 72, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

function drawProjectiles(
  ctx: CanvasRenderingContext2D,
  projectiles: Projectile[],
  tick: number,
) {
  for (const proj of projectiles) {
    if (!proj.active) continue;
    const pulse = 0.8 + Math.sin(tick * 20) * 0.2;
    ctx.shadowColor = proj.color;
    ctx.shadowBlur = 16;
    ctx.fillStyle = proj.color;
    ctx.beginPath();

    if (proj.type === "frost") {
      ctx.save();
      ctx.translate(proj.x, proj.y);
      ctx.rotate(tick * 4);
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * 8, Math.sin(a) * 8);
        ctx.strokeStyle = "#80d8ff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    } else {
      ctx.arc(proj.x, proj.y, 7 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = colorToRgba(proj.color, 0.3);
      ctx.beginPath();
      ctx.arc(proj.x - proj.vx * 2, proj.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }
}

function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

function drawHUD(ctx: CanvasRenderingContext2D, state: GameState) {
  const [p1, p2] = state.players;
  const barW = 200;
  const barH = 18;
  const padding = 16;

  const p1Color = PLAYER_COLOR_HEX[p1.customization.color];
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.beginPath();
  ctx.roundRect(padding, padding, barW, barH, 4);
  ctx.fill();
  const p1Pct = p1.hp / p1.maxHp;
  const p1BarGrad = ctx.createLinearGradient(padding, 0, padding + barW, 0);
  p1BarGrad.addColorStop(0, p1Color);
  p1BarGrad.addColorStop(1, colorToRgba(p1Color, 0.6));
  ctx.fillStyle = p1BarGrad;
  ctx.shadowColor = p1Color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.roundRect(padding, padding, barW * p1Pct, barH, 4);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#E8EEF2";
  ctx.font = "bold 12px 'Figtree', sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(`P1  ${Math.ceil(p1.hp)}HP`, padding + 4, padding + barH + 14);

  if (p1.specialCooldown > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.roundRect(padding, padding + barH + 18, barW, 6, 2);
    ctx.fill();
    const sPct = 1 - p1.specialCooldown / 6;
    ctx.fillStyle = p1Color;
    ctx.beginPath();
    ctx.roundRect(padding, padding + barH + 18, barW * sPct, 6, 2);
    ctx.fill();
    ctx.fillStyle = "rgba(232,238,242,0.5)";
    ctx.font = "10px 'Figtree', sans-serif";
    ctx.fillText("SPECIAL", padding + 4, padding + barH + 34);
  } else {
    ctx.fillStyle = "#D8C38A";
    ctx.font = "bold 10px 'Figtree', sans-serif";
    ctx.fillText("SPECIAL READY", padding + 4, padding + barH + 30);
  }

  const p2Color = PLAYER_COLOR_HEX[p2.customization.color];
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.beginPath();
  ctx.roundRect(CANVAS_W - padding - barW, padding, barW, barH, 4);
  ctx.fill();
  const p2Pct = p2.hp / p2.maxHp;
  const p2BarGrad = ctx.createLinearGradient(
    CANVAS_W - padding - barW,
    0,
    CANVAS_W - padding,
    0,
  );
  p2BarGrad.addColorStop(0, colorToRgba(p2Color, 0.6));
  p2BarGrad.addColorStop(1, p2Color);
  ctx.fillStyle = p2BarGrad;
  ctx.shadowColor = p2Color;
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.roundRect(
    CANVAS_W - padding - barW + barW * (1 - p2Pct),
    padding,
    barW * p2Pct,
    barH,
    4,
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#E8EEF2";
  ctx.font = "bold 12px 'Figtree', sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(
    `${Math.ceil(p2.hp)}HP  P2`,
    CANVAS_W - padding - 4,
    padding + barH + 14,
  );

  if (p2.specialCooldown > 0) {
    const sX = CANVAS_W - padding - barW;
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.roundRect(sX, padding + barH + 18, barW, 6, 2);
    ctx.fill();
    const sPct = 1 - p2.specialCooldown / 6;
    ctx.fillStyle = p2Color;
    ctx.beginPath();
    ctx.roundRect(
      sX + barW * (1 - sPct),
      padding + barH + 18,
      barW * sPct,
      6,
      2,
    );
    ctx.fill();
    ctx.fillStyle = "rgba(232,238,242,0.5)";
    ctx.font = "10px 'Figtree', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("SPECIAL", CANVAS_W - padding - 4, padding + barH + 34);
  } else {
    ctx.fillStyle = "#D8C38A";
    ctx.font = "bold 10px 'Figtree', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("SPECIAL READY", CANVAS_W - padding - 4, padding + barH + 30);
  }

  const timerSecs = Math.ceil(state.timer);
  const timerColor = timerSecs <= 10 ? "#e05050" : "#D8C38A";
  ctx.fillStyle = timerColor;
  ctx.shadowColor = timerColor;
  ctx.shadowBlur = timerSecs <= 10 ? 12 : 4;
  ctx.font = "bold 28px 'Bricolage Grotesque', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(String(timerSecs).padStart(2, "0"), CANVAS_W / 2, 36);
  ctx.shadowBlur = 0;

  const pipR = 6;
  const pipGap = 18;
  const totalPips = state.maxRounds;
  const startX = CANVAS_W / 2 - ((totalPips - 1) * pipGap) / 2;
  for (let i = 0; i < totalPips; i++) {
    const px = startX + i * pipGap;
    const won1 = i < state.p1Wins;
    const won2 = i < state.p2Wins;
    const p1Col = PLAYER_COLOR_HEX[p1.customization.color];
    const p2Col = PLAYER_COLOR_HEX[p2.customization.color];
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(px, 52, pipR, 0, Math.PI * 2);
    ctx.stroke();
    if (won1) {
      ctx.fillStyle = p1Col;
      ctx.beginPath();
      ctx.arc(px, 52, pipR - 2, 0, Math.PI);
      ctx.fill();
    }
    if (won2) {
      ctx.fillStyle = p2Col;
      ctx.beginPath();
      ctx.arc(px, 52, pipR - 2, Math.PI, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = "rgba(232,238,242,0.5)";
  ctx.font = "11px 'Figtree', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`ROUND ${state.round} / ${state.maxRounds}`, CANVAS_W / 2, 72);
}

function drawRoundEnd(ctx: CanvasRenderingContext2D, state: GameState) {
  if (state.phase !== "roundEnd") return;
  const alpha = Math.min(1, (2.5 - state.roundEndTimer) * 2);
  ctx.fillStyle = `rgba(0,0,0,${alpha * 0.6})`;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.globalAlpha = alpha;
  const msg =
    state.roundWinner === 0
      ? "DRAW!"
      : `PLAYER ${state.roundWinner} WINS ROUND!`;
  ctx.fillStyle = "#D8C38A";
  ctx.shadowColor = "#D8C38A";
  ctx.shadowBlur = 30;
  ctx.font = "bold 52px 'Bricolage Grotesque', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(msg, CANVAS_W / 2, CANVAS_H / 2 - 10);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

// ──────────────────────────────────────────────────────────────────────────────
// FINISHER ANIMATIONS — Real drawn stick figure poses
// ──────────────────────────────────────────────────────────────────────────────

function getFinisherCategory(ability: SpecialAbility): string {
  const fire = [
    "fireSpin",
    "flameThrow",
    "meteorStrike",
    "explosionRing",
    "rocketLaunch",
    "grenadeThrow",
  ];
  const ice = ["iceFrost", "iceWall", "icicleSpear"];
  const lightning = ["lightningBolt", "chainLightning", "thunderClap"];
  const shadow = [
    "teleport",
    "shadowStep",
    "blink",
    "invisibility",
    "smokeBomb",
  ];
  const earth = [
    "groundSlam",
    "earthquakeStrike",
    "powerSlam",
    "spikeWall",
    "groundSpike",
  ];
  const energy = ["energyBlast", "laserBeam", "energyField", "sonicBoom"];
  const drain = ["vampireDrain", "lifesteal", "healingAura"];
  const wind = ["windBlast", "airSlash", "shockwave", "vortex", "blackHole"];
  if (fire.includes(ability)) return "fire";
  if (ice.includes(ability)) return "ice";
  if (lightning.includes(ability)) return "lightning";
  if (shadow.includes(ability)) return "shadow";
  if (earth.includes(ability)) return "earth";
  if (energy.includes(ability)) return "energy";
  if (drain.includes(ability)) return "drain";
  if (wind.includes(ability)) return "wind";
  return "slash";
}

// ── Pose system ──────────────────────────────────────────────────────────────

interface StickPose {
  headTilt: number; // head tilt offset (pixels, + = toward facing)
  bodyLean: number; // body lean angle from vertical (radians, + = toward facing)
  rightArmAngle: number; // right (forward) arm: 0=horizontal fwd, PI/2=down, -PI/2=up
  leftArmAngle: number; // left (back) arm: 0=horizontal bwd, PI/2=down, -PI/2=up
  rightLegAngle: number; // right leg from vertical: + = forward spread
  leftLegAngle: number; // left leg from vertical: + = backward spread
  xOffset: number; // absolute x offset from base position
  yOffset: number; // y offset: positive = upward
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

function lerpPose(a: StickPose, b: StickPose, t: number): StickPose {
  return {
    headTilt: lerp(a.headTilt, b.headTilt, t),
    bodyLean: lerp(a.bodyLean, b.bodyLean, t),
    rightArmAngle: lerp(a.rightArmAngle, b.rightArmAngle, t),
    leftArmAngle: lerp(a.leftArmAngle, b.leftArmAngle, t),
    rightLegAngle: lerp(a.rightLegAngle, b.rightLegAngle, t),
    leftLegAngle: lerp(a.leftLegAngle, b.leftLegAngle, t),
    xOffset: lerp(a.xOffset, b.xOffset, t),
    yOffset: lerp(a.yOffset, b.yOffset, t),
  };
}

function getPoseAt(
  keyframes: Array<{ t: number; pose: StickPose }>,
  t: number,
): StickPose {
  if (t <= keyframes[0].t) return keyframes[0].pose;
  if (t >= keyframes[keyframes.length - 1].t)
    return keyframes[keyframes.length - 1].pose;
  for (let i = 0; i < keyframes.length - 1; i++) {
    const a = keyframes[i];
    const b = keyframes[i + 1];
    if (t >= a.t && t <= b.t) {
      const localT = (t - a.t) / (b.t - a.t);
      return lerpPose(a.pose, b.pose, localT);
    }
  }
  return keyframes[keyframes.length - 1].pose;
}

// Draws a stick figure at a given position using a pose struct.
// facing: 1 = facing right, -1 = facing left
// All pose angles are relative to facing direction for symmetry.
function drawStickFigurePose(
  ctx: CanvasRenderingContext2D,
  baseX: number,
  feetY: number,
  color: string,
  pose: StickPose,
  hat: Player["customization"]["hat"],
  facing: number,
  alpha = 1,
) {
  const HEAD_R = 18;
  const BODY_LEN = 48;
  const ARM_LEN = 32;
  const LEG_LEN = 40;

  const cx = baseX + pose.xOffset;
  const baseYAdj = feetY - pose.yOffset;

  // Hip: sits roughly at feetY minus leg length (legs hang from hip)
  const hipX = cx;
  const hipY = baseYAdj - LEG_LEN * 0.82;

  // Shoulder: body extends upward from hip at bodyLean angle
  // bodyLean positive = leans toward facing direction
  const shoulderX = hipX + Math.sin(pose.bodyLean) * BODY_LEN * facing;
  const shoulderY = hipY - Math.cos(pose.bodyLean) * BODY_LEN;

  // Head: above shoulder, slight tilt
  const headX = shoulderX + pose.headTilt * facing;
  const headY = shoulderY - HEAD_R * 1.4;

  // Mid-body: arm attachment point
  const midX = (hipX + shoulderX) / 2;
  const midY = (hipY + shoulderY) / 2;

  // Right arm: 0 = extends horizontally toward facing direction
  //            -PI/2 = points straight up, PI/2 = points down
  const rightArmEndX = midX + Math.cos(pose.rightArmAngle) * ARM_LEN * facing;
  const rightArmEndY = midY + Math.sin(pose.rightArmAngle) * ARM_LEN;

  // Left arm: 0 = extends horizontally away from facing direction
  const leftArmEndX = midX - Math.cos(pose.leftArmAngle) * ARM_LEN * facing;
  const leftArmEndY = midY + Math.sin(pose.leftArmAngle) * ARM_LEN;

  // Right leg: 0 = straight down, positive = forward (toward facing dir)
  const rightLegEndX = hipX + Math.sin(pose.rightLegAngle) * LEG_LEN * facing;
  const rightLegEndY = hipY + Math.cos(pose.rightLegAngle) * LEG_LEN;

  // Left leg: 0 = straight down, positive = backward
  const leftLegEndX = hipX - Math.sin(pose.leftLegAngle) * LEG_LEN * facing;
  const leftLegEndY = hipY + Math.cos(pose.leftLegAngle) * LEG_LEN;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = color;
  ctx.shadowBlur = 10;

  // Body
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(shoulderX, shoulderY);
  ctx.stroke();

  // Head
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.arc(headX, headY, HEAD_R, 0, Math.PI * 2);
  ctx.stroke();

  // Eye
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(headX + facing * 5, headY - 3, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Arms
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.lineTo(rightArmEndX, rightArmEndY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(midX, midY);
  ctx.lineTo(leftArmEndX, leftArmEndY);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(rightLegEndX, rightLegEndY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(hipX, hipY);
  ctx.lineTo(leftLegEndX, leftLegEndY);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.restore();

  // Hat drawn on top
  ctx.save();
  ctx.globalAlpha = alpha;
  drawHat(ctx, headX, headY - HEAD_R, hat, color, facing);
  ctx.restore();
}

// ── Reusable base poses ──────────────────────────────────────────────────────

const POSE_STAND: StickPose = {
  headTilt: 0,
  bodyLean: 0,
  rightArmAngle: 0.7,
  leftArmAngle: 0.7,
  rightLegAngle: 0.13,
  leftLegAngle: 0.13,
  xOffset: 0,
  yOffset: 0,
};

const POSE_FIGHT: StickPose = {
  headTilt: 4,
  bodyLean: 0.18,
  rightArmAngle: -0.25,
  leftArmAngle: 0.45,
  rightLegAngle: 0.35,
  leftLegAngle: 0.28,
  xOffset: 0,
  yOffset: 0,
};

const POSE_CROUCH: StickPose = {
  headTilt: 2,
  bodyLean: 0.22,
  rightArmAngle: -0.15,
  leftArmAngle: 0.2,
  rightLegAngle: 0.5,
  leftLegAngle: 0.5,
  xOffset: 0,
  yOffset: -8,
};

const POSE_LEAP: StickPose = {
  headTilt: 3,
  bodyLean: 0.15,
  rightArmAngle: -1.1,
  leftArmAngle: -0.9,
  rightLegAngle: -0.4,
  leftLegAngle: 0.65,
  xOffset: 0,
  yOffset: 70,
};

const POSE_SLAM: StickPose = {
  headTilt: 5,
  bodyLean: 0.4,
  rightArmAngle: 1.1,
  leftArmAngle: 1.0,
  rightLegAngle: 0.35,
  leftLegAngle: 0.25,
  xOffset: 0,
  yOffset: 0,
};

const POSE_PUNCH: StickPose = {
  headTilt: 4,
  bodyLean: 0.38,
  rightArmAngle: 0.08,
  leftArmAngle: 0.7,
  rightLegAngle: 0.28,
  leftLegAngle: 0.3,
  xOffset: 0,
  yOffset: 0,
};

const POSE_ARMS_UP: StickPose = {
  headTilt: -2,
  bodyLean: -0.05,
  rightArmAngle: -1.1,
  leftArmAngle: -0.9,
  rightLegAngle: 0.22,
  leftLegAngle: 0.22,
  xOffset: 0,
  yOffset: 0,
};

const _POSE_ARMS_FORWARD: StickPose = {
  headTilt: 3,
  bodyLean: 0.28,
  rightArmAngle: 0.05,
  leftArmAngle: -0.2,
  rightLegAngle: 0.25,
  leftLegAngle: 0.3,
  xOffset: 0,
  yOffset: 0,
};

const POSE_ICE_EXTEND: StickPose = {
  headTilt: 3,
  bodyLean: 0.2,
  rightArmAngle: 0.0,
  leftArmAngle: 0.55,
  rightLegAngle: 0.28,
  leftLegAngle: 0.22,
  xOffset: 0,
  yOffset: 0,
};

const POSE_SPIN_A: StickPose = {
  headTilt: 0,
  bodyLean: -0.1,
  rightArmAngle: -0.5,
  leftArmAngle: -1.0,
  rightLegAngle: -0.5,
  leftLegAngle: 0.8,
  xOffset: 0,
  yOffset: 15,
};

const POSE_SPIN_B: StickPose = {
  headTilt: 0,
  bodyLean: 0.6,
  rightArmAngle: 0.5,
  leftArmAngle: -0.8,
  rightLegAngle: 1.0,
  leftLegAngle: -0.3,
  xOffset: 0,
  yOffset: 20,
};

const POSE_SPIN_C: StickPose = {
  headTilt: 0,
  bodyLean: -0.3,
  rightArmAngle: -1.2,
  leftArmAngle: 0.3,
  rightLegAngle: 0.5,
  leftLegAngle: -0.6,
  xOffset: 0,
  yOffset: 10,
};

// Victim poses
const VPOSE_STAND: StickPose = {
  headTilt: 0,
  bodyLean: 0,
  rightArmAngle: 0.7,
  leftArmAngle: 0.7,
  rightLegAngle: 0.13,
  leftLegAngle: 0.13,
  xOffset: 0,
  yOffset: 0,
};

const VPOSE_STAGGER: StickPose = {
  headTilt: -5,
  bodyLean: -0.3,
  rightArmAngle: -0.5,
  leftArmAngle: -0.75,
  rightLegAngle: 0.12,
  leftLegAngle: 0.12,
  xOffset: 0,
  yOffset: 0,
};

const VPOSE_FROZEN: StickPose = {
  headTilt: 0,
  bodyLean: 0,
  rightArmAngle: Math.PI / 2,
  leftArmAngle: Math.PI / 2,
  rightLegAngle: 0,
  leftLegAngle: 0,
  xOffset: 0,
  yOffset: 0,
};

const VPOSE_FLY_UP: StickPose = {
  headTilt: -4,
  bodyLean: -0.2,
  rightArmAngle: -0.9,
  leftArmAngle: -1.1,
  rightLegAngle: -0.2,
  leftLegAngle: -0.1,
  xOffset: 0,
  yOffset: 80,
};

const VPOSE_FLY_BACK: StickPose = {
  headTilt: -6,
  bodyLean: -0.55,
  rightArmAngle: -0.8,
  leftArmAngle: -1.05,
  rightLegAngle: -0.15,
  leftLegAngle: -0.05,
  xOffset: 70,
  yOffset: 25,
};

const VPOSE_CRUMPLE: StickPose = {
  headTilt: 8,
  bodyLean: 1.1,
  rightArmAngle: 1.2,
  leftArmAngle: 1.0,
  rightLegAngle: 0.55,
  leftLegAngle: -0.2,
  xOffset: 50,
  yOffset: -5,
};

const VPOSE_COLLAPSE: StickPose = {
  headTilt: 6,
  bodyLean: 0.9,
  rightArmAngle: 0.9,
  leftArmAngle: 0.7,
  rightLegAngle: 0.6,
  leftLegAngle: 0.1,
  xOffset: 20,
  yOffset: -10,
};

// ── Main finisher overlay ────────────────────────────────────────────────────

function drawFinisherOverlay(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  tick: number,
) {
  if (!state.finisherActive) return;

  const attackerIdx = (state.finisherAttacker as number) - 1;
  const victimIdx = attackerIdx === 0 ? 1 : 0;
  const attacker = state.players[attackerIdx];
  const victim = state.players[victimIdx];
  const t = 1 - state.finisherTimer / FINISHER_DURATION;
  const ability = attacker.customization.special;
  const atkColor = PLAYER_COLOR_HEX[attacker.customization.color];
  const vicColor = PLAYER_COLOR_HEX[victim.customization.color];
  const category = getFinisherCategory(ability);

  const attackerOnLeft = attacker.pos.x <= victim.pos.x;
  const atkBaseX = attackerOnLeft ? 240 : 560;
  const vicBaseX = attackerOnLeft ? 560 : 240;
  const feetY = 358;
  const atkFacing = attackerOnLeft ? 1 : -1;
  const vicFacing = -atkFacing;

  const impactX = vicBaseX;
  const impactY = feetY - 55;

  const impactWords: Record<string, string> = {
    fire: "INFERNO!",
    ice: "SHATTER!",
    lightning: "VOLTAGE!",
    shadow: "SLASH!",
    earth: "QUAKE!",
    energy: "BLAST!",
    drain: "DRAIN!",
    wind: "IMPACT!",
  };
  const impactWord = impactWords[category] ?? "IMPACT!";

  // Phase 1: cinematic pull-in dark overlay
  const overlayAlpha = t < 0.08 ? (t / 0.08) * 0.82 : 0.82;
  ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  // White flash on open
  if (t < 0.12) {
    const flashA = (1 - t / 0.12) * 0.95;
    ctx.fillStyle = `rgba(255,255,255,${flashA})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // Manga diagonal background lines (phases 2-4)
  if (t > 0.15 && t < 0.65) {
    const lineA = Math.sin(((t - 0.15) / 0.5) * Math.PI) * 0.07;
    ctx.save();
    ctx.globalAlpha = lineA;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1;
    const diagonals: [number, number, number, number][] = [
      [0, 0, CANVAS_W, CANVAS_H],
      [CANVAS_W, 0, 0, CANVAS_H],
      [0, CANVAS_H * 0.3, CANVAS_W, CANVAS_H * 0.7],
      [CANVAS_W, CANVAS_H * 0.3, 0, CANVAS_H * 0.7],
      [CANVAS_W * 0.2, 0, CANVAS_W * 0.8, CANVAS_H],
    ];
    for (const [x1, y1, x2, y2] of diagonals) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Ground line
  {
    const g = ctx.createLinearGradient(0, feetY, CANVAS_W, feetY);
    g.addColorStop(0, "rgba(255,255,255,0)");
    g.addColorStop(0.5, "rgba(255,255,255,0.35)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, feetY);
    ctx.lineTo(CANVAS_W, feetY);
    ctx.stroke();
  }

  // Figure state
  let atkPose: StickPose = POSE_STAND;
  let vicPose: StickPose = VPOSE_STAND;
  let atkAlpha = 1;
  let vicAlpha = 1;
  let shadowFlipped = false;

  ctx.save();

  switch (category) {
    case "fire": {
      atkPose = getPoseAt(
        [
          { t: 0.0, pose: POSE_STAND },
          { t: 0.15, pose: POSE_FIGHT },
          { t: 0.28, pose: POSE_CROUCH },
          { t: 0.42, pose: { ...POSE_LEAP, xOffset: atkFacing * 80 } },
          { t: 0.55, pose: { ...POSE_SLAM, xOffset: atkFacing * 160 } },
          {
            t: 0.75,
            pose: { ...POSE_SLAM, xOffset: atkFacing * 160, yOffset: 0 },
          },
        ],
        t,
      );
      vicPose = getPoseAt(
        [
          { t: 0.0, pose: VPOSE_STAND },
          { t: 0.52, pose: VPOSE_STAND },
          { t: 0.58, pose: VPOSE_STAGGER },
          { t: 0.68, pose: { ...VPOSE_FLY_UP, xOffset: vicFacing * -40 } },
          { t: 0.85, pose: { ...VPOSE_CRUMPLE, xOffset: vicFacing * -80 } },
        ],
        t,
      );
      if (t > 0.54 && t < 0.82) {
        const impactT = (t - 0.54) / 0.28;
        const impX = vicBaseX + (atkFacing > 0 ? -40 : 40);
        for (let ring = 0; ring < 3; ring++) {
          const ringT = Math.max(0, impactT - ring * 0.18);
          if (ringT <= 0) continue;
          const rr = ringT * 90;
          const ra = (1 - ringT) * 0.8;
          ctx.strokeStyle =
            ring === 0
              ? `rgba(255,100,0,${ra})`
              : `rgba(255,200,0,${ra * 0.6})`;
          ctx.lineWidth = ring === 0 ? 5 : 3;
          ctx.shadowColor = "#ff6000";
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(impX, feetY - 30, rr, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
      if (t > 0.3 && t < 0.6) {
        const sparkT = (t - 0.3) / 0.3;
        for (let s = 0; s < 8; s++) {
          const sx =
            atkBaseX +
            atkFacing * (sparkT * 140 - s * 20) +
            Math.sin(tick * 12 + s) * 6;
          const sy = feetY - 80 - s * 8 + Math.cos(tick * 10 + s) * 5;
          ctx.globalAlpha = (1 - s / 8) * 0.7;
          ctx.fillStyle = s % 2 === 0 ? "#ff6020" : "#ffcc00";
          ctx.shadowColor = "#ff6020";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(sx, sy, 4 * (1 - s / 10), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      break;
    }
    case "ice": {
      atkPose = getPoseAt(
        [
          { t: 0.0, pose: POSE_STAND },
          { t: 0.18, pose: POSE_FIGHT },
          { t: 0.4, pose: { ...POSE_ICE_EXTEND, xOffset: atkFacing * 30 } },
          { t: 0.65, pose: { ...POSE_ICE_EXTEND, xOffset: atkFacing * 30 } },
          { t: 0.8, pose: POSE_FIGHT },
        ],
        t,
      );
      const vicStiffness = Math.max(0, Math.min(1, (t - 0.25) / 0.25));
      vicPose = lerpPose(VPOSE_STAND, VPOSE_FROZEN, vicStiffness);
      if (t > 0.3 && t < 0.62) {
        const encaseA = Math.min(1, (t - 0.3) / 0.2) * 0.65;
        ctx.globalAlpha = encaseA;
        const iceGrad = ctx.createLinearGradient(
          vicBaseX - 24,
          feetY - 85,
          vicBaseX + 24,
          feetY,
        );
        iceGrad.addColorStop(0, "rgba(160,230,255,0.9)");
        iceGrad.addColorStop(1, "rgba(60,180,255,0.6)");
        ctx.fillStyle = iceGrad;
        ctx.shadowColor = "#00aaff";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(vicBaseX - 24, feetY - 88, 48, 90, 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(220,245,255,0.8)";
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 4;
        for (let c = 0; c < 4; c++) {
          const cx2 = vicBaseX + (c % 2 === 0 ? -8 : 10);
          const cy2 = feetY - 20 - c * 18;
          ctx.beginPath();
          ctx.moveTo(cx2, cy2);
          ctx.lineTo(cx2 + 12, cy2 - 8);
          ctx.lineTo(cx2 + 18, cy2 - 4);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      if (t > 0.62) {
        vicAlpha = 0;
        const shatterT = (t - 0.62) / 0.38;
        for (let i = 0; i < 14; i++) {
          const angle = (i / 14) * Math.PI * 2;
          const dist = shatterT * 130;
          const sx = vicBaseX + Math.cos(angle) * dist;
          const sy = feetY - 44 + Math.sin(angle) * dist * 0.55;
          const sa = (1 - shatterT) * 0.9;
          ctx.globalAlpha = sa;
          ctx.fillStyle =
            i % 3 === 0 ? "#c0f0ff" : i % 3 === 1 ? "#80d8ff" : "#ffffff";
          ctx.shadowColor = "#00ccff";
          ctx.shadowBlur = 8;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(angle + shatterT * 4);
          ctx.fillRect(-7, -2, 14, 4);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      break;
    }
    case "lightning": {
      atkPose = getPoseAt(
        [
          { t: 0.0, pose: POSE_STAND },
          { t: 0.18, pose: POSE_FIGHT },
          { t: 0.38, pose: POSE_ARMS_UP },
          { t: 0.6, pose: POSE_ARMS_UP },
          { t: 0.75, pose: POSE_FIGHT },
        ],
        t,
      );
      const jitter = t > 0.35 && t < 0.65 ? Math.sin(tick * 40) * 8 : 0;
      vicPose = getPoseAt(
        [
          { t: 0.0, pose: VPOSE_STAND },
          { t: 0.35, pose: VPOSE_STAND },
          { t: 0.45, pose: { ...VPOSE_STAND, xOffset: jitter } },
          { t: 0.62, pose: VPOSE_STAGGER },
          { t: 0.75, pose: { ...VPOSE_FLY_BACK, xOffset: vicFacing * -90 } },
        ],
        t,
      );
      if (t > 0.35 && t < 0.72) {
        const ltA = Math.sin(tick * 30) * 0.5 + 0.6;
        ctx.globalAlpha = ltA;
        const handX = atkBaseX + atkFacing * 20;
        const handY = feetY - 145;
        for (let b = 0; b < 2; b++) {
          ctx.strokeStyle = b === 0 ? "#ffffff" : "#ffff44";
          ctx.lineWidth = b === 0 ? 5 : 2;
          ctx.shadowColor = "#ffff00";
          ctx.shadowBlur = 20;
          ctx.beginPath();
          let lx = handX + b * 12;
          ctx.moveTo(lx, handY);
          for (let s = 1; s <= 8; s++) {
            lx += (Math.sin(tick * 73 + s * 13 + b * 7) - 0.5) * 28;
            ctx.lineTo(lx, handY + (s / 8) * (feetY - 50 - handY));
          }
          ctx.lineTo(vicBaseX + Math.sin(tick * 53) * 12, feetY - 50);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      break;
    }
    case "shadow": {
      if (t < 0.28) {
        atkAlpha = Math.max(0, 1 - (t - 0.12) / 0.16);
        atkPose = getPoseAt(
          [
            { t: 0.0, pose: POSE_STAND },
            { t: 0.12, pose: POSE_FIGHT },
          ],
          t,
        );
        vicPose = VPOSE_STAND;
      } else if (t < 0.56) {
        shadowFlipped = true;
        atkAlpha = Math.min(1, (t - 0.28) / 0.1);
        atkPose = getPoseAt(
          [
            { t: 0.28, pose: { ...POSE_FIGHT, xOffset: vicFacing * -20 } },
            {
              t: 0.42,
              pose: {
                ...POSE_PUNCH,
                bodyLean: -0.35,
                xOffset: vicFacing * -20,
              },
            },
            {
              t: 0.56,
              pose: {
                ...POSE_PUNCH,
                bodyLean: -0.35,
                xOffset: vicFacing * -20,
              },
            },
          ],
          t,
        );
        vicPose = getPoseAt(
          [
            { t: 0.28, pose: VPOSE_STAND },
            { t: 0.48, pose: VPOSE_STAGGER },
            { t: 0.56, pose: { ...VPOSE_STAGGER, xOffset: atkFacing * 15 } },
          ],
          t,
        );
        if (t > 0.4 && t < 0.64) {
          const slashA = Math.sin(((t - 0.4) / 0.24) * Math.PI);
          ctx.globalAlpha = slashA * 0.85;
          ctx.strokeStyle = "#cc44ff";
          ctx.lineWidth = 5;
          ctx.shadowColor = "#cc00ff";
          ctx.shadowBlur = 14;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(vicBaseX - 38, feetY - 78);
          ctx.lineTo(vicBaseX + 38, feetY - 8);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(vicBaseX - 22, feetY - 90);
          ctx.lineTo(vicBaseX + 22, feetY - 18);
          ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
        const tndA = Math.min(1, (t - 0.28) / 0.2) * 0.5;
        ctx.globalAlpha = tndA;
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2 + tick * 2.5;
          ctx.strokeStyle = "#6600aa";
          ctx.lineWidth = 2;
          ctx.shadowColor = "#9900ff";
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(vicBaseX, feetY - 40);
          ctx.quadraticCurveTo(
            vicBaseX + Math.cos(angle) * 40,
            feetY - 40 + Math.sin(angle) * 35,
            vicBaseX + Math.cos(angle) * 75,
            feetY - 40 + Math.sin(angle) * 60,
          );
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      } else {
        shadowFlipped = true;
        atkPose = { ...POSE_FIGHT, xOffset: vicFacing * -20 };
        vicPose = getPoseAt(
          [
            { t: 0.56, pose: VPOSE_STAGGER },
            { t: 0.75, pose: { ...VPOSE_FLY_BACK, xOffset: atkFacing * 60 } },
          ],
          t,
        );
      }
      break;
    }
    case "earth": {
      atkPose = getPoseAt(
        [
          { t: 0.0, pose: POSE_STAND },
          { t: 0.2, pose: POSE_FIGHT },
          { t: 0.35, pose: POSE_CROUCH },
          { t: 0.52, pose: { ...POSE_SLAM, xOffset: atkFacing * 100 } },
          { t: 0.72, pose: { ...POSE_SLAM, xOffset: atkFacing * 80 } },
        ],
        t,
      );
      vicPose = getPoseAt(
        [
          { t: 0.0, pose: VPOSE_STAND },
          { t: 0.5, pose: VPOSE_STAND },
          { t: 0.58, pose: VPOSE_STAGGER },
          { t: 0.72, pose: { ...VPOSE_FLY_UP, xOffset: 0 } },
          { t: 0.9, pose: { ...VPOSE_CRUMPLE, xOffset: vicFacing * -40 } },
        ],
        t,
      );
      if (t > 0.5 && t < 0.85) {
        const crackT = (t - 0.5) / 0.35;
        ctx.globalAlpha = (1 - crackT) * 0.9;
        ctx.strokeStyle = "#cc8844";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#ff8800";
        ctx.shadowBlur = 10;
        for (let c = 0; c < 5; c++) {
          const angle = (c / 5) * Math.PI + Math.sin(c * 1.4) * 0.4;
          const len = 30 + c * 15;
          ctx.beginPath();
          ctx.moveTo(vicBaseX, feetY);
          ctx.lineTo(
            vicBaseX + Math.cos(angle) * len,
            feetY + Math.sin(angle) * len * 0.4,
          );
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      break;
    }
    case "energy": {
      atkPose = getPoseAt(
        [
          { t: 0.0, pose: POSE_STAND },
          { t: 0.18, pose: POSE_FIGHT },
          { t: 0.38, pose: { ...POSE_PUNCH, xOffset: atkFacing * 20 } },
          { t: 0.62, pose: { ...POSE_SLAM, xOffset: atkFacing * 80 } },
          { t: 0.8, pose: POSE_FIGHT },
        ],
        t,
      );
      vicPose = getPoseAt(
        [
          { t: 0.0, pose: VPOSE_STAND },
          { t: 0.55, pose: VPOSE_STAND },
          { t: 0.62, pose: VPOSE_STAGGER },
          { t: 0.78, pose: { ...VPOSE_FLY_BACK, xOffset: vicFacing * -110 } },
        ],
        t,
      );
      if (t > 0.3 && t < 0.68) {
        const beamT = (t - 0.3) / 0.38;
        const beamA = Math.sin(beamT * Math.PI) * 0.9;
        ctx.globalAlpha = beamA;
        const bw =
          (beamT < 0.5 ? beamT * 2 : 1) * Math.abs(vicBaseX - atkBaseX);
        ctx.fillStyle = "#44aaff";
        ctx.shadowColor = "#0088ff";
        ctx.shadowBlur = 25;
        ctx.fillRect(
          atkFacing > 0 ? atkBaseX : atkBaseX - bw,
          feetY - 110,
          bw / 3,
          18,
        );
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      break;
    }
    case "drain": {
      atkPose = getPoseAt(
        [
          { t: 0.0, pose: POSE_STAND },
          { t: 0.18, pose: { ...POSE_ICE_EXTEND, xOffset: atkFacing * 50 } },
          { t: 0.65, pose: { ...POSE_ICE_EXTEND, xOffset: atkFacing * 50 } },
          { t: 0.8, pose: { ...POSE_FIGHT, xOffset: atkFacing * 30 } },
        ],
        t,
      );
      vicPose = lerpPose(
        VPOSE_STAND,
        VPOSE_COLLAPSE,
        t > 0.65 ? Math.min(1, (t - 0.65) / 0.2) : 0,
      );
      const drainProgress = t > 0.18 ? Math.min(1, (t - 0.18) / 0.48) : 0;
      if (t > 0.16 && t < 0.8) {
        const tendA = Math.min(1, (t - 0.16) / 0.15);
        const atkHandX = atkBaseX + atkFacing * 50;
        for (let s = 0; s < 5; s++) {
          const phase = (t * 2.5 + s / 5) % 1;
          if (phase > 0.85) continue;
          const px = vicBaseX + (atkHandX - vicBaseX) * phase;
          const py = feetY - 50 - Math.sin(phase * Math.PI) * (50 + s * 8);
          const sa = (1 - phase) * tendA * 0.9;
          const prevPhase = Math.max(0, phase - 0.08);
          const ppx = vicBaseX + (atkHandX - vicBaseX) * prevPhase;
          const ppy = feetY - 50 - Math.sin(prevPhase * Math.PI) * (50 + s * 8);
          ctx.globalAlpha = sa;
          ctx.strokeStyle = s % 2 === 0 ? "#ff40aa" : "#dd20cc";
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#ff00aa";
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(ppx, ppy);
          ctx.quadraticCurveTo(
            (ppx + px) / 2 + Math.sin(tick * 8 + s) * 12,
            (ppy + py) / 2,
            px,
            py,
          );
          ctx.stroke();
        }
        ctx.globalAlpha = drainProgress * 0.4;
        ctx.fillStyle = atkColor;
        ctx.shadowColor = atkColor;
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(
          atkBaseX + atkFacing * 30,
          feetY - 80,
          8 + drainProgress * 14,
          0,
          Math.PI * 2,
        );
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      break;
    }
    default: {
      const spinPoses = [
        { t: 0.0, pose: POSE_STAND },
        { t: 0.18, pose: POSE_FIGHT },
        { t: 0.28, pose: POSE_SPIN_A },
        { t: 0.36, pose: POSE_SPIN_B },
        { t: 0.44, pose: POSE_SPIN_C },
        { t: 0.52, pose: { ...POSE_SPIN_A, xOffset: atkFacing * 60 } },
        { t: 0.6, pose: { ...POSE_PUNCH, xOffset: atkFacing * 120 } },
        { t: 0.8, pose: { ...POSE_FIGHT, xOffset: atkFacing * 80 } },
      ];
      atkPose = getPoseAt(spinPoses, t);
      const hit1 = t > 0.35 && t < 0.55;
      const hit2 = t > 0.52 && t < 0.68;
      const bounce =
        (hit1 ? Math.sin(((t - 0.35) / 0.2) * Math.PI * 2) * 18 : 0) +
        (hit2 ? Math.sin(((t - 0.52) / 0.16) * Math.PI * 2) * 12 : 0);
      vicPose = getPoseAt(
        [
          { t: 0.0, pose: VPOSE_STAND },
          { t: 0.34, pose: VPOSE_STAND },
          { t: 0.42, pose: { ...VPOSE_STAGGER, yOffset: 8 } },
          { t: 0.52, pose: { ...VPOSE_STAGGER, xOffset: vicFacing * -20 } },
          { t: 0.62, pose: { ...VPOSE_STAGGER, xOffset: vicFacing * -40 } },
          { t: 0.78, pose: { ...VPOSE_FLY_BACK, xOffset: vicFacing * -80 } },
        ],
        t,
      );
      vicPose = { ...vicPose, yOffset: vicPose.yOffset + bounce };
      if (t > 0.32 && t < 0.72) {
        const hitSpots = [
          { tx: 0.35, ty: 0.48 },
          { tx: 0.5, ty: 0.62 },
        ];
        for (const spot of hitSpots) {
          const st = (t - spot.tx) / (spot.ty - spot.tx);
          if (st < 0 || st > 1) continue;
          const sa = Math.sin(st * Math.PI);
          const sr = st * 42;
          ctx.globalAlpha = sa * 0.9;
          ctx.strokeStyle = atkColor;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = atkColor;
          ctx.shadowBlur = 12;
          for (let ray = 0; ray < 8; ray++) {
            const ra = (ray / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(
              vicBaseX + Math.cos(ra) * sr * 0.3,
              feetY - 45 + Math.sin(ra) * sr * 0.3,
            );
            ctx.lineTo(
              vicBaseX + Math.cos(ra) * sr,
              feetY - 45 + Math.sin(ra) * sr,
            );
            ctx.stroke();
          }
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
      }
      break;
    }
  }

  ctx.restore();

  // Phase 2: Charge-up energy aura (t 0.15–0.45)
  if (t > 0.15 && t < 0.45) {
    const auraA =
      Math.min(1, (t - 0.15) / 0.1) * (t > 0.38 ? (0.45 - t) / 0.07 : 1);
    const atkAuraX = atkBaseX + atkPose.xOffset;
    const atkAuraY = feetY - 55 + atkPose.yOffset;
    const numSpikes = 12;
    for (let i = 0; i < numSpikes; i++) {
      const angle = (i / numSpikes) * Math.PI * 2 + tick * 3;
      const spikeLen = 22 + Math.sin(i * 2.3 + tick * 4) * 16;
      const wobble = Math.sin(i * 1.7 + tick * 7) * 0.22;
      const outerX = atkAuraX + Math.cos(angle + wobble) * spikeLen;
      const outerY = atkAuraY + Math.sin(angle + wobble) * spikeLen * 0.75;
      const midAngle = angle + wobble + 0.2;
      const midX = atkAuraX + Math.cos(midAngle) * spikeLen * 0.55;
      const midY = atkAuraY + Math.sin(midAngle) * spikeLen * 0.55 * 0.75;
      ctx.save();
      ctx.globalAlpha = auraA * (0.6 + Math.sin(tick * 8 + i) * 0.3);
      ctx.strokeStyle = atkColor;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = atkColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(atkAuraX, atkAuraY);
      ctx.lineTo(midX, midY);
      ctx.lineTo(outerX, outerY);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255,255,255,0.8)";
      ctx.lineWidth = 1;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.moveTo(atkAuraX, atkAuraY);
      ctx.lineTo(outerX * 0.6 + atkAuraX * 0.4, outerY * 0.6 + atkAuraY * 0.4);
      ctx.stroke();
      ctx.restore();
    }
    // Foot dust
    for (let p = 0; p < 5; p++) {
      const px = atkBaseX + atkPose.xOffset + Math.sin(p * 2.1 + tick * 3) * 22;
      const py = feetY + Math.cos(p * 1.6 + tick * 2) * 5;
      const pa = auraA * (0.3 + Math.sin(tick * 5 + p) * 0.2) * (1 - p / 5);
      ctx.save();
      ctx.globalAlpha = pa;
      ctx.fillStyle = "#cccccc";
      ctx.beginPath();
      ctx.arc(px, py, 4 + p * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // Phase 3: Manga close-up panel (t 0.38–0.55)
  if (t > 0.38 && t < 0.55) {
    const panelA =
      Math.min(1, (t - 0.38) / 0.06) * (t > 0.5 ? (0.55 - t) / 0.05 : 1);
    const panelX = attackerOnLeft ? 8 : CANVAS_W - 208;
    const panelY = 65;
    const panelW = 200;
    const panelH = 135;

    ctx.save();
    ctx.globalAlpha = panelA;

    // Panel bg
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    const headCX = panelX + panelW / 2;
    const headCY = panelY + panelH / 2 + 8;

    // Aura spikes inside panel
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const len = 48 + Math.sin(i * 2.3) * 20;
      ctx.globalAlpha = panelA * 0.45;
      ctx.strokeStyle = atkColor;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = atkColor;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.moveTo(headCX + Math.cos(angle) * 20, headCY + Math.sin(angle) * 20);
      ctx.lineTo(
        headCX + Math.cos(angle) * len,
        headCY + Math.sin(angle) * len * 0.7,
      );
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = panelA;

    // Head
    ctx.strokeStyle = atkColor;
    ctx.fillStyle = "#1a1a1a";
    ctx.lineWidth = 3;
    ctx.shadowColor = atkColor;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(headCX, headCY, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Eyes
    for (let eye = -1; eye <= 1; eye += 2) {
      const ex = headCX + eye * 11;
      const ey = headCY - 4;
      ctx.strokeStyle = atkColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(ex, ey, 7, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ex, ey, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#000000";
      ctx.beginPath();
      ctx.arc(ex + eye * 1.5, ey + 1, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(ex + eye * 1, ey - 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    // Brows
    ctx.strokeStyle = atkColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(headCX - 16, headCY - 14);
    ctx.lineTo(headCX - 6, headCY - 10);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(headCX + 16, headCY - 14);
    ctx.lineTo(headCX + 6, headCY - 10);
    ctx.stroke();

    ctx.restore();

    // FINISHER label
    ctx.save();
    ctx.globalAlpha = panelA;
    ctx.textAlign = "center";
    ctx.font = "bold italic 22px 'Bricolage Grotesque', sans-serif";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.strokeText("FINISHER", CANVAS_W / 2, 52);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = atkColor;
    ctx.shadowBlur = 18;
    ctx.fillText("FINISHER", CANVAS_W / 2, 52);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Phase 4: Rush speed lines (t 0.52–0.65)
  if (t > 0.52 && t < 0.65) {
    const rushA =
      Math.min(1, (t - 0.52) / 0.05) * (t > 0.6 ? (0.65 - t) / 0.05 : 1);
    const rushAtkX = atkBaseX + atkPose.xOffset;
    const rushAtkY = feetY - 60 + atkPose.yOffset;
    ctx.save();
    for (let i = 0; i < 36; i++) {
      const angle =
        Math.atan2(impactY - rushAtkY, impactX - rushAtkX) +
        (Math.sin(i * 1.3) - 0.5) * 0.55;
      const len = 140 + Math.sin(i * 2.1) * 60;
      ctx.globalAlpha = rushA * (0.3 + Math.sin(i * 1.7) * 0.2);
      ctx.strokeStyle = i % 3 === 0 ? "#ffffff" : atkColor;
      ctx.lineWidth = i % 4 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(rushAtkX, rushAtkY);
      ctx.lineTo(
        rushAtkX + Math.cos(angle) * len,
        rushAtkY + Math.sin(angle) * len,
      );
      ctx.stroke();
    }
    ctx.restore();

    // Motion ghosts
    for (let g = 1; g <= 3; g++) {
      const ghostAlpha = rushA * [0.25, 0.12, 0.05][g - 1];
      const ghostX = atkBaseX + atkPose.xOffset - atkFacing * g * 18;
      drawStickFigurePose(
        ctx,
        ghostX,
        feetY,
        atkColor,
        atkPose,
        attacker.customization.hat,
        atkFacing,
        ghostAlpha,
      );
    }
  }

  // Phase 5: IMPACT FRAMES (t 0.62–0.72)
  if (t > 0.62 && t < 0.72) {
    const subT = (t - 0.62) / 0.1;

    if (subT < 0.25) {
      // White flash - black silhouettes
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      drawStickFigurePose(
        ctx,
        vicBaseX + vicPose.xOffset,
        feetY,
        "#000000",
        { ...vicPose, xOffset: 0 },
        victim.customization.hat,
        vicFacing,
        1,
      );
      const sAtkX2 = shadowFlipped ? vicBaseX + vicFacing * -60 : atkBaseX;
      drawStickFigurePose(
        ctx,
        sAtkX2 + atkPose.xOffset,
        feetY,
        "#000000",
        { ...atkPose, xOffset: 0 },
        attacker.customization.hat,
        shadowFlipped ? -atkFacing : atkFacing,
        1,
      );
    } else if (subT < 0.5) {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    } else if (subT < 0.75) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }

    // Radial impact lines
    const flashAlpha = subT < 0.5 ? 1.0 : Math.max(0, (0.75 - subT) / 0.25);
    ctx.save();
    ctx.translate(impactX, impactY);
    for (let i = 0; i < 60; i++) {
      const angle = (i / 60) * Math.PI * 2;
      const dist = 160 + Math.sin(i * 1.7) * 80;
      ctx.globalAlpha = flashAlpha * (0.5 + Math.sin(i * 2.3) * 0.4);
      ctx.strokeStyle =
        i % 4 === 0
          ? "#ffffff"
          : i % 4 === 1
            ? atkColor
            : i % 4 === 2
              ? "#ffffff"
              : vicColor;
      ctx.lineWidth = i % 5 === 0 ? 3 : 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * dist, Math.sin(angle) * dist);
      ctx.stroke();
    }
    ctx.restore();
    ctx.globalAlpha = 1;

    // Impact word - skewed
    const wordA = subT < 0.3 ? subT / 0.3 : subT > 0.8 ? (1 - subT) / 0.2 : 1;
    ctx.save();
    ctx.globalAlpha = wordA;
    ctx.setTransform(1, -0.3, 0.1, 1, impactX, impactY - 30);
    ctx.textAlign = "center";
    ctx.font = "bold italic 62px 'Bricolage Grotesque', sans-serif";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#000000";
    ctx.strokeText(impactWord, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = atkColor;
    ctx.shadowBlur = 22;
    ctx.fillText(impactWord, 0, 0);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // Screen shake (t 0.62–0.78) + figure draw
  ctx.save();
  if (t > 0.62 && t < 0.78) {
    const shakeT = (t - 0.62) / 0.16;
    const shakeAmt = (1 - shakeT) * 12;
    ctx.translate(
      Math.sin(tick * 60) * shakeAmt,
      Math.cos(tick * 55) * shakeAmt * 0.6,
    );
  }

  // Draw figures (skip during white flash sub-frames)
  if (!(t > 0.62 && t < 0.645)) {
    let actualAtkX = atkBaseX;
    let actualAtkFacing = atkFacing;
    if (shadowFlipped) {
      actualAtkX = vicBaseX + vicFacing * -60;
      actualAtkFacing = -atkFacing;
    }
    drawStickFigurePose(
      ctx,
      vicBaseX,
      feetY,
      vicColor,
      vicPose,
      victim.customization.hat,
      vicFacing,
      vicAlpha,
    );
    drawStickFigurePose(
      ctx,
      actualAtkX,
      feetY,
      atkColor,
      atkPose,
      attacker.customization.hat,
      actualAtkFacing,
      atkAlpha,
    );
  }

  ctx.restore();

  // Phase 6: Aftermath debris + dust (t 0.72–1.0)
  if (t > 0.72) {
    const aftT = (t - 0.72) / 0.28;
    // Debris chunks
    for (let d = 0; d < 7; d++) {
      const angle = (d / 7) * Math.PI * 2 + d * 0.4;
      const speed = 90 + d * 28;
      const dx = impactX + Math.cos(angle) * aftT * speed;
      const dy = impactY + Math.sin(angle) * aftT * speed + aftT * aftT * 60;
      const dAlpha = (1 - aftT) * 0.85;
      const dSize = 6 + d * 2;
      ctx.save();
      ctx.globalAlpha = dAlpha;
      ctx.fillStyle =
        d % 3 === 0 ? "#888888" : d % 3 === 1 ? "#aaaaaa" : "#666666";
      ctx.translate(dx, dy);
      ctx.rotate(d * 0.9 + aftT * 4);
      ctx.beginPath();
      ctx.moveTo(0, -dSize);
      ctx.lineTo(dSize * 0.7, -dSize * 0.2);
      ctx.lineTo(dSize * 0.5, dSize * 0.8);
      ctx.lineTo(-dSize * 0.4, dSize);
      ctx.lineTo(-dSize * 0.8, dSize * 0.1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    // Dust clouds
    for (let dc = 0; dc < 4; dc++) {
      const dcX = impactX + (dc - 1.5) * 45;
      const dcY = feetY - 10 - aftT * 35;
      const dcR = (15 + dc * 12) * Math.min(1, aftT * 3);
      const dcA = (1 - aftT) * 0.5 * (0.5 + dc * 0.12);
      ctx.save();
      ctx.globalAlpha = dcA;
      ctx.fillStyle = dc % 2 === 0 ? "#cccccc" : "#ffffff";
      ctx.beginPath();
      ctx.arc(dcX, dcY, dcR, 0, Math.PI * 2);
      ctx.fill();
      for (let b = 0; b < 3; b++) {
        const bAngle = (b / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(
          dcX + Math.cos(bAngle) * dcR * 0.6,
          dcY + Math.sin(bAngle) * dcR * 0.5,
          dcR * 0.45,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // Cinematic letterbox bars
  const barH = t < 0.12 ? (t / 0.12) * 60 : 60;
  ctx.fillStyle = "rgba(0,0,0,0.97)";
  ctx.fillRect(0, 0, CANVAS_W, barH);
  ctx.fillRect(0, CANVAS_H - barH, CANVAS_W, barH);

  // Ability name label
  if (t > 0.05 && t < 0.7) {
    const lblA = t < 0.15 ? (t - 0.05) / 0.1 : t > 0.6 ? (0.7 - t) / 0.1 : 1;
    ctx.save();
    ctx.globalAlpha = lblA * 0.75;
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = atkColor;
    ctx.shadowBlur = 12;
    ctx.font = "bold 16px 'Figtree', sans-serif";
    const abilityLabel = ability
      .replace(/([A-Z])/g, " $1")
      .toUpperCase()
      .trim();
    ctx.fillText(
      `${abilityLabel} FINISHER`,
      CANVAS_W / 2,
      CANVAS_H - barH + 20,
    );
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // FINISH HIM! (phases 1-2)
  if (t > 0.04 && t < 0.38) {
    const txtA = t < 0.12 ? (t - 0.04) / 0.08 : t > 0.28 ? (0.38 - t) / 0.1 : 1;
    ctx.save();
    ctx.globalAlpha = txtA;
    ctx.textAlign = "center";
    ctx.font = "bold italic 60px 'Bricolage Grotesque', sans-serif";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "#880000";
    ctx.strokeText("FINISH HIM!", CANVAS_W / 2, barH + 36);
    ctx.fillStyle = "#ff2200";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 35;
    ctx.fillText("FINISH HIM!", CANVAS_W / 2, barH + 36);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ELIMINATED (t 0.78–1.0)
  if (t > 0.78) {
    const eRaw = (t - 0.78) / 0.1;
    const eScale =
      eRaw < 1
        ? eRaw < 0.5
          ? 2.0 - eRaw * 2.2
          : 0.9 + (eRaw - 0.5) * 0.2
        : 1.0;
    const eA = Math.min(1, eRaw * 1.5);
    ctx.save();
    ctx.globalAlpha = eA;
    ctx.translate(CANVAS_W / 2, CANVAS_H / 2 + 12);
    ctx.scale(Math.max(0.1, eScale), Math.max(0.1, eScale));
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(-180, -40, 360, 55);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 56px 'Bricolage Grotesque', sans-serif";
    ctx.lineWidth = 7;
    ctx.strokeStyle = "#880000";
    ctx.strokeText("ELIMINATED", 0, 0);
    ctx.fillStyle = "#ff2200";
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 30;
    ctx.fillText("ELIMINATED", 0, 0);
    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

export function renderFrame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  tick: number,
) {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawBackground(ctx, tick, state.bgColor);
  drawPlatforms(ctx, state.platforms);
  drawParticles(ctx, state.particles);
  drawProjectiles(ctx, state.projectiles, tick);
  for (const player of state.players) {
    drawStickFigure(ctx, player, tick);
  }
  drawHUD(ctx, state);
  drawRoundEnd(ctx, state);
  drawFinisherOverlay(ctx, state, tick);
}
