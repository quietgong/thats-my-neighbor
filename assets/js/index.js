// Exhibition space controller
class ExhibitionSpace {
  constructor() {
    this.scrollWrapper = document.getElementById('scrollLeft').parentElement.querySelector('.scroll-wrapper');
    this.infoBtn = document.querySelector('.info-btn');
    this.modal = document.getElementById('infoModal');
    this.modalClose = document.querySelector('.modal-close');
    this.scrollLeftBtn = document.getElementById('scrollLeft');
    this.scrollRightBtn = document.getElementById('scrollRight');
    this.exhibitionSpace = document.getElementById('exhibitionSpace');

    this.init();
  }

  init() {
    // Info button
    this.infoBtn.addEventListener('click', () => this.openModal());
    this.modalClose.addEventListener('click', () => this.closeModal());
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeModal();
    });

    // Scroll buttons
    this.scrollLeftBtn.addEventListener('click', () => this.scroll(-500));
    this.scrollRightBtn.addEventListener('click', () => this.scroll(500));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.scroll(-500);
      if (e.key === 'ArrowRight') this.scroll(500);
      if (e.key === 'Escape') this.closeModal();
    });

    // Artwork interactions
    document.querySelectorAll('.artwork').forEach(artwork => {
      artwork.addEventListener('click', (e) => {
        e.stopPropagation();
        const title = artwork.dataset.title;
        const type = artwork.dataset.type;
        console.log(`[v0] Artwork clicked: ${title} (${type})`);
      });
    });

    // Update scroll indicators visibility
    this.updateScrollIndicators();
    this.scrollWrapper.addEventListener('scroll', () => this.updateScrollIndicators());
  }

  scroll(distance) {
    this.scrollWrapper.scrollBy({
      left: distance,
      behavior: 'smooth'
    });
  }

  updateScrollIndicators() {
    const scrollLeft = this.scrollWrapper.scrollLeft;
    const scrollWidth = this.scrollWrapper.scrollWidth - this.scrollWrapper.clientWidth;

    this.scrollLeftBtn.style.opacity = scrollLeft > 0 ? 0.6 : 0.3;
    this.scrollRightBtn.style.opacity = scrollLeft < scrollWidth - 50 ? 0.6 : 0.3;
  }

  openModal() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ExhibitionSpace();
});