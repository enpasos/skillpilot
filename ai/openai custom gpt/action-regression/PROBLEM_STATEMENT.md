# Problem statement

Since approximately the GPT-5.6 rollout, the existing SkillPilot Custom GPT appears to reach the SkillPilot server successfully but does not reliably continue from, or act on, the returned Action response.

The production coach flow includes authentication, sessions, curriculum data, larger schemas, complex instructions, and multiple operations. The regression endpoint therefore lives in the same real Spring Boot deployment, but its handler is deliberately independent of that application logic: it uses no authentication, database, learner data, RAG, or domain service.

This package tests one observable question:

> Does the Custom GPT Action flow preserve fresh values from a successful HTTP 200 JSON response into the immediately following Action call?

The public endpoint returns unpredictable values and a server-verifiable HMAC prefix. Those values do not occur in the GPT instructions, imported OpenAPI document, user prompt, or static examples. The following Action submits them to a stateless verifier. Structured backend events bind response and request bodies to timestamps, request IDs, hashes, one `probe_id`, and the active process key fingerprint.

The direct public control establishes that the real referenced endpoint accepts the unchanged probe/verify chain and rejects a schema-valid one-character proof mutation. Local Java tests cover additional mutations and malformed inputs. The attached, rendered OpenAPI file establishes the exact Action contract imported into the GPT. Backend process isolation is not part of the claim because ChatGPT's handling of that successful Action result is the system under test.

A valid verifier result establishes that a server-signed tuple arrived intact; it does not identify which internal OpenAI component read or forwarded it. A missing completed verifier-handler event, a malformed verifier request, a well-formed request with invalid signed values, and a valid chain followed by the wrong visible answer are separate observable failure classes. A missing special-audit event alone does not prove that no HTTP attempt occurred; wrong routing/methods and aborts before handler audit require access logs or OpenAI traces to distinguish.

“Since the GPT-5.6 rollout” is temporal context, not a causal conclusion. The ticket records the selected ChatGPT mode, automatic-switching state, visible response label, and any quota or fallback indication. A GPT-5.6-specific cause should be claimed only if a controlled, time-interleaved comparison supports it or OpenAI confirms the internal routing.
