# Выкладка сайта на сервер (sait-13)

Сайт — чистая статика: `./saits/build.sh sait-13` собирает `saits/sait-13/dist`,
а workflow `.github/workflows/deploy-hosting.yml` при пуше в `main` отправляет
собранное на VPS через `rsync` поверх SSH. Никакого серверного кода (PHP,
Node, базы) на сервере нет — nginx отдаёт файлы.

Что в этом каталоге:

| Файл | Назначение |
| --- | --- |
| `nginx/site.conf` | конфиг сайта: четыре серверных блока — `:80` по IP для диагностики, `:80` для `zok.pro`/`www` с редиректом на HTTPS, `:443` с сертификатом и HSTS, `:443` по умолчанию (закрывает соединение по IP) |
| `nginx/site-common.conf` | то, что общее для всех блоков: документ-рут, кэш, gzip, заголовки безопасности; подключается из `site.conf` |
| `install-tls.sh` | установка сертификата и HTTPS: проверки ключа и цепочки, файлы в `/etc/ssl/zok.pro/`, конфиг nginx с бэкапом и откатом |
| `bootstrap.sh` | разовая подготовка VPS: пакеты, документ-рут, HTTPS через `install-tls.sh`, firewall, fail2ban |
| `check-live.sh` | проверка «почему домен не открывается» снаружи: DNS, ответ по IP, HTTPS, сертификат, стейдж, canonical |
| `README.md` | эта инструкция |

## 1. Разовая подготовка сервера

Нужен доступ по SSH на `177.177.212.73` (Debian 13). Скопировать каталог
`deploy` и файлы сертификата на сервер, затем запустить скрипт:

```bash
scp -r saits/sait-13/deploy root@177.177.212.73:/root/
scp docs/ssl/zok_pro.crt docs/ssl/zok_pro.key root@177.177.212.73:/root/
ssh root@177.177.212.73 \
  'TLS_CERT=/root/zok_pro.crt TLS_KEY=/root/zok_pro.key bash /root/deploy/bootstrap.sh'
```

Сертификат и приватный ключ лежат в `docs/ssl/` и в git не попадают: каталог
перечислен в `.gitignore`, потому что репозиторий публичный. Ключ передаётся
только по `scp` и после установки удаляется с сервера (`rm /root/zok_pro.*`).

Скрипт поставит nginx, rsync, curl, openssl, ca-certificates, ufw, fail2ban,
создаст `/var/www/site`, отдаст сертификат и конфиг в `install-tls.sh` (HTTPS,
редирект с HTTP, `/etc/nginx/snippets/site-common.conf`), откроет 22/80/443,
включит автозапуск nginx и fail2ban и проверит ответы на `127.0.0.1` по HTTP и
HTTPS. Повторный запуск безопасен. Если SSH слушает не 22-й порт —
`SSH_PORT=2222 bash bootstrap.sh`, иначе ufw закроет доступ.

Без сертификата `bootstrap.sh` останавливается до установки пакетов: в конфиге
есть блок `:443`, и без файлов в `/etc/ssl/zok.pro/` проверка `nginx -t` не
пройдёт. Когда сертификат уже установлен, повторный прогон запускается без
аргументов и переустанавливает только конфиг:

```bash
ssh root@177.177.212.73 'bash /root/deploy/bootstrap.sh'
```

После этого на сервере остаётся только выкладка файлов — вручную в `/etc/nginx`
ничего не копируется.

Состояние на 17.11.2026: DNS привязан — `A` `zok.pro` и `www.zok.pro` →
`177.177.212.73` (Timeweb NS). Сертификат GlobalSign AlphaSSL выписан на
`www.zok.pro` с SAN `www.zok.pro, zok.pro`, действует
17.11.2026 – 04.06.2027. Сервер подготовлен 12.11.2026 (Debian 13, nginx,
ufw 22/80/443 и 10050 для zabbix-агента хостера, fail2ban), сайт выложен в
`/var/www/site` и `http://177.177.212.73/` отвечает 200. Осталось выполнить
`install-tls.sh` с сертификатом (раздел 5, шаг 2): до этого сервер отвечает
только по HTTP — в установленном конфиге нет блока `:443`.

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
   `hosting.json` (`stagingBaseUrl` — сейчас `https://zok.pro`).
