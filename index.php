<?php
/**
 * Adminer entry-point.
 *
 * Mirrors the upstream docker-adminer index.php — auto-loads any plugin file
 * dropped into ./plugins-enabled/ so we can extend Adminer without touching
 * this file again.
 */
function adminer_object()
{
    $pluginsEnabled = __DIR__ . '/plugins-enabled';
    if (!is_dir($pluginsEnabled)) {
        return new Adminer;
    }

    $plugins = [];
    foreach (glob($pluginsEnabled . '/*.php') ?: [] as $plugin) {
        $instance = require $plugin;
        if (is_object($instance)) {
            $plugins[] = $instance;
        }
    }

    if (!$plugins) {
        return new Adminer;
    }

    require_once __DIR__ . '/plugins/plugin.php';
    return new AdminerPlugin($plugins);
}

require __DIR__ . '/adminer.php';
