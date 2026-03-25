// Procedural sound effects using Web Audio API
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function noteFreq(note: string): number {
  const notes: Record<string, number> = {
    C4: 261.63,
    D4: 293.66,
    E4: 329.63,
    F4: 349.23,
    G4: 392,
    A4: 440,
    B4: 493.88,
    C5: 523.25,
    D5: 587.33,
    E5: 659.25,
    G5: 783.99,
  };
  return notes[note] ?? 440;
}

function osc(
  ac: AudioContext,
  type: OscillatorType,
  freq: number,
  startTime: number,
  endTime: number,
  gain: number,
  freqEnd?: number,
) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, startTime);
  if (freqEnd !== undefined)
    o.frequency.exponentialRampToValueAtTime(freqEnd, endTime);
  g.gain.setValueAtTime(gain, startTime);
  g.gain.exponentialRampToValueAtTime(0.001, endTime);
  o.connect(g);
  g.connect(ac.destination);
  o.start(startTime);
  o.stop(endTime + 0.01);
}

function noise(
  ac: AudioContext,
  startTime: number,
  duration: number,
  gain: number,
  lowpass = 800,
) {
  const bufSize = ac.sampleRate * duration;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const filter = ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = lowpass;
  const g = ac.createGain();
  g.gain.setValueAtTime(gain, startTime);
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  src.connect(filter);
  filter.connect(g);
  g.connect(ac.destination);
  src.start(startTime);
  src.stop(startTime + duration);
}

export function playHit() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  noise(ac, t, 0.08, 0.35, 400);
  osc(ac, "sine", 160, t, t + 0.07, 0.25, 60);
}

export function playSpecial() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  osc(ac, "sawtooth", 220, t, t + 0.12, 0.15, 880);
  osc(ac, "square", 440, t + 0.05, t + 0.25, 0.1, 1200);
  noise(ac, t, 0.15, 0.12, 2000);
}

export function playJump() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  osc(ac, "sine", 320, t, t + 0.18, 0.18, 640);
}

export function playLand() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  noise(ac, t, 0.06, 0.2, 300);
  osc(ac, "sine", 80, t, t + 0.06, 0.2, 40);
}

export function playLootBox() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  const melody = ["C5", "E5", "G5", "C5"];
  melody.forEach((note, i) => {
    const st = t + i * 0.12;
    osc(ac, "triangle", noteFreq(note), st, st + 0.18, 0.22);
  });
  noise(ac, t, 0.5, 0.08, 6000);
}

export function playFinisher() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  osc(ac, "sawtooth", 55, t, t + 0.4, 0.3, 30);
  osc(ac, "square", 110, t + 0.1, t + 0.5, 0.2, 220);
  noise(ac, t + 0.05, 0.6, 0.25, 1200);
  osc(ac, "sine", 880, t + 0.3, t + 0.7, 0.15, 110);
}

export function playRoundEnd() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  osc(ac, "sine", 440, t, t + 0.5, 0.3);
  osc(ac, "sine", 440, t + 0.02, t + 0.52, 0.1);
  osc(ac, "sine", 880, t + 0.15, t + 0.6, 0.15);
}

export function playVictory() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  const tune = [
    [noteFreq("C5"), 0],
    [noteFreq("E5"), 0.1],
    [noteFreq("G5"), 0.2],
    [noteFreq("C5"), 0.35],
    [noteFreq("E5"), 0.45],
    [noteFreq("G5"), 0.55],
    [noteFreq("C5") * 2, 0.7],
  ];
  for (const [freq, delay] of tune) {
    osc(ac, "triangle", freq, t + delay, t + delay + 0.22, 0.2);
  }
}

export function playMenuClick() {
  const ac = getCtx();
  if (!ac) return;
  const t = ac.currentTime;
  osc(ac, "sine", 880, t, t + 0.05, 0.12, 660);
}
