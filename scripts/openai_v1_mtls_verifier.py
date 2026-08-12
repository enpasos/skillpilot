#!/usr/bin/env python3
"""Loopback-only OpenAI client-certificate verifier for the V1 MCP edge."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import hashlib
import http.server
import ipaddress
import os
from pathlib import Path
import ssl
import subprocess
import sys
import tempfile
import threading
from urllib.parse import unquote


EXPECTED_SAN = "mtls.prod.connectors.openai.com"
EXPECTED_ROOT_CERT_SHA256 = (
    "493d9a1edc48d558f5a28764b20605205a50e1df4840231e342f2e0e8cdd5be9"
)
EXPECTED_INTERMEDIATE_CERT_SHA256 = (
    "da3d8e2e32ee4981ea1152c1456f866c863dbde2fbf4f8eba8850df74b656816"
)
MODES = frozenset({"observe", "enforce"})
CLASSIFICATION_VERIFIED = "VERIFIED"
CLASSIFICATION_OBSERVE_NO_CERT = "OBSERVE_NO_CERT"
CLASSIFICATION_LOCAL_OPERATOR = "LOCAL_OPERATOR"
CLIENT_AUTH_EKU_LABEL = "TLS Web Client Authentication"
MAX_CERTIFICATE_HEADER_BYTES = 32 * 1024
MAX_CONCURRENT_REQUESTS = 8
CLIENT_READ_TIMEOUT_SECONDS = 5
OPENSSL_TIMEOUT_SECONDS = 3

MODE_HEADER = "X-SkillPilot-OpenAI-mTLS-Mode"
REMOTE_ADDRESS_HEADER = "X-SkillPilot-OpenAI-mTLS-Remote-Addr"
CLIENT_VERIFY_HEADER = "X-SkillPilot-OpenAI-mTLS-Client-Verify"
CLIENT_CERTIFICATE_HEADER = "X-SkillPilot-OpenAI-mTLS-Client-Cert"
CLASSIFICATION_HEADER = "X-SkillPilot-OpenAI-mTLS-Classification"
SAN_HEADER = "X-SkillPilot-OpenAI-mTLS-SAN"


@dataclass(frozen=True)
class Decision:
    accepted: bool
    classification: str | None
    reason: str


class CertificateVerifier:
    """Validate a leaf against the pinned OpenAI root and intermediate."""

    def __init__(
        self,
        root_ca: Path,
        intermediate_ca: Path,
        openssl: str = "openssl",
        expected_root_fingerprint: str = EXPECTED_ROOT_CERT_SHA256,
        expected_intermediate_fingerprint: str = EXPECTED_INTERMEDIATE_CERT_SHA256,
    ) -> None:
        self.root_ca = root_ca
        self.intermediate_ca = intermediate_ca
        self.openssl = openssl
        self._require_fingerprint(root_ca, expected_root_fingerprint)
        self._require_fingerprint(intermediate_ca, expected_intermediate_fingerprint)

        root_chain = self._run(
            "verify",
            "-trusted",
            str(root_ca),
            "-no-CApath",
            "-no-CAstore",
            "-x509_strict",
            str(root_ca),
        )
        if root_chain.returncode != 0:
            raise ValueError("the pinned root certificate does not verify itself")

        intermediate_chain = self._run(
            "verify",
            "-trusted",
            str(root_ca),
            "-no-CApath",
            "-no-CAstore",
            "-x509_strict",
            str(intermediate_ca),
        )
        if intermediate_chain.returncode != 0:
            raise ValueError("the pinned intermediate does not chain to the pinned root")

        self.intermediate_subject = self._certificate_name(
            intermediate_ca,
            "-subject",
        )
        if not self.intermediate_subject:
            raise ValueError("the pinned intermediate subject could not be read")

    def verify_leaf(self, certificate_pem: str) -> tuple[bool, str]:
        certificate_bytes = certificate_pem.encode("utf-8")
        if (
            not certificate_pem
            or len(certificate_bytes) > MAX_CERTIFICATE_HEADER_BYTES
            or certificate_pem.count("-----BEGIN CERTIFICATE-----") != 1
            or certificate_pem.count("-----END CERTIFICATE-----") != 1
        ):
            return False, "missing_or_malformed_leaf"

        with tempfile.NamedTemporaryFile(
            mode="w",
            encoding="utf-8",
            suffix=".pem",
            delete=False,
        ) as handle:
            handle.write(certificate_pem)
            leaf_path = Path(handle.name)
        os.chmod(leaf_path, 0o600)

        try:
            chain = self._run(
                "verify",
                "-purpose",
                "sslclient",
                "-trusted",
                str(self.root_ca),
                "-no-CApath",
                "-no-CAstore",
                "-x509_strict",
                "-untrusted",
                str(self.intermediate_ca),
                "-show_chain",
                str(leaf_path),
            )
            if chain.returncode != 0:
                return False, "invalid_chain_or_client_purpose"

            if self._certificate_name(leaf_path, "-issuer") != self.intermediate_subject:
                return False, "unexpected_intermediate"

            extended_key_usage = self._run(
                "x509",
                "-in",
                str(leaf_path),
                "-noout",
                "-ext",
                "extendedKeyUsage",
            )
            if (
                extended_key_usage.returncode != 0
                or CLIENT_AUTH_EKU_LABEL not in extended_key_usage.stdout
            ):
                return False, "missing_client_auth_eku"

            subject_alt_name = self._run(
                "x509",
                "-in",
                str(leaf_path),
                "-noout",
                "-ext",
                "subjectAltName",
            )
            if subject_alt_name.returncode != 0:
                return False, "missing_san"
            dns_names = self._dns_san_names(subject_alt_name.stdout)
            if dns_names != {EXPECTED_SAN}:
                return False, "unexpected_san"

            return True, "verified"
        except (OSError, subprocess.SubprocessError, UnicodeError):
            return False, "verification_error"
        finally:
            leaf_path.unlink(missing_ok=True)

    @staticmethod
    def certificate_fingerprint(certificate: Path) -> str:
        pem = certificate.read_text(encoding="utf-8")
        der = ssl.PEM_cert_to_DER_cert(pem)
        return hashlib.sha256(der).hexdigest()

    @staticmethod
    def _dns_san_names(output: str) -> set[str]:
        lines = [line.strip() for line in output.splitlines() if line.strip()]
        payload = [
            line
            for line in lines
            if not line.startswith("X509v3 Subject Alternative Name")
        ]
        entries = [
            entry.strip() for entry in ",".join(payload).split(",") if entry.strip()
        ]
        return {entry.removeprefix("DNS:") for entry in entries if entry.startswith("DNS:")}

    def _require_fingerprint(self, certificate: Path, expected: str) -> None:
        try:
            actual = self.certificate_fingerprint(certificate)
        except (OSError, ValueError, UnicodeError) as exception:
            raise ValueError(f"cannot read certificate {certificate}") from exception
        normalized_expected = expected.lower().replace(":", "")
        if actual != normalized_expected:
            raise ValueError(
                f"unexpected certificate fingerprint for {certificate}: {actual}"
            )

    def _certificate_name(self, certificate: Path, selector: str) -> str:
        result = self._run(
            "x509",
            "-in",
            str(certificate),
            "-noout",
            selector,
            "-nameopt",
            "RFC2253",
        )
        if result.returncode != 0 or "=" not in result.stdout:
            return ""
        return result.stdout.strip().split("=", 1)[1]

    def _run(self, *arguments: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [self.openssl, *arguments],
            check=False,
            capture_output=True,
            text=True,
            timeout=OPENSSL_TIMEOUT_SECONDS,
        )


class MtlsDecisionEngine:
    def __init__(self, certificate_verifier: CertificateVerifier) -> None:
        self.certificate_verifier = certificate_verifier

    def decide(
        self,
        mode: str,
        remote_address: str,
        nginx_client_verify: str,
        escaped_certificate: str,
    ) -> Decision:
        if mode not in MODES:
            return Decision(False, None, "invalid_mode")

        try:
            peer_address = ipaddress.ip_address(remote_address)
        except ValueError:
            return Decision(False, None, "invalid_remote_address")

        if nginx_client_verify == "SUCCESS":
            certificate, decode_reason = self._decode_certificate(escaped_certificate)
            if decode_reason:
                return Decision(False, None, decode_reason)
            accepted, reason = self.certificate_verifier.verify_leaf(certificate)
            if not accepted:
                return Decision(False, None, reason)
            return Decision(True, CLASSIFICATION_VERIFIED, "verified")

        if nginx_client_verify == "NONE":
            if escaped_certificate:
                return Decision(False, None, "certificate_present_without_tls_success")
            if mode == "observe":
                return Decision(
                    True,
                    CLASSIFICATION_OBSERVE_NO_CERT,
                    "observe_without_certificate",
                )
            if peer_address.is_loopback:
                return Decision(
                    True,
                    CLASSIFICATION_LOCAL_OPERATOR,
                    "local_operator_without_certificate",
                )
            return Decision(False, None, "certificate_required")

        # This covers every nginx FAILED:* value and unknown/malformed values.
        return Decision(False, None, "nginx_certificate_verification_failed")

    @staticmethod
    def _decode_certificate(value: str) -> tuple[str, str | None]:
        if not value or len(value.encode("utf-8")) > MAX_CERTIFICATE_HEADER_BYTES:
            return "", "missing_or_oversized_certificate_header"
        try:
            decoded = unquote(value, encoding="utf-8", errors="strict")
        except UnicodeError:
            return "", "malformed_certificate_encoding"
        if len(decoded.encode("utf-8")) > MAX_CERTIFICATE_HEADER_BYTES:
            return "", "missing_or_oversized_certificate_header"
        return decoded, None


class VerificationHandler(http.server.BaseHTTPRequestHandler):
    engine: MtlsDecisionEngine

    def do_GET(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API
        if self.path != "/verify":
            self._respond(404, None, "not_found")
            return
        try:
            actual_peer = ipaddress.ip_address(self.client_address[0])
        except ValueError:
            self._respond(403, None, "non_loopback_caller")
            return
        if not actual_peer.is_loopback:
            self._respond(403, None, "non_loopback_caller")
            return

        required = {
            MODE_HEADER: self._single_header(MODE_HEADER),
            REMOTE_ADDRESS_HEADER: self._single_header(REMOTE_ADDRESS_HEADER),
            CLIENT_VERIFY_HEADER: self._single_header(CLIENT_VERIFY_HEADER),
        }
        if any(value is None for value in required.values()):
            self._respond(403, None, "missing_or_duplicate_contract_header")
            return
        certificate_headers = self.headers.get_all(CLIENT_CERTIFICATE_HEADER, [])
        if len(certificate_headers) > 1:
            self._respond(403, None, "duplicate_certificate_header")
            return

        decision = self.engine.decide(
            required[MODE_HEADER] or "",
            required[REMOTE_ADDRESS_HEADER] or "",
            required[CLIENT_VERIFY_HEADER] or "",
            certificate_headers[0] if certificate_headers else "",
        )
        self._respond(
            204 if decision.accepted else 403,
            decision.classification,
            decision.reason,
        )

    def do_POST(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API
        self._respond(405, None, "method_not_allowed")

    def _single_header(self, name: str) -> str | None:
        values = self.headers.get_all(name, [])
        return values[0] if len(values) == 1 else None

    def _respond(
        self,
        status: int,
        classification: str | None,
        reason: str,
    ) -> None:
        self.send_response(status)
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", "0")
        if classification is not None:
            self.send_header(CLASSIFICATION_HEADER, classification)
            if classification == CLASSIFICATION_VERIFIED:
                self.send_header(SAN_HEADER, EXPECTED_SAN)
        self.end_headers()
        decision = "accept" if 200 <= status < 300 else "reject"
        print(
            f"openai_v1_mtls decision={decision} status={status} reason={reason}",
            flush=True,
        )

    def log_message(self, format_string: str, *args: object) -> None:
        # The bounded decision log above is sufficient. Never log request headers.
        return


class LoopbackThreadingHTTPServer(http.server.ThreadingHTTPServer):
    daemon_threads = True
    allow_reuse_address = True

    def __init__(self, server_address: tuple[str, int], handler: type[http.server.BaseHTTPRequestHandler]) -> None:
        self._request_slots = threading.BoundedSemaphore(MAX_CONCURRENT_REQUESTS)
        super().__init__(server_address, handler)

    def get_request(self) -> tuple[object, tuple[str, int]]:
        request, client_address = super().get_request()
        request.settimeout(CLIENT_READ_TIMEOUT_SECONDS)
        return request, client_address

    def process_request(self, request: object, client_address: tuple[str, int]) -> None:
        if not self._request_slots.acquire(blocking=False):
            self.shutdown_request(request)
            return
        try:
            super().process_request(request, client_address)
        except BaseException:
            self._request_slots.release()
            raise

    def process_request_thread(self, request: object, client_address: tuple[str, int]) -> None:
        try:
            super().process_request_thread(request, client_address)
        finally:
            self._request_slots.release()


def parse_args(arguments: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--listen", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8792)
    parser.add_argument("--root-ca", required=True, type=Path)
    parser.add_argument("--intermediate-ca", required=True, type=Path)
    parser.add_argument("--openssl", default="openssl")
    args = parser.parse_args(arguments)

    try:
        listen_address = ipaddress.ip_address(args.listen)
    except ValueError:
        parser.error("--listen must be a numeric loopback address")
    if not listen_address.is_loopback:
        parser.error("the verifier may bind only to loopback")
    if not 1 <= args.port <= 65535:
        parser.error("--port must be between 1 and 65535")
    if not args.root_ca.is_file():
        parser.error(f"root CA not found: {args.root_ca}")
    if not args.intermediate_ca.is_file():
        parser.error(f"intermediate CA not found: {args.intermediate_ca}")
    return args


def main(arguments: list[str] | None = None) -> int:
    args = parse_args(arguments)
    try:
        certificate_verifier = CertificateVerifier(
            args.root_ca,
            args.intermediate_ca,
            args.openssl,
        )
    except (OSError, subprocess.SubprocessError, ValueError) as exception:
        print(f"verifier startup failed: {exception}", file=sys.stderr)
        return 2

    VerificationHandler.engine = MtlsDecisionEngine(certificate_verifier)
    server = LoopbackThreadingHTTPServer((args.listen, args.port), VerificationHandler)
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
