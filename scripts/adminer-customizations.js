// @ts-check
// Adminer UI customizations.
//
// Sections:
//   1. EN/TH language toggle
//   2. LOGOUT relocation
//   3. Brand rebrand + tab title
//   4. Brand-link rewrite → DB list
//   5. Theme toggle (light/dark)
//   6. Mobile sidebar UX (own hamburger + slide + close X + backdrop)
(function () {
    'use strict';

    /* === Apply theme as EARLY as possible — before paint — so the body
       doesn't flash dark on the first frame in light mode. */
    try {
        var savedTheme = localStorage.getItem('adminer-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', savedTheme);
    } catch (e) { /* ignore */ }

    /* ===== 1. EN/TH language toggle ============================ */
    function findNativeLangForm() {
        var sel = document.querySelector('#lang select[name="lang"], form select[name="lang"]');
        if (!sel) return null;
        var form = sel.form || sel.closest('form');
        if (!form) return null;
        return { form: form, select: sel };
    }
    function detectCurrentLang() {
        var native = findNativeLangForm();
        if (native && native.select.value) return native.select.value;
        var qp = new URLSearchParams(window.location.search).get('lang');
        if (qp) return qp;
        var htmlLang = document.documentElement.lang || '';
        return htmlLang ? htmlLang.split('-')[0] : 'en';
    }
    function switchLang(lang) {
        var native = findNativeLangForm();
        if (native) { native.select.value = lang; native.form.submit(); return; }
        var url = new URL(window.location.href);
        url.searchParams.set('lang', lang);
        window.location.href = url.toString();
    }
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
    function buildLangToggle(currentLang) {
        var t = document.createElement('div');
        t.className = 'lang-toggle';
        var sep = document.createElement('span');
        sep.className = 'lang-sep';
        sep.textContent = '/';
        t.appendChild(makeLangLink('en', 'EN', currentLang === 'en'));
        t.appendChild(sep);
        t.appendChild(makeLangLink('th', 'TH', currentLang === 'th'));
        return t;
    }

    /* ===== 2. LOGOUT relocation ================================ */
    function relocateLogout(menu) {
        var logoutPara = document.querySelector('.logout, p.logout');
        if (!logoutPara) return;
        var form = logoutPara.closest('form') || logoutPara;
        if (form.parentNode === menu) return;
        menu.appendChild(form);
    }

    /* ===== 3. Brand rebrand ==================================== */
    var BRAND_PREFIX = 'ptpofficialxd';
    var BRAND_SUFFIX = 'DB';
    var BRAND_FULL = BRAND_PREFIX + BRAND_SUFFIX;

    function rebrandHeader() {
        var link = document.querySelector('#menu h1 a');
        if (!link || link.querySelector('.brand-name')) return;
        Array.prototype.slice.call(link.childNodes).forEach(function (n) {
            if (n.nodeType === Node.TEXT_NODE) link.removeChild(n);
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

    /* ===== 4. Brand-link → DB list =============================
       Security: never bake the connection string (server/username) into
       the rendered `href` attribute. A static `href="#"` keeps the DOM
       clean against `inspect element`; the actual URL is computed inside
       a click handler from window.location (which is unavoidable but
       not duplicated into HTML markup). */
    var URL_KEYS_TO_STRIP = [
        'db', 'ns', 'table', 'select', 'edit', 'where', 'schema', 'create',
        'view', 'foreign', 'trigger', 'sequence', 'type', 'procedure', 'event',
        'sql', 'import', 'dump', 'privileges', 'user', 'processlist',
        'variables', 'status'
    ];

    function buildDbListUrl() {
        var url = new URL(window.location.href);
        URL_KEYS_TO_STRIP.forEach(function (p) { url.searchParams.delete(p); });
        return url.toString();
    }

    function rewriteBrandLink() {
        var link = document.querySelector('#menu h1 a');
        if (!link) return;

        // Strip credentials/connection params from the rendered attribute.
        link.setAttribute('href', '#');
        link.setAttribute('aria-label', 'Database list');
        link.title = 'Database list';
        link.removeAttribute('target');
        link.removeAttribute('rel');

        link.addEventListener('click', function (e) {
            e.preventDefault();
            window.location.assign(buildDbListUrl());
        });

        // Support keyboard activation too (Enter on focused <a href="#">
        // doesn't navigate without an href value).
        link.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                window.location.assign(buildDbListUrl());
            }
        });
    }

    /* ===== 5. Theme toggle ===================================== */
    var THEME_KEY = 'adminer-theme';
    var SUN_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
    var MOON_SVG = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

    function buildThemeToggle() {
        var current = document.documentElement.getAttribute('data-theme') || 'dark';
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'theme-toggle';
        btn.setAttribute('aria-label', 'Toggle theme');
        btn.title = 'Toggle light/dark theme';
        btn.innerHTML = current === 'dark' ? SUN_SVG : MOON_SVG;
        btn.addEventListener('click', function () {
            var cur = document.documentElement.getAttribute('data-theme') || 'dark';
            var next = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* ignore */ }
            btn.innerHTML = next === 'dark' ? SUN_SVG : MOON_SVG;
        });
        return btn;
    }

    /* ===== 6. Native mobile menu trigger — restyle, don't replace =====
       Adminer's own JS opens the sidebar via the #menuopen button. We just
       give that button a modern SVG-icon look. No custom hamburger, no
       slide animation, no backdrop — Adminer handles all of that. */
    function modernizeNativeMenuToggle() {
        var menuopen = document.getElementById('menuopen');
        if (!menuopen) return;
        // The actual clickable is the inner <button>. Style it, replace its
        // text content with an SVG, but DON'T attach our own click handler —
        // Adminer's submit-form behavior is what opens the sidebar.
        var btn = menuopen.querySelector('button') || menuopen;
        btn.classList.add('modern-menu-trigger');
        btn.setAttribute('aria-label', 'Open sidebar');
        btn.innerHTML = HAMBURGER_SVG;
    }

    /* ===== Init ================================================ */
    function init() {
        var menu = document.getElementById('menu');

        var langToggle = buildLangToggle(detectCurrentLang());
        var header = document.createElement('div');
        header.className = 'menu-header-actions';
        header.appendChild(langToggle);
        (menu || document.body).appendChild(header);

        // Theme toggle floats bottom-right of the viewport
        document.body.appendChild(buildThemeToggle());

        if (menu) {
            relocateLogout(menu);
        }

        modernizeNativeMenuToggle();
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
