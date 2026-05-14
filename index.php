<?php
/**
 * Adminer entry-point.
 *
 * Returns an anonymous subclass of Adminer\Adminer (Adminer 5.x is namespaced)
 * that overrides head() to inject the EN/TH language toggle JS with the
 * per-request CSP nonce.
 */
function adminer_object()
{
    return new class extends \Adminer\Adminer {
        public function head($dark = null)
        {
            $result = parent::head($dark);

            $jsFile = __DIR__ . '/scripts/adminer-lang-toggle.js';
            if (is_file($jsFile)) {
                // Adminer 5.x ships get_nonce() inside the Adminer\ namespace.
                $nonce = '';
                if (function_exists('Adminer\\get_nonce')) {
                    $nonce = \Adminer\get_nonce();
                } elseif (function_exists('get_nonce')) {
                    $nonce = get_nonce();
                }

                $nonceAttr = $nonce !== '' && $nonce !== null
                    ? ' nonce="' . htmlspecialchars((string) $nonce, ENT_QUOTES) . '"'
                    : '';

                echo "<script{$nonceAttr}>\n";
                echo file_get_contents($jsFile);
                echo "\n</script>\n";
            }

            return $result;
        }
    };
}

require __DIR__ . '/adminer.php';
