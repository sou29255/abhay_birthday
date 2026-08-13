/* ==========================================================================
   ADVANCED CANDLE BLOWING & MIC SOUND DETECTOR MODULE
   ========================================================================== */

export class CandleManager {
  constructor({ containerEl, onBlowOut, audioManager, canvasFX }) {
    this.container = containerEl;
    this.onBlowOut = onBlowOut;
    this.audioManager = audioManager;
    this.canvasFX = canvasFX;

    this.candles = [];
    this.areBlownOut = false;
    this.micStream = null;
    this.audioAnalyser = null;
    this.isListeningMic = false;

    this.initCandles();
  }

  initCandles() {
    this.candles = Array.from(this.container.querySelectorAll('.candle'));
    this.candles.forEach((candle) => {
      candle.addEventListener('click', () => this.blowOutSingleCandle(candle));
    });
  }

  blowOutAll() {
    if (this.areBlownOut) return;
    this.areBlownOut = true;

    this.candles.forEach((candle, index) => {
      setTimeout(() => {
        this.extinguishCandle(candle);
      }, index * 120);
    });

    if (this.audioManager) {
      this.audioManager.playBlowSound();
      setTimeout(() => {
        this.audioManager.playTrack(0);
      }, 500);
    }

    if (this.canvasFX) {
      this.canvasFX.triggerMassiveFireworks(5000);
    }

    if (typeof this.onBlowOut === 'function') {
      this.onBlowOut();
    }
  }

  blowOutSingleCandle(candle) {
    if (candle.classList.contains('blown-out')) return;
    this.extinguishCandle(candle);
    
    if (this.audioManager) {
      this.audioManager.playBlowSound();
    }

    // Check if all candles are blown out
    const remaining = this.candles.filter(c => !c.classList.contains('blown-out'));
    if (remaining.length === 0 && !this.areBlownOut) {
      this.areBlownOut = true;
      if (this.audioManager) this.audioManager.playTrack(0);
      if (this.canvasFX) this.canvasFX.triggerMassiveFireworks(5000);
      if (typeof this.onBlowOut === 'function') this.onBlowOut();
    }
  }

  extinguishCandle(candle) {
    candle.classList.add('blown-out');

    // Create rising smoke element
    const smoke = document.createElement('div');
    smoke.className = 'smoke-particle';
    candle.appendChild(smoke);

    setTimeout(() => {
      if (smoke.parentNode) smoke.parentNode.removeChild(smoke);
    }, 1500);
  }

  // --- Microphone Audio Blowing Analyzer ---
  async startMicListening(updateStatusCb) {
    if (this.isListeningMic) return;

    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(this.micStream);
      this.audioAnalyser = audioCtx.createAnalyser();
      this.audioAnalyser.fftSize = 256;
      source.connect(this.audioAnalyser);

      this.isListeningMic = true;
      if (updateStatusCb) updateStatusCb('listening');

      const dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);
      
      const checkBlowingVolume = () => {
        if (!this.isListeningMic || this.areBlownOut) return;

        this.audioAnalyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const averageVolume = sum / dataArray.length;

        // High frequency volume surge indicating blow sound
        if (averageVolume > 42) {
          this.blowOutAll();
          this.stopMicListening();
          if (updateStatusCb) updateStatusCb('blown');
          return;
        }

        requestAnimationFrame(checkBlowingVolume);
      };

      checkBlowingVolume();
    } catch (err) {
      console.warn('Microphone access denied or unavailable:', err);
      if (updateStatusCb) updateStatusCb('denied');
    }
  }

  stopMicListening() {
    this.isListeningMic = false;
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
  }
}
