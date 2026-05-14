FROM adminer:5.4.2

# Custom theme
COPY adminer.css       /var/www/html/adminer.css

# Entry point — replicates the image's plugin-loading index.php
COPY index.php         /var/www/html/index.php

# Adminer plugins (auto-loaded by index.php)
COPY plugins-enabled/  /var/www/html/plugins-enabled/

# JS bundle that the plugin injects
COPY scripts/          /var/www/html/scripts/

EXPOSE 8080
