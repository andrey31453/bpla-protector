<?php
declare(strict_types=1);

// PHP 8.1+, обычный mail() и локальный MTA. См. ../README.md.
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
$sender = $form['mail']['senderLocalPart'] . '@' . $host;
if (!filter_var($recipient, FILTER_VALIDATE_EMAIL) || !filter_var($sender, FILTER_VALIDATE_EMAIL)) {
    respond(503, $form['sendError']);
}
$subject = '=?UTF-8?B?' . base64_encode($site['brand'] . ' — ' . $form['mail']['subject']) . '?=';
$body = $form['base'][0]['label'] . ': ' . $name . "\n"
    . $form['base'][1]['label'] . ': ' . $phone . "\n"
    . $form['hidden']['label'] . ': ' . $section . "\n"
    . $form['comment']['label'] . ': ' . $comment . "\n";
$headers = [
    'From' => $sender,
    'MIME-Version' => '1.0',
    'Content-Type' => 'text/plain; charset=UTF-8',
    'Content-Transfer-Encoding' => 'base64',
];
if (!@mail($recipient, $subject, chunk_split(base64_encode($body)), $headers)) {
    error_log('Site lead: mail transport rejected message');
    respond(503, $form['sendError']);
}
respond(200, $form['success']);