3. `saits/hosting-deploy.sh` льёт `dist/` в `/var/www/site` через
   `rsync -az --delete` и затем проверяет `curl`-ом, что `publicUrl`
   отвечает (сейчас `https://zok.pro/`, с проверкой сертификата).
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

Боевой адрес сайта — `https://zok.pro`. Домен привязан (A → `177.177.212.73`),
HTTPS включается сертификатом GlobalSign, но сайт пока закрыт от индексации
(`staging: true`). Переезд — три шага, каждый проверяемый.

**Шаг 1. DNS — сделано 17.11.2026.** `A` `zok.pro` и `www.zok.pro` →
`177.177.212.73` (NS — `ns3/ns4/ns8.nic.ru`; раньше домен смотрел на парковку
NIC.RU `178.210.92.188`). Проверка:

```bash
dig +short zok.pro        # 177.177.212.73
dig +short www.zok.pro    # 177.177.212.73
```

**MX/SPF/DKIM почты не трогать** — почта живёт отдельно от сайта.

**Шаг 2. Сертификат и HTTPS.** Сертификат GlobalSign AlphaSSL на `zok.pro` и
`www.zok.pro` лежит в `docs/ssl/`: `zok_pro.crt` (лист + промежуточный +
самоподписанный корневой) и `zok_pro.key` (приватный ключ, в git не попадает).
Ставится одним скриптом:

```bash
scp -r saits/sait-13/deploy root@177.177.212.73:/root/
scp docs/ssl/zok_pro.crt docs/ssl/zok_pro.key root@177.177.212.73:/root/
ssh root@177.177.212.73 \
  'bash /root/deploy/install-tls.sh /root/zok_pro.crt /root/zok_pro.key'
ssh root@177.177.212.73 'rm -f /root/zok_pro.crt /root/zok_pro.key'   # ключ с сервера убрать
```

Что делает `install-tls.sh`:

- проверяет, что ключ читается, подходит к сертификату (сравнивает публичные
  части) и что в SAN есть `zok.pro` — иначе браузер покажет ошибку, и ставить
  такой сертификат незачем;
- предупреждает, если до истечения меньше 30 дней, и проверяет цепочку
  системным хранилищем (`/etc/ssl/certs/ca-certificates.crt`);
- собирает `fullchain.pem` = лист + промежуточный. Самоподписанный корневой
  сертификат из файла выбрасывается: браузеры его не используют, а лишний
  сертификат в рукопожатии только мешает;
- кладёт `/etc/ssl/zok.pro/fullchain.pem` (644) и `privkey.pem` (600 root:root);
- бэкапит прежний конфиг в `/etc/nginx/backup-<штамп>/`, ставит `site.conf` и
  `site-common.conf`, убирает заглушку `sites-enabled/default`, делает
  `nginx -t` с откатом при ошибке, включает и перезагружает nginx;
- проверяет локально через `--resolve 127.0.0.1`: `https://zok.pro/` → 200,
  `http://zok.pro/` → 301, `https://www.zok.pro/` → 301 на `zok.pro`, и
  печатает срок сертификата, который реально отдаёт nginx.

Что получается в `nginx/site.conf` (четыре блока):

| Запрос | Ответ |
| --- | --- |
| `http://177.177.212.73/` (IP, незнакомый Host) | сайт, чтобы диагностика работала и при сломанном DNS; закрыт `X-Robots-Tag: noindex` |
| `http://zok.pro/`, `http://www.zok.pro/` | 301 на `https://…`; исключение — `/.well-known/acme-challenge/` (проверка домена) |
| `https://zok.pro/` | сайт: HTTP/2, TLS 1.2/1.3, только ECDHE, HSTS на год |
| `https://www.zok.pro/` | 301 на `https://zok.pro/` — canonical один |
| `https://177.177.212.73/` и чужой Host | 444, nginx закрывает соединение: сертификата на IP нет, дубль контента не нужен |

Повторный запуск без аргументов переустанавливает только конфиг — так
применяются правки `nginx/site.conf` и `nginx/site-common.conf` из репозитория
(сертификат остаётся прежним).

Откат конфига, если что-то пошло не так:

```bash
ls -d /etc/nginx/backup-*                     # найти свежий бэкап
cp /etc/nginx/backup-<штамп>/site.conf /etc/nginx/sites-available/site.conf
nginx -t && systemctl reload nginx
```

### Продление сертификата

Сертификат годовой (до 04.06.2027) и **не продлевается автоматически** — это
не Let's Encrypt, срок продлевает человек:

