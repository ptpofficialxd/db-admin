// @ts-check
// Brand customizations:
//   1. Replace the "Adminer" wordmark in #menu h1 with
//      "ptpofficialxd" + "DB" spans so CSS can colour each half.
//   2. Update <title> "... - Adminer" → "... - ptpofficialxdDB".
//   3. Rewrite the brand link to the DB list (strips connection
//      parameters from the href so they aren't exposed via Inspect).
//   4. Move the version pill (".version") out of #menu h1 and into
//      the top-right header-actions row alongside EN/TH.
(function () {
    'use strict';

    var BRAND_PREFIX = 'ptpofficialxd';
    var BRAND_SUFFIX = 'DB';
    var BRAND_FULL = BRAND_PREFIX + BRAND_SUFFIX;

    // Connection / nav params that should NOT survive in the brand-link
    // href — clicking the brand should go to the DB list, not back to
    // the currently-open table or query.
    var NAV_PARAMS = [
        'db', 'ns', 'table', 'select', 'edit', 'where', 'schema',
        'create', 'view', 'foreign', 'trigger', 'sequence', 'type',
        'procedure', 'event', 'sql', 'import', 'dump', 'privileges',
        'user', 'processlist', 'variables', 'status'
    ];

    function rebrandHeader() {
        var link = document.querySelector('#menu h1 a');
        if (!link || link.querySelector('.brand-name')) return;
        // Strip the original "Adminer" text node(s) from the link.
        var kids = Array.prototype.slice.call(link.childNodes);
        for (var i = 0; i < kids.length; i++) {
            if (kids[i].nodeType === Node.TEXT_NODE) link.removeChild(kids[i]);
        }
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

    function rewriteBrandLink() {
        var link = document.querySelector('#menu h1 a');
        if (!link) return;
        var url = new URL(window.location.href);
        for (var i = 0; i < NAV_PARAMS.length; i++) {
            url.searchParams.delete(NAV_PARAMS[i]);
        }
        link.href = url.pathname + (url.search || '');
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.title = 'Database list';
    }

    function relocateVersion() {
        var menu = document.getElementById('menu');
        var header = document.querySelector('.menu-header-actions');
        if (!menu || !header) return;
        var version = menu.querySelector('h1 .version');
        if (!version) return;
        // Prefix "v" once (e.g. "5.4.2" → "v5.4.2").
        var txt = (version.textContent || '').trim();
        if (txt && txt[0] !== 'v' && txt[0] !== 'V') {
            version.textContent = 'v' + txt;
        }
        // Insert before the lang toggle so the row reads: version | EN/TH
        header.insertBefore(version, header.firstChild);
    }

    function init() {
        rebrandHeader();
        rebrandTitle();
        rewriteBrandLink();
        relocateVersion();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
