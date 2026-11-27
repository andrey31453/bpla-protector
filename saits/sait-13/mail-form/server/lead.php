<?php
declare(strict_types=1);

// PHP 8.1+ и cURL. Токен RuSender хранится только вне document root.
$config = require __DIR__ . '/lead-config.php';
$form = $config['form'];
$site = $config['site'];
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
header('X-Robots-Tag: noindex');

function respond(int $code, string $message): never
{
    global $form;
    http_response_code($code);
    $ok = $code === 200;
    if (str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json')) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    } else {
        header('Content-Type: text/html; charset=utf-8');
        $escape = fn(string $text): string => htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
        echo '<!doctype html><html lang="ru"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">';
        echo '<title>' . $escape($form['title']) . '</title><main><h1>' . $escape($form['title']) . '</h1>';
        echo '<p>' . $escape($message) . '</p><a href="' . $escape($form['returnUrl']) . '">' . $escape($form['back']) . '</a></main></html>';
    }
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, $form['error']);
}
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 16384) {
    respond(413, $form['error']);
}
$host = parse_url($site['baseUrl'], PHP_URL_HOST);
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array(parse_url($origin, PHP_URL_HOST), [$host, 'www.' . $host], true)) {
    respond(403, $form['error']);
}

function field(string $key, int $limit): string
{
    global $form;
    $value = $_POST[$key] ?? '';
    if (!is_string($value) || strlen($value) > $limit || preg_match('//u', $value) !== 1 || str_contains($value, "\0")) {
        respond(422, $form['error']);
    }
    return trim($value);
}

if (field('website', 500) !== '') {
    respond(422, $form['error']);
}
$name = field('name', 300);
$phone = field('phone', 100);
$comment = field('comment', 8000);
$section = field($form['hidden']['name'], 500);
$digits = preg_replace('/\D/', '', $phone);
if ($name === '' || !preg_match('/^[+\d\s()\-]+$/', $phone) || strlen($digits) < 10 || strlen($digits) > 15) {
    respond(422, $form['error']);
}

// Один запрос в минуту с IP. Не доверяем подменяемому X-Forwarded-For.
$key = hash('sha256', __DIR__ . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
$lock = fopen(sys_get_temp_dir() . '/site-lead-' . $key, 'c+');
if ($lock === false || !flock($lock, LOCK_EX)) {
    respond(503, $form['sendError']);
}
$last = (int) stream_get_contents($lock);
if ($last > time() - 60) {
    fclose($lock);
    header('Retry-After: 60');
    respond(429, $form['rateError']);
}
ftruncate($lock, 0);
rewind($lock);
fwrite($lock, (string) time());
fflush($lock);
flock($lock, LOCK_UN);
fclose($lock);

$recipient = $form['mail']['recipient'];
$sender = $form['mail']['sender'];
if (!filter_var($recipient, FILTER_VALIDATE_EMAIL) || !filter_var($sender, FILTER_VALIDATE_EMAIL)) {
    respond(503, $form['sendError']);
}
$subject = $site['brand'] . ' — ' . $form['mail']['subject'];
$body = $form['base'][0]['label'] . ': ' . $name . "\n"
    . $form['base'][1]['label'] . ': ' . $phone . "\n"
    . $form['hidden']['label'] . ': ' . $section . "\n"
    . $form['comment']['label'] . ': ' . $comment . "\n";
$tokenFile = getenv('RUSENDER_TOKEN_FILE') ?: '/etc/site-lead/rusender-token';
$token = is_readable($tokenFile) ? trim((string) file_get_contents($tokenFile)) : '';
if ($token === '' || preg_match('/[\r\n]/', $token) || !function_exists('curl_init')) {
    error_log('Site lead: RuSender token or cURL unavailable');
    respond(503, $form['sendError']);
}
$payload = json_encode(['data' => [
    'from' => ['email' => $sender, 'name' => $site['brand']],
    'to' => ['email' => $recipient],
    'subject' => $subject,
    'html' => '<pre>' . htmlspecialchars($body, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</pre>',
]], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);
// Один ключ на операцию: сетевой повтор ниже не создаёт второе письмо.
$idempotencyKey = 'lead-' . bin2hex(random_bytes(16));
$http = 0;
$error = 0;
$accepted = false;
for ($attempt = 0; $attempt < 2; $attempt++) {
    $curl = curl_init('https://api.rusender.ru/api/v1/public/emails');
    curl_setopt_array($curl, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $token,
            'Content-Type: application/json',
            'Accept: application/json',
            'Idempotency-Key: ' . $idempotencyKey,
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_SSL_VERIFYHOST => 2,
    ]);
    $response = curl_exec($curl);
    $http = (int) curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
    $error = curl_errno($curl);
    curl_close($curl);
    $decoded = is_string($response) ? json_decode($response, true) : null;
    $accepted = $http === 202 && is_array($decoded) && !empty($decoded['data']['id']);
    if ($accepted || ($error === 0 && $http < 500)) {
        break;
    }
}
if (!$accepted) {
    // Не логируем токен, тело заявки или ответ провайдера с персональными данными.
    error_log('Site lead: RuSender failed; HTTP=' . $http . '; curl=' . $error);
    respond(503, $form['sendError']);
}
respond(200, $form['success']);