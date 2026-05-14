FROM adminer

COPY adminer.css /var/www/html/adminer.css
COPY scripts/   /var/www/html/scripts/
COPY index.php  /var/www/html/index.php

EXPOSE 8080