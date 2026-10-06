#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Exercise private preparation, repeat runs, binding failures and edge syntax."""
import grp
import json
import os
from pathlib import Path
import pwd
import shutil
import socket
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from verify_gemini_v1_runtime import ConfigError, KEY_FILES, validate_runtime, validate_spring
from install_gemini_v1_gateway import verify_backend_service


class DeploymentTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.stage = Path(self.temp.name)
        self.node = self.stage / "node"
        self.node.write_text("#!/bin/sh\nprintf 'v22.22.0\\n'\n")
        self.node.chmod(0o755)
        self.user = pwd.getpwuid(os.geteuid()).pw_name
        self.group = grp.getgrgid(os.getegid()).gr_name
        self.command = [sys.executable, str(ROOT / "scripts/install_gemini_v1_gateway.py"),
                        "--repository", str(ROOT), "--node", str(self.node),
                        "--backend-port", "8787", "--user", self.user, "--group", self.group,
                        "--destination-root", str(self.stage)]
        self.runtime = self.stage / str(ROOT).lstrip("/") / "ai/gemini/gateway/.runtime"
        self.private = self.stage / "etc/skillpilot/gemini-v1"

    def run_install(self, success=True):
        result = subprocess.run(self.command, text=True, capture_output=True)
        self.assertEqual(result.returncode, 0 if success else 1, result.stdout + result.stderr)
        return result

    def test_repeat_preparation_preserves_keys_and_other_providers(self):
        existing_env = self.stage / "etc/skillpilot/skillpilot.env"
        existing_env.parent.mkdir(parents=True)
        existing_env.write_text("SPRING_CONFIG_ADDITIONAL_LOCATION=file:/etc/skillpilot/old.yml\nOTHER_PROVIDER_KEY=unchanged\n")
        prior = existing_env.read_bytes()
        first = self.run_install()
        values = {name: (self.runtime / name).read_bytes() for name in KEY_FILES}
        self.assertEqual(len(set(values.values())), 5)
        for name in (*KEY_FILES, "connection.json", "gemini-callback.txt", "DEIN-PRODUKTIONS-GEMINI-TEST.md"):
            self.assertEqual((self.runtime / name).stat().st_mode & 0o777, 0o600)
        self.assertEqual(self.runtime.stat().st_mode & 0o777, 0o700)
        second = self.run_install()
        self.assertIn("(0 updated)", second.stdout)
        self.assertEqual(values, {name: (self.runtime / name).read_bytes() for name in KEY_FILES})
        self.assertEqual(prior, existing_env.read_bytes())
        self.assertFalse((self.stage / "etc/nginx").exists())
        self.assertTrue((self.stage / "var/lib/skillpilot-gemini-acme/.well-known/acme-challenge").is_dir())
        self.assertFalse((self.private / "backups").exists())
        for secret in values.values():
            self.assertNotIn(secret.decode().strip(), first.stdout + first.stderr + second.stdout + second.stderr)
        unit = (self.stage / "etc/systemd/system/skillpilot-gemini-v1-gateway.service").read_text()
        self.assertNotIn("@REPOSITORY@", unit)
        self.assertIn("--backend-port 8787", unit)
        self.assertNotIn("\nPrivateNetwork=yes", unit)
        self.assertEqual((self.private / "gateway.env").read_text(), "GEMINI_GATEWAY_PORT=8795\nGEMINI_BACKEND_MCP_URL=http://127.0.0.1:8787/gemini/v1/mcp\n")
        spring = (self.private / "spring.yml").read_text()
        for name in ("gateway-secret", "signing-secret", "capability-secret"):
            self.assertIn(f"{name}: {json.dumps(values[name].decode().strip())}", spring)
        self.assertNotIn("datasource", spring)
        self.assertNotIn("server:", spring)

    def test_changed_gemini_artifact_gets_private_targeted_backup(self):
        self.run_install()
        target = self.private / "nginx-acme.conf"
        target.write_text("# previously installed Gemini-only bootstrap\n")
        self.run_install()
        backups = list((self.private / "backups").glob("*/*"))
        self.assertEqual(len(backups), 1)
        self.assertIn("previously installed Gemini-only", backups[0].read_text())
        self.assertEqual(backups[0].stat().st_mode & 0o777, 0o600)

    def test_wrong_origin_is_rejected_without_replacing_keys(self):
        self.run_install()
        prior = (self.runtime / "client-secret").read_bytes()
        config_file = self.runtime / "connection.json"
        config = json.loads(config_file.read_text())
        config["origin"] = "https://another-origin.example"
        config_file.write_text(json.dumps(config))
        result = self.run_install(success=False)
        self.assertIn("another origin", result.stderr)
        self.assertEqual(prior, (self.runtime / "client-secret").read_bytes())

    def test_duplicate_keys_and_wrong_spring_binding_are_rejected(self):
        self.run_install()
        client = self.runtime / "client-secret"
        original = client.read_text()
        client.write_text((self.runtime / "operator-key").read_text())
        self.assertIn("independent", self.run_install(success=False).stderr)
        client.write_text(original)
        spring = self.private / "spring.yml"
        spring.write_text(spring.read_text().replace("gateway-secret:", "wrong-secret:"))
        self.assertIn("key bindings differ", self.run_install(success=False).stderr)

    def test_unsafe_permissions_symlinks_and_changed_upstream_fail_closed(self):
        self.run_install()
        secret = self.runtime / "operator-key"
        original = secret.read_text()
        secret.chmod(0o644)
        self.assertIn("0600", self.run_install(success=False).stderr)
        secret.chmod(0o600)
        secret.unlink()
        secret.symlink_to(self.node)
        self.assertIn("regular files", self.run_install(success=False).stderr)
        secret.unlink()
        secret.write_text(original)
        secret.chmod(0o600)
        env = self.private / "gateway.env"
        env.write_text(env.read_text().replace(":8787/", ":8080/"))
        self.assertIn("configuration differs", self.run_install(success=False).stderr)

    def test_empty_callback_is_bootstrap_only_and_google_uri_is_exact(self):
        self.run_install()
        with self.assertRaisesRegex(ConfigError, "Pin the callback"):
            validate_runtime(self.runtime)
        validate_runtime(self.runtime, allow_unconfigured_callback=True)
        callback = self.runtime / "gemini-callback.txt"
        callback.write_text("https://oauth-redirect.googleusercontent.com/test-exact-callback\n")
        self.assertEqual(len(validate_runtime(self.runtime)[2]), 1)
        for uri in ("https://oauth-redirect.googleusercontent.com/*", "https://other.example/callback", "https://oauth-redirect.googleusercontent.com/callback#fragment"):
            callback.write_text(uri)
            with self.assertRaises(ConfigError):
                validate_runtime(self.runtime)
        callback.write_bytes(b"https://oauth-redirect.googleusercontent.com/first\r\nhttps://oauth-redirect.googleusercontent.com/second\r\n")
        with self.assertRaisesRegex(ConfigError, "canonical LF"):
            validate_runtime(self.runtime)

    def test_node_pin_is_checked_before_provisioning(self):
        self.node.write_text("#!/bin/sh\nprintf 'v18.0.0\\n'\n")
        self.assertIn("Node 22.22.0", self.run_install(success=False).stderr)
        self.assertFalse(self.runtime.exists())

    def test_runtime_verifier_requires_same_spring_audience_and_all_three_keys(self):
        self.run_install()
        config, keys, _callbacks = validate_runtime(self.runtime, allow_unconfigured_callback=True)
        spring = self.private / "spring.yml"
        original = spring.read_text()
        validate_spring(spring, config, keys)
        for prior, replacement in (("gateway-audience:", "wrong-audience:"),
                                   (json.dumps(keys["capability-secret"]), json.dumps("x" * 64)),
                                   ("        enabled: true", "        enabled: true\n        enabled: false")):
            spring.write_text(original.replace(prior, replacement))
            with self.assertRaises(ConfigError):
                validate_spring(spring, config, keys)
        spring.write_text(original + "server:\n  port: 9999\n")
        with self.assertRaises(ConfigError):
            validate_spring(spring, config, keys)

    def test_actual_backend_service_user_and_network_namespace_are_required(self):
        normal = f"LoadState=loaded\nUser={self.user}\nPrivateNetwork=no\nNetworkNamespacePath=\n"
        with patch("install_gemini_v1_gateway.subprocess.run", return_value=subprocess.CompletedProcess([], 0, normal)):
            verify_backend_service("skillpilot.service", os.geteuid())
        for output in (normal.replace("PrivateNetwork=no", "PrivateNetwork=yes"),
                       normal.replace("NetworkNamespacePath=", "NetworkNamespacePath=/run/netns/isolated"),
                       normal.replace("LoadState=loaded", "LoadState=not-found")):
            with patch("install_gemini_v1_gateway.subprocess.run", return_value=subprocess.CompletedProcess([], 0, output)):
                with self.assertRaises(ConfigError):
                    verify_backend_service("skillpilot.service", os.geteuid())
        with patch("install_gemini_v1_gateway.subprocess.run", return_value=subprocess.CompletedProcess([], 0, normal)):
            with self.assertRaises(ConfigError):
                verify_backend_service("skillpilot.service", os.geteuid() + 1)


class NginxSyntaxTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which("nginx") and shutil.which("openssl"), "nginx/openssl unavailable: run nginx -t before activation")
    def test_dedicated_edge_parses_and_serves_renewal_challenges_after_tls_cutover(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            certificate = base / "certificate.pem"
            key = base / "key.pem"
            subprocess.run(["openssl", "req", "-x509", "-newkey", "rsa:2048", "-nodes", "-days", "1",
                            "-subj", "/CN=mcp-gemini-v1.skillpilot.com", "-keyout", str(key), "-out", str(certificate)],
                           check=True, capture_output=True)
            webroot = base / "acme"
            challenge = webroot / ".well-known/acme-challenge/test-renewal"
            challenge.parent.mkdir(parents=True)
            challenge.write_text("controlled-renewal-proof")
            for name in ("nginx-acme.conf", "nginx-tls.conf"):
                content = (ROOT / "deploy/gemini-v1" / name).read_text()
                content = content.replace("/etc/letsencrypt/live/mcp-gemini-v1.skillpilot.com/fullchain.pem", str(certificate))
                content = content.replace("/etc/letsencrypt/live/mcp-gemini-v1.skillpilot.com/privkey.pem", str(key))
                content = content.replace("/var/lib/skillpilot-gemini-acme", str(webroot))
                # nginx -t binds listeners: test only disposable high ports.
                ports = []
                for _ in range(2):
                    with socket.socket() as listener:
                        listener.bind(("127.0.0.1", 0))
                        ports.append(listener.getsockname()[1])
                content = content.replace("listen 80;", f"listen 127.0.0.1:{ports[0]};")
                content = content.replace("listen [::]:80;", f"listen [::1]:{ports[0]};")
                content = content.replace("listen 443 ssl http2;", f"listen 127.0.0.1:{ports[1]} ssl http2;")
                content = content.replace("listen [::]:443 ssl http2;", f"listen [::1]:{ports[1]} ssl http2;")
                config = base / "nginx.conf"
                temp_paths = "\n".join(f"{kind}_temp_path {base}/{kind};" for kind in ("client_body", "proxy", "fastcgi", "uwsgi", "scgi"))
                current_user = pwd.getpwuid(os.geteuid()).pw_name
                config.write_text(f"user {current_user};\npid {base}/nginx.pid;\nerror_log {base}/error.log;\nevents {{}}\nhttp {{\naccess_log off;\n{temp_paths}\n{content}\n}}\n")
                result = subprocess.run(["nginx", "-t", "-p", str(base), "-c", str(config)], capture_output=True, text=True)
                self.assertEqual(result.returncode, 0, result.stderr)
                process = subprocess.Popen(["nginx", "-p", str(base), "-c", str(config), "-g", "daemon off;"],
                                           stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                try:
                    address = f"http://127.0.0.1:{ports[0]}"
                    deadline = time.monotonic() + 5
                    while True:
                        try:
                            response = urlopen(address + "/.well-known/acme-challenge/test-renewal", timeout=1)
                            break
                        except URLError:
                            if process.poll() is not None or time.monotonic() >= deadline:
                                self.fail("The disposable nginx edge did not become ready")
                            time.sleep(0.02)
                    with response:
                        self.assertEqual(response.read(), b"controlled-renewal-proof")
                    for path, method, expected in (("/mcp", "GET", 404),
                                                   ("/.well-known/acme-challenge/absent", "GET", 404),
                                                   ("/.well-known/acme-challenge/test-renewal", "POST", 403)):
                        with self.assertRaises(HTTPError) as error:
                            urlopen(Request(address + path, method=method), timeout=2)
                        self.assertEqual(error.exception.code, expected)
                finally:
                    process.terminate()
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait(timeout=5)

    def test_bootstrap_and_final_http_edge_keep_same_renewable_webroot(self):
        for name in ("nginx-acme.conf", "nginx-tls.conf"):
            content = (ROOT / "deploy/gemini-v1" / name).read_text()
            self.assertIn("location ^~ /.well-known/acme-challenge/ {", content)
            self.assertIn("root /var/lib/skillpilot-gemini-acme;", content)
            self.assertIn("try_files $uri =404;", content)
            self.assertIn("limit_except GET { deny all; }", content)


if __name__ == "__main__":
    unittest.main(verbosity=2)
