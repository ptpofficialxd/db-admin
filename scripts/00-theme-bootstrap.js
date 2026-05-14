// @ts-check
// Apply the saved theme BEFORE first paint to prevent a flash of the
// wrong theme. Reads `localStorage.adminer-theme` and sets the
// `data-theme` attribute on <html>. Synchronous, no DOM wait.
(function () {
    'use strict';
    try {
        var t = localStorage.getItem('adminer-theme') || 'dark';
        document.documentElement.setAttribute('data-theme', t);
    } catch (e) { /* localStorage may be blocked — fall back to dark */ }
})();
