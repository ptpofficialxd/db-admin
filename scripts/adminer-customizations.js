// @ts-check
// Adminer UI customizations — all client-side tweaks live in this file.
// New behaviors can be appended at the bottom; future scripts can also be
// dropped into ./scripts/ as separate files (index.php inlines every *.js
// in alphabetical order on each request).
//
// Currently does:
//   1. EN/TH language toggle that submits Adminer's native lang form.
//   2. Relocates the LOGOUT form into #menu for robust sidebar positioning.
//   3. Rebrands the "Adminer" wordmark and tab title to "ptpofficialxdDB".
//
// Paired with adminer.css.
(function () {
    'use strict';

    /* ============================================================
       EN/TH language toggle
       ============================================================ */

    /**
     * Adminer 5.x renders:
     *   <form action=""><div id="lang">…<select name="lang">…</select></div></form>
     * @returns {{form: HTMLFormElement, select: HTMLSelectElement} | null}
     */
    function findNativeLangForm() {
        var sel = /** @type {HTMLSelectElement | null} */ (
            document.querySelector('#lang select[name="lang"], form select[name="lang"]')
        );
        if (!sel) return null;
        var form = sel.form || /** @type {HTMLFormElement | null} */ (sel.closest('form'));
        if (!form) return null;
        return { form: form, select: sel };
    }

    /** @returns {string} */
    function detectCurrentLang() {
        var native = findNativeLangForm();
        if (native && native.select.value) return native.select.value;
        var qp = new URLSearchParams(window.location.search).get('lang');
        if (qp) return qp;
        var htmlLang = document.documentElement.lang || '';
        if (htmlLang) return htmlLang.split('-')[0];
        return 'en';
    }

    /** @param {string} lang */
    function switchLang(lang) {
        var native = findNativeLangForm();
        if (native) {
            native.select.value = lang;
            native.form.submit();
            return;
        }
        var url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.location.href = url.toString();
    }

    /**
     * @param {string} lang
     * @param {string} label
     * @param {boolean} isActive
     * @returns {HTMLAnchorElement}
     */
    function makeLangLink(lang, label, isActive) {
        var a = document.createElement('a');
        a.href = '#';
        a.textContent = label;
        a.className = 'lang-btn' + (isActive ? ' active' : '');
        a.setAttribute('role', 'button');
        a.setAttribute('aria-label', 'Switch to ' + label);
        a.addEventListener('click', function (event) {
            event.preventDefault();
            if (!isActive) switchLang(lang);
        });
        return a;
    }

    /** @param {string} currentLang */
    function buildLangToggle(currentLang) {
        var toggle = document.createElement('div');
        toggle.className = 'lang-toggle';
        var sep = document.createElement('span');
        sep.className = 'lang-sep';
        sep.textContent = '/';
        toggle.appendChild(makeLangLink('en', 'EN', currentLang === 'en'));
        toggle.appendChild(sep);
        toggle.appendChild(makeLangLink('th', 'TH', currentLang === 'th'));
        return toggle;
    }

    /* ============================================================
       LOGOUT relocation
       ============================================================ */

    /**
     * Move Adminer's logout form into #menu so it inherits the sidebar's
     * positioning context. We move the DOM node — not clone or recreate —
     * so the form's action / method / CSRF inputs stay intact.
     * @param {HTMLElement} menu
     */
    function relocateLogout(menu) {
        var logoutPara = document.querySelector('.logout, p.logout');
        if (!logoutPara) return;
        var form = logoutPara.closest('form') || logoutPara;
        if (form.parentNode === menu) return;
        menu.appendChild(form);
    }

    /* ============================================================
       Rebrand wordmark + tab title
       ============================================================ */

    var BRAND_PREFIX = 'ptpofficialxd';   // white
    var BRAND_SUFFIX = 'DB';               // green (theme color)
    var BRAND_FULL = BRAND_PREFIX + BRAND_SUFFIX;

    /**
     * Replace the "adminer" text inside the sidebar <h1><a> with two
     * differently-colored spans. The h1's background logo image and the
     * version <span class="version"> stay untouched.
     */
    function rebrandHeader() {
        var link = document.querySelector('#menu h1 a');
        if (!link) return;
        // Idempotent — bail out if already rebranded.
        if (link.querySelector('.brand-name')) return;

        // Wipe direct text nodes only — preserves any nested elements
        // Adminer might emit (e.g. <span class="version">5.4.2</span>).
        Array.prototype.slice.call(link.childNodes).forEach(function (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                link.removeChild(node);
            }
        });

        var name = document.createElement('span');
        name.className = 'brand-name';
        name.textContent = BRAND_PREFIX;

        var db = document.createElement('span');
        db.className = 'brand-db';
        db.textContent = BRAND_SUFFIX;

        link.insertBefore(db, link.firstChild);
        link.insertBefore(name, db);
    }

    /**
     * Adminer appends " - Adminer" to the document.title. Swap that suffix
     * for our brand so the browser tab matches.
     */
    function rebrandTitle() {
        if (!document.title) return;
        document.title = document.title.replace(/ - Adminer\b/i, ' - ' + BRAND_FULL);
    }

    /* ============================================================
       Init
       ============================================================ */

    function init() {
        var menu = document.getElementById('menu');

        var toggle = buildLangToggle(detectCurrentLang());
        if (menu) menu.appendChild(toggle);
        else document.body.appendChild(toggle);

        if (menu) relocateLogout(menu);

        rebrandHeader();
        rebrandTitle();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
