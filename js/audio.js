'use strict';
/* Procedural sound effects (Web Audio API). No audio files: every sound is
   synthesized from oscillators and filtered noise, so any of them can later be
   swapped for a recorded sample by replacing its entry in SOUNDS. */

const Sfx = (() => {
  const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } };
  const load = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };

  let ctx = null, master = null, noiseBuf = null;
  let enabled = load('mf.sound', true);
  let volume = load('mf.volume', 0.6);

  function init() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = volume;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.ratio.value = 4;
    master.connect(comp).connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return ctx;
  }

  /* ---- building blocks: all times in seconds relative to "now" ---- */
  function envelope(g, t, a, peak, d) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }
  function tone({ type = 'sine', f = 440, f2, t = 0, a = 0.005, d = 0.2, g = 0.3, vib = 0 }) {
    const now = ctx.currentTime + t;
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f, now);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + a + d);
    if (vib) {
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = vib; lg.gain.value = f * 0.03;
      lfo.connect(lg).connect(o.frequency); lfo.start(now); lfo.stop(now + a + d + 0.05);
    }
    const gn = ctx.createGain();
    envelope(gn, now, a, g, d);
    o.connect(gn).connect(master);
    o.start(now); o.stop(now + a + d + 0.05);
  }
  function noise({ t = 0, a = 0.005, d = 0.2, g = 0.3, type = 'bandpass', f = 1000, f2, q = 1 }) {
    const now = ctx.currentTime + t;
    const s = ctx.createBufferSource();
    s.buffer = noiseBuf; s.loop = true;
    const fl = ctx.createBiquadFilter();
    fl.type = type; fl.Q.value = q;
    fl.frequency.setValueAtTime(f, now);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, now + a + d);
    const gn = ctx.createGain();
    envelope(gn, now, a, g, d);
    s.connect(fl).connect(gn).connect(master);
    s.start(now, Math.random() * 0.5); s.stop(now + a + d + 0.05);
  }
  const rnd = (lo, hi) => lo + Math.random() * (hi - lo);
  /* inharmonic partials = metal */
  function metal(base, { t = 0, d = 0.5, g = 0.18 } = {}) {
    [1, 2.76, 5.4, 8.93].forEach((m, i) => tone({ type: i ? 'sine' : 'triangle', f: base * m, t, d: d / (1 + i * 0.6), g: g / (1 + i * 0.7) }));
  }
  function crackle(n, { t = 0, span = 0.3, g = 0.12, f = 3000 } = {}) {
    for (let i = 0; i < n; i++) noise({ t: t + Math.random() * span, d: rnd(0.01, 0.03), g: g * rnd(0.5, 1), type: 'highpass', f });
  }

  const SOUNDS = {
    swing() { noise({ a: 0.03, d: 0.14, g: 0.22, f: 700, f2: 2600, q: 2.5 }); },
    heavySwing() { noise({ a: 0.08, d: 0.22, g: 0.3, f: 250, f2: 1100, q: 2 }); },
    hit() { // unblocked light hit
      tone({ f: 170, f2: 60, d: 0.14, g: 0.5 });
      noise({ d: 0.08, g: 0.35, type: 'lowpass', f: 1400 });
    },
    heavyHit() {
      tone({ f: 120, f2: 38, d: 0.35, g: 0.75 });
      noise({ d: 0.22, g: 0.45, type: 'lowpass', f: 900, f2: 200 });
      noise({ t: 0.01, d: 0.06, g: 0.25, type: 'bandpass', f: 2200 });
    },
    hurt() { // extra "oof" layer when the player takes damage
      tone({ type: 'sawtooth', f: 210, f2: 120, a: 0.01, d: 0.16, g: 0.07 });
    },
    defend() { // raise shield: wooden thunk + light iron clink
      tone({ f: 190, f2: 120, d: 0.1, g: 0.35 });
      noise({ d: 0.05, g: 0.2, type: 'lowpass', f: 800 });
      metal(820, { t: 0.04, d: 0.25, g: 0.08 });
    },
    block() { // hit absorbed by block: metallic clang
      metal(430, { d: 0.6, g: 0.2 });
      noise({ d: 0.05, g: 0.3, type: 'highpass', f: 2500 });
      tone({ f: 140, f2: 80, d: 0.08, g: 0.25 });
    },
    shieldBreak() { // crack + falling metal shards
      noise({ d: 0.12, g: 0.5, type: 'bandpass', f: 1600, q: 0.8 });
      crackle(6, { span: 0.18, g: 0.25, f: 2000 });
      metal(380, { d: 0.35, g: 0.15 });
      [0.12, 0.2, 0.31].forEach((t, i) => metal(1200 + i * 330, { t, d: 0.15, g: 0.05 }));
      tone({ f: 300, f2: 90, d: 0.25, g: 0.2 });
    },
    fireCast() { noise({ a: 0.06, d: 0.32, g: 0.35, type: 'lowpass', f: 300, f2: 2400 }); crackle(6, { span: 0.35, g: 0.08 }); },
    fireImpact() {
      noise({ d: 0.45, g: 0.55, type: 'lowpass', f: 1200, f2: 150 });
      tone({ f: 90, f2: 40, d: 0.35, g: 0.45 });
      crackle(10, { t: 0.05, span: 0.4, g: 0.1 });
    },
    burn() { noise({ a: 0.02, d: 0.28, g: 0.18, type: 'highpass', f: 3500 }); crackle(7, { span: 0.25, g: 0.1 }); },
    frostCast() {
      [1, 1.25, 1.5, 2].forEach((m, i) => tone({ f: 1500 * m, t: i * 0.04, a: 0.03, d: 0.35, g: 0.05, vib: 9 }));
      noise({ a: 0.05, d: 0.25, g: 0.12, type: 'highpass', f: 5000 });
    },
    frostImpact() { // glassy shatter
      noise({ d: 0.1, g: 0.35, type: 'highpass', f: 3000 });
      for (let i = 0; i < 9; i++) tone({ f: rnd(2200, 4800), t: Math.random() * 0.3, d: rnd(0.05, 0.15), g: 0.05 });
      tone({ f: 160, f2: 70, d: 0.12, g: 0.3 });
    },
    chill() { // Grave Chill cast: hollow ghostly moan
      tone({ type: 'triangle', f: 330, f2: 190, a: 0.08, d: 0.4, g: 0.12, vib: 6 });
      noise({ a: 0.1, d: 0.35, g: 0.12, type: 'bandpass', f: 900, f2: 400, q: 6 });
    },
    zap() {
      for (let i = 0; i < 5; i++) tone({ type: 'sawtooth', f: rnd(90, 260), t: i * 0.03, d: 0.04, g: 0.1 });
      noise({ d: 0.15, g: 0.3, type: 'highpass', f: 4000 });
      noise({ t: 0.02, d: 0.1, g: 0.2, type: 'bandpass', f: 1200, q: 3 });
    },
    lightningOn() { tone({ type: 'sawtooth', f: 160, f2: 900, a: 0.02, d: 0.3, g: 0.08 }); tone({ f: 600, f2: 1600, d: 0.3, g: 0.08 }); SOUNDS.zap(); },
    lightningOff() { tone({ type: 'sawtooth', f: 900, f2: 120, a: 0.01, d: 0.3, g: 0.07 }); noise({ t: 0.05, d: 0.2, g: 0.08, type: 'highpass', f: 5000 }); },
    potion() { [0, 0.11, 0.22].forEach((t, i) => tone({ f: 260 + i * 40, f2: 520 + i * 60, t, d: 0.07, g: 0.22 })); tone({ f: 900, f2: 1400, t: 0.36, d: 0.12, g: 0.06 }); },
    stun() { tone({ f: 1760, t: 0, d: 0.25, g: 0.1 }); tone({ f: 1320, t: 0.12, d: 0.3, g: 0.1 }); tone({ f: 1568, t: 0.24, d: 0.35, g: 0.08 }); },
    stagger() { tone({ type: 'triangle', f: 220, f2: 140, d: 0.3, g: 0.2, vib: 12 }); },
    drain() { tone({ f: 600, f2: 110, a: 0.03, d: 0.5, g: 0.15, vib: 14 }); },
    windup() { noise({ a: 0.3, d: 0.25, g: 0.25, type: 'bandpass', f: 120, f2: 600, q: 3 }); tone({ type: 'triangle', f: 70, f2: 140, a: 0.3, d: 0.25, g: 0.25 }); metal(260, { t: 0.45, d: 0.4, g: 0.08 }); },
    immune() { metal(600, { d: 0.2, g: 0.08 }); },
    turn() { tone({ f: 523, d: 0.25, g: 0.06 }); tone({ f: 784, t: 0.08, d: 0.3, g: 0.05 }); },
    victory() { [523, 659, 784, 1047].forEach((f, i) => tone({ type: 'triangle', f, t: i * 0.13, d: i === 3 ? 0.8 : 0.25, g: 0.18 })); },
    defeat() { [392, 349, 311, 262].forEach((f, i) => tone({ type: 'triangle', f, t: i * 0.22, d: i === 3 ? 1 : 0.3, g: 0.16 })); },
    click() { tone({ f: 1400, d: 0.03, g: 0.04 }); },
  };

  return {
    names: Object.keys(SOUNDS),
    play(name) {
      if (!enabled || !SOUNDS[name]) return;
      if (!init()) return;
      if (ctx.state === 'suspended') ctx.resume();
      try { SOUNDS[name](); } catch (e) { console.warn('sfx', name, e); }
    },
    unlock() { if (enabled && init() && ctx.state === 'suspended') ctx.resume(); },
    get enabled() { return enabled; },
    setEnabled(v) { enabled = !!v; store('mf.sound', enabled); },
    get volume() { return volume; },
    setVolume(v) { volume = Math.max(0, Math.min(1, v)); store('mf.volume', volume); if (master) master.gain.value = volume; },
  };
})();
