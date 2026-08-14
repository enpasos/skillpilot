import { readFile, stat } from "node:fs/promises";

import { assertPrivateInputFile } from "./private-fs.js";
import { runProcess } from "./process.js";

const DEFAULT_STORAGE_STATE_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_NATIVE_CLIP_MAX_DURATION_MS = 5 * 60_000;
const DEFAULT_FFPROBE_TIMEOUT_MS = 15_000;
const DEFAULT_EXPECTED_ORIGIN = "https://chatgpt.com";
const DEFAULT_AUTHENTICATION_DOMAINS = ["chatgpt.com", "openai.com"] as const;
const FORBIDDEN_STORAGE_DOMAIN = "skillpilot.com";
const AUTHENTICATION_NAME_PATTERN = /(?:auth|session|token|account|credential|login)/iu;

type JsonRecord = Record<string, unknown>;

interface StorageCookie {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Strict" | "Lax" | "None";
}

interface StorageOrigin {
  origin: string;
  localStorage: Array<{ name: string; value: string }>;
}

export interface PlaywrightStorageStatePreflightOptions {
  label?: string;
  expectedOrigin?: string;
  authenticationDomains?: readonly string[];
  maxBytes?: number;
  nowMs?: number;
}

export interface PlaywrightStorageStatePreflightResult {
  cookieCount: number;
  originCount: number;
  expectedOrigin: string;
  authenticationMaterial: "secure-http-only-cookie";
}

export interface NativeClipMediaPreflightInput {
  id: string;
  filePath: string;
  audioPolicy: "mute" | "preserve";
}

export interface NativeClipMediaPreflightOptions {
  ffprobe?: string;
  maxDurationMs?: number;
  timeoutMs?: number;
}

export interface NativeClipMediaPreflightResult {
  id: string;
  durationMs: number;
  videoStreams: number;
  audioStreams: number;
  hasAudio: boolean;
}

function asRecord(value: unknown): JsonRecord | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : undefined;
}

function exactKeys(value: JsonRecord, allowed: readonly string[]): boolean {
  const allowedKeys = new Set(allowed);
  return Object.keys(value).every((key) => allowedKeys.has(key));
}

function parseCookie(value: unknown): StorageCookie | undefined {
  const cookie = asRecord(value);
  if (!cookie || !exactKeys(cookie, [
    "name", "value", "domain", "path", "expires", "httpOnly", "secure", "sameSite", "partitionKey",
  ])) return undefined;
  if (typeof cookie.name !== "string" || !cookie.name.trim()
      || typeof cookie.value !== "string"
      || typeof cookie.domain !== "string" || !cookie.domain.trim()
      || /[\s/:]/u.test(cookie.domain)
      || typeof cookie.path !== "string" || !cookie.path.startsWith("/")
      || typeof cookie.expires !== "number" || !Number.isFinite(cookie.expires)
      || typeof cookie.httpOnly !== "boolean"
      || typeof cookie.secure !== "boolean"
      || (cookie.sameSite !== "Strict" && cookie.sameSite !== "Lax" && cookie.sameSite !== "None")
      || (cookie.partitionKey !== undefined && typeof cookie.partitionKey !== "string")) {
    return undefined;
  }
  return {
    name: cookie.name,
    value: cookie.value,
    domain: cookie.domain,
    path: cookie.path,
    expires: cookie.expires,
    httpOnly: cookie.httpOnly,
    secure: cookie.secure,
    sameSite: cookie.sameSite,
  };
}

function parseOrigin(value: unknown): StorageOrigin | undefined {
  const entry = asRecord(value);
  if (!entry || !exactKeys(entry, ["origin", "localStorage"]) || !Array.isArray(entry.localStorage)) {
    return undefined;
  }
  if (typeof entry.origin !== "string") return undefined;
  let url: URL;
  try {
    url = new URL(entry.origin);
  } catch {
    return undefined;
  }
  if (url.protocol !== "https:"
      || url.origin !== entry.origin
      || url.username || url.password
      || url.pathname !== "/" || url.search || url.hash) {
    return undefined;
  }
  const localStorage: Array<{ name: string; value: string }> = [];
  const names = new Set<string>();
  for (const rawItem of entry.localStorage) {
    const item = asRecord(rawItem);
    if (!item || !exactKeys(item, ["name", "value"])
        || typeof item.name !== "string" || !item.name
        || typeof item.value !== "string" || names.has(item.name)) {
      return undefined;
    }
    names.add(item.name);
    localStorage.push({ name: item.name, value: item.value });
  }
  return { origin: entry.origin, localStorage };
}

