<?php
/**
 * Adminer entry-point.
 *
 * Returns an anonymous subclass of Adminer\Adminer (5.x is namespaced)
 * that overrides head() to:
 *   1. Inline every `scripts/[0-9]*.js` file in alphabetical order
 *      with Adminer's per-request CSP nonce.
 *   2. Append a content-hashed query string to the <link> for
 *      adminer.css so browser caches invalidate on each deploy.
 *
 * Adding a new client-side tweak = drop a numbered .js file into
 * `scripts/` (e.g. `60-foo.js`) and rebuild. No PHP edits needed.
 */
function adminer_object()
{
    return new class extends \Adminer\Adminer {
        public function head($dark = null)
        {
            $result = parent::head($dark);

            $this->inlineCustomScripts();
            $this->printVersionedCss();

            return $result;
        }

        /**
         * Inline numbered modules from scripts/ in alphabetical order.
         * Files without a leading digit (e.g. README.md, legacy
         * adminer-customizations.js) are intentionally skipped.
         */
        private function inlineCustomScripts(): void
        {
            $dir = __DIR__ . '/scripts';
            if (!is_dir($dir)) {
                return;
            }
            $files = glob($dir . '/[0-9]*.js') ?: [];
            sort($files);
            if (!$files) {
                return;
            }

            $nonceAttr = $this->nonceAttr();

            echo "<script{$nonceAttr}>\n";
            foreach ($files as $f) {
                echo "// ---- " . basename($f) . " ----\n";
                echo file_get_contents($f);
                echo "\n";
            }
            echo "</script>\n";
        }

        /**
         * Adminer's default <link rel="stylesheet" href="adminer.css">
         * has no version, so users see stale CSS until they hard-refresh.
         * Print our own link with `?v=<hash>` derived from the file's
         * mtime + size — fast and cache-friendly.
         */
        private function printVersionedCss(): void
        {
            $css = __DIR__ . '/adminer.css';
            if (!is_file($css)) {
                return;
            }
            $stamp = substr(md5(filemtime($css) . '-' . filesize($css)), 0, 8);
            $nonceAttr = $this->nonceAttr();
            echo '<link rel="stylesheet" type="text/css" href="adminer.css?v=' . $stamp . '"' . $nonceAttr . ">\n";
        }

        /**
         * Build the ` nonce="..."` attribute for the current request.
         * Adminer 5.x exposes get_nonce() inside the Adminer\ namespace;
         * older dev builds had it global — try both.
         */
        private function nonceAttr(): string
        {
            $nonce = '';
            if (function_exists('Adminer\\get_nonce')) {
                $nonce = \Adminer\get_nonce();
            } elseif (function_exists('get_nonce')) {
                $nonce = get_nonce();
            }
            if ($nonce === '' || $nonce === null) {
                return '';
            }
            return ' nonce="' . htmlspecialchars((string) $nonce, ENT_QUOTES) . '"';
        }
    };
}

require __DIR__ . '/adminer.php';
