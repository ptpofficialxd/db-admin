// @ts-check
// EN/TH language toggle for Adminer — always renders, even if Adminer 5.x
// didn't emit an <select> for languages (current lang is then sourced from
// the URL or <html lang>).
//
// Paired with adminer.css (the `.lang-toggle` block).
(function () {
    'use strict';

    /**
     * @param {string} lang
     * @returns {string}
     */
    function buildUrl(lang) {
        var url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        return url.toString();
    }

    /**
     * @returns {string} Current language code, e.g. "en" or "th".
     */
    function detectCurrentLang() {
        // 1. Native <select> (Adminer 4.x-style) — most reliable when present
        var sel = /** @type {HTMLSelectElement | null} */ (
            document.querySelector('#lang select')
        );
        if (sel && sel.value) return sel.value;

        // 2. ?lang= in the URL — set by our own links once clicked
        var qp = new URLSearchParams(window.location.search).get('lang');
        if (qp) return qp;

        // 3. <html lang="..."> — Adminer always sets this
        var htmlLang = document.documentElement.lang || '';
        if (htmlLang) return htmlLang.split('-')[0];

        return 'en';
    }

    /**
     * @param {string} lang
     * @param {string} label
     * @param {boolean} isActive
     * @returns {HTMLAnchorElement}
     */
    function makeLangLink(lang, label, isActive) {
        var a = document.createElement('a');
        a.href = buildUrl(lang);
        a.textContent = label;
        a.className = 'lang-btn' + (isActive ? ' active' : '');
        return a;
    }

    function init() {
        var currentLang = detectCurrentLang();
        console.log('[lang-toggle] current lang:', currentLang);

        var toggle = document.createElement('div');
        toggle.className = 'lang-toggle';

        var sep = document.createElement('span');
        sep.className = 'lang-sep';
        sep.textContent = '/';

        toggle.appendChild(makeLangLink('en', 'EN', currentLang === 'en'));
        toggle.appendChild(sep);
        toggle.appendChild(makeLangLink('th', 'TH', currentLang === 'th'));

        var menu = document.getElementById('menu');
        if (menu) {
            menu.appendChild(toggle);
            console.log('[lang-toggle] appended to #menu');
        } else {
            // Fallback: pin top-right of viewport if there's no sidebar
            toggle.style.position = 'fixed';
            toggle.style.top = '16px';
            toggle.style.right = '16px';
            toggle.style.zIndex = '9999';
            document.body.appendChild(toggle);
            console.warn('[lang-toggle] #menu not found, appended to body');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
