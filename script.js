/* =========================================================
   StreamFlix — app logic
   All data below is placeholder/fictional (no real titles,
   posters or copyrighted assets are used).
   ========================================================= */

(function () {
  'use strict';

  // ---- Mock content catalogue -------------------------------------------
  const PALETTES = [
    ['#3a0ca3', '#7209b7'], ['#0b132b', '#1c2541'], ['#7f1d1d', '#1a0505'],
    ['#03071e', '#370617'], ['#13315c', '#1c1c1c'], ['#264653', '#2a2a2a'],
    ['#3d0000', '#000000'], ['#1b263b', '#0d1b2a'], ['#4a0e0e', '#120000'],
    ['#232946', '#121629'], ['#5f0f40', '#0f0f0f'], ['#022c43', '#001219'],
  ];

  function palette(i) {
    const p = PALETTES[i % PALETTES.length];
    return `linear-gradient(155deg, ${p[0]} 0%, ${p[1]} 100%)`;
  }

  const TITLES = [
    'The Last Signal', 'Hollow Crown', 'Midnight Runners', 'Glass Horizon',
    'Static City', 'The Paper Compass', 'Ember & Ash', 'Nightfall Protocol',
    'Salt Water Kings', 'The Quiet Room', 'Vertigo Heights', 'Coral Drift',
    'Ashfall', 'The Long Winter', 'Neon Requiem', 'Paper Moon Diner',
    'Fault Lines', 'The Cartographer', 'Iron Season', 'Wildfire Radio',
    'Blackout Kids', 'The Eighth Floor', 'Gravel Road', 'Tin Can Telephone',
    'The Understudy', 'Low Orbit', 'Saltbox', 'The Last Ferry',
    'Cold Storage', 'Marigold', 'The Unraveling', 'Harbor Lights',
  ];

  const GENRES_POOL = ['Drama', 'Thriller', 'Sci-Fi', 'Comedy', 'Mystery', 'Action', 'Romance', 'Documentary'];
  const CAST_POOL = ['J. Alvarez', 'M. Okafor', 'R. Chen', 'S. Novak', 'T. Reyes', 'D. Kim', 'P. Lindqvist', 'A. Osei'];

  function pick(pool, n) {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  }

  function makeTitle(i) {
    const year = 2018 + (i % 8);
    return {
      id: i,
      title: TITLES[i % TITLES.length],
      year,
      badge: i % 5 === 0 ? 'NEW' : (i % 7 === 0 ? 'TOP 10' : null),
      desc: 'A gripping story of ambition, loyalty and the choices we make when no one is watching. Streaming now in the StreamFlix original library.',
      genres: pick(GENRES_POOL, 3),
      cast: pick(CAST_POOL, 3),
      match: 80 + (i * 7) % 19,
      duration: `${1 + (i % 2)}h ${10 + (i * 3) % 50}m`,
      paletteIndex: i,
    };
  }

  const CATALOGUE = Array.from({ length: TITLES.length }, (_, i) => makeTitle(i));

  const ROWS = [
    { title: 'Trending Now', items: CATALOGUE.slice(0, 12) },
    { title: 'Because You Watched Static City', items: shuffleSlice(CATALOGUE, 12) },
    { title: 'StreamFlix Originals', items: shuffleSlice(CATALOGUE, 12) },
    { title: 'Critically Acclaimed', items: shuffleSlice(CATALOGUE, 12) },
    { title: 'Continue Watching', items: shuffleSlice(CATALOGUE, 10) },
  ];

  function shuffleSlice(arr, n) {
    return [...arr].sort(() => 0.5 - Math.random()).slice(0, n);
  }

  // ---- Render rows --------------------------------------------------------
  const rowsContainer = document.getElementById('rows');

  function cardHTML(item) {
    return `
      <div class="card" tabindex="0" data-id="${item.id}" role="button" aria-label="${item.title}, open details">
        <div class="card__art" style="background:${palette(item.paletteIndex)}">
          ${item.badge ? `<span class="card__badge">${item.badge}</span>` : ''}
          <span class="card__label">${item.title}</span>
        </div>
        <div class="card-hover-info">
          <div class="chi__row">
            <span class="chi__mini-btn">▶</span>
            <span class="chi__mini-btn">+</span>
            <span class="chi__match">${item.match}%</span>
          </div>
          <div class="chi__meta">${item.duration} · ${item.genres[0]}</div>
        </div>
      </div>`;
  }

  function renderRows(rows) {
    rowsContainer.innerHTML = rows.map((row, idx) => `
      <section class="row" aria-label="${row.title}">
        <h2 class="row__title">${row.title}</h2>
        <div class="row__track" id="track-${idx}">
          ${row.items.map(cardHTML).join('')}
        </div>
      </section>
    `).join('');
  }

  renderRows(ROWS);

  // ---- Card click / keyboard -> modal -------------------------------------
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalHero = document.getElementById('modal-hero');
  const modalTitle = document.getElementById('modal-title');
  const modalYear = document.getElementById('modal-year');
  const modalDesc = document.getElementById('modal-desc');
  const modalCast = document.getElementById('modal-cast');
  const modalGenres = document.getElementById('modal-genres');
  const modalClose = document.getElementById('modal-close');

  function openModal(item) {
    modalHero.style.background = palette(item.paletteIndex);
    modalTitle.textContent = item.title;
    modalYear.textContent = item.year;
    modalDesc.textContent = item.desc;
    modalCast.textContent = item.cast.join(', ');
    modalGenres.textContent = item.genres.join(', ');
    modalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeModal() {
    modalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  rowsContainer.addEventListener('click', (e) => {
    const card = e.target.closest('.card');
    if (!card) return;
    const item = CATALOGUE.find((c) => c.id === Number(card.dataset.id));
    if (item) openModal(item);
  });

  rowsContainer.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.card');
    if (!card) return;
    e.preventDefault();
    const item = CATALOGUE.find((c) => c.id === Number(card.dataset.id));
    if (item) openModal(item);
  });

  modalClose.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop.classList.contains('open')) closeModal();
  });

  // ---- Hero "More Info" also opens a modal for the hero title ------------
  const heroInfoBtn = document.querySelector('.hero [data-action="info"]');
  const heroSample = CATALOGUE[0];
  heroInfoBtn.addEventListener('click', () => openModal(heroSample));

  document.querySelectorAll('[data-action="play"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      btn.textContent = '';
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      btn.append('Playing… (demo)');
    });
  });

  // ---- Header background on scroll ----------------------------------------
  const header = document.getElementById('site-header');
  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Search ---------------------------------------------------------------
  const searchToggle = document.querySelector('.search-toggle');
  const searchBox = document.getElementById('search-box');

  searchToggle.addEventListener('click', () => {
    const isOpen = searchBox.classList.toggle('open');
    searchToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) searchBox.focus();
    else { searchBox.value = ''; renderRows(ROWS); }
  });

  let searchDebounce;
  searchBox.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      const q = searchBox.value.trim().toLowerCase();
      if (!q) { renderRows(ROWS); return; }
      const matches = CATALOGUE.filter((c) => c.title.toLowerCase().includes(q));
      renderRows([{ title: `Results for "${searchBox.value}"`, items: matches }]);
    }, 200);
  });

  // ---- Footer year -----------------------------------------------------------
  document.getElementById('year').textContent = new Date().getFullYear();

})();
