(() => {
  const input = document.querySelector('#search');
  const menu = document.querySelector('#siteSearchResults');
  const clear = document.querySelector('.clear, .clear-search');
  const reset = document.querySelector('.reset, .reset-button');
  const people = window.PEOPLE_DIRECTORY || [];
  const focusAreas = [
    { name: 'APJC WTG Marketing', href: 'apjc-wtg-marketing.html' },
    { name: 'AMER GTM Field & Global Events', href: 'amer-gtm-field-global-events.html' },
    { name: 'EMEA Field Marketing', href: 'emea-field-marketing.html' },
    { name: 'IIoT Revenue Marketing', href: 'iiot-revenue-marketing.html' },
    { name: 'Integrated Marketing & GTM Strategy', href: 'integrated-marketing-gtm-strategy.html' },
    { name: 'Web, Digital, & Ops', href: 'web-digital-ops-team.html' },
    { name: 'Product Marketing Networking', href: 'product-marketing-networking.html' },
    { name: 'Collaboration Networking + Product & Solutions Marketing', href: 'collaboration-networking-product-solutions-marketing.html' },
    { name: 'Office of Saleema', href: 'office-of-saleema.html' },
    { name: 'Leadership Team', href: 'gtm-growth-marketing-leadership-team.html' }
  ];
  if (!input || !menu) return;

  const normalize = value => (value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().replace(/\s+/g, ' ').trim();
  const close = () => {
    menu.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
  };
  let active = -1;

  function rank(person, query) {
    const name = normalize(person.name);
    const title = normalize(person.title);
    const areas = (person.areas || []).map(normalize);
    if (name === query) return 0;
    if (name.startsWith(query)) return 1;
    if (name.split(' ').some(word => word.startsWith(query))) return 2;
    if (name.includes(query)) return 3;
    if (title.startsWith(query)) return 4;
    if (title.split(/[^a-z0-9]+/).some(word => word.startsWith(query))) return 5;
    if (title.includes(query)) return 6;
    if (areas.some(area => area === query)) return 7;
    if (areas.some(area => area.startsWith(query))) return 8;
    return 9;
  }

  function setActive(index) {
    const options = [...menu.querySelectorAll('[role="option"]')];
    if (!options.length) return;
    active = (index + options.length) % options.length;
    options.forEach((option, i) => {
      const selected = i === active;
      option.classList.toggle('is-active', selected);
      option.setAttribute('aria-selected', String(selected));
    });
    input.setAttribute('aria-activedescendant', options[active].id);
    options[active].scrollIntoView({ block: 'nearest' });
  }

  function makeOption(entry, query, index) {
    const option = document.createElement('a');
    option.className = 'city-search-option';
    option.id = `siteSearchOption${index}`;
    option.setAttribute('role', 'option');
    option.setAttribute('aria-selected', 'false');
    const destination = new URL(entry.href, window.location.href);
    if (entry.kind === 'area') {
      destination.searchParams.set('q', query);
      destination.searchParams.delete('person');
    } else {
      destination.searchParams.delete('q');
      destination.searchParams.set('person', entry.name);
    }
    option.href = destination.href;
    option.addEventListener('pointerenter', () => setActive(index));
    const name = document.createElement('strong');
    name.textContent = entry.name;
    const area = document.createElement('span');
    area.className = 'result-area';
    area.textContent = entry.kind === 'area' ? 'Focus area' : (entry.areas || []).length > 1 ? `${entry.areas.length} focus areas` : (entry.areas || [])[0] || 'People directory';
    const detail = document.createElement('small');
    detail.textContent = entry.kind === 'area' ? 'Open this area' : entry.title || (entry.areas || []).join(' · ');
    option.append(name, area, detail);
    return option;
  }

  function update() {
    const raw = input.value.trim();
    const query = normalize(raw);
    input.closest('.search-wrap')?.classList.toggle('has-value', Boolean(raw));
    input.dataset.globalMatches = 'false';
    menu.replaceChildren();
    active = -1;
    if (!query) { close(); return; }

    const matches = people.filter(person => normalize(`${person.name} ${person.title} ${(person.areas || []).join(' ')}`).includes(query));
    matches.sort((a, b) => rank(a, query) - rank(b, query) || normalize(a.name).localeCompare(normalize(b.name)));
    const areaMatches = focusAreas
      .filter(area => normalize(area.name).includes(query))
      .map(area => ({ ...area, title: '', areas: [], kind: 'area' }));
    input.dataset.globalMatches = String(matches.length + areaMatches.length > 0);

    if (!matches.length && !areaMatches.length) {
      const empty = document.createElement('div');
      empty.className = 'city-search-empty';
      empty.textContent = 'No people or focus areas match that search.';
      menu.append(empty);
    } else {
      [...matches, ...areaMatches].forEach((entry, index) => menu.append(makeOption(entry, raw, index)));
    }
    menu.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', 'siteSearchResults');
  input.setAttribute('aria-expanded', 'false');
  input.addEventListener('input', update, true);
  input.addEventListener('focus', () => { if (input.value.trim()) update(); });
  input.addEventListener('keydown', event => {
    const options = menu.querySelectorAll('[role="option"]');
    if (event.key === 'ArrowDown' && !menu.hidden && options.length) { event.preventDefault(); setActive(active + 1); }
    else if (event.key === 'ArrowUp' && !menu.hidden && options.length) { event.preventDefault(); setActive(active < 0 ? options.length - 1 : active - 1); }
    else if (event.key === 'Enter' && !menu.hidden && active >= 0 && options[active]) { event.preventDefault(); options[active].click(); }
    else if (event.key === 'Escape') close();
  });
  clear?.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
  reset?.addEventListener('click', () => { input.value = ''; update(); input.focus(); });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.toolbar')) close(); });
  const initial = new URLSearchParams(window.location.search).get('q');
  if (initial) input.value = initial;
  update();
})();
