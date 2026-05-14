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

    /* ===== 4. Brand-link → DB list ============================= */
    function rewriteBrandLink() {
        var link = document.querySelector('#menu h1 a');
        if (!link) return;
        var url = new URL(window.location.href);
        ['db', 'ns', 'table', 'select', 'edit', 'where', 'schema', 'create',
         'view', 'foreign', 'trigger', 'sequence', 'type', 'procedure', 'event',
         'sql', 'import', 'dump', 'privileges', 'user', 'processlist',
         'variables', 'status'].forEach(function (p) { url.searchParams.delete(p); });
        link.href = url.pathname + (url.search || '');
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.title = 'Database list';
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

    /* ===== 6. Mobile sidebar UX ================================ */
    var HAMBURGER_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
    var CLOSE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M6 18L18 6"/></svg>';

    function setupSidebarUI(menu) {
        // 1) Hide every variant of Adminer's native mobile trigger.
        //    5.x uses #menuopen > button.icon.icon-move; older builds used
        //    #menu-toggle / #menutoggle / .menutoggle.
        ['menu-toggle', 'menutoggle', 'menuopen'].forEach(function (id) {
            var n = document.getElementById(id);
            if (n) {
                n.style.display = 'none';
                n.setAttribute('aria-hidden', 'true');
            }
        });
        Array.prototype.forEach.call(
            document.querySelectorAll(
                '.menu-toggle, .menutoggle, #menuopen button.icon.icon-move'
            ),
            function (n) { n.style.display = 'none'; }
        );

        // 2) Create OUR own hamburger trigger (always controllable).
        if (!document.querySelector('.custom-menu-trigger')) {
            var trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'custom-menu-trigger';
            trigger.setAttribute('aria-label', 'Open sidebar');
            trigger.innerHTML = HAMBURGER_SVG;
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                document.documentElement.classList.toggle('menu-open');
                document.body.classList.toggle('menu-open');
            });
            document.body.appendChild(trigger);
        }

        // 3) Close × inside sidebar
        if (!menu.querySelector('.sidebar-close')) {
            var close = document.createElement('button');
            close.type = 'button';
            close.className = 'sidebar-close';
            close.setAttribute('aria-label', 'Close sidebar');
            close.innerHTML = CLOSE_SVG;
            close.addEventListener('click', function () {
                document.documentElement.classList.remove('menu-open');
                document.body.classList.remove('menu-open');
            });
            menu.appendChild(close);
        }

        // 4) Backdrop
        if (!document.querySelector('.sidebar-backdrop')) {
            var bd = document.createElement('div');
            bd.className = 'sidebar-backdrop';
            bd.addEventListener('click', function () {
                document.documentElement.classList.remove('menu-open');
                document.body.classList.remove('menu-open');
            });
            document.body.appendChild(bd);
        }

        // 5) Auto-close after tapping a nav link (mobile UX)
        menu.addEventListener('click', function (e) {
            var t = e.target;
            var a = t && t.closest && t.closest('a');
            if (!a) return;
            if (a.classList.contains('lang-btn')) return;
            if (a.classList.contains('theme-toggle')) return;
            document.documentElement.classList.remove('menu-open');
            document.body.classList.remove('menu-open');
        });

        // 6) ESC closes
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                document.documentElement.classList.remove('menu-open');
                document.body.classList.remove('menu-open');
            }
        });
    }

    /* ===== Init ================================================ */
    function init() {
        var menu = document.getElementById('menu');

        var langToggle = buildLangToggle(detectCurrentLang());
        var header = document.createElement('div');
        header.className = 'menu-header-actions';
        header.appendChild(langToggle);
        (menu || document.body).appendChild(header);

        // Theme toggle is floating bottom-right — attach to <body>, not the sidebar
        document.body.appendChild(buildThemeToggle());

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
