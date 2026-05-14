FROM adminer:5.4.2

COPY adminer.css /var/www/html/adminer.css
COPY index.php   /var/www/html/index.php
COPY scripts/    /var/www/html/scripts/

EXPOSE 8080
