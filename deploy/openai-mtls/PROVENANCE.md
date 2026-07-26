# OpenAI Connectors mTLS CA provenance

These certificates are the public trust anchors published by OpenAI for
ChatGPT-to-MCP mutual TLS.

Retrieved: 2026-07-26

Source documentation:

- https://developers.openai.com/plugins/build/auth#mutual-tls-mtls
- https://developers.openai.com/plugins/mtls/openai-root-ca.pem
- https://developers.openai.com/plugins/mtls/openai-connectors-mtls-ca.pem

Pinned SHA-256 digests:

- `openai-root-ca.pem`:
  `3a565b5c83c83ba2de085de28733e3c6af01af9b347322b93caf3a03d42c5cbe`
- `openai-connectors-mtls-ca.pem`:
  `7485f98dfbb7db119ca99d5748ac7a86baa73ddede878d3263a50cba2c4f6dd8`

Pinned X.509 certificate SHA-256 fingerprints (DER):

- `OpenAI-Root-CA`:
  `493d9a1edc48d558f5a28764b20605205a50e1df4840231e342f2e0e8cdd5be9`
- `OpenAI-Connectors-mTLS-CA`:
  `da3d8e2e32ee4981ea1152c1456f866c863dbde2fbf4f8eba8850df74b656816`

The installer verifies these hashes and verifies the intermediate against the
root before installing either file. The runtime verifier uses the root only as
the trust anchor, supplies this exact intermediate as the sole untrusted chain
certificate, checks its X.509 fingerprint, and requires the leaf issuer to
match it. Rotation is performed by replacing the two files from the official
URLs, reviewing their certificate constraints, updating these hashes and
fingerprints, running the edge tests, and deploying the updated bundle. Leaf
certificates are deliberately never pinned.
