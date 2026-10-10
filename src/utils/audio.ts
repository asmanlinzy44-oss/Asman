/**
 * Solo Leveling Anime System UI Sound Synthesizer (Web Audio API)
 * Generates the iconic electric blue System interface sounds ("zzzk" electric spark click,
 * quest alerts, hologram window transitions, level up notifications).
 * Zero external mp3/wav files required, zero latency, runs instantly across all browsers.
 */

let audioCtx: AudioContext | null = null;
let soundEnabled = true;
let lastClickTime = 0;
let isGlobalListenerAttached = false;

// Check stored sound preference
try {
  const saved = localStorage.getItem('studypro_robotic_sound_enabled');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
} catch {
  soundEnabled = true;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function isRoboticSoundEnabled(): boolean {
  return soundEnabled;
}

export function setRoboticSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled;
  try {
    localStorage.setItem('studypro_robotic_sound_enabled', enabled ? 'true' : 'false');
  } catch {}
}

/**
 * Solo Leveling Anime System UI Click ("zzzk" Electric Blue Hologram)
 * Recreates the iconic electric spark / mana arc sound when clicking
 * the floating blue hunter system interface in Solo Leveling.
 */
export function playRoboticClick(): void {
  if (!soundEnabled) return;

  const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now();
  if (nowMs - lastClickTime < 45) {
    return; // Debounce rapid multi-triggers within 45ms
  }
  lastClickTime = nowMs;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // -------------------------------------------------------------
    // LAYER 1: Electric Arc Crackle / Sizzle ("zzzk" spark texture)
    // -------------------------------------------------------------
    const sparkDuration = 0.038; // 38ms of electric sizzle
    const sampleRate = ctx.sampleRate || 44100;
    const bufferSize = Math.floor(sampleRate * sparkDuration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const channelData = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Modulated decaying lightning crackle
      const decay = Math.exp(-i / (bufferSize * 0.45));
      const sparkImpulse = Math.random() > 0.3 ? (Math.random() * 2 - 1) : 0;
      channelData[i] = sparkImpulse * decay;
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const sparkFilter = ctx.createBiquadFilter();
    sparkFilter.type = 'bandpass';
    sparkFilter.frequency.setValueAtTime(3600, now);
    sparkFilter.frequency.exponentialRampToValueAtTime(1400, now + sparkDuration);
    sparkFilter.Q.setValueAtTime(5.2, now); // Sharp electric resonance

    const sparkGain = ctx.createGain();
    sparkGain.gain.setValueAtTime(0.24, now);
    sparkGain.gain.exponentialRampToValueAtTime(0.001, now + sparkDuration);

    noiseSource.connect(sparkFilter);
    sparkFilter.connect(sparkGain);
    sparkGain.connect(ctx.destination);
    noiseSource.start(now);

    // -------------------------------------------------------------
    // LAYER 2: High-Voltage Electric Zap (Sawtooth/Square Down-Sweep)
    // -------------------------------------------------------------
    const zapOsc = ctx.createOscillator();
    const zapGain = ctx.createGain();
    const zapFilter = ctx.createBiquadFilter();

    zapOsc.type = 'sawtooth';
    zapOsc.frequency.setValueAtTime(2850, now);
    zapOsc.frequency.exponentialRampToValueAtTime(750, now + 0.034);

    zapFilter.type = 'bandpass';
    zapFilter.frequency.setValueAtTime(2200, now);
    zapFilter.Q.setValueAtTime(3.8, now);

    zapGain.gain.setValueAtTime(0.18, now);
    zapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);

    zapOsc.connect(zapFilter);
    zapFilter.connect(zapGain);
    zapGain.connect(ctx.destination);

    zapOsc.start(now);
    zapOsc.stop(now + 0.042);

    // -------------------------------------------------------------
    // LAYER 3: Holographic System Window Crystal Chime (Blue Mana Ping)
    // -------------------------------------------------------------
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();

    chimeOsc.type = 'sine';
    chimeOsc.frequency.setValueAtTime(2093, now); // C7 Note
    chimeOsc.frequency.exponentialRampToValueAtTime(1661, now + 0.055); // G#6

    chimeGain.gain.setValueAtTime(0.14, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(ctx.destination);

    chimeOsc.start(now);
    chimeOsc.stop(now + 0.065);

    // -------------------------------------------------------------
    // LAYER 4: Tactile Sub-Impulse (Provides physical tactile thump)
    // -------------------------------------------------------------
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();

    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(150, now);
    subOsc.frequency.exponentialRampToValueAtTime(45, now + 0.022);

    subGain.gain.setValueAtTime(0.15, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    subOsc.connect(subGain);
    subGain.connect(ctx.destination);

    subOsc.start(now);
    subOsc.stop(now + 0.03);
  } catch {}
}

// Alias for explicit Solo Leveling naming
export const playSoloLevelingClick = playRoboticClick;

/**
 * Solo Leveling System Window Switch / Tab Slide ("zzzk-shing" electric swoop)
 */
export function playRoboticTab(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    // Electric swoop oscillator
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(850, now);
    osc1.frequency.exponentialRampToValueAtTime(2400, now + 0.045);
    osc1.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    const filter1 = ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(1800, now);
    filter1.Q.setValueAtTime(3.5, now);

    gain1.gain.setValueAtTime(0.14, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc1.connect(filter1);
    filter1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.09);

    // High crystalline mana chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1760, now + 0.015);
    osc2.frequency.exponentialRampToValueAtTime(2637, now + 0.07);

    gain2.gain.setValueAtTime(0.12, now + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.015);
    osc2.stop(now + 0.1);
  } catch {}
}

export const playSoloLevelingTab = playRoboticTab;

/**
 * Solo Leveling Inventory / Drawer Unfold ("zzzk-vwoop")
 */
export function playRoboticFolder(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(1250, now + 0.04);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.Q.setValueAtTime(2.8, now);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  } catch {}
}

export const playSoloLevelingFolder = playRoboticFolder;

/**
 * Solo Leveling System Quest Complete / Level Up Alert ("Ding-Ding-Zzzk-Chime!")
 */
export function playRoboticUnlock(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Solo Leveling System chime progression: F#5, A5, C#6, E6 (Minor-Major 7th high-tech mystery chord)
    const notes = [739.99, 880.0, 1108.73, 1318.51];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = now + idx * 0.055;
      const duration = 0.16;

      osc.type = idx === notes.length - 1 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.03, startTime + duration);

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    });
  } catch {}
}

export const playSoloLevelingLevelUp = playRoboticUnlock;

/**
 * Solo Leveling Penalty / Red Warning System Buzzer
 */
export function playRoboticError(): void {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(130, now + 0.06);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.Q.setValueAtTime(3.0, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  } catch {}
}

export const playSoloLevelingWarning = playRoboticError;

/**
 * Initializes global click capture listener so that ANY interactive button,
 * link, tab, filter chip, or card click across the entire application
 * triggers the Solo Leveling anime "zzzk" system click sound!
 */
export function initSoloLevelingGlobalAudio(): void {
  if (typeof window === 'undefined' || isGlobalListenerAttached) return;
  isGlobalListenerAttached = true;

  const handleGlobalClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if clicked element or any parent is interactive
    const interactiveEl = target.closest(
      'button, a, [role="button"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], select, [data-sound="click"], .cursor-pointer'
    );

    if (interactiveEl) {
      playRoboticClick();
    }
  };

  // Capture phase ensures it triggers on touch/mouse click immediately
  window.addEventListener('click', handleGlobalClick, { capture: true, passive: true });
}
