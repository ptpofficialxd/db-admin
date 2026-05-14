// @ts-check
// EN/TH language toggle for Adminer — replaces the native <select> dropdown
// with a compact two-button toggle anchored in the sidebar (#menu).
//
// Paired with adminer.css (the `.lang-toggle` block).
(function () {
    'use strict';

    /**
     * Build a URL identical to the current one but with ?lang=<lang>.
     * Preserves every other query param (server, db, table, etc.).
     * @param {string} lang
     * @returns {string}
     */
    function buildUrl(lang) {
        var url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        return url.toString();
    }

    /**
     * @param {string} lang   e.g. "en"
     * @param {string} label  e.g. "EN"
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
        var langForm = document.getElementById('lang');
        if (!langForm) return;

        var langSelect = /** @type {HTMLSelectElement | null} */ (
            langForm.querySelector('select')
        );
        var currentLang = (langSelect && langSelect.value) || 'en';

        var toggle = document.createElement('div');
        toggle.className = 'lang-toggle';

        var sep = document.createElement('span');
        sep.className = 'lang-sep';
        sep.textContent = '/';

        toggle.appendChild(makeLangLink('en', 'EN', currentLang === 'en'));
        toggle.appen