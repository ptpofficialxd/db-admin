<?php
/**
 * Adminer plugin: inject the EN/TH language toggle JS.
 *
 * Auto-loaded by ../index.php (which globs *.php from this folder).
 * Reads scripts/adminer-lang-toggle.js and emits it inline with Adminer's
 * per-request CSP nonce so it survives the strict script-src policy.
 */
return new class {
    public function head()
    {
        $jsFile = __DIR__ . '/../scripts/adminer-lang-toggle.js';
        if (!is_file($jsFile)) {
            return;
        }

        $nonceAttr = '';
        if (function_exists('get_nonce')) {
            $n = get_nonce();
            if ($n !== '' && $n !== null) {
                $nonceAttr = ' nonce="' . htmlspecialchars($n, ENT_QUOTES) . '"';
            }
        }

        echo "<script{$nonceAttr}>\n";
        echo file_get_contents($jsFile);
        echo "\n</script>\n";
    }
};
