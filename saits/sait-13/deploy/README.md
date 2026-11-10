# Выкладка сайта на сервер (sait-13)

Сайт — чистая статика: `./saits/build.sh sait-13` собирает `saits/sait-13/dist`,
а workflow `.github/workflows/deploy-hosting.yml` при пуше в `main` отправляет
собранное на VPS через `rsync` поверх SSH. Никакого серверного кода (PHP,
Node, базы) на сервере нет — nginx отдаёт файлы.

Что в этом каталоге:

| Файл | Назначение |
| --- | --- |
| `nginx/site.conf` | конфиг виртуального хоста: документ-рут, кеш, gzip, заголовки |
| `bootstrap.sh` | разовая подготовка VPS: пакеты, каталог, конфиг nginx, firewall |
| `README.md` | эта инструкция |

## 1. Разовая подготовка сервера

Нужен доступ по SSH на `177.177.212.73` (Debian 13). Скопировать каталог
`deploy` на сервер и запустить скрипт:

```bash
scp -r saits/sait-13/deploy root@177.177.212.73:/root/site-deploy
ssh root@177.177.212.73 'bash /root/site-deploy/bootstrap.sh'
```

Скрипт поставит nginx, rsync, curl, ufw, fail2ban, создаст `/var/www/site`,
включит конфиг и проверит, что nginx отвечает на `127.0.0.1`. Повторный запуск
безопасен. Если SSH слушает не 22-й порт — `SSH_PORT=2222 bash bootstrap.sh`,
иначе ufw закроет доступ.

После этого на сервере остаётся только выкладка — вручную туда ничего класть
не нужно.

## 2. Секреты GitHub

Репозиторий живёт на GitHub (`andrey31453/bpla-protector`), выкладку запускает
GitHub Actions, поэтому секреты — **в GitHub, не в GitLab**:
`Settings → Secrets and variables → Actions`.

- **Secret** `FORTTEX_SSH_PASSWORD` — пароль SSH-пользователя деплоя
  (`root`, пока не заведён отдельный пользователь). Имя секрета задано в
  `hosting.json` (`passwordSecret`); сменили имя — поменяйте его и в конфиге.
  Тип: именно *repository secret*, не variable — переменные видны в логах.
- **Variable** (необязательно) `SSH_KNOWN_HOSTS` — отпечаток ключа сервера:

  ```bash
  ssh-keyscan -p 22 177.177.212.73
  ```

  С ним деплой доверяет только этому ключу (`StrictHostKeyChecking=yes`) и
  падает, если ключ на сервере подменили. Без переменной ssh принимает новый
  ключ один раз (`accept-new`) — удобно на первом запуске.

Пароль в репозиторий не попадает никогда: в `hosting.json` лежит только имя
секрета. Ключ вместо пароля подключается так же: положить приватный ключ в
секрет, а в `hosting.json` заменить `passwordSecret` на `sshKeySecret` — скрипт
сам создаст временный файл с правами 600 и не будет передавать пароль.

## 3. Как выкладывается

1. Пуш в `main` (команда владельца «обнови мейн»).
2. Workflow собирает сайт с `SITE_STAGING=1` и `SITE_BASE_URL` из
   `hosting.json` (пока домен не прикреплён — это адрес по IP).
3. `saits/hosting-deploy.sh` льёт `dist/` в `/var/www/site` через
   `rsync -az --delete` и затем проверяет `curl`-ом, что адрес отвечает.
   Не ответил — деплой красный, а не «вроде выложилось».

Ручной запуск с машины разработчика:

```bash
./saits/build.sh sait-13
HOSTING_CREDENTIAL='пароль' ./saits/hosting-deploy.sh sait-13
```

## 4. Откат

Файлы на сервере — одна папка без релизов, поэтому откат делается из git:

```bash
git revert <плохой-коммит>     # в своей ветке
# затем процедура «обнови мейн» → workflow выложит предыдущее состояние
```

Аварийно, если нужно вернуть сайт прямо сейчас и без CI: `git log`, взять
предыдущий коммит, собрать его в отдельной папке и залить тем же
`hosting-deploy.sh` (или `rsync` вручную).

