/* TAKT – interakcije (bez frameworka) */
(function () {
  'use strict';

  document.documentElement.classList.add('js');

  document.addEventListener('DOMContentLoaded', function () {
    var header = document.querySelector('.site-header');
    var nav = document.getElementById('glavni-izbornik');
    var toggle = document.querySelector('.nav-toggle');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* Godina u podnožju */
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    /* Ljepljivo zaglavlje – sjena pri pomicanju */
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-scrolled', window.scrollY > 8);
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    /* Mobilni izbornik */
    if (toggle && nav) {
      var label = toggle.querySelector('.visually-hidden');
      var setOpen = function (open) {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        if (label) label.textContent = open ? 'Zatvori izbornik' : 'Otvori izbornik';
      };
      toggle.addEventListener('click', function () {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
      });
      nav.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () { setOpen(false); });
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
          setOpen(false);
          toggle.focus();
        }
      });
      document.addEventListener('click', function (e) {
        if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
          setOpen(false);
        }
      });
      window.addEventListener('resize', function () {
        if (window.innerWidth > 900) setOpen(false);
      });
    }

    /* Suptilno pojavljivanje sadržaja */
    var reveals = document.querySelectorAll('.reveal');
    if (!reduceMotion && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

      reveals.forEach(function (el) {
        // blagi redoslijed za elemente istog roditelja
        var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
          return c.classList.contains('reveal');
        });
        var i = siblings.indexOf(el);
        if (i > 0) el.style.transitionDelay = Math.min(i * 70, 420) + 'ms';
        io.observe(el);
      });
    } else {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* Označavanje aktivne stavke izbornika */
    var navLinks = document.querySelectorAll('.main-nav ul a[href^="#"]');
    var sectionMap = {};
    navLinks.forEach(function (a) {
      var id = a.getAttribute('href').slice(1);
      var sec = document.getElementById(id);
      if (sec) sectionMap[id] = a;
    });
    if ('IntersectionObserver' in window && navLinks.length) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && sectionMap[entry.target.id]) {
            navLinks.forEach(function (l) { l.classList.remove('is-active'); l.removeAttribute('aria-current'); });
            sectionMap[entry.target.id].classList.add('is-active');
            sectionMap[entry.target.id].setAttribute('aria-current', 'true');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      Object.keys(sectionMap).forEach(function (id) {
        spy.observe(document.getElementById(id));
      });
    }

    /* Kontakt-obrazac */
    var form = document.getElementById('kontakt-obrazac');
    if (form) initForm(form);
  });

  function initForm(form) {
    var status = document.getElementById('form-status');
    var submitBtn = form.querySelector('button[type="submit"]');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var rules = [
      { id: 'f-ime', msg: 'Upiši svoje ime i prezime.', test: function (el) { return el.value.trim().length >= 2; } },
      { id: 'f-email', msg: 'Upiši ispravnu e-mail adresu.', test: function (el) { return emailRe.test(el.value.trim()); } },
      { id: 'f-poruka', msg: 'Napiši kratku poruku.', test: function (el) { return el.value.trim().length >= 5; } },
      { id: 'f-privola', msg: 'Za slanje poruke potrebna je tvoja privola.', test: function (el) { return el.checked; } }
    ];

    function check(rule) {
      var el = document.getElementById(rule.id);
      var err = document.getElementById(rule.id + '-err');
      var ok = rule.test(el);
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) err.textContent = ok ? '' : rule.msg;
      return ok;
    }

    rules.forEach(function (rule) {
      var el = document.getElementById(rule.id);
      var evt = el.type === 'checkbox' ? 'change' : 'blur';
      el.addEventListener(evt, function () { check(rule); });
      el.addEventListener('input', function () {
        if (el.getAttribute('aria-invalid') === 'true') check(rule);
      });
    });

    function setStatus(text, type) {
      status.textContent = text;
      status.className = 'form-status' + (type ? ' is-' + type : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');

      var firstInvalid = null;
      rules.forEach(function (rule) {
        if (!check(rule) && !firstInvalid) firstInvalid = document.getElementById(rule.id);
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      // spam zamka
      if (form.querySelector('[name="_gotcha"]').value) return;

      var action = form.getAttribute('action') || '';
      var data = new FormData(form);

      // Formspree još nije postavljen → otvori program za e-poštu
      if (action.indexOf('UPISATI_ID') !== -1 || action.indexOf('formspree.io') === -1) {
        var mailLink = document.querySelector('.contact-details a[href^="mailto:"]');
        var to = mailLink ? mailLink.getAttribute('href').replace('mailto:', '') : '';
        var body = 'Ime i prezime: ' + data.get('ime') + '\nE-mail: ' + data.get('email') + '\n\n' + data.get('poruka');
        window.location.href = 'mailto:' + to +
          '?subject=' + encodeURIComponent('Upit s web-stranice TAKT') +
          '&body=' + encodeURIComponent(body);
        setStatus('Otvara se tvoj program za e-poštu s pripremljenom porukom.', 'success');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Šaljem…';

      fetch(action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (res) {
          if (!res.ok) throw new Error('Greška');
          form.reset();
          rules.forEach(function (r) { document.getElementById(r.id).removeAttribute('aria-invalid'); });
          setStatus('Hvala ti na poruci. Javit ću ti se u najkraćem mogućem roku.', 'success');
        })
        .catch(function () {
          setStatus('Poruka nažalost nije poslana. Pokušaj ponovno ili mi se javi izravno e-mailom.', 'error');
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Pošalji poruku';
        });
    });
  }
})();
