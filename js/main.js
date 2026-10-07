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
  });
})();
