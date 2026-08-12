# OpenAI Connectors mTLS CA provenance

These public CA certificates are published by OpenAI for client authentication
when ChatGPT connects to an MCP server. They were retrieved and revalidated on
2026-08-12 from the official HTTPS endpoints:

- Documentation: <https://developers.openai.com/plugins/build/auth#mutual-tls-mtls>
- Root CA: <https://developers.openai.com/plugins/mtls/openai-root-ca.pem>
- Connectors intermediate CA:
  <https://developers.openai.com/plugins/mtls/openai-connectors-mtls-ca.pem>

Pinned source-file SHA-256 digests:

- `openai-root-ca.pem`:
  `3a565b5c83c83ba2de085de28733e3c6af01af9b347322b93caf3a03d42c5cbe`
- `openai-connectors-mtls-ca.pem`:
  `7485f98dfbb7db119ca99d5748ac7a86baa73ddede878d3263a50cba2c4f6dd8`

Pinned X.509 SHA-256 fingerprints over DER:

- `OpenAI-Root-CA`:
  `493d9a1edc48d558f5a28764b20605205a50e1df4840231e342f2e0e8cdd5be9`
- `OpenAI-Connectors-mTLS-CA`:
  `da3d8e2e32ee4981ea1152c1456f866c863dbde2fbf4f8eba8850df74b656816`

The root is valid from 2026-03-19 through 2036-03-17. The intermediate is
valid from 2026-03-19 through 2031-03-19 and chains directly to this root. The
installer and verifier check both fingerprints and that chain before use.
Every static, staged, preflight, installed, and deployment-runtime gate also
requires both CA certificates to remain valid for at least 90 days
(`openssl x509 -checkend 7776000`). Crossing that threshold requires a reviewed
CA refresh before another rollout; it never triggers an automatic download.

The verifier never pins an OpenAI leaf certificate. It requires each presented
leaf to chain through the pinned intermediate to the pinned root, to be valid
for TLS client authentication, and to contain exactly the DNS SAN
`mtls.prod.connectors.openai.com`.

## Rotation

CA rotation is a reviewed release operation, not a live startup download:

1. Download both files from the official URLs above over verified HTTPS.
2. Inspect their CA constraints, validity, subjects, issuers, and key usage.
3. Verify the intermediate against the root.
4. Replace the repository files and update both source hashes and DER
   fingerprints in this file, the installer, verifier, and verification script.
5. Run the hermetic verifier suite and static edge verification.
6. Install the reviewed bundle, restart the local verifier, validate Nginx,
   reload it, and execute the public negative plus real-ChatGPT positive smoke.

If OpenAI publishes overlapping old and new trust chains, plan an explicit
dual-trust cutover. Do not silently fetch or trust a new CA in production.
