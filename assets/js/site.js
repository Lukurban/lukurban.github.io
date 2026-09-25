(() => {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const cfg = JSON.parse($('#site-runtime').textContent);

  let toastTimer;
  function toast(message) {
    const t = $('#toast');
    t.textContent = message;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.hidden = true; }, 4200);
  }

  const menu = $('.menu-toggle');
  const nav = $('#mobile-nav');
  function closeMenu() {
    nav.hidden = true;
    menu.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-label', cfg.header.menu_open);
  }
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    nav.hidden = open;
    menu.setAttribute('aria-expanded', String(!open));
    menu.setAttribute('aria-label', open ? cfg.header.menu_open : cfg.header.menu_close);
  });
  $$('a', nav).forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (innerWidth > 700) closeMenu(); });

  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = document.getElementById(a.getAttribute('href').slice(1));
    if (t) {
      e.preventDefault();
      t.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      });
    }
  }));

  const form = $('#contact-form');
  const service = $('#request-service');
  const result = $('#request-result');
  const output = $('#request-text');

  function selectService(value, scroll = true) {
    service.value = value;
    syncServiceSelect();
    result.hidden = true;
    if (scroll) {
      $('#kontakt').scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      });
    }
  }
  $$('[data-request]').forEach((b) => b.addEventListener('click', () => selectService(b.dataset.request)));

  /* The native select popup cannot be styled to match the dark theme, so the
     select is enhanced into a themed listbox. Without JS the native select
     keeps working untouched. */
  const selectWrap = service.closest('[data-select-wrap]');
  const serviceSelectUi = { sync() {}, toggle: null, markInvalid() {} };
  function syncServiceSelect() { serviceSelectUi.sync(); }

  if (selectWrap) {
    service.required = false;
    service.hidden = true;
    const CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 9 7 7 7-7"/></svg>';
    const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 12.5 5 5 10-11"/></svg>';
    const fieldLabel = service.closest('label');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'select-toggle is-placeholder';
    toggle.setAttribute('aria-haspopup', 'listbox');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', 'request-service-list');
    toggle.innerHTML = '<span class="select-value"></span><span class="select-chevron">' + CHEVRON + '</span>';
    const list = document.createElement('ul');
    list.className = 'select-list';
    list.id = 'request-service-list';
    list.setAttribute('role', 'listbox');
    list.hidden = true;
    selectWrap.append(toggle, list);

    const items = $$('option', service).filter((o) => o.value).map((o, i) => {
      const li = document.createElement('li');
      li.id = 'request-service-opt-' + i;
      li.className = 'select-option';
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');
      li.dataset.value = o.value;
      li.innerHTML = '<span class="select-option-label">' + o.textContent + '</span><span class="select-check">' + CHECK + '</span>';
      list.append(li);
      return li;
    });
    const placeholderText = ($('option[value=""]', service) || {}).textContent || '';

    let activeIndex = -1;
    function setActive(i) {
      activeIndex = (i + items.length) % items.length;
      items.forEach((li, j) => li.classList.toggle('is-active', j === activeIndex));
      list.setAttribute('aria-activedescendant', items[activeIndex].id);
      items[activeIndex].scrollIntoView({ block: 'nearest' });
    }
    function open() {
      list.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      const current = items.findIndex((li) => li.dataset.value === service.value);
      setActive(current >= 0 ? current : 0);
    }
    function close(refocus = true) {
      list.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
      if (refocus) toggle.focus();
    }
    function sync() {
      toggle.classList.toggle('is-placeholder', !service.value);
      toggle.querySelector('.select-value').textContent = service.value || placeholderText;
      items.forEach((li) => li.setAttribute('aria-selected', String(li.dataset.value === service.value)));
      toggle.classList.remove('is-invalid');
    }
    function choose(li) {
      service.value = li.dataset.value;
      sync();
      service.dispatchEvent(new Event('change', { bubbles: true }));
      close();
    }

    toggle.addEventListener('click', () => (list.hidden ? open() : close(false)));
    toggle.addEventListener('keydown', (e) => {
      if (list.hidden) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          open();
          setActive(e.key === 'ArrowDown' ? 0 : items.length - 1);
        }
        return;
      }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
      else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
      else if (e.key === 'End') { e.preventDefault(); setActive(items.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); choose(items[activeIndex]); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'Tab') close(false);
    });
    list.addEventListener('click', (e) => {
      const li = e.target.closest('.select-option');
      if (li) choose(li);
    });
    list.addEventListener('mouseover', (e) => {
      const li = e.target.closest('.select-option');
      if (li) setActive(items.indexOf(li));
    });
    document.addEventListener('pointerdown', (e) => {
      if (!list.hidden && !selectWrap.contains(e.target)) close(false);
    });
    if (fieldLabel) fieldLabel.addEventListener('click', (e) => {
      if (!selectWrap.contains(e.target)) { e.preventDefault(); toggle.focus(); }
    });

    serviceSelectUi.sync = sync;
    serviceSelectUi.toggle = toggle;
    serviceSelectUi.markInvalid = () => toggle.classList.add('is-invalid');
    sync();
  }

  form.addEventListener('input', () => { result.hidden = true; });
  form.addEventListener('change', () => { result.hidden = true; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    if (!service.value) {
      serviceSelectUi.sync();
      serviceSelectUi.markInvalid();
      if (serviceSelectUi.toggle) serviceSelectUi.toggle.focus();
      return;
    }
    const place = $('#request-place');
    const project = $('#request-project');
    if (!place.value.trim()) {
      place.setCustomValidity(cfg.form.place_error);
      place.reportValidity();
      place.addEventListener('input', () => place.setCustomValidity(''), { once: true });
      return;
    }
    if (!project.value.trim()) {
      project.setCustomValidity(cfg.form.project_error);
      project.reportValidity();
      project.addEventListener('input', () => project.setCustomValidity(''), { once: true });
      return;
    }
    const name = $('#request-name').value.trim();
    const email = $('#request-email').value.trim();
    const phone = $('#request-phone').value.trim();
    const L = cfg.form.letter;
    const body = [
      L.place_label + ' ' + place.value.trim(),
      '',
      L.project_label,
      project.value.trim(),
    ];
    if (email) body.push('', L.email_label + ' ' + email);
    if (phone) body.push('', L.phone_label + ' ' + phone);
    output.value = [
      L.greeting,
      '',
      L.intro,
      service.value,
      '',
      ...body,
      '',
      L.closing,
      '',
      L.regards + (name ? '\n' + name : ''),
    ].join('\n');
    result.hidden = false;
    result.focus({ preventScroll: true });
    result.scrollIntoView({
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      block: 'center',
    });
  });

  $('#copy-request').addEventListener('click', async () => {
    let copied = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(output.value);
        copied = true;
      }
    } catch (err) { /* fall through to execCommand */ }
    if (!copied) {
      output.focus();
      output.select();
      try { copied = document.execCommand('copy'); } catch (err) { copied = false; }
    }
    toast(copied ? cfg.form.copied : cfg.form.copy_fallback);
  });

  $('#save-request').addEventListener('click', () => {
    const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cfg.form.filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast(cfg.form.saved);
  });

  const legal = $('#legal-dialog');
  $$('[data-dialog]').forEach((b) => b.addEventListener('click', () => {
    const tpl = $('#legal-' + b.dataset.dialog);
    $('#legal-content').innerHTML = tpl ? tpl.innerHTML : '';
    legal.showModal();
  }));
  $('.dialog-close', legal).addEventListener('click', () => legal.close());
  legal.addEventListener('click', (e) => {
    if (e.target === legal) {
      const r = legal.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) legal.close();
    }
  });
})();
