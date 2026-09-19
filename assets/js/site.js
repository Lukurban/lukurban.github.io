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
    result.hidden = true;
    if (scroll) {
      $('#kontakt').scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      });
    }
  }
  $$('[data-request]').forEach((b) => b.addEventListener('click', () => selectService(b.dataset.request)));

  form.addEventListener('input', () => { result.hidden = true; });
  form.addEventListener('change', () => { result.hidden = true; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
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
    const L = cfg.form.letter;
    output.value = [
      L.greeting,
      '',
      L.intro,
      service.value,
      '',
      L.place_label + ' ' + place.value.trim(),
      '',
      L.project_label,
      project.value.trim(),
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

  $$('[data-region]').forEach((b) => b.addEventListener('click', () => {
    const group = b.closest('.region-pills');
    $$('button', group).forEach((c) => {
      c.classList.toggle('active', b === c);
      c.setAttribute('aria-pressed', String(b === c));
    });
    group.nextElementSibling.textContent = cfg.regions[b.dataset.region];
  }));

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
