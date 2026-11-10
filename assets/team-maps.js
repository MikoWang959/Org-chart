(() => {
  const search = document.querySelector('#search');
  const searchWrap = document.querySelector('.search-wrap');
  const reset = document.querySelector('.reset');
  const clear = document.querySelector('.clear');
  const cards = [...document.querySelectorAll('.person-card, .lead-person, .executive-card')];
  const count = document.querySelector('[data-people-count]');
  if (count) count.textContent = `${cards.length} people`;

  const directoryMarkup = `
    <div class="directory-scrim" id="directoryScrim" aria-hidden="true"></div>
    <aside class="directory-panel" id="directoryPanel" role="dialog" aria-modal="true" aria-labelledby="directoryName" aria-hidden="true">
      <div class="directory-top"><p class="directory-kicker">People directory</p><button class="directory-close" type="button" aria-label="Close profile"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></button></div>
      <div class="directory-profile"><div class="directory-avatar"></div><h2 class="directory-name" id="directoryName"></h2><p class="directory-title"></p><div class="directory-badges"></div></div>
      <section class="directory-section"><h3>Responsibilities</h3><p class="directory-copy directory-responsibility"></p></section>
      <section class="directory-section"><h3>Team placement</h3><p class="directory-copy directory-team"></p></section>
      <section class="directory-section"><h3>Reporting path</h3><div class="directory-reporting"></div></section>
      <p class="directory-bottom">Contact details aren’t included in this team map. Use the reporting path above to find the right person to ask.</p>
    </aside>`;
  document.body.insertAdjacentHTML('beforeend', directoryMarkup);
  const panel = document.querySelector('#directoryPanel');
  const scrim = document.querySelector('#directoryScrim');
  const closeButton = panel.querySelector('.directory-close');
  let previousFocus = null;

  function readCard(card) {
    const name = card.querySelector('.name, .node-name')?.textContent.trim() || '';
    const title = [...card.querySelectorAll('.title, .node-title')].map(node => node.textContent.trim()).filter(Boolean).join(' · ');
    const role = card.querySelector('.role, .role-pill')?.textContent.trim() || '';
    const avatarNode = card.querySelector('.avatar');
    const photo = avatarNode?.querySelector('img')?.getAttribute('src') || '';
    const avatar = avatarNode?.textContent.trim() || name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    const section = card.closest('.group, .specialty, .domain, .team-column');
    const heading = section?.querySelector('.group-title, .team-heading, h3, h4');
    const support = card.closest('.executive-support, .product-support');
    const focusBanner = document.querySelector('.focus-banner');
    const team = support ? 'Leadership support' : heading?.textContent.trim() || focusBanner?.textContent.trim() || document.querySelector('h1')?.textContent.trim() || 'Marketing';
    const manager = getManager(card);
    return { name, title, role, avatar, photo, team, manager };
  }

  function lastPersonIn(node) {
    if (!node) return null;
    if (node.matches?.('.person-card, .lead-person, .executive-card')) return node;
    const people = node.querySelectorAll?.('.person-card, .lead-person, .executive-card');
    return people?.length ? people[people.length - 1] : null;
  }

  function precedingPerson(node) {
    let sibling = node?.previousElementSibling;
    while (sibling) {
      const person = lastPersonIn(sibling);
      if (person) return person;
      sibling = sibling.previousElementSibling;
    }
    return null;
  }

  function departmentLeader() {
    const departmentRow = [...document.querySelectorAll('.executive-row')].find(row => row.previousElementSibling?.classList.contains('focus-banner'));
    if (departmentRow) return departmentRow.querySelector('.executive-card');
    return document.querySelector('.lead-panel .lead-person, .product-vp-card, .lead-person');
  }

  function getManager(card) {
    const explicitManagerName = card.dataset.manager;
    if (explicitManagerName) {
      return cards.find(candidate => candidate.querySelector('.name, .node-name')?.textContent.trim() === explicitManagerName) || null;
    }

    const row = card.closest('.executive-row');
    if (card.matches('.executive-card') && row) {
      const rows = [...document.querySelectorAll('.executive-row')];
      const index = rows.indexOf(row);
      if (index <= 0) return null;
      return rows[0].querySelector('.executive-card');
    }
    if (card.closest('.executive-support')) return row?.querySelector('.executive-card') || null;
    if (card.closest('.product-support')) return document.querySelector('.product-vp-card');
    if (card.closest('.lead-panel')) return document.querySelector('.executive-row .executive-card');

    const sharedScope = card.closest('.shared-scope');
    if (sharedScope && !card.matches('.shared-scope > .person-card')) {
      const sharedLeader = sharedScope.querySelector(':scope > .person-card');
      if (sharedLeader) return sharedLeader;
    }

    const abxReports = card.closest('.abx-report-row');
    if (abxReports) return precedingPerson(abxReports);

    const reportingGrid = card.closest('.reporting-grid');
    if (reportingGrid) {
      const owner = precedingPerson(reportingGrid);
      if (owner) return owner;
    }

    const subgroup = card.closest('.subgroup');
    if (subgroup) {
      const owner = precedingPerson(subgroup);
      if (owner) return owner;
    }

    const reportingBranch = card.closest('.reporting-branch:not(.reporting-grid)');
    if (reportingBranch) {
      const owner = precedingPerson(reportingBranch);
      if (owner) return owner;
    }

    const specialty = card.closest('.specialty');
    if (specialty) {
      const domain = specialty.closest('.domain');
      const pinsLead = domain?.querySelector('.domain-lead');
      if (pinsLead && domain.querySelector('.domain-lead')) return pinsLead;
    }

    return departmentLeader();
  }

  function openDirectory(card) {
    const person = readCard(card);
    previousFocus = card;
    const directoryAvatar = panel.querySelector('.directory-avatar');
    if (person.photo) {
      const portrait = document.createElement('img');
      portrait.src = person.photo;
      portrait.alt = '';
      directoryAvatar.replaceChildren(portrait);
    } else directoryAvatar.textContent = person.avatar;
    panel.querySelector('.directory-name').textContent = person.name;
    panel.querySelector('.directory-title').textContent = person.title;
    panel.querySelector('.directory-responsibility').textContent = person.title || 'Responsibilities are not listed in this team map.';
    panel.querySelector('.directory-team').textContent = person.team;
    const badges = panel.querySelector('.directory-badges');
    badges.replaceChildren();
    if (person.role) {
      const badge = document.createElement('span');
      badge.className = `directory-badge ${/contractor/i.test(person.role) ? 'contractor' : /sow/i.test(person.role) ? 'sow' : /open/i.test(person.role) ? 'open' : ''}`;
      badge.textContent = person.role;
      badges.append(badge);
    }
    const reporting = panel.querySelector('.directory-reporting');
    reporting.replaceChildren();
    if (person.manager) {
      const manager = readCard(person.manager);
      const link = document.createElement('button');
      link.className = 'directory-manager';
      link.type = 'button';
      const managerName = document.createElement('strong');
      managerName.textContent = manager.name;
      const managerTitle = document.createElement('span');
      managerTitle.textContent = manager.title;
      link.append(managerName, managerTitle);
      link.addEventListener('click', () => openDirectory(person.manager));
      reporting.append(link);
    } else {
      const note = document.createElement('p');
      note.className = 'directory-copy';
      note.textContent = 'This is the highest layer shown for this role in the chart.';
      reporting.append(note);
    }
    panel.classList.add('open');
    scrim.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    scrim.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }

  function closeDirectory() {
    panel.classList.remove('open');
    scrim.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    scrim.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    previousFocus?.focus();
  }

  cards.forEach(card => {
    const person = readCard(card);
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Open ${person.name} profile`);
    card.addEventListener('click', () => openDirectory(card));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openDirectory(card);
      }
    });
  });
  closeButton.addEventListener('click', closeDirectory);
  scrim.addEventListener('click', closeDirectory);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.classList.contains('open')) closeDirectory();
  });

  function update() {
    const query = search.value.trim().toLocaleLowerCase();
    searchWrap.classList.toggle('has-value', Boolean(query));
    const contextualText = card => {
      const parts = [card.textContent];
      let parent = card.parentElement;
      while (parent && parent !== document.body) {
        if (parent.matches('.group, .subgroup, .division, .specialty, .domain, .team-column, .executive-support, .product-support')) {
          parts.push(parent.getAttribute('aria-label') || '');
          const heading = parent.querySelector(':scope > .group-title, :scope > .team-heading, :scope > h3, :scope > h4, :scope > .subgroup-label');
          if (heading) parts.push(heading.textContent);
          const supportLabel = parent.querySelector(':scope > .support-label, :scope > .executive-support-label, :scope > .product-support-label');
          if (supportLabel) parts.push(supportLabel.textContent);
        }
        parent = parent.parentElement;
      }
      return parts.join(' ').toLocaleLowerCase();
    };
    cards.forEach(card => card.classList.toggle('hidden-by-search', Boolean(query) && !contextualText(card).includes(query)));

    const wrappers = [...document.querySelectorAll('.executive-support, .executive-row, .product-support, .support-group, .group, .subgroup, .division, .specialty, .domain, .team-column, .teams-grid, .specialty-grid, .domain-grid, .group-content, .reporting-branch')];
    wrappers.sort((a, b) => {
      const depth = element => { let value = 0; while (element) { value++; element = element.parentElement; } return value; };
      return depth(b) - depth(a);
    }).forEach(wrapper => {
      const visible = [...wrapper.querySelectorAll('.person-card, .lead-person, .executive-card')].some(card => !card.classList.contains('hidden-by-search'));
      wrapper.classList.toggle('hidden-by-search', Boolean(query) && !visible);
    });
    const anyVisible = cards.some(card => !card.classList.contains('hidden-by-search'));
    document.querySelector('.empty-state').style.display = anyVisible ? 'none' : 'block';
  }

  search.addEventListener('input', update);
  clear.addEventListener('click', () => { search.value = ''; search.focus(); update(); });
  reset.addEventListener('click', () => { search.value = ''; update(); search.focus(); });
})();
