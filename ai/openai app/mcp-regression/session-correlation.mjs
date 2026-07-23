import { createHash } from "node:crypto";

const SESSION_PATTERN = /^[\x21-\x7e]{1,512}$/;

export function sessionCorrelationFromExtra(extra) {
  return sessionIdentity(extra?._meta?.["openai/session"]);
}

function sessionIdentity(value) {
  if (typeof value !== "string" || !SESSION_PATTERN.test(value)) return null;
  return {
    hash: createHash("sha256").update(value, "utf8").digest("hex")
  };
}
