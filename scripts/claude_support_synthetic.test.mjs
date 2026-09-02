import assert from "node:assert/strict";
import test from "node:test";
import {
  claudeSupportSyntheticTargets,
  verifyClaudeSupportSynthetic,
} from "./claude_support_synthetic.mjs";

const candidate = {
  version: "1.0.2",
  sha256: "9c38746fff5ec51778bd922286bc1c142c6f03488894652ed295ab6ad230a09d",
};

test("synthetic validates only the fixed public read-only support surface", async () => {
  const requested = [];
  const verifyPublicationCalls = [];
  let tick = 0;
  const result = await verifyClaudeSupportSynthetic({
    fetchImpl: fixtureFetch({ requested }),
    verifyPublication: async (options) => {
      verifyPublicationCalls.push(options);
      const response = await options.fetchImpl(
        new URL(claudeSupportSyntheticTargets.pluginPage),
        { method: "GET", headers: { accept: "text/html" } },
      );
      assert.equal(response.status, 200);
      return candidate;
    },
    clock: () => tick++,
    checkedAt: () => "2026-09-01T12:34:56.000Z",
  });

  assert.equal(result.outcome, "pass");
  assert.equal(result.checkedAt, "2026-09-01T12:34:56.000Z");
  assert.deepEqual(result.candidate, candidate);
  assert.deepEqual(
    result.checks.map(({ id }) => id),
    [
      "public-plugin-publication",
      "public-legal-page",
      "public-main-privacy-page",
      "public-connector-privacy-page",
      "application-readiness",
      "oauth-protected-resource-metadata",
      "oauth-authorization-server-metadata",
      "unauthenticated-mcp-challenge",
    ],
  );
  assert.equal(verifyPublicationCalls.length, 1);
  assert.equal(verifyPublicationCalls[0].baseUrl, "https://skillpilot.com");
  assert.equal(typeof verifyPublicationCalls[0].fetchImpl, "function");
  assert.deepEqual(
    requested.map(({ url }) => url),
    [
      claudeSupportSyntheticTargets.pluginPage,
      claudeSupportSyntheticTargets.legal,
      claudeSupportSyntheticTargets.mainPrivacy,
      claudeSupportSyntheticTargets.connectorPrivacy,
      claudeSupportSyntheticTargets.readiness,
      claudeSupportSyntheticTargets.protectedResourceMetadata,
      claudeSupportSyntheticTargets.authorizationServerMetadata,
      claudeSupportSyntheticTargets.mcp,
    ],
  );
  for (const request of requested) {
    assert.equal(request.method, "GET");
    assert.equal(request.redirect, "error");
    assert.equal(request.headers.get("accept-encoding"), "identity");
    assert.equal(request.headers.has("authorization"), false);
    assert.equal(request.headers.has("cookie"), false);
    assert.ok(request.signal instanceof AbortSignal);
  }
});

test("synthetic fails closed when readiness is not UP", async () => {
  await assert.rejects(
    verifyClaudeSupportSynthetic({
      fetchImpl: fixtureFetch({
        overrides: {
          "/actuator/health/readiness": actuatorResponse({ status: "DOWN" }),
        },
      }),
      verifyPublication: async () => candidate,
    }),
    /application-readiness failed: readiness status is not UP/u,
  );
});

test("synthetic rejects incomplete OAuth discovery metadata", async () => {
  const authorizationMetadata = validAuthorizationMetadata();
  authorizationMetadata.code_challenge_methods_supported = ["plain"];
  await assert.rejects(
    verifyClaudeSupportSynthetic({
      fetchImpl: fixtureFetch({
        overrides: {
          "/.well-known/oauth-authorization-server": jsonResponse(
            authorizationMetadata,
          ),
        },
      }),
      verifyPublication: async () => candidate,
    }),
    /oauth-authorization-server-metadata failed: authorization-server PKCE methods are incomplete/u,
  );
});

test("synthetic requires the unauthenticated MCP Bearer challenge", async () => {
  await assert.rejects(
    verifyClaudeSupportSynthetic({
      fetchImpl: fixtureFetch({
        overrides: {
          "/mcp": new Response("", { status: 200 }),
        },
      }),
      verifyPublication: async () => candidate,
    }),
    /unauthenticated-mcp-challenge failed: expected HTTP 401, received HTTP 200/u,
  );
});

test("synthetic requires the exact MCP challenge without extra parameters", async () => {
  await assert.rejects(
    verifyClaudeSupportSynthetic({
      fetchImpl: fixtureFetch({
        overrides: {
          "/mcp": new Response("", {
            status: 401,
            headers: {
              "www-authenticate":
                'Bearer realm="unexpected", resource_metadata="https://mcp-claude-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp"',
            },
          }),
        },
      }),
      verifyPublication: async () => candidate,
    }),
    /missing the expected Bearer resource metadata challenge/u,
  );
});

test("synthetic error output never echoes response bodies or fetch errors", async () => {
  const secretMarker = "do-not-log-oauth-code";
  await assert.rejects(
    verifyClaudeSupportSynthetic({
      fetchImpl: fixtureFetch({
        overrides: {
          "/actuator/health/readiness": new Response(secretMarker, {
            status: 200,
            headers: {
              "content-type": "application/vnd.spring-boot.actuator.v3+json",
            },
          }),
        },
      }),
      verifyPublication: async () => candidate,
    }),
    (error) => {
      assert.match(error.message, /does not contain valid JSON/u);
      assert.doesNotMatch(error.message, new RegExp(secretMarker, "u"));
      return true;
    },
  );

  await assert.rejects(
    verifyClaudeSupportSynthetic({
      fetchImpl: async () => {
        throw new Error(secretMarker);
      },
      verifyPublication: async () => candidate,
    }),
    (error) => {
      assert.match(error.message, /request failed for approved target/u);
      assert.doesNotMatch(error.message, new RegExp(secretMarker, "u"));
      return true;
    },
  );
});

