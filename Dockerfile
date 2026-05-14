# syntax=docker/dockerfile:1.6
#
# Adminer with the ptpofficialxd theme + customizations.
#
# Build:    docker build -t ptpofficialxd-db .
# Run:      docker run -p 8080:8080 ptpofficialxd-db
#
# Render.com auto-builds via render.yaml; nothing to configure here.

FROM adminer:5.4.2

# Layer 1 — CSS (changes most often, but tiny). Putting it first means
# script/PHP layers stay cached when only styles change.
COPY adminer.css   /var/www/html/adminer.css

# Layer 2 — client-side modules. Bumping any module re-uses the PHP
# layer below.
COPY scripts/      /var/www/html/scripts/

# Layer 3 — PHP wrapper. Changes least often.
COPY index.php     /var/www/html/index.php

# The base image already sets:
#   ENTRYPOINT  php -S [::]:8080 -t /var/www/html
#   EXPOSE      8080
# We just reaffirm the port for tooling that reads it directly.
EXPOSE 8080
