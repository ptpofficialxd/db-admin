// @ts-check
// Adminer UI customizations. New behaviors append at the bottom; drop additional
// .js files into ./scripts/ if you want to keep them separate — index.php
// inlines every file in alphabetical order on each request.
//
// Sections:
//   1. EN/TH language toggle      — submits Adminer's native lang form
//   2. LOGOUT relocation          — moves form into #menu for clean positioning
//   3. Brand rebrand              — "adminer" → "ptpofficialxdDB"
//   4. Brand link rewrite         — header anchor goes to the DB list, not adminer.org
//   5. Theme toggle (light/dark)  — persisted in localStorage on <html data-theme>
//   6. Mobile sidebar UI          — modern hamburger, slide animation, close X, backdrop
(function () {
    'use strict';

    /* ============================================================
       1. EN/TH language toggle
       ============================================================ */

    /**
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
     */
    function makeLangLink(lang, label, isActive) {
        var a = document.createElement('a');
        a.href = '#';
        a.textContent = label;
        a.className = 'lang-btn' + (isActive ? ' active' : '');
        a.setAttribute('role', 'button');
        a.addEventListener('click', function (e) {
            e.preventDefault();
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
       2. LOGOUT relocation
       ============================================================ */

    /** @param {HTMLElement} menu */
    function relocateLogout(menu) {
        var logoutPara = document.querySelector('.logout, p.logout');
        if (!logoutPara) return;
        var form = logoutPara.closest('form') || logoutPara;
        if (form.parentNode === menu) return;
        menu.appendChild(form);
    }

    /* ============================================================
       3. Brand rebrand wordmark + tab title
       ============================================================ */

    var BRAND_PREFIX = 'ptpofficialxd';   // white
    var BRAND_SUFFIX = 'DB';               // theme green
    var BRAND_FULL = BRAND_PREFIX + BRAND_SUFFIX;

    function rebrandHeader() {
        var link = document.querySelector('#menu h1 a');
        if (!link) return;
        if (link.querySelector('.brand-name')) return;

        Array.prototype.slice.call(link.childNodes).forEach(function (node) {
            if (node.nodeType === Node.TEXT_NODE) link.removeChild(node);
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

    function rebrandTitle() {
        if (!document.title) return;
        document.title = document.title.replace(/ - Adminer\b/i, ' - ' + BRAND_FULL);
    }

    /* ============================================================
       4. Rewrite brand-link href → DB list page (not adminer.org)
       ============================================================ */

    function rewriteBrandLink() {
        var link = /** @type {HTMLAnchorElement | null} */ (
            document.querySelector('#menu h1 a')
        );
        if (!link) return;
        var url = new URL(window.location.href);
        ['db', 'ns', 'table', 'select', 'edit', 'where', 'schema',
         'create', 'view', 'foreign', 'trigger', 'sequence', 'type', 'procedure',
         'event', 'sql', 'import', 'dump', 'privileges', 'user', 'processlist',
         'variables', 'status'].forEach(function (p) {
            url.searchParams.delete(p);
        });
        link.href = url.pathname + (url.search || '');
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.title = 'Database list';
    }

    /* ============================================================
       5. Theme toggle (light / dark)
       ============================================================ */

    var THEME_KEY = 'adminer-theme';
    var SUN_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
    var MOON_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    function buildThemeToggle() {
        var saved = localStorage.getItem(THEME_KEY) || 'dark';
        applyTheme(saved);

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-toggle';
        btn.setAttribute('aria-label', 'Toggle theme');
        btn.title = 'Toggle light/dark theme';
        btn.innerHTML = saved === 'dark' ? SUN_SVG : MOON_SVG;

        btn.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme') || 'dark';
            var next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next);
            try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
            btn.innerHTML = next === 'dark' ? SUN_SVG : MOON_SVG;
        });

        return btn;
    }

    /* ============================================================
       6. Mobile sidebar — modern hamburger, slide animation, close X, backdrop
       ============================================================ */

    var HAMBURGER_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
    var CLOSE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>';

    function setupSidebarUI(menu) {
        // Modernize Adminer's built-in menu-toggle
        var trigger = document.getElementById('menu-toggle');
        if (trigger) {
            trigger.classList.add('menu-trigger');
            trigger.innerHTML = HAMBURGER_SVG;
            trigger.setAttribute('aria-label', 'Open sidebar');
            // Replace any inline onclick / native handler with our own.
            var fresh = trigger.cloneNode(true);
            trigger.parentNode.replaceChild(fresh, trigger);
            fresh.addEventListener('click', function (e) {
                e.preventDefault();
                document.documentElement.classList.toggle('menu-open');
            });
        }

        // Close (×) button inside the sidebar
        if (!menu.querySelector('.sidebar-close')) {
            var close = document.createElement('button');
            close.type = 'button';
            close.className = 'sidebar-close';
            close.setAttribute('aria-label', 'Close sidebar');
            close.innerHTML = CLOSE_SVG;
            close.addEventListener('click', function () {
                document.documentElement.classList.remove('menu-open');
            });
            menu.appendChild(close);
        }

        // Click-to-dismiss backdrop
        if (!document.querySelector('.sidebar-backdrop')) {
            var backdrop = document.createElement('div');
            backdrop.className = 'sidebar-backdrop';
            backdrop.addEventListener('click', function () {
                document.documentElement.classList.remove('menu-open');
            });
            document.body.appendChild(backdrop);
        }

        // Auto-close when a nav link is followed (mobile UX nicety)
        menu.addEventListener('click', function (e) {
            var t = /** @type {Element} */ (e.target);
            var a = t && t.closest('a');
            if (a && !a.classList.contains('lang-btn') && !a.classList.contains('theme-toggle')) {
                document.documentElement.classList.remove('menu-open');
            }
        });
    }

    /* ============================================================
       Init
       ============================================================ */

    function init() {
        var menu = document.getElementById('menu');

        // Theme first so saved value is applied before paint (kept inside init
        // because we already wait for DOMContentLoaded — there's no FOUC risk
        // worth a separate inline blocking script for this small change).
        var themeBtn = buildThemeToggle();

        // Lang toggle
        var langToggle = buildLangToggle(detectCurrentLang());

        // Group theme + lang in a single header-row container so they stack
        // predictably regardless of #menu's other contents.
        var header = document.createElement('div');
        header.className = 'menu-header-actions';
        header.appendChild(themeBtn);
        header.appendChild(langToggle);
        (menu || document.body).appendChild(header);

        if (menu) {
            relocateLogout(menu);
            setupSidebarUI(menu);
        }

        rebrandHeader();
        rebrandTitle();
        rewriteBrandLink();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
