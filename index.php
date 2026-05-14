<?php
/**
 * Adminer entry-point.
 *
 * Returns an anonymous subclass of Adminer\Adminer (5.x is namespaced) that
 * overrides head() to inline every JS file from ./scripts/ — alphabetically —
 * with Adminer's per-request CSP nonce.
 *
 * Adding a new client-side tweak = drop a .js file into ./scripts/ and
 * rebuild. No PHP edits needed.
 */
function adminer_object()
{
    return new class extends \Adminer\Adminer {
        public function head($dark = null)
        {
            $result = parent::head($dark);

            $scriptsDir = __DIR__ . '/scripts';
            if (!is_dir($scriptsDir)) {
                return $result;
            }

            $files = glob($scriptsDir . '/*.js') ?: [];
            sort($files);
            if (!$files) {
                return $result;
            }

            // Adminer 5.x ships get_nonce() inside the Adminer\ namespace,
            // but earlier dev builds had it in global scope — try both.
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
            foreach ($files as $f) {
                echo "// ---- " . basename($f) . " ----\n";
                echo file_get_contents($f);
                echo "\n";
            }
            echo "</script>\n";

            return $result;
        }
    };
}

require __DIR__ . '/adminer.php';
