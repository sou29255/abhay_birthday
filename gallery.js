/* ==========================================================================
   ADVANCED POLAROID GALLERY & LIGHTBOX MODULE
   ========================================================================== */

export class GalleryManager {
  constructor({ gridEl, lightboxModalEl, defaultPhotos }) {
    this.grid = gridEl;
    this.lightbox = lightboxModalEl;
    this.lightboxImg = this.lightbox.querySelector('.lightbox-img');
    this.lightboxCaption = this.lightbox.querySelector('.lightbox-caption');
    this.lightboxClose = this.lightbox.querySelector('.lightbox-close');

    this.photos = defaultPhotos || [
      {
        url: 'memory1.jpg',
        caption: 'River Side Memories 🌊'
      },
      {
        url: 'memory2.jpg',
        caption: 'Best Friends Forever 💙'
      },
      {
        url: 'memory3.jpg',
        caption: 'Unforgettable Moments 🎉'
      },
      {
        url: 'memory4.jpg',
        caption: 'Celebration Outing ✨'
      }
    ];

    this.init();
  }

  init() {
    this.render();

    // Close Lightbox events
    if (this.lightboxClose) {
      this.lightboxClose.addEventListener('click', () => this.closeLightbox());
    }
    this.lightbox.addEventListener('click', (e) => {
      if (e.target === this.lightbox) this.closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeLightbox();
    });
  }

  render() {
    this.grid.innerHTML = '';

    this.photos.forEach((photo, index) => {
      const card = document.createElement('div');
      card.className = 'polaroid-card';
      const angle = (index % 2 === 0 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
      card.style.setProperty('--angle', `${angle}deg`);

      card.innerHTML = `
        <div class="polaroid-img-wrapper">
          <img src="${photo.url}" alt="${photo.caption}" class="polaroid-img" loading="lazy" />
        </div>
        <div class="polaroid-caption">${photo.caption}</div>
      `;

      card.addEventListener('click', () => this.openLightbox(photo));
      this.grid.appendChild(card);
    });
  }

  addPhoto(url, caption) {
    this.photos.unshift({ url, caption: caption || 'Special Moment' });
    this.render();
  }

  openLightbox(photo) {
    this.lightboxImg.src = photo.url;
    this.lightboxCaption.textContent = photo.caption;
    this.lightbox.classList.add('active');
  }

  closeLightbox() {
    this.lightbox.classList.remove('active');
  }
}
