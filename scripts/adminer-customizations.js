// @ts-check
// Adminer UI customizations — all client-side tweaks live in this file.
// New behaviors can be appended at the bottom; future scripts can also be
// dropped into ./scripts/ as separate files (index.php inlines every *.js
// in alphabetical order on each request).
//
// Currently does:
//   1. EN/TH language toggle that submits Adminer's native lang form
//      (preserves CSRF + session-based language switch).
//   2. Relocates the LOGOUT form into #menu so adminer.css can position it
//      via `position: absolute` relative to the sidebar — robust against
//      mobile browsers rendering #menu wider than --ui-sidebar-width.
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
       Init
       ============================================================ */

    function init() {
        var menu = document.getElementById('menu');

        var toggle = buildLangToggle(detectCurrentLang());
        if (menu) menu.appendChild(toggle);
        else document.body.appendChild(toggle);

        if (menu) relocateLogout(menu);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
