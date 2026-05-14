<?php
/**
 * Adminer entry-point wrapper.
 *
 * Replaces the default index.php in the official Adminer image so we can
 * inject the EN/TH language toggle JS without using the plugin system.
 *
 * Drop this at /var/www/html/index.php alongside adminer.php + adminer.css.
 */

ob_start();

// The official Adminer Docker image ships a versioned file (e.g.
// adminer-5.4.2.php) symlinked from adminer.php. Including either works.
require __DIR__ . '/adminer.php';

$html = ob_get_clean();

// Inline every JS file from scripts/ in alphabetical order so adding a new
// script is just "drop it in scripts/ and rebuild" — no PHP edits needed.
$scriptsDir = __DIR__ . '/scripts';
$inline = '';
if (is_dir($scriptsDir)) {
    $files = glob($scriptsDir . '/*.js') ?: [];
    sort($files);
    foreach ($files as $f) {
        $inline .= "// ---- " . basename($f) . " ----\n";
        $inline .= file_get_contents($f) . "\n";
    }
}

if ($inline !== '') {
    $tag = "<script>\n" . $inline . "</script>\n</body>";
    // Case-insensitive replacement, only the LAST </body> in the document.
    $html = preg_replace('#</body>(?!.*</body>)#is', $tag, $html, 1);
}

echo $html;
