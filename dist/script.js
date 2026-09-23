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

  // Toggle do botao da lupa
  toggle.addEventListener('click', (event) => {
    event.stopPropagation();
    setZoom(!surface.classList.contains('is-zoomed'));
  });

  // ========================================================
  // COMPORTAMENTO DESKTOP (Mouse)
  // - Segue o cursor instantaneamente (apenas mover, sem segurar clique)
  // - Ao mover o cursor para fora da foto, desativa o zoom imediatamente
  // ========================================================
  surface.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'mouse') return;
    if (!surface.classList.contains('is-zoomed') || event.target.closest('.zoom-toggle')) return;
    updateOrigin(event.clientX, event.clientY);
  });

  surface.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    if (surface.classList.contains('is-zoomed')) {
      setZoom(false);
    }
  });

  // ========================================================
  // COMPORTAMENTO MOBILE (Touch)
  // - Arrastar dedo para navegar pelo pan com tracking estavel
  // - Tirar o dedo NÃO fecha o zoom (permanece ampliado)
  // - Tap simples ou toque fora da foto fecha o zoom
  // ========================================================
  let isTouching = false;
  let touchMoved = false;
  let touchStartX = 0;
  let touchStartY = 0;

  surface.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse') return;
    if (!surface.classList.contains('is-zoomed') || event.target.closest('.zoom-toggle')) return;
    isTouching = true;
    touchMoved = false;
    touchStartX = event.clientX;
    touchStartY = event.clientY;
    try {
      surface.setPointerCapture(event.pointerId);
    } catch (_) {}
  });

  surface.addEventListener('pointermove', (event) => {
    if (event.pointerType === 'mouse') return;
    if (!surface.classList.contains('is-zoomed') || !isTouching) return;
    if (Math.hypot(event.clientX - touchStartX, event.clientY - touchStartY) > 5) {
      touchMoved = true;
    }
    updateOrigin(event.clientX, event.clientY);
  });

  surface.addEventListener('pointerup', (event) => {
    if (event.pointerType === 'mouse') return;
    isTouching = false;
    try {
      if (surface.hasPointerCapture(event.pointerId)) {
        surface.releasePointerCapture(event.pointerId);
      }
    } catch (_) {}
  });

  surface.addEventListener('pointercancel', (event) => {
    if (event.pointerType === 'mouse') return;
    isTouching = false;
    try {
      if (surface.hasPointerCapture(event.pointerId)) {
        surface.releasePointerCapture(event.pointerId);
      }
    } catch (_) {}
  });

  // ========================================================
  // CLIQUE / TAP NA FOTO
  // ========================================================
  surface.addEventListener('click', (event) => {
    if (event.target.closest('.zoom-toggle')) return;
    if (!surface.classList.contains('is-zoomed')) return;

    // No touch: se foi arrasto de navegacao (pan), ignora para nao fechar
    if (touchMoved) {
      touchMoved = false;
      return;
    }

    // Clique limpo (desktop ou tap simples mobile) fecha o zoom
    event.preventDefault();
    event.stopPropagation();
    setZoom(false);
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
