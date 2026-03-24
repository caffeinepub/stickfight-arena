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
      // Tall pointy wizard hat
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
      // brim
      ctx.fillStyle = "#7040b0";
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 17, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // star
      ctx.fillStyle = "#ffe040";
      ctx.font = "8px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("★", x, headTopY - 10);
      break;
    }
    case "viking": {
      // Viking helmet with horns
      ctx.fillStyle = "#888";
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 4, 15, 8, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      // left horn
      ctx.fillStyle = "#ccc";
      ctx.beginPath();
      ctx.moveTo(x - 13, headTopY + 2);
      ctx.quadraticCurveTo(x - 22, headTopY - 8, x - 18, headTopY - 18);
      ctx.quadraticCurveTo(x - 14, headTopY - 10, x - 10, headTopY);
      ctx.closePath();
      ctx.fill();
      // right horn
      ctx.beginPath();
      ctx.moveTo(x + 13, headTopY + 2);
      ctx.quadraticCurveTo(x + 22, headTopY - 8, x + 18, headTopY - 18);
      ctx.quadraticCurveTo(x + 14, headTopY - 10, x + 10, headTopY);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "ninja": {
      // Ninja face wrap / mask
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 10, 16, 12, 0, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#1a1a1a";
      ctx.fillRect(x - 15, headTopY + 4, 30, 10);
      // eyes showing
      ctx.fillStyle = "#e05050";
      ctx.beginPath();
      ctx.ellipse(x + facing * 4, headTopY + 5, 4, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "cowboy": {
      // Wide brim cowboy hat
      ctx.fillStyle = "#8B5E3C";
      ctx.strokeStyle = "#5C3D1E";
      ctx.lineWidth = 1.5;
      // crown
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 12, 10, 0, Math.PI, 0);
      ctx.fill();
      ctx.stroke();
      // wide brim
      ctx.beginPath();
      ctx.ellipse(x, headTopY + 2, 22, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // band
      ctx.fillStyle = "#D8C38A";
      ctx.fillRect(x - 12, headTopY - 1, 24, 3);
      break;
    }
    case "party": {
      // Colorful party hat (triangle)
      const colors = ["#ff4080", "#ffcc00", "#00ccff", "#ff6020"];
      ctx.fillStyle = colors[0];
      ctx.beginPath();
      ctx.moveTo(x - 12, headTopY + 2);
      ctx.lineTo(x, headTopY - 22);
      ctx.lineTo(x + 12, headTopY + 2);
      ctx.closePath();
      ctx.fill();
      // stripes
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
      // pom pom
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, headTopY - 22, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "bunny": {
      // Bunny ears
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      // left ear
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
      // right ear
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

  // status effects behind figure
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
      // snowflake-like projectile
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
// FINISHER ANIMATIONS
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
  const t = 1 - state.finisherTimer / FINISHER_DURATION; // 0→1 progress
  const ability = attacker.customization.special;
  const atkColor = PLAYER_COLOR_HEX[attacker.customization.color];
  const category = getFinisherCategory(ability);

  const vx = victim.pos.x;
  const vy = victim.pos.y;
  const ax = attacker.pos.x;

  // ── Phase 1: screen flash + "FINISH HIM!" text (0–0.2) ──────────────────
  if (t < 0.2) {
    const flashAlpha = ((0.2 - t) / 0.2) * 0.85;
    ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // ── Dark cinematic bars (letterbox) ─────────────────────────────────────
  const barH = 60;
  ctx.fillStyle = "rgba(0,0,0,0.88)";
  ctx.fillRect(0, 0, CANVAS_W, barH);
  ctx.fillRect(0, CANVAS_H - barH, CANVAS_W, barH);

  // ── Ability category visual ──────────────────────────────────────────────
  ctx.save();

  switch (category) {
    case "fire": {
      // Rising inferno column at victim
      const fireT = Math.max(0, (t - 0.1) / 0.8);
      const pillarH = fireT * (CANVAS_H - barH * 2);
      for (let i = 0; i < 8; i++) {
        const ox = (i - 3.5) * 14;
        const flicker = Math.sin(tick * 20 + i * 1.3) * 8;
        const grad = ctx.createLinearGradient(
          vx + ox,
          vy,
          vx + ox,
          vy - pillarH + flicker,
        );
        grad.addColorStop(0, "rgba(255,80,0,0)");
        grad.addColorStop(0.4, `rgba(255,120,0,${0.7 * fireT})`);
        grad.addColorStop(1, `rgba(255,220,60,${0.9 * fireT})`);
        ctx.fillStyle = grad;
        ctx.fillRect(vx + ox - 7, vy - pillarH + flicker, 14, pillarH);
      }
      // Shockwave ring
      if (fireT > 0.3) {
        const ringR = ((fireT - 0.3) / 0.7) * 200;
        ctx.strokeStyle = `rgba(255,100,0,${1 - (fireT - 0.3) / 0.7})`;
        ctx.lineWidth = 6;
        ctx.shadowColor = "#ff6000";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(vx, vy - 35, ringR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      break;
    }

    case "ice": {
      // Crystal shatter effect
      const iceT = Math.max(0, (t - 0.1) / 0.85);
      // Ice encasing
      if (iceT < 0.6) {
        const encaseAlpha = Math.min(1, iceT / 0.3) * 0.75;
        ctx.globalAlpha = encaseAlpha;
        ctx.fillStyle = "#a0e8ff";
        ctx.shadowColor = "#00aaff";
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(vx - 22, vy - 75, 44, 78, 4);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      // Shatter shards
      if (iceT > 0.55) {
        const shatterT = (iceT - 0.55) / 0.45;
        for (let i = 0; i < 12; i++) {
          const angle = (i / 12) * Math.PI * 2;
          const dist = shatterT * 120;
          const sx = vx + Math.cos(angle) * dist;
          const sy = vy - 35 + Math.sin(angle) * dist * 0.6;
          ctx.globalAlpha = (1 - shatterT) * 0.9;
          ctx.fillStyle = "#c0f0ff";
          ctx.shadowColor = "#00ccff";
          ctx.shadowBlur = 8;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(angle + shatterT * 3);
          ctx.fillRect(-6, -2, 12, 4);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }
      break;
    }

    case "lightning": {
      // Lightning storm from above
      const ltT = Math.max(0, (t - 0.05) / 0.9);
      const bolts = 3;
      for (let b = 0; b < bolts; b++) {
        const bPhase = (ltT * bolts - b) % 1;
        if (bPhase > 0 && bPhase < 0.5) {
          const bAlpha =
            bPhase < 0.25 ? bPhase / 0.25 : 1 - (bPhase - 0.25) / 0.25;
          ctx.globalAlpha = bAlpha;
          ctx.strokeStyle = b === 0 ? "#ffffff" : "#ffff44";
          ctx.lineWidth = b === 0 ? 5 : 2;
          ctx.shadowColor = "#ffff00";
          ctx.shadowBlur = 20;
          ctx.beginPath();
          let lx = vx + (b - 1) * 20;
          ctx.moveTo(lx, barH);
          for (let seg = 0; seg < 8; seg++) {
            lx += (Math.random() - 0.5) * 30;
            ctx.lineTo(lx, barH + (seg + 1) * ((vy - barH - 35) / 8));
          }
          ctx.lineTo(vx + (b - 1) * 15, vy - 35);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }
      ctx.globalAlpha = 1;
      // Impact flash
      if (ltT > 0.5) {
        const flashA = Math.sin(((ltT - 0.5) / 0.5) * Math.PI) * 0.6;
        ctx.fillStyle = `rgba(255,255,180,${flashA})`;
        ctx.fillRect(0, barH, CANVAS_W, CANVAS_H - barH * 2);
      }
      break;
    }

    case "shadow": {
      // Dark shadow slash
      const shT = Math.max(0, (t - 0.1) / 0.85);
      // Dark tendrils
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 + tick * 2;
        const len = shT * 80;
        ctx.globalAlpha = shT * 0.7;
        ctx.strokeStyle = "#660099";
        ctx.lineWidth = 3;
        ctx.shadowColor = "#aa00ff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(vx, vy - 35);
        ctx.lineTo(
          vx + Math.cos(angle) * len,
          vy - 35 + Math.sin(angle) * len * 0.6,
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      // Slash mark
      if (shT > 0.35) {
        const slashT = (shT - 0.35) / 0.65;
        const slashAlpha =
          slashT < 0.5 ? slashT / 0.5 : 1 - (slashT - 0.5) / 0.5;
        ctx.globalAlpha = slashAlpha;
        ctx.strokeStyle = "#cc44ff";
        ctx.lineWidth = 6;
        ctx.shadowColor = "#cc00ff";
        ctx.shadowBlur = 16;
        const facing = attacker.pos.x < victim.pos.x ? 1 : -1;
        ctx.beginPath();
        ctx.moveTo(vx - facing * 50, vy - 70);
        ctx.lineTo(vx + facing * 50, vy - 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(vx - facing * 30, vy - 80);
        ctx.lineTo(vx + facing * 30, vy - 10);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
      break;
    }

    case "earth": {
      // Ground shatter
      const eT = Math.max(0, (t - 0.05) / 0.9);
      // Crack lines on ground
      const crackAlpha = Math.min(1, eT / 0.3);
      ctx.globalAlpha = crackAlpha;
      ctx.strokeStyle = "#ff8800";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#ff6600";
      ctx.shadowBlur = 8;
      for (let c = 0; c < 5; c++) {
        const angle = (c / 5) * Math.PI - Math.PI / 2 + 0.3;
        const crackLen = eT * 150;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(
          vx + Math.cos(angle) * crackLen,
          vy + Math.sin(angle) * crackLen * 0.3,
        );
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      // Rock chunks flying
      if (eT > 0.2) {
        const rockT = (eT - 0.2) / 0.8;
        for (let r = 0; r < 8; r++) {
          const rAngle = (r / 8) * Math.PI * 2;
          const rDist = rockT * 100;
          const rx = vx + Math.cos(rAngle) * rDist;
          const ry = vy + Math.sin(rAngle) * rDist * 0.5 - rockT * 40;
          ctx.globalAlpha = (1 - rockT) * crackAlpha;
          ctx.fillStyle = "#a06030";
          ctx.fillRect(rx - 5, ry - 4, 10, 8);
        }
      }
      ctx.globalAlpha = 1;
      break;
    }

    case "energy": {
      // Laser beam / energy column
      const enT = Math.max(0, (t - 0.08) / 0.85);
      const beamAlpha = enT < 0.2 ? enT / 0.2 : enT > 0.8 ? (1 - enT) / 0.2 : 1;
      const beamFacing = ax < vx ? 1 : -1;
      const beamStart = ax + beamFacing * 30;
      const beamEnd = vx;
      const beamW = beamAlpha * 18;
      ctx.globalAlpha = beamAlpha * 0.9;
      const beamGrad = ctx.createLinearGradient(beamStart, 0, beamEnd, 0);
      beamGrad.addColorStop(0, atkColor);
      beamGrad.addColorStop(1, "#ffffff");
      ctx.fillStyle = beamGrad;
      ctx.shadowColor = atkColor;
      ctx.shadowBlur = 30;
      ctx.fillRect(
        Math.min(beamStart, beamEnd),
        vy - 40 - beamW / 2,
        Math.abs(beamEnd - beamStart),
        beamW,
      );
      ctx.shadowBlur = 0;
      // Impact at victim
      const impactR = enT * 60;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 3;
      ctx.shadowColor = atkColor;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.arc(vx, vy - 35, impactR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      break;
    }

    case "drain": {
      // Soul extraction
      const drT = Math.max(0, (t - 0.1) / 0.85);
      // Floating soul orbs moving from victim to attacker
      for (let s = 0; s < 6; s++) {
        const sPhase = (drT + s / 6) % 1;
        if (sPhase < 0.8) {
          const sx = vx + (ax - vx) * (sPhase / 0.8);
          const sy = vy - 35 - Math.sin(sPhase * Math.PI) * 60;
          const sAlpha =
            sPhase < 0.1
              ? sPhase / 0.1
              : sPhase > 0.7
                ? (0.8 - sPhase) / 0.1
                : 1;
          ctx.globalAlpha = sAlpha * 0.9;
          ctx.fillStyle = "#ff40aa";
          ctx.shadowColor = "#ff00aa";
          ctx.shadowBlur = 16;
          ctx.beginPath();
          ctx.arc(sx, sy, 8 * (1 - sPhase * 0.3), 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
      ctx.globalAlpha = 1;
      break;
    }

    case "wind": {
      // Vortex spiral
      const wT = Math.max(0, (t - 0.05) / 0.9);
      ctx.globalAlpha = wT * 0.85;
      for (let ring = 0; ring < 4; ring++) {
        const rPhase = (wT * 2 + ring * 0.25) % 1;
        const rRadius = rPhase * 120;
        const rAlpha = rPhase < 0.5 ? rPhase / 0.5 : (1 - rPhase) / 0.5;
        ctx.globalAlpha = rAlpha * 0.7;
        ctx.strokeStyle = "#88ccff";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#4488ff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(vx, vy - 35, rRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;
      break;
    }

    default: {
      // Slash: dramatic X mark
      const slT = Math.max(0, (t - 0.1) / 0.85);
      if (slT > 0.2) {
        const xAlpha =
          slT < 0.4 ? (slT - 0.2) / 0.2 : slT > 0.8 ? (1 - slT) / 0.2 : 1;
        ctx.globalAlpha = xAlpha;
        ctx.strokeStyle = atkColor;
        ctx.lineWidth = 8;
        ctx.shadowColor = atkColor;
        ctx.shadowBlur = 20;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(vx - 40, vy - 70);
        ctx.lineTo(vx + 40, vy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(vx + 40, vy - 70);
        ctx.lineTo(vx - 40, vy);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }
  }

  ctx.restore();

  // ── FINISHER text ────────────────────────────────────────────────────────
  if (t > 0.05 && t < 0.45) {
    const txtAlpha =
      t < 0.15 ? (t - 0.05) / 0.1 : t > 0.35 ? (0.45 - t) / 0.1 : 1;
    ctx.save();
    ctx.globalAlpha = txtAlpha;
    ctx.textAlign = "center";
    ctx.shadowColor = "#ff2200";
    ctx.shadowBlur = 30;
    ctx.fillStyle = "#ff2200";
    ctx.font = "bold 68px 'Bricolage Grotesque', sans-serif";
    ctx.fillText("FINISH HIM!", CANVAS_W / 2, CANVAS_H / 2 + 10);
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ── Ability name label ───────────────────────────────────────────────────
  if (t > 0.25 && t < 0.75) {
    const lblAlpha =
      t < 0.35 ? (t - 0.25) / 0.1 : t > 0.65 ? (0.75 - t) / 0.1 : 1;
    ctx.save();
    ctx.globalAlpha = lblAlpha * 0.8;
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = atkColor;
    ctx.shadowBlur = 12;
    ctx.font = "bold 18px 'Figtree', sans-serif";
    const abilityLabel = ability
      .replace(/([A-Z])/g, " $1")
      .toUpperCase()
      .trim();
    ctx.fillText(
      `${abilityLabel} FINISHER`,
      CANVAS_W / 2,
      CANVAS_H - barH - 16,
    );
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  // ── Final ELIMINATED text ────────────────────────────────────────────────
  if (t > 0.75) {
    const eAlpha = (t - 0.75) / 0.25;
    ctx.save();
    ctx.globalAlpha = eAlpha;
    ctx.textAlign = "center";
    ctx.shadowColor = atkColor;
    ctx.shadowBlur = 40;
    ctx.fillStyle = atkColor;
    ctx.font = "bold 72px 'Bricolage Grotesque', sans-serif";
    ctx.fillText("ELIMINATED", CANVAS_W / 2, CANVAS_H / 2 + 10);
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
