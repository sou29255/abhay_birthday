/* ==========================================================================
   ADVANCED AUDIO MANAGER (Web Audio API Synth & Sound FX)
   ========================================================================== */

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isPlayingMusic = false;
    this.isMuted = false;
    this.musicTimer = null;
    
    // Musical frequencies for Happy Birthday melody
    this.notes = {
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00,
      'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33,
      'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
    };

    // Melody sequence: [Note, DurationFactor]
    this.happyBirthdayMelody = [
      ['G4', 0.75], ['G4', 0.25], ['A4', 1.0], ['G4', 1.0], ['C5', 1.0], ['B4', 2.0],
      ['G4', 0.75], ['G4', 0.25], ['A4', 1.0], ['G4', 1.0], ['D5', 1.0], ['C5', 2.0],
      ['G4', 0.75], ['G4', 0.25], ['G5', 1.0], ['E5', 1.0], ['C5', 1.0], ['B4', 1.0], ['A4', 1.5],
      ['F5', 0.75], ['F5', 0.25], ['E5', 1.0], ['C5', 1.0], ['D5', 1.0], ['C5', 2.5]
    ];
    this.audioElement = new Audio();
    this.audioElement.loop = true;

    this.tracks = [
      { id: 0, title: 'Track 1 (by.mpeg)', type: 'audio', src: 'by.mpeg' },
      { id: 1, title: 'Track 2 (hi.mpeg)', type: 'audio', src: 'hi.mpeg' }
    ];
    this.currentTrackIndex = 0;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playNote(freq, duration = 0.5, type = 'triangle', delay = 0) {
    if (this.isMuted) return;
    this.initContext();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);

    const now = this.ctx.currentTime + delay;
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);
  }

  playTrack(index) {
    this.stopCurrentMusic();
    this.currentTrackIndex = index;
    const track = this.tracks[index] || this.tracks[0];

    if (track.type === 'audio') {
      this.audioElement.src = track.src;
      this.audioElement.currentTime = 0;
      this.audioElement.play().then(() => {
        this.isPlayingMusic = true;
      }).catch(err => {
        console.warn('Audio playback error:', err);
      });
      this.isPlayingMusic = true;
    } else {
      this.playMelody();
    }
  }

  stopCurrentMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  playMelody() {
    this.initContext();
    this.stopCurrentMusic();
    this.isPlayingMusic = true;

    let currentTimeOffset = 0;
    const tempo = 360; // ms per beat unit

    const scheduleSequence = () => {
      if (!this.isPlayingMusic) return;

      currentTimeOffset = 0;
      this.happyBirthdayMelody.forEach(([noteName, beats]) => {
        const freq = this.notes[noteName];
        const durationSec = (beats * tempo) / 1000;
        
        this.playNote(freq, durationSec, 'sine', currentTimeOffset);
        if (freq) {
          this.playNote(freq * 0.5, durationSec, 'triangle', currentTimeOffset);
        }
        
        currentTimeOffset += durationSec;
      });

      this.musicTimer = setTimeout(() => {
        if (this.isPlayingMusic) scheduleSequence();
      }, (currentTimeOffset + 1) * 1000);
    };

    scheduleSequence();
  }

  stopMelody() {
    this.stopCurrentMusic();
  }

  toggleMusic() {
    const isPlaying = this.isPlayingMusic || (this.audioElement && !this.audioElement.paused);
    if (isPlaying) {
      this.stopCurrentMusic();
      return false;
    } else {
      this.playTrack(this.currentTrackIndex);
      return true;
    }
  }

  // --- Sound FX Methods ---
  playPopSound() {
    if (this.isMuted) return;
    this.initContext();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  playBlowSound() {
    if (this.isMuted) return;
    this.initContext();
    // Create white noise woosh for candle blowing
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  playUnwrapChime() {
    if (this.isMuted) return;
    const chord = ['C5', 'E5', 'G5', 'C6'];
    chord.forEach((note, index) => {
      const freq = this.notes[note] || 1046.5;
      this.playNote(freq, 0.6, 'sine', index * 0.1);
    });
  }
}
