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

const zoomSurfaces = document.querySelectorAll('.zoom-surface');

zoomSurfaces.forEach((surface) => {
  const photo = surface.querySelector('img');
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'zoom-toggle';
  toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="6"/><path d="m14.5 14.5 6 6M7 10h6"/><path class="zoom-plus" d="M10 7v6"/></svg>';
  surface.append(toggle);

  function setZoom(active) {
    if (active) {
      zoomSurfaces.forEach((other) => {
        if (other !== surface && other.classList.contains('is-zoomed')) {
          other.classList.remove('is-zoomed');
          const otherToggle = other.querySelector('.zoom-toggle');
          if (otherToggle) {
            otherToggle.setAttribute('aria-pressed', 'false');
            otherToggle.title = 'Ampliar foto';
          }
        }
      });
    }
    surface.classList.toggle('is-zoomed', active);
    toggle.setAttribute('aria-pressed', String(active));
    toggle.setAttribute('aria-label', `${active ? 'Desativar' : 'Ativar'} lupa: ${photo.alt}`);
    toggle.title = active ? 'Desativar lupa' : 'Ampliar foto';
    if (active) photo.style.transformOrigin = '50% 50%';
  }

  function updateOrigin(clientX, clientY) {
    const bounds = surface.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - bounds.top) / bounds.height) * 100));
    photo.style.transformOrigin = `${x}% ${y}%`;
  }

  setZoom(false);

  // Pan suave com pointer capture — funciona em mouse e touch sem lag
  let pointerMoved = false;

  surface.addEventListener('pointerdown', (event) => {
    if (!surface.classList.contains('is-zoomed') || event.target.closest('.zoom-toggle')) return;
    surface.setPointerCapture(event.pointerId);
    pointerMoved = false;
  });

  surface.addEventListener('pointermove', (event) => {
    if (!surface.classList.contains('is-zoomed') || !surface.hasPointerCapture(event.pointerId)) return;
    pointerMoved = true;
    updateOrigin(event.clientX, event.clientY);
  });

  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setZoom(!surface.classList.contains('is-zoomed'));
  });

  // Tap na foto (sem arrastar) desabilita o zoom
  // Se houve pan (pointerMoved), ignora o click para nao fechar apos arrasto
  surface.addEventListener('click', (event) => {
    if (event.target.closest('.zoom-toggle')) return;
    if (pointerMoved) { pointerMoved = false; return; }
    if (surface.classList.contains('is-zoomed')) {
      event.preventDefault();
      event.stopPropagation();
      setZoom(false);
    }
  });

  surface.addEventListener('focusout', (event) => {
    if (!surface.contains(event.relatedTarget)) setZoom(false);
  });

  // Toque ou clique fora da foto desabilita
  document.addEventListener('pointerdown', (event) => {
    if (!surface.contains(event.target) && surface.classList.contains('is-zoomed')) {
      setZoom(false);
    }
  });
});
