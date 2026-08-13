/* ==========================================================================
   ADVANCED PERSONALIZATION & URL SHARE MODULE
   ========================================================================== */

export class PersonalizeManager {
  constructor({ modalEl, formEl, nameInput, subtextInput, showToastCb, onUpdateCb }) {
    this.modal = modalEl;
    this.form = formEl;
    this.nameInput = nameInput;
    this.subtextInput = subtextInput;
    this.showToast = showToastCb;
    this.onUpdate = onUpdateCb;

    this.recipientData = {
      name: 'ABHAY',
      subtext: 'Wishing you a day filled with unforgettable joy, laughter, and incredible moments!'
    };

    this.init();
  }

  init() {
    this.parseUrlParams();

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveCustomization();
      });
    }

    // Preset message quick picker buttons
    document.querySelectorAll('.preset-msg-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const msg = btn.getAttribute('data-msg');
        if (msg && this.subtextInput) {
          this.subtextInput.value = msg;
        }
      });
    });
  }

  parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('name')) {
      this.recipientData.name = params.get('name').toUpperCase();
    }
    if (params.has('msg')) {
      this.recipientData.subtext = params.get('msg');
    }

    this.applyData();
  }

  applyData() {
    const nameEl = document.querySelector('.recipient-name');
    const msgEl = document.querySelector('.bday-subtext');

    if (nameEl) nameEl.textContent = this.recipientData.name;
    if (msgEl) msgEl.textContent = this.recipientData.subtext;

    if (this.nameInput) this.nameInput.value = this.recipientData.name;
    if (this.subtextInput) this.subtextInput.value = this.recipientData.subtext;

    this.updateShareUrl();

    if (typeof this.onUpdate === 'function') {
      this.onUpdate(this.recipientData);
    }
  }

  saveCustomization() {
    const name = this.nameInput.value.trim();
    const msg = this.subtextInput.value.trim();

    if (name) this.recipientData.name = name.toUpperCase();
    if (msg) this.recipientData.subtext = msg;

    this.applyData();
    this.closeModal();

    if (this.showToast) {
      this.showToast('✨ Birthday details updated successfully!');
    }
  }

  updateShareUrl() {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    params.set('name', this.recipientData.name);
    params.set('msg', this.recipientData.subtext);

    const shareUrl = `${baseUrl}?${params.toString()}`;
    const shareTextEl = document.getElementById('share-url-display');
    if (shareTextEl) {
      shareTextEl.textContent = shareUrl;
    }
    this.shareUrl = shareUrl;
  }

  async copyShareUrl() {
    if (!this.shareUrl) return;
    try {
      await navigator.clipboard.writeText(this.shareUrl);
      if (this.showToast) this.showToast('📋 Shareable link copied to clipboard!');
    } catch (e) {
      if (this.showToast) this.showToast('Failed to copy link manually.');
    }
  }

  openModal() {
    if (this.modal) this.modal.classList.add('active');
  }

  closeModal() {
    if (this.modal) this.modal.classList.remove('active');
  }
}
