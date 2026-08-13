/* ==========================================================================
   ADVANCED VIRTUAL WISH BOARD MODULE (REAL-TIME CLOUD SYNC)
   ========================================================================== */

export class WishBoard {
  constructor({ gridEl, formEl, nameInput, textInput, showToastCb }) {
    this.grid = gridEl;
    this.form = formEl;
    this.nameInput = nameInput;
    this.textInput = textInput;
    this.showToast = showToastCb;

    this.storageKey = 'bday_wishes_v3';
    // Dedicated online REST database object endpoint
    this.cloudApiUrl = 'https://api.restful-api.dev/objects/ff8081819ff5b110019ff9231fde07a7';
    this.wishes = [];
    this.phoneNumber = '7450070592';
    this.isSyncing = false;

    this.init();
  }

  async init() {
    this.loadFromLocal();
    this.render();

    // Initial fetch from cloud database
    await this.fetchFromCloud();

    // Auto-poll cloud database every 7 seconds for real-time live sync across devices
    setInterval(() => this.fetchFromCloud(true), 7000);

    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addWish();
      });
    }

    const smsBtn = document.getElementById('send-direct-sms');
    if (smsBtn) {
      smsBtn.addEventListener('click', () => {
        const author = this.nameInput.value.trim();
        const text = this.textInput.value.trim();
        if (!author || !text) {
          if (this.showToast) this.showToast('Please enter your name and wish message first!');
          return;
        }
        this.sendToSMS(author, text);
      });
    }
  }

  loadFromLocal() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.wishes = JSON.parse(saved);
      } else {
        this.wishes = [];
      }
    } catch (e) {
      this.wishes = [];
    }
  }

  saveToLocal() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.wishes));
    } catch (e) {
      console.warn('Unable to save wishes to localStorage', e);
    }
  }

  async fetchFromCloud(silent = false) {
    if (this.isSyncing) return;
    try {
      this.isSyncing = true;
      const res = await fetch(this.cloudApiUrl, {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        const json = await res.json();
        const cloudWishes = json.data?.wishes || [];
        if (JSON.stringify(cloudWishes) !== JSON.stringify(this.wishes)) {
          this.wishes = cloudWishes;
          this.saveToLocal();
          this.render();
        }
      }
    } catch (e) {
      if (!silent) console.warn('Cloud wishes sync error:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  async pushToCloud(updatedWishes) {
    try {
      await fetch(this.cloudApiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: 'abhay_birthday_wishes_v1',
          data: { wishes: updatedWishes }
        })
      });
    } catch (e) {
      console.warn('Unable to push wishes to cloud:', e);
    }
  }

  render() {
    this.grid.innerHTML = '';

    if (this.wishes.length === 0) {
      this.grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 2.5rem 1rem; background: rgba(255,255,255,0.03); border: 1px dashed var(--border-glass); border-radius: var(--radius-md);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">💌</div>
          <div style="font-size: 1.1rem; color: var(--text-main);">Be the first to pin a birthday wish for Abhay!</div>
          <div style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.3rem;">Your wish will be visible to everyone visiting the site.</div>
        </div>
      `;
      return;
    }

    const colorClasses = ['pink', 'purple', 'cyan'];
    const totalWishes = this.wishes.length;

    this.wishes.forEach((wish, index) => {
      const note = document.createElement('div');
      const rotateDeg = (index % 2 === 0 ? 1.5 : -1.5) * (Math.random() * 2 + 1);
      const color = wish.color || colorClasses[index % colorClasses.length];

      // Calculate position/rank (Order when submitted)
      const rank = wish.orderNumber || (totalWishes - index);
      let badgeHtml = '';
      let isFirst = false;

      if (rank === 1) {
        isFirst = true;
        badgeHtml = `<div class="wish-badge-pill wish-badge-first">🏆 #1 First Wish!</div>`;
      } else if (rank === 2) {
        badgeHtml = `<div class="wish-badge-pill wish-badge-second">🥈 #2 Second Wish</div>`;
      } else if (rank === 3) {
        badgeHtml = `<div class="wish-badge-pill wish-badge-third">🥉 #3 Third Wish</div>`;
      } else {
        badgeHtml = `<div class="wish-badge-pill wish-badge-default">✨ #${rank} Birthday Wish</div>`;
      }

      note.className = `wish-note ${color} ${isFirst ? 'first-wish-card' : ''}`;
      note.style.setProperty('--rotate', `${rotateDeg}deg`);

      const timeStr = wish.timestamp || '';

      note.innerHTML = `
        ${badgeHtml}
        <div class="wish-note-text">"${this.escapeHtml(wish.text)}"</div>
        <div class="wish-note-footer">
          <span class="wish-note-time">${this.escapeHtml(timeStr)}</span>
          <span class="wish-note-author">— ${this.escapeHtml(wish.author)}</span>
        </div>
      `;

      this.grid.appendChild(note);
    });
  }

  async addWish() {
    const author = this.nameInput.value.trim();
    const text = this.textInput.value.trim();

    if (!author || !text) {
      if (this.showToast) this.showToast('Please fill out both your name and wish message!');
      return;
    }

    const colors = ['pink', 'purple', 'cyan'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Fetch latest cloud state first to ensure accurate sequence number
    await this.fetchFromCloud(true);

    const wishNumber = this.wishes.length + 1;
    const now = new Date();
    const formattedTime = now.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) + ', ' +
                          now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const newWish = {
      id: Date.now().toString(),
      author,
      text,
      color: randomColor,
      orderNumber: wishNumber,
      timestamp: formattedTime
    };

    // Prepend so new wish appears at the top
    this.wishes.unshift(newWish);
    this.saveToLocal();
    this.render();

    this.nameInput.value = '';
    this.textInput.value = '';

    // Synchronize to cloud REST DB
    await this.pushToCloud(this.wishes);

    if (this.showToast) {
      const toastMsg = wishNumber === 1 
        ? '🏆 You pinned the 1st Birthday Wish for Abhay! Visible to everyone!' 
        : `💖 Wish #${wishNumber} pinned for everyone to see!`;
      this.showToast(toastMsg);
    }

    this.sendToWhatsApp(author, text);
  }

  sendToWhatsApp(author, text) {
    const msg = `🎉 *New Birthday Wish for Abhay!* 🎂\n\n*From:* ${author}\n*Wish:* "${text}"\n\n_Sent from your Birthday Website ✨_`;
    const waUrl = `https://api.whatsapp.com/send?phone=91${this.phoneNumber}&text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank');
  }

  sendToSMS(author, text) {
    const msg = `Happy Birthday Abhay! From: ${author}. Wish: ${text}`;
    const smsUrl = `sms:+91${this.phoneNumber}?body=${encodeURIComponent(msg)}`;
    window.location.href = smsUrl;
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
  }
}