1. Выпустить у GlobalSign новый сертификат на те же имена (`zok.pro`,
   `www.zok.pro`) — при других именах `install-tls.sh` откажется ставить.
2. Повторить шаг 2 с новыми `zok_pro.crt` / `zok_pro.key`.
3. Проверить: `./saits/sait-13/deploy/check-live.sh` — блок «3a. Сертификат»
   печатает subject, срок и полноту цепочки. За 30 дней до истечения он
   начинает ругаться, так что дату не пропустить.

Если позже понадобится автопродление — в конфиге уже оставлен открытым
`/.well-known/acme-challenge/` (`root /var/www/acme`, каталог создаёт
`install-tls.sh`), поэтому переезд на Let's Encrypt не останавливает сайт:
`certbot certonly --webroot -w /var/www/acme -d zok.pro -d www.zok.pro`, затем
в `site.conf` заменить пути `ssl_certificate` / `ssl_certificate_key` на
`/etc/letsencrypt/live/zok.pro/fullchain.pem` и `privkey.pem`, переустановить
конфиг (`install-tls.sh` без аргументов) и проверить
`systemctl list-timers | grep certbot`.

**Шаг 3. Снять стейдж-закрытие и пересобрать.** Только после того, как
`https://zok.pro` открывается:

1. `nginx/site-common.conf`: удалить строку
   `add_header X-Robots-Tag "noindex, nofollow" always;`, затем на сервере
   применить правки без аргументов: `bash /root/deploy/install-tls.sh` (он
   сделает бэкап, `nginx -t`, reload).
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
curl -sI https://www.zok.pro/ | head -1  # 301 → https://zok.pro/
curl -s https://zok.pro/robots.txt       # Allow: / и Sitemap: https://zok.pro/sitemap.xml
curl -s https://zok.pro/ | grep -o 'index, follow'   # есть
curl -s https://zok.pro/ | grep -c 'mc.yandex.ru'    # 1 или больше
./saits/sait-13/deploy/check-live.sh     # «Всё на месте», код выхода 0
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
curl -sI https://zok.pro/ | head -1       # 200, Strict-Transport-Security
curl -s http://177.177.212.73/robots.txt  # на стейдже: Disallow: /
curl -I https://zok.pro/assets/…          # expires 1y
curl -sI https://177.177.212.73/ -k       # соединение сбрасывается: по IP сайта нет
```

Пока `staging: true`, в страницах стоит `noindex, nofollow`, счётчик Метрики
не выводится, а `robots.txt` закрыт целиком — тестовый адрес не попадёт в
поиск и в статистику.

## 7. Диагностика: почему домен не открывается

Одна команда проверяет всю цепочку снаружи — без доступа к серверу и без
паролей (только `dig`/`curl`/`node`):

```bash
./saits/sait-13/deploy/check-live.sh
```

Скрипт берёт адрес сервера и режим из `hosting.json`, домен — из
`src/data/site.json`, и печатает шесть блоков: `[ok]` — в порядке, `[!]` — на
что посмотреть, `[FAIL]` — сломано (код выхода 1). Адреса в скрипте не зашиты:
поменяли домен или сервер — правится только конфиг.

Порядок, в котором домен «включается» (каждый шаг проверяется тем же скриптом):

1. **Сделано 17.11.2026:** `A`-запись `zok.pro` и `www.zok.pro` →
   `177.177.212.73` (раздел 5, шаг 1).
2. **Сделано 12.11.2026:** `bootstrap.sh` на сервере — nginx, firewall 80/443,
   документ-рут, fail2ban (раздел 1).
3. **Сделано 12.11.2026:** выкладка сайта — `./saits/hosting-deploy.sh sait-13`,
   `http://177.177.212.73/` отвечает 200 (раздел 3). В общем случае её делает
   workflow из `main` после команды «обнови мейн».
4. **Осталось:** `install-tls.sh` с сертификатом GlobalSign (раздел 5, шаг 2),
   затем `staging: false`, `publicUrl` → `https://zok.pro/`, снять
   `X-Robots-Tag` и пересобрать (раздел 5, шаг 3).

Когда все четыре шага пройдены, `check-live.sh` печатает «Всё на месте» и
выходит с кодом 0.

Что означают типовые ответы:

