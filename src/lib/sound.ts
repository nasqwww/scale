let audioContext: AudioContext | null = null;

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

export function playRevealSound(intensity: number) {
  try {
    const context = getAudioContext();
    const now = context.currentTime;
    const master = context.createGain();
    master.connect(context.destination);
    master.gain.value = Math.min(0.16, 0.07 + intensity * 0.08);

    const riser = context.createOscillator();
    const riserGain = context.createGain();
    riser.type = 'sine';
    riser.frequency.setValueAtTime(90, now);
    riser.frequency.exponentialRampToValueAtTime(380 + intensity * 440, now + 0.44);
    rampGain(riserGain, now, 0.18, now + 0.5);
    riser.connect(riserGain).connect(master);
    riser.start(now);
    riser.stop(now + 0.52);

    const impact = context.createOscillator();
    const impactGain = context.createGain();
    impact.type = 'triangle';
    impact.frequency.setValueAtTime(55 + intensity * 80, now + 0.5);
    impact.frequency.exponentialRampToValueAtTime(28, now + 0.9);
    rampGain(impactGain, now + 0.5, 0.42, now + 1.08);
    impact.connect(impactGain).connect(master);
    impact.start(now + 0.5);
    impact.stop(now + 1.1);

    window.navigator.vibrate?.(intensity > 0.82 ? [28, 18, 42] : 24);
  } catch {
    window.navigator.vibrate?.(20);
  }
}
