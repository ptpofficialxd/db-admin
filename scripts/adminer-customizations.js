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

    var OPEN_STYLE = [
        'display: flex !important',
        'flex-direction: column !important',
        'visibility: visible !important',
        'opacity: 1 !important',
        'position: fixed !important',
        'left: 0 !important',
        'right: auto !important',
        'top: 0 !important',
        'bottom: 0 !important',
        'transform: translateX(0) !important',
        'width: var(--ui-sidebar-width, 310px) !important',
        'max-width: 92vw !important',
        'height: 100vh !important',
        'z-index: 2147483600 !important',
        'pointer-events: auto !important',
        'overflow-y: auto !important'
    ].join(';');

    var CLOSE_STYLE = [
        'transform: translateX(-105%) !important',
        'pointer-events: none !important'
    ].join(';');

    /* Adminer builds use different class names to indicate "menu is open" —
       we set every plausible one on both <html> and <body> so any of
       Adminer's own selectors that depend on a class will also kick in. */
    var OPEN_CLASSES = ['menu-open', 'open', 'openmenu', 'menutoggle', 'show-menu'];

    /** @type {MutationObserver | null} */
    var openObserver = null;

    /** @param {HTMLElement} menu */
    function applyOpenStyle(menu) {
        if (!menu) return;
        // Write atomically — overwrites whatever Adminer may have set.
        menu.style.cssText = OPEN_STYLE;
    }

    /** @param {HTMLElement} menu */
    function forceOpen(menu) {
        OPEN_CLASSES.forEach(function (c) {
            document.documentElement.classList.add(c);
            document.body.classList.add(c);
        });
        if (!menu) return;
        applyOpenStyle(menu);

        // If anything tries to mutate #menu while we want it open, re-apply.
        if (openObserver) openObserver.disconnect();
        openObserver = new MutationObserver(function () {
            if (document.documentElement.classList.contains('menu-open')) {
                // Only re-apply if our style was wiped (cheap check on display)
                if (menu.style.display !== 'flex' || menu.style.transform.indexOf('-') !== -1) {
                    applyOpenStyle(menu);
                }
            }
        });
        openObserver.observe(menu, { attributes: true, attributeFilter: ['style', 'class'] });
    }

    /** @param {HTMLElement} menu */
    function forceClose(menu) {
        OPEN_CLASSES.forEach(function (c) {
            document.documentElement.classList.remove(c);
            document.body.classList.remove(c);
        });
        if (openObserver) { openObserver.disconnect(); openObserver = null; }
        if (!menu) return;
        // Slide out then clear inline styles after the transition so desktop
        // breakpoint rules can take back over cleanly.
        menu.style.cssText = CLOSE_STYLE;
        setTimeout(function () {
            if (!document.documentElement.classList.contains('menu-open')) {
                menu.style.cssText = '';
            }
        }, 360);
    }

    /** @param {HTMLElement} menu */
    function toggleSidebar(menu) {
        if (document.documentElement.classList.contains('menu-open')) {
            forceClose(menu);
        } else {
            forceOpen(menu);
        }
    }

    function setupSidebarUI(menu) {
        // 1) Hide every variant of Adminer's native mobile trigger.
        ['menu-toggle', 'menutoggle', 'menuopen'].forEach(function (id) {
            var n = document.getElementById(id);
            if (n) {
                n.style.setProperty('display', 'none', 'important');
                n.setAttribute('aria-hidden', 'true');
            }
        });
        Array.prototype.forEach.call(
            document.querySelectorAll(
                '.menu-toggle, .menutoggle, #menuopen button.icon.icon-move'
            ),
            function (n) { n.style.setProperty('display', 'none', 'important'); }
        );

        // 2) Our own hamburger
        if (!document.querySelector('.custom-menu-trigger')) {
            var trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'custom-menu-trigger';
            trigger.setAttribute('aria-label', 'Open sidebar');
            trigger.innerHTML = HAMBURGER_SVG;
            trigger.addEventListener('click', function (e) {
                e.preventDefault();
                var fresh = document.getElementById('menu') || menu;
                toggleSidebar(fresh);
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
                forceClose(menu);
            });
            menu.appendChild(close);
        }

        // 4) Backdrop
        if (!document.querySelector('.sidebar-backdrop')) {
            var bd = document.createElement('div');
            bd.className = 'sidebar-backdrop';
            bd.addEventListener('click', function () {
                forceClose(menu);
            });
            document.body.appendChild(bd);
        }

        // 5) Auto-close after tapping a nav link
        menu.addEventListener('click', function (e) {
            var t = e.target;
            var a = t && t.closest && t.closest('a');
            if (!a) return;
            if (a.classList.contains('lang-btn')) return;
            if (a.classList.contains('theme-toggle')) return;
            forceClose(menu);
        });

        // 6) ESC closes
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') forceClose(menu);
        });

        // 7) On desktop, the inline styles we may have set should NOT linger.
        //    Listen to viewport changes — if we cross the mobile breakpoint
        //    back to desktop, wipe the inline overrides so default CSS rules.
        var mq = window.matchMedia('(min-width: 801px)');
        function syncDesktop() {
            if (mq.matches) {
                ['display','flex-direction','visibility','opacity','position',
                 'left','right','top','bottom','transform','width','max-width',
                 'height','z-index','pointer-events','overflow-y']
                    .forEach(function (k) { menu.style.removeProperty(k); });
                document.documentElement.classList.remove('menu-open');
                document.body.classList.remove('menu-open');
            }
        }
        mq.addEventListener ? mq.addEventListener('change', syncDesktop)
                            : mq.addListener(syncDesktop);
        syncDesktop();
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
