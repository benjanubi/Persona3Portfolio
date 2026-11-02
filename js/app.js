/* ═══════════════════════════════════════════════════════════════════
   PORTAFOLIO — PERSONA 3 RELOAD
   Navegación de menú, transición circular y sonido.
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const stage = document.getElementById('stage');
  const mainScreen = document.getElementById('screen-main');
  const aboutScreen = document.getElementById('screen-about');
  const aboutHud = aboutScreen.querySelector('.hud--about');
  const videoMain = document.getElementById('video-main');
  const videoAbout = document.getElementById('video-about');
  const menu = document.getElementById('menu');
  const items = Array.from(menu.querySelectorAll('.menu__item'));
  const commandDesc = document.querySelector('[data-command-desc]');
  const soundToggle = document.querySelector('[data-sound-toggle]');
  const soundText = soundToggle.querySelector('.sound-toggle__text');

  const motionReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GITHUB_URL = 'https://github.com/benjanubi';

  let selected = 0;
  let isAbout = false;
  let transitioning = false;
  let soundOn = false;
  let wipeFrame = 0;
  let audioCtx = null;

  /* ── Utilidades ───────────────────────────────────────────────── */
  const easeInOutCubic = (p) => (
    p < 0.5
      ? 4 * p * p * p
      : 1 - Math.pow(-2 * p + 2, 3) / 2
  );

  function getMaxRadius() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const x = width * 0.5;
    const y = height * 0.52;
    const dx = Math.max(x, width - x);
    const dy = Math.max(y, height - y);
    return Math.hypot(dx, dy) + 60;
  }

  function updateDate() {
    const now = new Date();
    const day = new Intl.DateTimeFormat('es-CL', { weekday: 'short' })
      .format(now)
      .replace(/\./g, '')
      .toUpperCase();
    const date = new Intl.DateTimeFormat('es-CL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
      .format(now)
      .replace(/\./g, '')
      .toUpperCase();

    document.querySelectorAll('[data-date-day]').forEach((el) => {
      el.textContent = day;
    });
    document.querySelectorAll('[data-date]').forEach((el) => {
      el.textContent = date;
    });
  }

  function updateAge() {
    const birthValue = document.body.dataset.birthdate;
    if (!birthValue) return;

    const birth = new Date(`${birthValue}T00:00:00`);
    if (Number.isNaN(birth.getTime())) return;

    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age -= 1;
    }

    document.querySelectorAll('[data-age]').forEach((el) => {
      el.textContent = String(age);
    });
  }

  function updateHash(open) {
    try {
      const base = window.location.href.split('#')[0];
      window.history.replaceState(null, '', open ? `${base}#sobre-mi` : base);
    } catch (error) {
      /* file:// puede bloquear replaceState; no es crítico. */
    }
  }

  /* ── Selección del menú ───────────────────────────────────────── */
  function select(index, options = {}) {
    const { focus = false, sound = true } = options;
    const next = (index + items.length) % items.length;
    const changed = next !== selected;
    selected = next;

    items.forEach((item, itemIndex) => {
      const active = itemIndex === next;
      item.classList.toggle('is-selected', active);
      item.setAttribute('aria-current', active ? 'true' : 'false');
      item.tabIndex = active ? 0 : -1;
    });

    if (commandDesc) {
      commandDesc.textContent = items[next].dataset.label || '';
    }

    if (focus) {
      items[next].focus({ preventScroll: true });
    }

    if (sound && changed) {
      playSfx('move');
    }
  }

  function moveSelection(delta) {
    select(selected + delta, { focus: true });
  }

  function activate(item) {
    if (!item || transitioning) return;
    if (item.getAttribute('aria-disabled') === 'true') return;

    const action = item.dataset.action;
    playSfx('confirm');

    if (action === 'about') {
      openAbout();
    } else if (action === 'github') {
      window.open(GITHUB_URL, '_blank', 'noopener,noreferrer');
    }
  }

  /* ── Transición circular ──────────────────────────────────────── */
  function animateWipe(from, to, duration, done) {
    cancelAnimationFrame(wipeFrame);
    stage.classList.add('is-wiping');

    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const value = from + (to - from) * easeInOutCubic(progress);
      stage.style.setProperty('--wipe-r', `${value.toFixed(2)}px`);

      if (progress < 1) {
        wipeFrame = requestAnimationFrame(tick);
      } else {
        stage.classList.remove('is-wiping');
        if (typeof done === 'function') done();
      }
    };

    wipeFrame = requestAnimationFrame(tick);
  }

  function openAbout() {
    if (isAbout || transitioning) return;

    isAbout = true;
    transitioning = true;

    stage.classList.remove('is-closing');
    stage.classList.add('is-about', 'is-opening');
    stage.style.setProperty('--wipe-r', '0px');

    aboutScreen.removeAttribute('inert');
    aboutScreen.setAttribute('aria-hidden', 'false');
    aboutScreen.focus({ preventScroll: true });

    mainScreen.setAttribute('aria-hidden', 'true');
    mainScreen.inert = true;

    aboutHud.scrollTop = 0;

    videoAbout.muted = !soundOn;
    videoMain.muted = true;

    if (!motionReduced || soundOn) {
      videoAbout.play().catch(() => {});
    }

    document.title = 'Sobre mí — Benjamín Valenzuela';
    updateHash(true);

    const max = getMaxRadius();

    if (motionReduced) {
      stage.style.setProperty('--wipe-r', `${max}px`);
      stage.classList.add('is-revealed');
      window.setTimeout(() => {
        stage.classList.remove('is-opening');
        transitioning = false;
        videoMain.pause();
      }, 20);
      return;
    }

    animateWipe(0, max, 820, () => {
      stage.classList.remove('is-opening');
      transitioning = false;
      videoMain.pause();
    });

    window.setTimeout(() => {
      stage.classList.add('is-revealed');
    }, 230);
  }

  function closeAbout() {
    if (!isAbout || transitioning) return;

    isAbout = false;
    transitioning = true;

    stage.classList.remove('is-revealed');
    stage.classList.add('is-closing');

    videoMain.muted = !soundOn;
    videoAbout.muted = true;

    if (!motionReduced || soundOn) {
      videoMain.play().catch(() => {});
    }

    playSfx('back');

    const finish = () => {
      stage.classList.remove('is-about', 'is-closing');
      stage.style.setProperty('--wipe-r', '0px');

      aboutScreen.setAttribute('aria-hidden', 'true');
      aboutScreen.inert = true;
      videoAbout.pause();

      mainScreen.inert = false;
      mainScreen.removeAttribute('aria-hidden');

      transitioning = false;
      document.title = 'Benjamín Valenzuela — Portafolio';
      updateHash(false);
      select(selected, { focus: true, sound: false });
    };

    if (motionReduced) {
      finish();
      return;
    }

    animateWipe(getMaxRadius(), 0, 650, finish);
  }

  function openAboutInstant() {
    isAbout = true;
    stage.classList.add('is-about', 'is-revealed');
    stage.style.setProperty('--wipe-r', `${getMaxRadius()}px`);

    aboutScreen.removeAttribute('inert');
    aboutScreen.setAttribute('aria-hidden', 'false');
    mainScreen.setAttribute('aria-hidden', 'true');
    mainScreen.inert = true;

    videoMain.pause();
    videoMain.muted = true;
    videoAbout.muted = true;

    if (!motionReduced) {
      videoAbout.play().catch(() => {});
    }

    document.title = 'Sobre mí — Benjamín Valenzuela';
  }

  function scrollAbout(direction) {
    const amount = Math.min(170, window.innerHeight * 0.22);
    aboutHud.scrollBy({
      top: direction * amount,
      behavior: motionReduced ? 'auto' : 'smooth',
    });
  }

  /* ── Sonido ───────────────────────────────────────────────────── */
  function initAudio() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    return audioCtx;
  }

  function playSfx(kind) {
    if (!soundOn) return;

    const ctx = initAudio();
    if (!ctx) return;

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = kind === 'move' ? 'sine' : 'triangle';

    const base = kind === 'move' ? 920 : kind === 'confirm' ? 620 : 420;
    oscillator.frequency.setValueAtTime(base, now);

    if (kind === 'confirm') {
      oscillator.frequency.exponentialRampToValueAtTime(base * 1.5, now + 0.08);
    } else if (kind === 'back') {
      oscillator.frequency.exponentialRampToValueAtTime(base * 0.58, now + 0.11);
    }

    const peak = kind === 'move' ? 0.022 : 0.042;
    const length = kind === 'move' ? 0.07 : 0.16;

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + length);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + length + 0.02);
  }

  function setSound(enabled) {
    soundOn = enabled;

    soundToggle.classList.toggle('is-on', enabled);
    soundToggle.setAttribute('aria-pressed', String(enabled));
    soundToggle.setAttribute('aria-label', enabled ? 'Desactivar sonido' : 'Activar sonido');
    soundText.textContent = enabled ? 'Sound on' : 'Sound off';

    const activeVideo = isAbout ? videoAbout : videoMain;

    if (enabled) {
      initAudio();
      activeVideo.muted = false;
      activeVideo.play().catch(() => {});
      playSfx('confirm');
    } else {
      videoMain.muted = true;
      videoAbout.muted = true;
    }
  }

  /* ── Eventos ──────────────────────────────────────────────────── */
  items.forEach((item, index) => {
    item.addEventListener('mouseenter', () => {
      if (!isAbout && selected !== index) {
        select(index);
      }
    });

    item.addEventListener('focus', () => {
      if (!isAbout && selected !== index) {
        select(index, { sound: false });
      }
    });

    item.addEventListener('click', () => {
      activate(item);
    });
  });

  document.querySelectorAll('[data-back]').forEach((button) => {
    button.addEventListener('click', closeAbout);
  });

  soundToggle.addEventListener('click', () => {
    setSound(!soundOn);
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key;
    const target = event.target;
    const typing = target instanceof HTMLElement && (
      target.isContentEditable ||
      /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
    );

    if (typing) return;

    if (isAbout) {
      if (key === 'Backspace' || key === 'Escape') {
        event.preventDefault();
        closeAbout();
      } else if (key === 'ArrowDown' || key === 'ArrowRight') {
        event.preventDefault();
        scrollAbout(1);
      } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
        event.preventDefault();
        scrollAbout(-1);
      }
      return;
    }

    if (key === 'ArrowDown' || key === 'ArrowRight') {
      event.preventDefault();
      moveSelection(1);
    } else if (key === 'ArrowUp' || key === 'ArrowLeft') {
      event.preventDefault();
      moveSelection(-1);
    } else if (key === 'Enter' || key === ' ') {
      const onOtherButton = target instanceof HTMLElement &&
        target.closest('button') &&
        !target.closest('.menu__item');

      if (onOtherButton) return;

      event.preventDefault();
      activate(items[selected]);
    } else if (key === 'Backspace') {
      event.preventDefault();
    }
  });

  window.addEventListener('hashchange', () => {
    const shouldOpen = window.location.hash === '#sobre-mi';

    if (shouldOpen && !isAbout) {
      openAbout();
    } else if (!shouldOpen && isAbout) {
      closeAbout();
    }
  });

  window.addEventListener('resize', () => {
    if (isAbout && !transitioning) {
      stage.style.setProperty('--wipe-r', `${getMaxRadius()}px`);
    }
  });

  /* ── Arranque ─────────────────────────────────────────────────── */
  updateDate();
  updateAge();
  select(0, { sound: false });

  if (window.location.hash === '#sobre-mi') {
    openAboutInstant();
  } else if (!motionReduced) {
    videoMain.play().catch(() => {});
  }

  if (motionReduced) {
    videoMain.pause();
  }

  // La transición necesita el radio real desde el primer frame.
  stage.style.setProperty('--wipe-r', '0px');
})();
