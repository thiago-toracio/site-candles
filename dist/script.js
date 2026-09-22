const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Abrir menu');
  mobileNav.hidden = true;
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
  mobileNav.hidden = isOpen;
});

mobileNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});

document.querySelector('#year').textContent = new Date().getFullYear();

const zoomSurfaces = document.querySelectorAll(
  '.hero-image-wrap, .product-image, .feature-image, .kit-image, .universe-image'
);

zoomSurfaces.forEach((surface) => {
  const photo = surface.querySelector('img');

  surface.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;

    const bounds = surface.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
    photo.style.transformOrigin = `${x}% ${y}%`;
  });
});
