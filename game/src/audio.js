// Gobble Dash — all sound is synthesized with WebAudio. No audio files, no network.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this._alarmAt = 0;
  }

  unlock() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        this.ctx = null;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  _tone(freq, dur, type, vol, when = 0, slideTo = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  gobble() {
    // The turkey's signature: a quick descending gobble-gobble.
    const notes = [420, 360, 300, 380, 320, 260];
    notes.forEach((f, i) => this._tone(f, 0.09, 'square', 0.06, i * 0.07, f * 0.8));
  }

  jump() {
    this._tone(280, 0.14, 'sine', 0.09, 0, 620);
  }

  flap() {
    this._tone(420, 0.1, 'triangle', 0.07, 0, 760);
  }

  corn() {
    this._tone(880, 0.07, 'sine', 0.1);
    this._tone(1320, 0.1, 'sine', 0.09, 0.06);
  }

  feather() {
    [660, 880, 1100, 1320].forEach((f, i) => this._tone(f, 0.12, 'sine', 0.08, i * 0.07));
  }

  hurt() {
    this._tone(180, 0.25, 'sawtooth', 0.12, 0, 60);
  }

  stumble() {
    this._tone(140, 0.12, 'square', 0.07, 0, 90);
  }

  // Throttled two-tone alarm while the farmer is close behind.
  alarm(now) {
    if (now - this._alarmAt < 0.9) return;
    this._alarmAt = now;
    this._tone(520, 0.12, 'square', 0.05);
    this._tone(392, 0.14, 'square', 0.05, 0.14);
  }

  caught() {
    [392, 370, 349, 311].forEach((f, i) => this._tone(f, 0.28, 'sawtooth', 0.1, i * 0.22));
  }

  escaped() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => this._tone(f, 0.22, 'triangle', 0.1, i * 0.11));
  }

  stageClear() {
    [784, 988, 1175].forEach((f, i) => this._tone(f, 0.16, 'triangle', 0.09, i * 0.09));
  }
}
