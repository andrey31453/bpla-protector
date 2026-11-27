#!/usr/bin/env bash
# Debian/Ubuntu: PHP-FPM/cURL only; existing Postfix is not modified.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo 'Run as root' >&2; exit 1; }
command -v apt-get >/dev/null
command -v systemctl >/dev/null
dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y php-fpm php-cli php-curl ca-certificates
version="$(php -r 'echo PHP_MAJOR_VERSION,".",PHP_MINOR_VERSION;')"
php -r 'exit(PHP_VERSION_ID >= 80100 && extension_loaded("curl") ? 0 : 1);'
command -v "php-fpm${version}" >/dev/null
install -d -m 750 -o root -g www-data /etc/site-lead
[ -s /etc/site-lead/rusender-token ] || { echo 'Provision /etc/site-lead/rusender-token first' >&2; exit 1; }
chown root:www-data /etc/site-lead/rusender-token
chmod 640 /etc/site-lead/rusender-token
pool="/etc/php/${version}/fpm/pool.d/site-lead.conf"
backup="$(mktemp)"
trap 'rm -f "$backup"' EXIT
had_pool=false
if [ -f "$pool" ]; then cp -a "$pool" "$backup"; had_pool=true; fi
install -m 644 "$dir/lead-pool.conf" "$pool"
if ! "php-fpm${version}" -t; then
    if "$had_pool"; then cp -a "$backup" "$pool"; else rm -f "$pool"; fi
    exit 1
fi
systemctl enable --now "php${version}-fpm"
systemctl restart "php${version}-fpm"
test -S /run/php/site-lead.sock
echo 'PHP-FPM/cURL ready for RuSender; Postfix unchanged.'