| Что показывает проверка | Причина | Что делать |
| --- | --- | --- |
| `22-й порт не отвечает` / `ssh: connect … Operation timed out` | сервер выключен, недоступен по сети или его адрес изменился | проверить в панели хостера, что VPS запущен и адрес тот же; связаться с поддержкой, если недоступен весь сервер |
| `A-запись zok.pro = 178.210.92.188, а сервер — 177.177.212.73` | домен смотрит на парковку регистратора, а не на сервер | `A zok.pro` → `177.177.212.73` в панели регистратора, подождать TTL (раздел 5, шаг 1) |
| `http://177.177.212.73/ не отвечает` | 80-й порт закрыт или nginx не запущен: сервер ещё не готовили | `bootstrap.sh` на сервере (раздел 1) |
| `https://177.177.212.73/ не отвечает` / `отвечает 444` | сертификата на IP нет — и получить его нельзя, удостоверяющие центры не выдают сертификаты на адреса | это норма, а не поломка: по IP сайт закрыт намеренно, HTTPS работает только для домена (раздел 5, шаг 2) |
| `http://177.177.212.73/ отдаёт 404` | nginx работает, но в `/var/www/site` нет `index.html` | выкладка: workflow `deploy-hosting.yml` или `./saits/hosting-deploy.sh sait-13` (раздел 3) |
| `https://zok.pro/ не открывается` | либо DNS ещё не на сервере, либо сертификат не установлен | сначала DNS, затем `bash /root/deploy/install-tls.sh /root/zok_pro.crt /root/zok_pro.key` (раздел 5, шаг 2) |
| `сертификат не покрывает zok.pro` | на сервере чужой или неполный файл: в SAN нет домена | поставить сертификат из `docs/ssl/` через `install-tls.sh` — он проверяет SAN до установки и откажется ставить неподходящий |
| `сертификат истекает … (меньше 30 дней)` | срок годового сертификата кончается, автопродления нет | перевыпустить у GlobalSign и повторить `install-tls.sh` (раздел 5, «Продление сертификата») |
| `сервер отдаёт только лист без промежуточного сертификата` | в `/etc/ssl/zok.pro/fullchain.pem` нет промежуточного сертификата | переустановить: `install-tls.sh` собирает полную цепочку сам |
| `scp: Connection closed` / `lost connection` при копировании | канал до сервера с потерями пакетов: SFTP-сессия `scp` не выживает | передать потоком через ssh: `tar czf - -C saits/sait-13 deploy \| ssh root@177.177.212.73 'tar xzf - -C /root'` и `cat docs/ssl/zok_pro.crt \| ssh root@177.177.212.73 'cat > /root/zok_pro.crt'` |
| `http://zok.pro/ — код 200 (ожидался 301)` сразу после установки, а вручную уже 301 | `systemctl reload nginx` вернул управление раньше, чем новые воркеры подхватили конфиг: это гонка, а не поломка (в скрипте проверка идёт с повторами) | перезапустить `bash /root/deploy/install-tls.sh` без аргументов или проверить вручную: `curl -sI --resolve zok.pro:80:127.0.0.1 http://zok.pro/` |
| `X-Robots-Tag нет, а staging: true` | на сервере лежит `site-common.conf` без этой строки | применить конфиг из репозитория: `bash /root/deploy/install-tls.sh` (раздел 5, шаг 3) |
| `canonical = …, а боевой адрес — https://zok.pro/` | сборка шла с `SITE_BASE_URL` стейджа или со старым доменом | пересобрать без `SITE_STAGING` («обнови мейн» после `staging: false`) |

Про ошибку из логов CI вида
`[deploy] sait-13 → ftps://isp.arbat.pro:21/web` / `open: isp.arbat.pro: Name or
service not known`: это предыдущая схема выкладки (FTPS на прошлый хостинг),
которая осталась в ветке `main`. Того хостинга больше нет — имя
`isp.arbat.pro` не резолвится, а старый домен `forttex.ru` (`62.118.185.118`)
не отвечает по 80-му порту. Если такая строка в логе появилась, значит
собирался старый `hosting.json`: нужная версия (rsync по SSH на
`177.177.212.73`) лежит в ветке с переездом, её надо провести в `develop`, а
затем выложить в `main` командой «обнови мейн». Правки в самом `hosting.json`
уже не нужны — сверять надо ветку, из которой идёт деплой:

```bash
git show origin/main:saits/sait-13/hosting.json | grep -E '"(transport|host)"'
# ожидается: "transport": "ssh" и "host": "177.177.212.73"
```

