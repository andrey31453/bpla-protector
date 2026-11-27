"""Integration checks with namespaced cURL stubs; never contacts RuSender."""
import hashlib
import sys
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request


root = Path(__file__).resolve().parents[1]
api = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else None
with tempfile.TemporaryDirectory(prefix="lead-test-") as directory:
    temp = Path(directory).resolve()
    if api:
        shutil.copytree(api, temp / "api")
    else:
        subprocess.run(['node', str(root / 'build.mjs'), str(root / 'config/site.example.json'), str(temp)], check=True)
    compiled = json.loads(subprocess.check_output([
        'php', '-r', 'echo json_encode(require $argv[1]);', str(temp / 'api/lead-config.php')
    ]))
    origin = compiled['site']['baseUrl']
    host = urllib.parse.urlparse(origin).hostname
    capture = temp / "message"
    fail = temp / "fail"
    token = temp / 'token'
    token.write_text('test-token-not-a-secret')
    # Namespace overrides transport only in the temporary copy, never in production.
    handler = temp / 'api/lead.php'
    handler.write_text(handler.read_text().replace('declare(strict_types=1);', '''declare(strict_types=1);
namespace LeadTest;
function curl_init($url) { return (object) ['url' => $url, 'options' => []]; }
function curl_setopt_array($curl, $options) { $curl->options = $options; return true; }
function curl_exec($curl) {
    file_put_contents(getenv('CAPTURE'), json_encode(['url' => $curl->url, 'options' => $curl->options]) . "\\n", FILE_APPEND);
    return file_exists(getenv('FAIL')) ? '{"error":{"code":"DENIED"}}' : '{"data":{"id":"test-id"}}';
}
function curl_getinfo($curl, $option) { return file_exists(getenv('FAIL')) ? 503 : 202; }
function curl_errno($curl) { return 0; }
function curl_close($curl) {}
'''))
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    server = subprocess.Popen(
        ["php", "-d", f"sys_temp_dir={temp}", "-S", f"127.0.0.1:{port}", "-t", str(temp)],
        env={**os.environ, 'RUSENDER_TOKEN_FILE': str(token), 'CAPTURE': str(capture), 'FAIL': str(fail)},
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    url = f"http://127.0.0.1:{port}/api/lead.php"
    lock_key = hashlib.sha256((str(temp / "api") + "127.0.0.1").encode()).hexdigest()
    lock = temp / f"site-lead-{lock_key}"

    def request(data=None, accept="application/json", origin=None):
        headers = {"Accept": accept}
        if origin:
            headers["Origin"] = origin
        req = urllib.request.Request(url, data=None if data is None else urllib.parse.urlencode(data).encode(), headers=headers)
        try:
            response = urllib.request.urlopen(req, timeout=5)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            return response.status, response.read().decode()

    try:
        for _ in range(50):
            try:
                request()
                break
            except urllib.error.URLError:
                time.sleep(0.1)
        valid = {"name": "Тест", "phone": "+7 (999) 123-45-67", "comment": "Проверка <script>alert(1)</script>", compiled['form']['hidden']['name']: "Мосты"}
        assert request()[0] == 405
        assert request({})[0] == 422
        assert request({**valid, "phone": "123"})[0] == 422
        assert request({**valid, "name[]": "bad", "name": ""})[0] == 422
        assert request({**valid, "website": "spam"})[0] == 422
        assert request({**valid, "comment": "a" * 9000})[0] == 422
        assert request({**valid, "comment": "a" * 17000})[0] == 413
        assert request(valid, origin="https://evil.example")[0] == 403
        assert not capture.exists(), "Invalid requests must not invoke mail"
        code, body = request(valid, origin=origin)
        assert code == 200 and json.loads(body)["ok"] is True
        message = json.loads(capture.read_text().splitlines()[0])
        config = json.loads((root / "config/form.json").read_text())
        assert message['url'] == 'https://api.rusender.ru/api/v1/public/emails'
        options = message['options']
        payload = next(json.loads(v) for v in options.values() if isinstance(v, str) and v.startswith('{"data":'))['data']
        headers = next(v for v in options.values() if isinstance(v, list))
        assert 'Authorization: Bearer test-token-not-a-secret' in headers
        assert any(h.startswith('Idempotency-Key: lead-') for h in headers)
        assert payload['to']['email'] == config['mail']['recipient']
        assert payload['from']['email'] == 'info@zok.pro'
        decoded = payload['html']
        assert "Тест" in decoded and "Мосты" in decoded and valid["phone"] in decoded
        assert '<script>' not in decoded and '&lt;script&gt;' in decoded
        assert request(valid)[0] == 429
        lock.unlink()
        fail.touch()
        code, body = request(valid)
        assert code == 503 and json.loads(body)["ok"] is False
        retries = [json.loads(line) for line in capture.read_text().splitlines()[-2:]]
        assert retries[0] == retries[1], 'Retry must preserve payload and idempotency key'
        lock.unlink()
        fail.unlink()
        code, body = request(valid, accept="text/html")
        assert code == 200 and '<html lang="ru">' in body and config['returnUrl'] in body
        lock.unlink()
        token.unlink()
        assert request(valid)[0] == 503
        print("PHP integration: validation, RuSender payload/auth, stable retry key, missing token, API failure, no-JS — PASS")
    finally:
        server.terminate()
        server.wait(timeout=5)
        lock.unlink(missing_ok=True)