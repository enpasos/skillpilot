// Browser-side controller for the Claude Connector v1 binding page.
//
// The ID file and its password are read, decrypted and discarded entirely in this page. Only the
// decrypted UUID leaves the browser, over TLS, in the POST body below. Nothing is written to the
// URL, browser storage, the document title or any third-party endpoint.
//
// This file is served as a separate script so the page can keep a CSP without 'unsafe-inline'.

import { decryptSkillpilotIdFileContent } from './id-decrypt.js';

const BIND_ENDPOINT = '/connect/bind';
const DETAILS_ENDPOINT = '/connect/details';
const CSRF_ENDPOINT = '/connect/csrf';
const MAX_SKILLPILOT_ID_FILE_SIZE = 4096;
const HANDLE_PATTERN = /^[0-9a-f]{64}$/;

const form = document.getElementById('bindingForm');
const statusBox = document.getElementById('status');
const submitButton = document.getElementById('submitBtn');
const fileInput = document.getElementById('idFile');
const passwordInput = document.getElementById('password');
const transactionDetails = document.getElementById('transactionDetails');
const clientName = document.getElementById('clientName');
const clientHost = document.getElementById('clientHost');
const redirectHost = document.getElementById('redirectHost');
const redirectType = document.getElementById('redirectType');
const requestedScopes = document.getElementById('requestedScopes');

const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''));
const handle = fragment.get('handle') || '';
// Remove the one-time handle from the visible URL and browser history before the learner selects
// a file. URL fragments are not sent to the server or included in referrers.
window.history.replaceState(null, '', '/connect');
document.getElementById('handle').value = handle;
submitButton.disabled = true;

const setStatus = (message, kind) => {
  statusBox.className = kind || '';
  statusBox.textContent = message;
};

if (!HANDLE_PATTERN.test(handle)) {
  setStatus(
    'Ungültige oder fehlende Transaktions-ID. Bitte starten Sie die Verbindung von Claude aus neu.',
    'error',
  );
  submitButton.disabled = true;
}

const messageForError = (error) => {
  switch (error && error.message) {
    case 'decryption-failed-or-wrong-password':
      return 'Falsches Passwort oder beschädigte ID-Datei.';
    case 'invalid-skillpilot-id-file':
      return 'Diese Datei ist keine gültige SkillPilot-ID-Datei.';
    case 'invalid-skillpilot-id-file-password':
      return 'Bitte geben Sie das Passwort der ID-Datei ein.';
    case 'browser-encryption-unavailable':
      return 'Dieser Browser unterstützt die benötigte lokale Verschlüsselung nicht.';
    default:
      return 'Die Verbindung konnte nicht hergestellt werden. Bitte versuchen Sie es erneut.';
  }
};

const csrfHeaders = async () => {
  const response = await fetch(CSRF_ENDPOINT, {
    method: 'GET',
    credentials: 'same-origin',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('csrf-unavailable');
  const csrf = await response.json();
  if (
    !csrf
    || typeof csrf.headerName !== 'string'
    || typeof csrf.token !== 'string'
    || csrf.headerName.length === 0
    || csrf.token.length === 0
  ) {
    throw new Error('csrf-unavailable');
  }
  return { 'Content-Type': 'application/json', [csrf.headerName]: csrf.token };
};

const loadTransactionDetails = async () => {
  const headers = await csrfHeaders();
  const response = await fetch(DETAILS_ENDPOINT, {
    method: 'POST',
    headers,
    credentials: 'same-origin',
    body: JSON.stringify({ handle }),
  });
  if (!response.ok) throw new Error('transaction-details-unavailable');
  const details = await response.json();
  if (
    !details
    || typeof details.clientName !== 'string'
    || typeof details.clientHost !== 'string'
    || typeof details.redirectHost !== 'string'
    || typeof details.redirectType !== 'string'
    || !Array.isArray(details.requestedScopes)
    || details.requestedScopes.some((scope) => typeof scope !== 'string')
  ) {
    throw new Error('transaction-details-unavailable');
  }
  clientName.textContent = details.clientName;
  clientHost.textContent = details.clientHost;
  redirectHost.textContent = details.redirectHost;
  redirectType.textContent = details.redirectType;
  requestedScopes.textContent = details.requestedScopes.join(', ');
  transactionDetails.hidden = false;
  submitButton.disabled = false;
};

if (HANDLE_PATTERN.test(handle)) {
  loadTransactionDetails().catch(() => {
    setStatus(
      'Die OAuth-Transaktion ist abgelaufen oder ungültig. Bitte starten Sie die Verbindung von Claude aus neu.',
      'error',
    );
  });
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  setStatus('Entschlüssele ID-Datei lokal im Browser…');

  if (!fileInput.files || fileInput.files.length === 0) {
    setStatus('Bitte wählen Sie Ihre .skillpilot-Datei aus.', 'error');
    submitButton.disabled = false;
    return;
  }

  let skillpilotId;
  try {
    const selectedFile = fileInput.files[0];
    if (selectedFile.size > MAX_SKILLPILOT_ID_FILE_SIZE) {
      throw new Error('invalid-skillpilot-id-file');
    }
    const fileContent = await selectedFile.text();
    skillpilotId = await decryptSkillpilotIdFileContent(fileContent, passwordInput.value);
  } catch (error) {
    setStatus(messageForError(error), 'error');
    submitButton.disabled = false;
    return;
  } finally {
    // The password never needs to survive the decryption attempt.
    passwordInput.value = '';
    fileInput.value = '';
  }

  try {
    setStatus('ID erfolgreich entschlüsselt. Bestätige Autorisierung…');
    const headers = await csrfHeaders();
    const response = await fetch(BIND_ENDPOINT, {
      method: 'POST',
      headers,
      credentials: 'same-origin',
      body: JSON.stringify({ handle, skillpilotId }),
    });

    if (!response.ok) {
      setStatus(
        response.status === 409
          ? 'Diese Verbindung wurde bereits verwendet. Bitte starten Sie sie in Claude neu.'
          : 'Die Verbindung konnte nicht hergestellt werden. Bitte starten Sie sie in Claude neu.',
        'error',
      );
      submitButton.disabled = false;
      return;
    }

    const result = await response.json();
    if (!result || result.status !== 'BOUND' || typeof result.redirectUrl !== 'string') {
      throw new Error('invalid-redirect');
    }
    const redirect = new URL(result.redirectUrl, window.location.origin);
    if (
      redirect.origin !== window.location.origin
      || redirect.pathname !== '/oauth2/authorize'
      || redirect.username !== ''
      || redirect.password !== ''
      || redirect.hash !== ''
    ) {
      throw new Error('invalid-redirect');
    }
    setStatus('Erfolgreich verbunden! Leite weiter zu Claude…', 'success');
    window.location.assign(redirect.href);
  } catch (error) {
    setStatus(messageForError(error), 'error');
    submitButton.disabled = false;
  } finally {
    skillpilotId = undefined;
  }
});
