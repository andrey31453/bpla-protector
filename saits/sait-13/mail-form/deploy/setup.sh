#!/usr/bin/env bash
# Только Debian/Ubuntu + systemd. Не запускается автоматически при сборке.
# MAIL_DOMAIN=example.org bash mail-form/deploy/setup.sh
set -euo pipefail
fail() { printf '%s\n' "$*" >&2; exit 1; }
[ "$(id -u)" = 0 ] || fail 'Run as root'
command -v apt-get >/dev/null || fail 'Debian/Ubuntu required'
command -v systemctl >/dev/null || fail 'systemd required'
domain="${MAIL_DOMAIN:-}"
[[ "$domain" =~ ^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$ && "$domain" == *.* ]] || fail 'Set MAIL_DOMAIN to the sending domain'
dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
[ -f "$dir/lead-pool.conf" ] || fail 'Missing lead-pool.conf'

# Чужой почтовый сервер не перенастраиваем: сначала ручной аудит.
if command -v sendmail >/dev/null 2>&1 || [ -e /etc/postfix/main.cf ]; then
    fail 'Existing mail transport detected. Audit it manually; no changes made.'
fi
export DEBIAN_FRONTEND=noninteractive
printf 'postfix postfix/mailname string %s\npostfix postfix/main_mailer_type select Internet Site\n' "$domain" | debconf-set-selections
apt-get update -qq
apt-get install -y php-fpm php-cli postfix
version="$(php -r 'echo PHP_MAJOR_VERSION,".",PHP_MINOR_VERSION;')"
php -r 'exit(PHP_VERSION_ID >= 80100 ? 0 : 1);' || fail 'PHP 8.1+ required'
command -v "php-fpm${version}" >/dev/null || fail 'PHP CLI/FPM version mismatch; inspect installed versions'
install -m 644 "$dir/lead-pool.conf" "/etc/php/${version}/fpm/pool.d/site-lead.conf"
"php-fpm${version}" -t

# Прямая отправка на MX получателя, не SMTP relay. Только локальный приём:
# сервер не становится открытым реле и не слушает внешний порт 25.
postconf -e "myhostname = mail.${domain}"
postconf -e "myorigin = ${domain}"
postconf -e 'inet_interfaces = loopback-only'
postconf -e 'mynetworks = 127.0.0.0/8 [::1]/128'
postconf -e 'mydestination = $myhostname, localhost.localdomain, localhost'
postconf -e 'relayhost ='
postconf -e 'smtp_tls_security_level = may'
postfix check
systemctl enable --now "php${version}-fpm" postfix
systemctl restart "php${version}-fpm" postfix
test -S /run/php/site-lead.sock
printf '%s\n' 'PHP-FPM and local Postfix ready. Next: nginx config, DNS/PTR, outbound TCP/25 and a real delivery test.'