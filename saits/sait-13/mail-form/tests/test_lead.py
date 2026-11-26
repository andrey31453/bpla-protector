"""Integration checks against PHP with a local mail stub; no external mail."""
import hashlib
import sys
import json
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
    stub = temp / "sendmail"
    stub.write_text(f'#!/bin/sh\ncat > "{capture}"\ntest ! -f "{fail}"\n')
    stub.chmod(0o700)
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    server = subprocess.Popen(
        ["php", "-d", f"sys_temp_dir={temp}", "-d", f"sendmail_path={stub}", "-S", f"127.0.0.1:{port}", "-t", str(temp)],
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
        valid = {"name": "Тест", "phone": "+7 (999) 123-45-67", "comment": "Проверка", compiled['form']['hidden']['name']: "Мосты"}
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
        message = capture.read_text()
        config = json.loads((root / "config/form.json").read_text())
        assert config["mail"]["recipient"] in message
        assert f"From: {config['mail']['senderLocalPart']}@{host}" in message
        import base64
        payload = message.replace("\r\n", "\n").split("\n\n", 1)[1]
        decoded = base64.b64decode(payload).decode()
        assert "Тест" in decoded and "Мосты" in decoded and valid["phone"] in decoded
        assert request(valid)[0] == 429
        lock.unlink()
        fail.touch()
        code, body = request(valid)
        assert code == 503 and json.loads(body)["ok"] is False
        lock.unlink()
        fail.unlink()
        code, body = request(valid, accept="text/html")
        assert code == 200 and '<html lang="ru">' in body and config['returnUrl'] in body
        print("PHP integration: validation, honeypot, origin, size, mail payload, rate limit, mail failure, no-JS response — PASS")
    finally:
        server.terminate()
        server.wait(timeout=5)
        lock.unlink(missing_ok=True)