## 5. Переезд на домен zok.pro

Боевой адрес сайта — `https://zok.pro`. Пока A-запись не указывает на сервер,
сайт живёт по IP `http://177.177.212.73/` и закрыт от индексации
(`staging: true`). Переезд — три шага, каждый проверяемый.

**Шаг 1. DNS.** У регистратора домена: `A`-запись `zok.pro` → `177.177.212.73`
и, если нужен `www`, `A`/`CNAME` `www.zok.pro` → тот же адрес (или на `zok.pro`).
За сутки до переключения снизить TTL до 300 секунд. **MX/SPF/DKIM почты не
трогать** — почта живёт отдельно от сайта.

Проверка (ждём, пока ответит именно наш сервер):

```bash
dig +short zok.pro            # должен быть 177.177.212.73
```

**Шаг 2. nginx и сертификат.** Когда DNS уже указывает на сервер:

```bash
# на сервере
cd /root/site-deploy/nginx   # каталог, куда копировали deploy/
# 1) убрать слово default_server в двух строках listen (домен привязан)
sed -i 's/listen 80 default_server;/listen 80;/; s/listen \[::\]:80 default_server;/listen [::]:80;/' site.conf
cp site.conf /etc/nginx/sites-available/site.conf
nginx -t && systemctl reload nginx

# 2) сертификат: certbot сам допишет блок :443 и редирект с :80
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d zok.pro -d www.zok.pro
systemctl list-timers | grep certbot     # автопродление включено
```

**Шаг 3. Снять стейдж-закрытие и пересобрать.** Только после того, как
`https://zok.pro` открывается:

1. `nginx/site.conf`: удалить строку `add_header X-Robots-Tag "noindex, nofollow" always;`,
   скопировать на сервер, `nginx -t && systemctl reload nginx`.
2. `saits/sait-13/hosting.json`: `"staging": false`, строку `stagingBaseUrl`
   удалить, `publicUrl` → `"https://zok.pro/"`.
3. `src/data/site.json` — `baseUrl` уже `https://zok.pro` (canonical, OG,
   sitemap, JSON-LD берут его оттуда; на стейдже его подменяет `SITE_BASE_URL`).
4. Закоммитить и выложить («обнови мейн») — сборка без `SITE_STAGING` вернёт
   `index, follow`, открытый `robots.txt` и счётчик Метрики.

**Проверка после переезда:**

```bash
curl -I https://zok.pro/                 # 200, без X-Robots-Tag
curl -sI http://zok.pro/ | head -1       # 301 → https
curl -s https://zok.pro/robots.txt       # Allow: / и Sitemap: https://zok.pro/sitemap.xml
curl -s https://zok.pro/ | grep -o 'index, follow'   # есть
curl -s https://zok.pro/ | grep -c 'mc.yandex.ru'    # 1 или больше
```

Дальше — Яндекс.Вебмастер и Google Search Console: добавить `https://zok.pro`,
подтвердить права, отправить `https://zok.pro/sitemap.xml`.

Отдельно про почту: в контактах сайта (`src/data/site.json`, поле `email`)
теперь `zakaz@zok.pro` — адрес меняется одним полем, разметка берёт его
отовсюду (`mailto:` в шапке, подвале и форме, JSON-LD). Ящик на новом домене
нужно завести и настроить MX **до** переключения на боевой домен: пока почты
нет, письма на этот адрес будут отскакивать. Если ящик пока на старом домене —
вернуть в поле старый адрес, сайт продолжит работать.

## 6. Проверка после выкладки

```bash
curl -I http://177.177.212.73/            # 200, X-Robots-Tag: noindex
curl -s http://177.177.212.73/robots.txt  # на стейдже: Disallow: /
curl -I http://177.177.212.73/assets/…    # expires 1y
```

Пока `staging: true`, в страницах стоит `noindex, nofollow`, счётчик Метрики
не выводится, а `robots.txt` закрыт целиком — тестовый адрес не попадёт в
поиск и в статистику.
