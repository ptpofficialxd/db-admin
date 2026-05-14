// @ts-check
// EN/TH language toggle. Replaces Adminer's native <select name="lang">
// with a compact two-button switch, mounted inside a new
// `.menu-header-actions` container in the sidebar (top-right). The
// container is reused by later modules (e.g. brand.js for the
// version chip), so this script runs first by alphabetical order.
(function () {
    'use strict';

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
        // Prefer Adminer's native form submit (carries the CSRF token).
        // Fallback to a URL rewrite if the form isn't on the page.
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

    function init() {
        var menu = document.getElementById('menu');
        var actions = document.createElement('div');
        actions.className = 'menu-header-actions';
        actions.appendChild(buildLangToggle(detectCurrentLang()));
        (menu || document.body).appendChild(actions);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
