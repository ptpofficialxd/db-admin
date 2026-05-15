// @ts-check
// Login form patches:
//   1. Mark <body data-login="true"> so the CSS glass-card layout
//      can target the login screen specifically.
//   2. Override Adminer's built-in i18n strings on the login page
//      (English + Thai labels that the user wanted reworded).
(function () {
    'use strict';

    // Each pair is [search, replace]. Order matters: replacements run
    // top-to-bottom on every text node, so put broader matches last.
    var TEXT_REPLACEMENTS = [
        ['Permanent login', 'Remember me'],
        ['Server', 'Server / Host'],
        ['จดจำการเข้าสู่ระบบตลอดไป', 'จดจำการเข้าสู่ระบบ'],
        ['เซอเวอร์', 'เซิฟเวอร์ / โฮสต์']
    ];

    function isLoginPage() {
        // Detect by presence of any `auth[...]` input. We iterate instead
        // of using `input[name="auth[driver]"]` because the literal `[`
        // inside the attribute value trips up a few selector engines.
        var fields = document.querySelectorAll('input, select');
        for (var i = 0; i < fields.length; i++) {
            var n = fields[i].getAttribute('name') || '';
            if (n.indexOf('auth[') === 0) return true;
        }
        return false;
    }

    function replaceAll(s) {
        var out = s;
        for (var i = 0; i < TEXT_REPLACEMENTS.length; i++) {
            var pair = TEXT_REPLACEMENTS[i];
            if (out.indexOf(pair[0]) !== -1) {
                out = out.split(pair[0]).join(pair[1]);
            }
        }
        return out;
    }

    function patchTextNodes(root) {
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
        var node;
        while ((node = walker.nextNode())) {
            var t = node.nodeValue;
            if (!t) continue;
            var nv = replaceAll(t);
            if (nv !== t) node.nodeValue = nv;
        }
    }

    function patchButtonValues() {
        var inputs = document.querySelectorAll('input[type="submit"], input[type="button"]');
        for (var i = 0; i < inputs.length; i++) {
            var el = inputs[i];
            var v = el.getAttribute('value');
            if (!v) continue;
            var nv = replaceAll(v);
            if (nv !== v) el.setAttribute('value', nv);
        }
    }

    function init() {
        if (!isLoginPage()) return;
        document.body.setAttribute('data-login', 'true');
        patchTextNodes(document.querySelector('form') || document.body);
        patchButtonValues();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
