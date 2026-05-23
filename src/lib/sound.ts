let audioContext: AudioContext | null = null;
let menuAmbientNodes: { stop: () => void } | null = null;

export function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') void ctx.resume();
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function rampGain(gain: GainNode, now: number, peak: number, end: number) {
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.08);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
}

export function playMenuAmbient() {
  try {
    stopMenuAmbient();
    const context = getAudioContext();
    const now = context.currentTime;
    const master = context.createGain();
    master.gain.value = 0.035;
    master.connect(context.destination);

    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(52, now);
    osc.frequency.linearRampToValueAtTime(58, now + 12);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 2);
    osc.connect(gain).connect(master);
    osc.start(now);

    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 8;
    lfo.connect(lfoGain).connect(osc.frequency);
    lfo.start(now);

    menuAmbientNodes = {
      stop: () => {
        gain.gain.linearRampToValueAtTime(0.0001, context.currentTime + 0.6);
        osc.stop(context.currentTime + 0.7);
        lfo.stop(context.currentTime + 0.7);
        menuAmbientNodes = null;
      },
    };
  } catch {
    /* no audio */
  }
}

export function stopMenuAmbient() {
  menuAmbientNodes?.stop();
}

export function playSliderTick() {
  try {
    const context = getAudioContext();
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.04, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(gain).connect(context.destination);
    osc.start(now);
    osc.stop(now + 0.07);
  } catch {
    /* */
  }
}

export function playTensionBuild() {
  const context = getAudioContext();
  const now = context.currentTime;
  const master = context.createGain();
  master.gain.value = 0.12;
  master.connect(context.destination);

  const riser = context.createOscillator();
  const riserGain = context.createGain();
  riser.type = 'sawtooth';
  riser.frequency.setValueAtTime(70, now);
  riser.frequency.exponentialRampToValueAtTime(520, now + 0.62);
  rampGain(riserGain, now, 0.08, now + 0.66);
  riser.connect(riserGain).connect(master);
  riser.start(now);
  riser.stop(now + 0.68);

  return () => {
    riserGain.gain.cancelScheduledValues(context.currentTime);
    riserGain.gain.setValueAtTime(0.0001, context.currentTime);
  };
}

export function playRevealSound(intensity: number) {
  try {
    const context = getAudioContext();
    const now = context.currentTime;
    const master = context.createGain();
    master.connect(context.destination);
    master.gain.value = Math.min(0.18, 0.06 + intensity * 0.1);

    const riser = context.createOscillator();
    const riserGain = context.createGain();
    riser.type = 'sine';
    riser.frequency.setValueAtTime(90, now);
    riser.frequency.exponentialRampToValueAtTime(420 + intensity * 520, now + 0.48);
    rampGain(riserGain, now, 0.2, now + 0.54);
    riser.connect(riserGain).connect(master);
    riser.start(now);
    riser.stop(now + 0.56);

    const impact = context.createOscillator();
    const impactGain = context.createGain();
    impact.type = 'triangle';
    impact.frequency.setValueAtTime(62 + intensity * 90, now + 0.52);
    impact.frequency.exponentialRampToValueAtTime(24, now + 1.05);
    rampGain(impactGain, now + 0.52, 0.48, now + 1.15);
    impact.connect(impactGain).connect(master);
    impact.start(now + 0.52);
    impact.stop(now + 1.18);

    window.navigator.vibrate?.(intensity > 0.82 ? [32, 20, 48] : 18);
  } catch {
    window.navigator.vibrate?.(16);
  }
}

export function playScorePop(legendary: boolean) {
  try {
    const context = getAudioContext();
    const now = context.currentTime;
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = legendary ? 'square' : 'sine';
    osc.frequency.setValueAtTime(legendary ? 880 : 520, now);
    osc.frequency.exponentialRampToValueAtTime(legendary ? 1320 : 740, now + 0.12);
    rampGain(gain, now, legendary ? 0.14 : 0.08, now + 0.22);
    osc.connect(gain).connect(context.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  } catch {
    /* */
  }
}
