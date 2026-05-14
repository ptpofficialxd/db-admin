<?php
/**
 * Adminer entry-point.
 *
 * Returns an anonymous Adminer subclass that overrides head() to inject
 * our EN/TH language toggle JS with the per-request CSP nonce.
 *
 * No plugin.php / AdminerPlugin needed — the official adminer:5.4.2
 * standalone image doesn't ship plugins/plugin.php, so we avoid the whole
 * plugin loader and just subclass Adminer directly.
 */
function adminer_object()
{
    return new class extends Adminer {
        public function head($dark = null)
        {
            $result = parent::head($dark);

            $jsFile = __DIR__ . '/scripts/adminer-lang-toggle.js';
            if (is_file($jsFile)) {
                $nonceAttr = '';
                if (function_exists('get_nonce')) {
                    $n = get_nonce();
                    if ($n !== null && $n !== '') {
                        $nonceAttr = ' nonce="' . htmlspecialchars($n, ENT_QUOTES) . '"';
                    }
                }
                echo "<script{$nonceAttr}>\n";
                echo file_get_contents($jsFile);
                echo "\n</script>\n";
            }

            return $result;
        }
    };
}

require __DIR__ . '/adminer.php';
