/* ==========================================================================
   ADVANCED HAPPY BIRTHDAY - MAIN APPLICATION INITIALIZER
   ========================================================================== */

import { CanvasFX } from './canvas-fx.js';
import { AudioManager } from './audio-manager.js';
import { CandleManager } from './candles.js';
import { BalloonManager } from './balloons.js';
import { GalleryManager } from './gallery.js';
import { WishBoard } from './wish-board.js';
import { PersonalizeManager } from './personalize.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Toast Notification System
  const toastContainer = document.getElementById('toast-container');
  const showToast = (message) => {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>✨</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 4000);
  };

  // 2. Initialize Canvas FX Engine
  const bgCanvas = document.getElementById('bg-canvas');
  const canvasFX = new CanvasFX(bgCanvas);

  // 3. Initialize Audio Manager
  const audioManager = new AudioManager();

  // 4. Initialize Candle Manager
  const cakeContainer = document.querySelector('.cake-container');
  const candleManager = new CandleManager({
    containerEl: cakeContainer,
    audioManager: audioManager,
    canvasFX: canvasFX,
    onBlowOut: () => {
      showToast('🎉 Happy Birthday! Candles blown out!');
      const blowStatusText = document.getElementById('blow-status-text');
      if (blowStatusText) blowStatusText.textContent = '🎉 Candles Blown Out!';
    }
  });

  // 5. Initialize Balloon Manager
  const balloonsContainer = document.getElementById('balloons-container');
  new BalloonManager({
    containerEl: balloonsContainer,
    audioManager: audioManager,
    canvasFX: canvasFX,
    showToastCb: showToast
  });

  // 6. Initialize Polaroid Gallery
  const galleryGrid = document.getElementById('gallery-grid');
  const lightboxModal = document.getElementById('lightbox-modal');
  const galleryManager = new GalleryManager({
    gridEl: galleryGrid,
    lightboxModalEl: lightboxModal
  });

  // Photo Upload Handler
  const uploadPhotoInput = document.getElementById('upload-photo-input');
  if (uploadPhotoInput) {
    uploadPhotoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          galleryManager.addPhoto(evt.target.result, 'Uploaded Memory');
          showToast('📸 Photo added to the Polaroid gallery!');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // 7. Initialize Wish Board
  const wishesGrid = document.getElementById('wishes-grid');
  const wishForm = document.getElementById('wish-form');
  const wishNameInput = document.getElementById('wish-author');
  const wishTextInput = document.getElementById('wish-text');
  new WishBoard({
    gridEl: wishesGrid,
    formEl: wishForm,
    nameInput: wishNameInput,
    textInput: wishTextInput,
    showToastCb: showToast
  });

  // 8. Initialize Personalization & URL Sharing
  const personalizeModal = document.getElementById('personalize-modal');
  const personalizeForm = document.getElementById('personalize-form');
  const editNameInput = document.getElementById('edit-name');
  const editMsgInput = document.getElementById('edit-msg');

  const personalizeManager = new PersonalizeManager({
    modalEl: personalizeModal,
    formEl: personalizeForm,
    nameInput: editNameInput,
    subtextInput: editMsgInput,
    showToastCb: showToast
  });

  // 9. Unboxing Entrance Gate Logic
  const entranceGate = document.getElementById('entrance-gate');
  const giftBox = document.getElementById('gift-box-trigger');
  const giftLid = document.querySelector('.gift-lid');

  if (giftBox && entranceGate) {
    giftBox.addEventListener('click', () => {
      audioManager.playUnwrapChime();
      if (giftLid) giftLid.style.animation = 'lid-fly-off 0.8s forwards ease-in';

      setTimeout(() => {
        entranceGate.classList.add('hidden');
        canvasFX.triggerMassiveFireworks(3500);
        showToast('🎁 Welcome to the celebration!');
      }, 600);
    });
  }

  // 10. Button Event Listeners & Floating Controls
  
  // Music Toggle Button & Playlist Selector
  const musicBtn = document.getElementById('toggle-music-btn');
  const playlistSelect = document.getElementById('playlist-select');

  if (musicBtn) {
    musicBtn.addEventListener('click', () => {
      const isPlaying = audioManager.toggleMusic();
      musicBtn.classList.toggle('active', isPlaying);
      musicBtn.innerHTML = isPlaying ? '🎵' : '🔇';
      showToast(isPlaying ? '🎶 Playing song!' : '🔇 Music paused');
    });
  }

  if (playlistSelect) {
    playlistSelect.addEventListener('change', (e) => {
      const trackIdx = parseInt(e.target.value, 10);
      audioManager.playTrack(trackIdx);
      if (musicBtn) {
        musicBtn.classList.add('active');
        musicBtn.innerHTML = '🎵';
      }
      const trackTitle = audioManager.tracks[trackIdx]?.title || 'Song';
      showToast(`🎵 Playing: ${trackTitle}`);
    });
  }

  // Firework Launch Button
  const fireworksBtn = document.getElementById('trigger-fireworks-btn');
  if (fireworksBtn) {
    fireworksBtn.addEventListener('click', () => {
      canvasFX.triggerMassiveFireworks(4000);
      audioManager.playUnwrapChime();
      showToast('🎆 Fireworks launched!');
    });
  }

  // Personalize Button
  const personalizeBtn = document.getElementById('open-personalize-btn');
  if (personalizeBtn) {
    personalizeBtn.addEventListener('click', () => {
      personalizeManager.openModal();
    });
  }

  const closePersonalizeBtn = document.getElementById('close-personalize-btn');
  if (closePersonalizeBtn) {
    closePersonalizeBtn.addEventListener('click', () => {
      personalizeManager.closeModal();
    });
  }

  // Microphone Candle Blow Button
  const micBlowBtn = document.getElementById('mic-blow-btn');
  const blowStatusText = document.getElementById('blow-status-text');
  if (micBlowBtn) {
    micBlowBtn.addEventListener('click', () => {
      candleManager.startMicListening((status) => {
        if (status === 'listening' && blowStatusText) {
          blowStatusText.textContent = '🎙️ Listening... Blow into your microphone now!';
          showToast('🌬️ Blow into your microphone to extinguish the candles!');
        } else if (status === 'denied') {
          showToast('Mic access denied. Tap the candles directly to blow them out!');
          candleManager.blowOutAll();
        }
      });
    });
  }

  // Blow Out All Candles Direct Button
  const blowDirectBtn = document.getElementById('blow-direct-btn');
  if (blowDirectBtn) {
    blowDirectBtn.addEventListener('click', () => {
      candleManager.blowOutAll();
    });
  }
});
