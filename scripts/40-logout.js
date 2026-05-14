// @ts-check
// Move the LOGOUT form out of Adminer's default location and append it
// to the sidebar (#menu) so the LOGOUT pill can be positioned next to
// the defaultdb selector via CSS.
(function () {
    'use strict';

    function init() {
        var menu = document.getElementById('menu');
        if (!menu) return;
        var logoutPara = document.querySelector('.logout, p.logout');
        if (!logoutPara) return;
        var form = logoutPara.closest('form') || logoutPara;
        if (form.parentNode === menu) return;
        menu.appendChild(form);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
