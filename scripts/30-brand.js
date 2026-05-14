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

    // Navigation params Adminer puts in the query string for the
    // currently-open table / query / view. Clicking the brand should
    // go to the DB list, so these get stripped.
    //
    // NOTE: We deliberately DO NOT strip `server` or `username` here —
    // Adminer needs them to identify the authenticated session. To
    // prevent them leaking via DOM inspection, the brand link's href
    // is set to "#" and navigation is done programmatically in the
    // click handler below.
    var NAV_PARAMS = [
        'db', 'ns', 'table', 'select', 'edit', 'where', 'schema',
        'create', 'view', 'foreign', 'trigger', 'sequence', 'type',
        'procedure', 'event', 'sql', 'import', 'dump', 'privileges',
        'user', 'processlist', 'variables', 'status'
    ];

    function buildDbListUrl() {
        var url = new URL(window.location.href);
        for (var i = 0; i < NAV_PARAMS.length; i++) {
            url.searchParams.delete(NAV_PARAMS[i]);
        }
        return url.pathname + (url.search || '');
    }

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
        // href = "#" so DOM inspection never reveals server/username/db.
        // Navigation happens programmatically in the click handler.
        link.setAttribute('href', '#');
        link.removeAttribute('target');
        link.removeAttribute('rel');
        link.title = 'Database list';
        // Use a property flag to make this idempotent across re-runs.
        if (link.__brandLinkBound) return;
        link.__brandLinkBound = true;
        link.addEventListener('click', function (e) {
            // Allow middle-click / cmd-click / ctrl-click to open in
            // a new tab — but with the safe DB-list URL, not the
            // server-leaking one.
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
                window.open(buildDbListUrl(), '_blank');
                e.preventDefault();
                return;
            }
            e.preventDefault();
            window.location.href = buildDbListUrl();
        });
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