function normalizeExpectedOrigin(value: string): string {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new TypeError("storage-state expectedOrigin must be a valid HTTPS origin");
  }
  if (url.protocol !== "https:"
      || url.origin !== value
      || url.username || url.password
      || url.pathname !== "/" || url.search || url.hash) {
    throw new TypeError("storage-state expectedOrigin must be an exact credential-free HTTPS origin");
  }
  return url.origin;
}

function normalizedAuthenticationDomains(values: readonly string[]): string[] {
  const domains = [...new Set(values.map((value) => value.trim().toLowerCase()))];
  if (domains.length === 0 || domains.some((value) => !value || /[\s/:]/u.test(value))) {
    throw new TypeError("storage-state authenticationDomains must contain DNS domain names");
  }
  return domains;
}

function cookieMatchesDomain(cookieDomain: string, trustedDomain: string): boolean {
  const normalized = cookieDomain.replace(/^\./u, "").toLowerCase();
  return normalized === trustedDomain || normalized.endsWith(`.${trustedDomain}`);
}

function hostnameMatchesDomain(hostname: string, trustedDomain: string): boolean {
  const normalized = hostname.toLowerCase();
  return normalized === trustedDomain || normalized.endsWith(`.${trustedDomain}`);
}

/**
 * Validates a protected Playwright storage-state file without launching a
 * browser or performing network access. This proves current schema and
 * plausible private authentication material; only an online ChatGPT check can
 * prove that the session is still accepted by the provider.
 */
export async function validatePlaywrightStorageState(
  filePath: string,
  options: PlaywrightStorageStatePreflightOptions = {},
): Promise<PlaywrightStorageStatePreflightResult> {
  const label = options.label ?? "Playwright storage state";
  const maxBytes = options.maxBytes ?? DEFAULT_STORAGE_STATE_MAX_BYTES;
  if (!Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new TypeError("storage-state maxBytes must be a positive safe integer");
  }
  const nowMs = options.nowMs ?? Date.now();
  if (!Number.isFinite(nowMs) || nowMs < 0) {
    throw new TypeError("storage-state nowMs must be a non-negative finite timestamp");
  }
  const expectedOrigin = normalizeExpectedOrigin(options.expectedOrigin ?? DEFAULT_EXPECTED_ORIGIN);
  const authenticationDomains = normalizedAuthenticationDomains(
    options.authenticationDomains ?? DEFAULT_AUTHENTICATION_DOMAINS,
  );

  await assertPrivateInputFile(filePath, label);
  const metadata = await stat(filePath);
  if (metadata.size <= 0 || metadata.size > maxBytes) {
    throw new Error(`${label} must be non-empty and no larger than ${maxBytes} bytes`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(filePath, "utf8"));
  } catch (cause) {
    throw new Error(`${label} is not valid JSON`, { cause });
  }
  const state = asRecord(parsed);
  if (!state || !exactKeys(state, ["cookies", "origins"])
      || !Array.isArray(state.cookies) || !Array.isArray(state.origins)) {
    throw new Error(`${label} does not match the Playwright storage-state shape`);
  }
  const cookies = state.cookies.map(parseCookie);
  const origins = state.origins.map(parseOrigin);
  if (cookies.some((cookie) => cookie === undefined)
      || origins.some((origin) => origin === undefined)) {
    throw new Error(`${label} contains malformed cookie or origin entries`);
  }
  const validCookies = cookies as StorageCookie[];
  const validOrigins = origins as StorageOrigin[];
  if (validCookies.some((cookie) => cookieMatchesDomain(cookie.domain, FORBIDDEN_STORAGE_DOMAIN))
      || validOrigins.some((origin) => hostnameMatchesDomain(
        new URL(origin.origin).hostname,
        FORBIDDEN_STORAGE_DOMAIN,
      ))) {
    throw new Error(`${label} must not contain SkillPilot cookies or browser storage`);
  }
  if (validCookies.some((cookie) => !authenticationDomains.some(
    (domain) => cookieMatchesDomain(cookie.domain, domain),
  ))) {
    throw new Error(`${label} contains a cookie outside the ChatGPT/OpenAI allowlist`);
  }
  if (validOrigins.some((origin) => !authenticationDomains.some(
    (domain) => hostnameMatchesDomain(new URL(origin.origin).hostname, domain),
  ))) {
    throw new Error(`${label} contains browser storage outside the ChatGPT/OpenAI allowlist`);
  }
  if (!validOrigins.some((origin) => origin.origin === expectedOrigin)) {
    throw new Error(`${label} does not contain the expected origin ${expectedOrigin}`);
  }
  const currentUnixSeconds = nowMs / 1_000;
  const authenticationCookie = validCookies.find((cookie) => (
    cookie.value.length > 0
    && cookie.httpOnly
    && cookie.secure
    && AUTHENTICATION_NAME_PATTERN.test(cookie.name)
    && (cookie.expires === -1 || cookie.expires > currentUnixSeconds)
    && authenticationDomains.some((domain) => cookieMatchesDomain(cookie.domain, domain))
  ));
  if (!authenticationCookie) {
    throw new Error(`${label} contains no current secure private authentication cookie for ChatGPT/OpenAI`);
  }
  return {
    cookieCount: validCookies.length,
    originCount: validOrigins.length,
    expectedOrigin,
    authenticationMaterial: "secure-http-only-cookie",
  };
}

