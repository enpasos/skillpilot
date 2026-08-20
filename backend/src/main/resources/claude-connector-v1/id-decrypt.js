// Standalone browser-native ES module for local PBKDF2-AES-GCM decryption of .skillpilot ID files.
// Byte-for-byte compatible with SkillPilot WebGUI ID-file format.

const FILE_FORMAT = 'skillpilot-password-encrypted';
const FILE_VERSION = 1;
const FILE_PURPOSE = 'skillpilot-id';
const FILE_KDF_NAME = 'PBKDF2';
const FILE_KDF_HASH = 'SHA-256';
const FILE_KDF_ITERATIONS = 600_000;
const FILE_CIPHER_NAME = 'AES-GCM';
const FILE_CIPHER_KEY_LENGTH = 256;
const FILE_CIPHER_TAG_LENGTH = 128;
const FILE_SALT_LENGTH = 16;
const FILE_IV_LENGTH = 12;
const MAX_FILE_CIPHERTEXT_LENGTH = 1024;
const MAX_SKILLPILOT_ID_FILE_SIZE = 4096;
const MIN_SKILLPILOT_ID_FILE_PASSWORD_LENGTH = 4;
const MAX_SKILLPILOT_ID_FILE_PASSWORD_BYTES = 1024;

const PAYLOAD_FORMAT = 'skillpilot-id';
const PAYLOAD_VERSION = 1;
const SKILLPILOT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const encoder = new TextEncoder();
const decoder = new TextDecoder('utf-8', { fatal: true });
const additionalData = encoder.encode(
  'SkillPilot\0password-envelope\0v1\0skillpilot-id'
  + '\0PBKDF2-SHA-256-600000\0AES-256-GCM-128'
);

const isRecord = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const hasExactKeys = (value, expected) => {
  const actual = Object.keys(value).sort();
  return actual.length === expected.length
    && expected.slice().sort().every((key, index) => actual[index] === key);
};

const invalidFile = () => {
  throw new Error('invalid-skillpilot-id-file');
};

const requireString = (value) =>
  typeof value === 'string' ? value : invalidFile();

const requireValidSkillpilotId = (value) => {
  const rawId = requireString(value).trim().toLowerCase();
  if (!SKILLPILOT_ID_PATTERN.test(rawId)) invalidFile();
  return rawId;
};

const canonicalBase64ToBytes = (value) => {
  if (
    typeof value !== 'string'
    || value.length === 0
    || value.length % 4 !== 0
    || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value)
  ) {
    invalidFile();
  }
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    let canonical = '';
    for (let i = 0; i < bytes.length; i++) {
      canonical += String.fromCharCode(bytes[i]);
    }
    if (btoa(canonical) !== value) invalidFile();
    return bytes;
  } catch {
    invalidFile();
  }
};

const parseSkillpilotIdFileEnvelope = (content) => {
  if (encoder.encode(content).byteLength > MAX_SKILLPILOT_ID_FILE_SIZE) {
    invalidFile();
  }

  let parsed;
  try {
    parsed = JSON.parse(content.replace(/^\uFEFF/, ''));
  } catch {
    invalidFile();
  }
  const envelope = isRecord(parsed) ? parsed : invalidFile();
  if (!hasExactKeys(envelope, ['format', 'version', 'purpose', 'kdf', 'cipher', 'ciphertext'])) {
    invalidFile();
  }
  const kdf = isRecord(envelope.kdf) ? envelope.kdf : invalidFile();
  const cipher = isRecord(envelope.cipher) ? envelope.cipher : invalidFile();
  if (
    envelope.format !== FILE_FORMAT
    || envelope.version !== FILE_VERSION
    || envelope.purpose !== FILE_PURPOSE
    || !hasExactKeys(kdf, ['name', 'hash', 'iterations', 'salt'])
    || kdf.name !== FILE_KDF_NAME
    || kdf.hash !== FILE_KDF_HASH
    || kdf.iterations !== FILE_KDF_ITERATIONS
    || typeof kdf.salt !== 'string'
    || !hasExactKeys(cipher, ['name', 'keyLength', 'tagLength', 'iv'])
    || cipher.name !== FILE_CIPHER_NAME
    || cipher.keyLength !== FILE_CIPHER_KEY_LENGTH
    || cipher.tagLength !== FILE_CIPHER_TAG_LENGTH
  ) {
    invalidFile();
  }
  const encodedSalt = requireString(kdf.salt);
  const encodedIv = requireString(cipher.iv);
  const encodedCiphertext = requireString(envelope.ciphertext);

  const salt = canonicalBase64ToBytes(encodedSalt);
  const iv = canonicalBase64ToBytes(encodedIv);
  const ciphertext = canonicalBase64ToBytes(encodedCiphertext);

  if (
    salt.byteLength !== FILE_SALT_LENGTH
    || iv.byteLength !== FILE_IV_LENGTH
    || ciphertext.byteLength < 17
    || ciphertext.byteLength > MAX_FILE_CIPHERTEXT_LENGTH
  ) {
    invalidFile();
  }

  return { salt, iv, ciphertext };
};

export const isValidSkillpilotIdFilePassword = (password) => {
  if (typeof password !== 'string') return false;
  const characterLength = Array.from(password).length;
  const byteLength = encoder.encode(password).byteLength;
  return characterLength >= MIN_SKILLPILOT_ID_FILE_PASSWORD_LENGTH
    && byteLength <= MAX_SKILLPILOT_ID_FILE_PASSWORD_BYTES
    && password.trim().length > 0;
};

export const decryptSkillpilotIdFileContent = async (content, password) => {
  if (!isValidSkillpilotIdFilePassword(password)) {
    throw new Error('invalid-skillpilot-id-file-password');
  }
  const crypto = globalThis.crypto;
  if (!crypto?.subtle) {
    throw new Error('browser-encryption-unavailable');
  }

  const { salt, iv, ciphertext } = parseSkillpilotIdFileEnvelope(content);

  const baseKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: FILE_KDF_ITERATIONS,
      hash: FILE_KDF_HASH,
    },
    baseKey,
    { name: 'AES-GCM', length: FILE_CIPHER_KEY_LENGTH },
    false,
    ['decrypt']
  );

  let plaintextBuffer;
  try {
    plaintextBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: FILE_CIPHER_TAG_LENGTH,
        additionalData,
      },
      key,
      ciphertext
    );
  } catch {
    throw new Error('decryption-failed-or-wrong-password');
  }

  let payload;
  try {
    payload = JSON.parse(decoder.decode(plaintextBuffer));
  } catch {
    invalidFile();
  }
  const parsedPayload = isRecord(payload) ? payload : invalidFile();
  if (
    !hasExactKeys(parsedPayload, ['format', 'version', 'skillpilotId'])
    || parsedPayload.format !== PAYLOAD_FORMAT
    || parsedPayload.version !== PAYLOAD_VERSION
  ) {
    invalidFile();
  }

  return requireValidSkillpilotId(parsedPayload.skillpilotId);
};