test("synthetic bounds public response bodies", async () => {
  await assert.rejects(
    verifyClaudeSupportSynthetic({
      fetchImpl: fixtureFetch({
        overrides: {
          "/legal": new Response("legal", {
            status: 200,
            headers: {
              "content-length": "70000",
              "content-type": "text/html",
            },
          }),
        },
      }),
      verifyPublication: async () => candidate,
    }),
    /public-legal-page failed: response exceeds the configured byte limit/u,
  );
});

test("synthetic requires the deployed bilingual Claude privacy notice", async () => {
  await assert.rejects(
    verifyClaudeSupportSynthetic({
      fetchImpl: fixtureFetch({
        overrides: {
          "https://mcp-claude-v1.skillpilot.com/privacy": htmlResponse(),
        },
      }),
      verifyPublication: async () => candidate,
    }),
    /public-connector-privacy-page failed: HTML response is missing required release markers/u,
  );
});

test("synthetic stops an oversized response stream without Content-Length", async () => {
  const oversizedStream = () =>
    new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array(40_000));
          controller.enqueue(new Uint8Array(40_000));
          controller.close();
        },
      }),
      {
        status: 200,
        headers: { "content-type": "text/html" },
      },
    );
  await assert.rejects(
    verifyClaudeSupportSynthetic({
      fetchImpl: fixtureFetch({
        overrides: { "/legal": oversizedStream },
      }),
      verifyPublication: async () => candidate,
    }),
    /public-legal-page failed: response exceeds the configured byte limit/u,
  );
});

test("synthetic timeout remains active while reading a response body", async () => {
  const fetchImpl = async (url, options) => {
    if (url.pathname !== "/legal") {
      return fixtureFetch()(url, options);
    }
    return new Response(
      new ReadableStream({
        start(controller) {
          options.signal.addEventListener("abort", () => {
            controller.error(new DOMException("aborted", "AbortError"));
          });
        },
      }),
      {
        status: 200,
        headers: { "content-type": "text/html" },
      },
    );
  };
  await assert.rejects(
    verifyClaudeSupportSynthetic({
      fetchImpl,
      verifyPublication: async () => candidate,
      timeoutMs: 5,
    }),
    /public-legal-page failed: request failed for approved target https:\/\/skillpilot.com\/legal/u,
  );
});

function fixtureFetch({ requested = [], overrides = {} } = {}) {
  return async (url, options) => {
    requested.push({
      url: url.href,
      method: options.method,
      redirect: options.redirect,
      headers: new Headers(options.headers),
      signal: options.signal,
    });
    const override = overrides[url.href] ?? overrides[url.pathname];
    if (override !== undefined) {
      return typeof override === "function" ? override() : override.clone();
    }
    switch (url.pathname) {
      case "/plugins":
      case "/legal":
        return htmlResponse();
      case "/privacy":
        return url.origin === "https://mcp-claude-v1.skillpilot.com"
          ? connectorPrivacyHtmlResponse()
          : htmlResponse();
      case "/actuator/health/readiness":
        return actuatorResponse({ status: "UP" });
      case "/.well-known/oauth-protected-resource/mcp":
        return jsonResponse(validProtectedResourceMetadata());
      case "/.well-known/oauth-authorization-server":
        return jsonResponse(validAuthorizationMetadata());
      case "/mcp":
        return new Response("", {
          status: 401,
          headers: {
            "www-authenticate":
              'Bearer resource_metadata="https://mcp-claude-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp"',
          },
        });
      default:
        return new Response("not found", { status: 404 });
    }
  };
}

function htmlResponse() {
  return new Response("<!doctype html><title>SkillPilot</title>", {
    status: 200,
    headers: { "content-type": "text/html; charset=UTF-8" },
  });
}

function connectorPrivacyHtmlResponse() {
  return new Response(
    [
      "<!doctype html>",
      '<section id="deutsch" class="language-section" lang="de">Deutsch</section>',
      '<section id="english" class="language-section" lang="en">English</section>',
      '<a href="mailto:support@skillpilot.com">support@skillpilot.com</a>',
      '<a href="https://www.anthropic.com/legal/consumer-terms">Consumer Terms</a>',
      '<a href="https://www.anthropic.com/legal/privacy">Privacy Policy</a>',
    ].join(""),
    {
      status: 200,
      headers: { "content-type": "text/html; charset=UTF-8" },
    },
  );
}

function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function actuatorResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/vnd.spring-boot.actuator.v3+json" },
  });
}

function validProtectedResourceMetadata() {
  return {
    bearer_methods_supported: ["header"],
    authorization_servers: ["https://mcp-claude-v1.skillpilot.com"],
    resource: "https://mcp-claude-v1.skillpilot.com/mcp",
    scopes_supported: ["skillpilot.read", "skillpilot.write"],
    resource_documentation:
      "https://enpasos.github.io/skillpilot/deploy/claude-connector-v1-user-guide/",
  };
}

function validAuthorizationMetadata() {
  return {
    issuer: "https://mcp-claude-v1.skillpilot.com",
    authorization_endpoint:
      "https://mcp-claude-v1.skillpilot.com/oauth2/authorize",
    token_endpoint: "https://mcp-claude-v1.skillpilot.com/oauth2/token",
    revocation_endpoint: "https://mcp-claude-v1.skillpilot.com/oauth2/revoke",
    scopes_supported: ["skillpilot.read", "skillpilot.write", "offline_access"],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none"],
    revocation_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
    client_id_metadata_document_supported: true,
  };
}