function positiveSafeInteger(value: number, label: string): number {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError(`${label} must be a positive safe integer`);
  }
  return value;
}

function parseFfprobeDuration(value: unknown): number {
  const numeric = typeof value === "number"
    ? value
    : typeof value === "string"
      ? Number.parseFloat(value)
      : Number.NaN;
  return Number.isFinite(numeric) && numeric > 0 ? Math.ceil(numeric * 1_000) : 0;
}

/** Probes review-ready native clips before any external fixture is created. */
export async function validateNativeClipMedia(
  inputs: readonly NativeClipMediaPreflightInput[],
  options: NativeClipMediaPreflightOptions = {},
): Promise<NativeClipMediaPreflightResult[]> {
  const maxDurationMs = positiveSafeInteger(
    options.maxDurationMs ?? DEFAULT_NATIVE_CLIP_MAX_DURATION_MS,
    "native-clip maxDurationMs",
  );
  const timeoutMs = positiveSafeInteger(
    options.timeoutMs ?? DEFAULT_FFPROBE_TIMEOUT_MS,
    "native-clip timeoutMs",
  );
  const ids = new Set<string>();
  for (const input of inputs) {
    if (!input.id.trim()) throw new TypeError("Native clip IDs must not be empty");
    if (ids.has(input.id)) throw new Error(`Duplicate native clip ID: ${input.id}`);
    ids.add(input.id);
  }

  return await Promise.all(inputs.map(async (input) => {
    const label = `Native clip ${input.id}`;
    await assertPrivateInputFile(input.filePath, label);
    let stdout: string;
    try {
      stdout = (await runProcess(options.ffprobe ?? "ffprobe", [
        "-v", "error",
        "-show_entries", "format=duration:stream=codec_type",
        "-of", "json",
        input.filePath,
      ], {
        timeoutMs,
        maxOutputBytes: 1024 * 1024,
      })).stdout;
    } catch (cause) {
      throw new Error(`${label} is not a readable media file`, { cause });
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(stdout);
    } catch (cause) {
      throw new Error(`${label} produced invalid ffprobe metadata`, { cause });
    }
    const metadata = asRecord(parsed);
    const format = asRecord(metadata?.format);
    const streams = metadata?.streams;
    const durationMs = parseFfprobeDuration(format?.duration);
    if (durationMs <= 0) throw new Error(`${label} has no positive media duration`);
    if (durationMs > maxDurationMs) {
      throw new Error(`${label} exceeds the maximum reviewed duration of ${maxDurationMs} ms`);
    }
    if (!Array.isArray(streams)) throw new Error(`${label} has no readable media streams`);
    const videoStreams = streams.filter((stream) => asRecord(stream)?.codec_type === "video").length;
    const audioStreams = streams.filter((stream) => asRecord(stream)?.codec_type === "audio").length;
    if (videoStreams === 0) throw new Error(`${label} has no video stream`);
    if (input.audioPolicy === "preserve" && audioStreams === 0) {
      throw new Error(`${label} requests preserved audio but has no audio stream`);
    }
    return {
      id: input.id,
      durationMs,
      videoStreams,
      audioStreams,
      hasAudio: audioStreams > 0,
    };
  }));
}
