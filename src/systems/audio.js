/* ============================================================
   audio.js — WebAudio로 효과음을 즉석 합성한다.
   사운드 파일이 전혀 없어도 동작하며, 브라우저가 막으면 조용히 무시한다.
   ============================================================ */
FF.Audio = (function () {

  let ctx = null;
  let enabled = true;
  let ready = false;

  /** 사용자 제스처 이후에만 오디오 컨텍스트를 만든다(브라우저 정책) */
  function ensure() {
    if (ctx || !enabled) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      ready = true;
    } catch (e) { ctx = null; }
    return ctx;
  }

  function tone(freq, dur, type, gain, delay, slideTo) {
    const c = ensure();
    if (!c || !enabled) return;
    try {
      const t0 = c.currentTime + (delay || 0);
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(40, slideTo), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain || 0.14, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g); g.connect(c.destination);
      osc.start(t0); osc.stop(t0 + dur + 0.02);
    } catch (e) { /* 무시 */ }
  }

  function noise(dur, gain) {
    const c = ensure();
    if (!c || !enabled) return;
    try {
      const n = Math.floor(c.sampleRate * dur);
      const buf = c.createBuffer(1, n, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      const src = c.createBufferSource(); src.buffer = buf;
      const g = c.createGain(); g.gain.value = gain || 0.08;
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 900;
      src.connect(f); f.connect(g); g.connect(c.destination);
      src.start();
    } catch (e) { /* 무시 */ }
  }

  const SFX = {
    click:   () => tone(520, 0.05, 'triangle', 0.10),
    tap:     () => tone(680, 0.04, 'square', 0.05),
    good:    () => { tone(660, 0.10, 'sine', 0.13); tone(880, 0.14, 'sine', 0.11, 0.08); },
    bad:     () => { tone(220, 0.16, 'sawtooth', 0.09, 0, 150); },
    coin:    () => { tone(1050, 0.07, 'square', 0.08); tone(1400, 0.10, 'square', 0.07, 0.06); },
    success: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.16, 'sine', 0.13, i * 0.085)); },
    unlock:  () => { [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, 0.2, 'triangle', 0.12, i * 0.07)); noise(0.3, 0.05); },
    levelup: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, 'sine', 0.14, i * 0.09)); },
    pop:     () => tone(900, 0.05, 'sine', 0.09, 0, 1500),
    sizzle:  () => noise(0.5, 0.05),
    star:    () => tone(1200, 0.08, 'triangle', 0.09),
  };

  return {
    play(name) { if (!enabled) return; const f = SFX[name]; if (f) FF.util.safe(f, 'sfx:' + name); },
    unlockContext() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {}); },
    setEnabled(v) { enabled = !!v; if (!v && ctx) { try { ctx.suspend(); } catch (e) {} } else if (v && ctx) { try { ctx.resume(); } catch (e) {} } },
    isEnabled() { return enabled; },
    isReady() { return ready; }
  };
})();
