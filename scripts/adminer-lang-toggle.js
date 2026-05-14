// @ts-check
// EN/TH language toggle for Adminer.
// Clicking a button programmatically sets the value of Adminer's native
// <form id="lang"><select> and submits it — that's the only way Adminer
// 5.x reliably persists the chosen language (it stores it in the session
// after the form submit, not from a plain ?lang=xx GET).
//
// Paired with adminer.css (the `.lang-toggle` block).
(function () {
    'use strict';

    /**
     * Adminer 5.x renders:
     *   <form action="">
     *     <div id="lang">…<select name="lang" onchange="this.form.submit();">…</select></div>
     *   </form>
     * So #lang is the WRAPPING DIV, not the form. We resolve the form via
     * the select's `.form` property (or .closest('form') as a fallback).
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
        // Fallback for environments where Adminer didn't render the form
        // (e.g. before login). Reload with ?lang=… and hope Adminer picks it up.
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

    function init() {
        var currentLang = detectCurrentLang();

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
        } else {
            toggle.style.position = 'fixed';
            toggle.style.top = '16px';
            toggle.style.right = '16px';
            toggle.style.zIndex = '9999';
            document.body.appendChild(toggle);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
