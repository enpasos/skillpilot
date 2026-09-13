import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { convertQuickstartCaptions, prepareOriginalTempoExport, quickstartCaptureProvenance, resolveQuickstartExportTarget,
  validateQuickstartCapture, validateQuickstartCaptureLanguage, validateQuickstartHostClipArtifact,
  validateQuickstartRecordedFocus } from '../src/quickstart-export.js';

const cardCapture = () => ({
  kind: 'first-party-browser-with-labelled-instruction-cards', actualClaudeHostRecording: false,
  disposableLearnersDeleted: 1,
  instructionCardsSha256: 'a'.repeat(64), instructionScreenshotSha256: 'b'.repeat(64),
  recordingCleanupEvidenceSha256: 'c'.repeat(64), cleanupPerformedThisRun: 0,
  speechProvider: 'google-gemini',
});
const hostCapture = () => ({
  ...cardCapture(), kind: 'first-party-browser-with-verified-claude-web-clips', actualClaudeHostRecording: true,
  hostClips: {
    schemaVersion: 1, manifestSha256: 'd'.repeat(64), captureMethod: 'claude-browser-recording',
    presentation: 'local-video-replay', playbackRate: 1, nativeAppRecording: false, hostAcceptanceEvidence: false,
    clips: ['marketplace', 'repository', 'plugin-install', 'plugin-connect'].map((chapterId, index) => ({
      chapterId, sha256: String(index + 1).repeat(64), durationMs: 10000 + index,
      capturedAt: '2026-09-13T10:00:00.000Z', privacyReviewed: true,
    })),
  },
});
const evidenceArtifact = (text: string) => ({
  path: 'host-clips/evidence.json', sha256: createHash('sha256').update(text).digest('hex'),
});
const focusDeclaration = () => ({
  fromStepId: 'curriculum-open', toStepId: 'curriculum-read', x: 296, y: 258,
  width: 688, height: 302, leadMs: 300,
});
const focusScenario = () => ({
  browser: { video: { width: 1280, height: 720 } },
  chapters: [{ id: 'curriculum', recordedFocus: focusDeclaration(), steps: [
    { id: 'curriculum-open' }, { id: 'university' }, { id: 'curriculum-read' },
  ] }],
});
const focusRegion = () => ({
  ...focusDeclaration(), chapterId: 'curriculum', sourceStartMs: 10000, sourceEndMs: 20000,
  startMs: 12000, endMs: 25000, sourceWidth: 1280, sourceHeight: 720,
  fit: 'contain', paddingColor: 'white', speed: 1,
});

test('public framing includes only explicit declared camera regions and preserves unframed history', () => {
  assert.deepEqual(validateQuickstartRecordedFocus(focusScenario(), [focusRegion()], 30000), [focusRegion()]);
  const unframed = { ...focusScenario(), chapters: [{ id: 'intro', steps: [{ id: 'intro-card' }] }] };
  assert.equal(validateQuickstartRecordedFocus(unframed, undefined, 30000), undefined);
  assert.equal(validateQuickstartRecordedFocus(unframed, [], 30000), undefined);
  assert.throws(() => validateQuickstartRecordedFocus(focusScenario(), undefined, 30000), /lacks completed/u);
  assert.throws(() => validateQuickstartRecordedFocus(focusScenario(), [], 30000), /match each/u);
  assert.throws(() => validateQuickstartRecordedFocus(unframed, [focusRegion()], 30000), /match each/u);
});

test('public framing rejects private metadata, bad geometry, undeclared steps and output overflow', () => {
  for (const patch of [
    { path: '/private/raw.webm' }, { chapterId: 'private-account' },
    { fromStepId: '../private' }, { toStepId: 'missing-step' },
    { fromStepId: 'curriculum-read', toStepId: 'curriculum-open' },
    { x: -1 }, { y: 719 }, { width: 0 }, { width: 5000 }, { x: 296.5 },
    { leadMs: 1001 }, { leadMs: -1 }, { leadMs: 100 },
    { sourceWidth: 640 }, { sourceHeight: 360 }, { speed: 2 },
    { fit: 'cover' }, { paddingColor: 'black' },
    { sourceStartMs: -1 }, { sourceEndMs: 10000 }, { startMs: 25000 },
    { endMs: 30001 }, { startMs: 12000.5 },
  ]) assert.throws(() => validateQuickstartRecordedFocus(focusScenario(), [{ ...focusRegion(), ...patch }], 30000));
  for (const duration of [0, -1, NaN, Infinity, 10000.5]) {
    assert.throws(() => validateQuickstartRecordedFocus(focusScenario(), [focusRegion()], duration));
  }
  // A declared rectangle can still be out of bounds: the completed rendering must reject it.
  const outOfBounds = { ...focusDeclaration(), x: 1000 };
  assert.throws(() => validateQuickstartRecordedFocus({ ...focusScenario(), chapters: [
    { ...focusScenario().chapters[0], recordedFocus: outOfBounds },
  ] }, [{ ...focusRegion(), ...outOfBounds }], 30000), /dimensions/u);
});

test('public framing rejects duplicated chapters and overlapping or reordered intervals', () => {
  const first = focusScenario().chapters[0]!;
  const scenario = { ...focusScenario(), chapters: [first, { ...first, id: 'personal-curriculum' }] };
  const second = { ...focusRegion(), chapterId: 'personal-curriculum', sourceStartMs: 21000,
    sourceEndMs: 23000, startMs: 26000, endMs: 29000 };
  assert.equal(validateQuickstartRecordedFocus(scenario, [focusRegion(), second], 30000)?.length, 2);
  assert.throws(() => validateQuickstartRecordedFocus(scenario, [focusRegion(), focusRegion()], 30000), /exactly once/u);
  assert.throws(() => validateQuickstartRecordedFocus(scenario, [second, focusRegion()], 30000), /chapter/u);
  assert.throws(() => validateQuickstartRecordedFocus(scenario, [focusRegion(), { ...second, sourceStartMs: 19000 }], 30000), /overlapping/u);
  assert.throws(() => validateQuickstartRecordedFocus(scenario, [focusRegion(), { ...second, startMs: 24000 }], 30000), /overlapping/u);
});

test('localized exports keep German and English assets and disclosures separate', () => {
  for (const [language, locale, voiceNotice] of [
    ['de', 'de', 'KI-generierte Sprecherstimme'],
    ['de', 'de-DE', 'KI-generierte Sprecherstimme'],
    ['en', 'en', 'AI-generated voice'],
    ['en', 'en-US', 'AI-generated voice'],
    ['en', 'en-GB', 'AI-generated voice'],
  ]) {
    assert.deepEqual(resolveQuickstartExportTarget({
      id: `skillpilot-claude-quickstart-2026-09-13-${language}`,
      browser: { locale }, narration: { visualDisclosure: voiceNotice },
    }), { language, publicRoot: `/media/quickstart/claude/2026-09-13/${language}` });
  }
});

test('export refuses missing, unsupported or contradictory language bindings', () => {
  const english = {
    id: 'skillpilot-claude-quickstart-2026-09-13-en',
    browser: { locale: 'en-US' }, narration: { visualDisclosure: 'AI-generated voice' },
  };
  for (const locale of [undefined, '', 'fr-FR', 'en-US/../../de', 'english', 'de-DE']) {
    assert.throws(() => resolveQuickstartExportTarget({ ...english, browser: { locale } }));
  }
  for (const id of [undefined, 'skillpilot-claude-quickstart-2026-09-13-de', '../de', 'another-video-en']) {
    assert.throws(() => resolveQuickstartExportTarget({ ...english, id }));
  }
  for (const visualDisclosure of [undefined, '', 'KI-generierte Sprecherstimme']) {
    assert.throws(() => resolveQuickstartExportTarget({ ...english, narration: { visualDisclosure } }));
  }
  assert.throws(() => resolveQuickstartExportTarget(undefined));
});

test('English export requires explicitly English host clips and German preserves historic evidence', () => {
  const historicGerman = hostCapture();
  const originalEvidence = JSON.stringify(historicGerman.hostClips);
  assert.doesNotThrow(() => validateQuickstartCaptureLanguage(historicGerman, 'de'));
  assert.throws(() => validateQuickstartCaptureLanguage(historicGerman, 'en'), /clip language/u);
  assert.equal(JSON.stringify(quickstartCaptureProvenance(historicGerman).hostClips), originalEvidence);
  for (const language of ['de', 'en'] as const) {
    const capture = { ...hostCapture(), hostClips: { ...hostCapture().hostClips, language } };
    assert.doesNotThrow(() => validateQuickstartCaptureLanguage(capture, language));
    assert.throws(() => validateQuickstartCaptureLanguage(capture, language === 'de' ? 'en' : 'de'), /clip language/u);
    assert.equal(quickstartCaptureProvenance(capture).hostClips?.language, language);
    const evidence = JSON.stringify(capture.hostClips);
    assert.doesNotThrow(() => validateQuickstartHostClipArtifact(capture, evidenceArtifact(evidence), evidence));
    const swapped = JSON.stringify({ ...capture.hostClips, language: language === 'de' ? 'en' : 'de' });
    assert.throws(() => validateQuickstartHostClipArtifact(capture, evidenceArtifact(swapped), swapped), /does not match/u);
  }
  assert.doesNotThrow(() => validateQuickstartCaptureLanguage(cardCapture(), 'de'));
  assert.doesNotThrow(() => validateQuickstartCaptureLanguage(cardCapture(), 'en'));
  for (const language of ['fr', '', null]) {
    assert.throws(() => validateQuickstartCapture({ ...hostCapture(), hostClips: { ...hostCapture().hostClips, language } }));
  }
});

test('capture export distinguishes instruction cards from four verified Claude browser clips', () => {
  assert.deepEqual(validateQuickstartCapture(cardCapture()), cardCapture());
  assert.deepEqual(validateQuickstartCapture(hostCapture()), hostCapture());
  const card = quickstartCaptureProvenance(cardCapture());
  assert.equal(card.actualClaudeHostRecording, false);
  assert.equal('hostClips' in card, false);
  assert.equal(card.nativeAppRecording, false);
  assert.equal(card.hostAcceptanceEvidence, false);
  const host = quickstartCaptureProvenance(hostCapture());
  assert.equal(host.actualClaudeHostRecording, true);
  assert.equal(host.nativeAppRecording, false);
  assert.equal(host.hostAcceptanceEvidence, false);
  assert.match(host.capture, /browser recordings replayed locally at original speed/u);
  assert.deepEqual(host.hostClips, hostCapture().hostClips);
  assert.equal(JSON.stringify(host).includes('evidence.json'), false);
});

test('optional chat-start evidence exports without promoting historical clips into chat footage', () => {
  const historical = hostCapture();
  const chat = { ...historical.hostClips.clips[0]!, chapterId: 'chat-start', sha256: '5'.repeat(64) };
  const current = { ...historical, hostClips: { ...historical.hostClips, clips: [...historical.hostClips.clips, chat] } };
  assert.deepEqual(validateQuickstartCapture(current), current);
  assert.equal(quickstartCaptureProvenance(current).hostClips?.clips.length, 5);
  assert.equal(quickstartCaptureProvenance(historical).hostClips?.clips.length, 4);
  const bytes = JSON.stringify(current.hostClips);
  assert.doesNotThrow(() => validateQuickstartHostClipArtifact(current, evidenceArtifact(bytes), bytes));
  assert.throws(() => validateQuickstartHostClipArtifact(historical, evidenceArtifact(bytes), bytes), /does not match/u);
  for (const clips of [
    current.hostClips.clips.slice(1),
    [...current.hostClips.clips, chat],
    [...historical.hostClips.clips, { ...chat, privacyReviewed: false }],
  ]) assert.throws(() => validateQuickstartCapture({ ...current, hostClips: { ...current.hostClips, clips } }));
});

test('capture metadata allows explicitly absent instruction screenshots for clips and minimal card fixtures', () => {
  for (const capture of [cardCapture(), hostCapture()]) {
    const withoutScreenshot = { ...capture, instructionScreenshotSha256: null };
    assert.deepEqual(validateQuickstartCapture(withoutScreenshot), withoutScreenshot);
    assert.doesNotThrow(() => quickstartCaptureProvenance(withoutScreenshot));
  }
});

test('capture variants reject mixed provenance, unsupported claims and unverified cleanup', () => {
  for (const candidate of [
    { ...cardCapture(), actualClaudeHostRecording: true },
    { ...cardCapture(), hostClips: hostCapture().hostClips },
    { ...hostCapture(), actualClaudeHostRecording: false },
    { ...hostCapture(), hostClips: undefined },
    { ...hostCapture(), kind: 'unverified-browser-recording' },
    { ...hostCapture(), nativeAppRecording: true },
    { ...hostCapture(), hostAcceptanceEvidence: true },
    { ...cardCapture(), disposableLearnersDeleted: undefined },
    { ...cardCapture(), disposableLearnersDeleted: 0 },
    { ...cardCapture(), disposableLearnersDeleted: 0.5 },
    { ...cardCapture(), recordingCleanupEvidenceSha256: 'not-a-hash' },
  ]) assert.throws(() => validateQuickstartCapture(candidate));
});

test('host evidence requires exactly the four bounded, privacy-reviewed browser chapters', () => {
  for (const patch of [
    { schemaVersion: 2 }, { manifestSha256: 'invalid' }, { captureMethod: 'native-ios' },
    { presentation: 'live-host-acceptance' }, { playbackRate: 1.2 },
    { nativeAppRecording: true }, { hostAcceptanceEvidence: true },
    { path: '/private/clip.mp4' },
    { clips: hostCapture().hostClips.clips.slice(0, 3) },
    { clips: [...hostCapture().hostClips.clips, hostCapture().hostClips.clips[0]] },
    { clips: hostCapture().hostClips.clips.map((clip) => ({ ...clip, chapterId: 'marketplace' })) },
  ]) assert.throws(() => validateQuickstartCapture({ ...hostCapture(), hostClips: { ...hostCapture().hostClips, ...patch } }));

  for (const patch of [
    { chapterId: 'unrelated-account' }, { sha256: 'invalid' }, { durationMs: 0 },
    { durationMs: 0.5 }, { durationMs: Number.MAX_SAFE_INTEGER + 1 },
    { capturedAt: 'not-a-date' }, { privacyReviewed: false }, { privacyReviewed: undefined },
    { path: '/private/clip.mp4' }, { nativeAppRecording: true },
  ]) {
    const capture = hostCapture();
    assert.throws(() => validateQuickstartCapture({ ...capture, hostClips: {
      ...capture.hostClips, clips: capture.hostClips.clips.map((clip, index) => index === 0 ? { ...clip, ...patch } : clip),
    } }));
  }
});

test('host capture requires hash-bound JSON evidence equal to the embedded provenance', () => {
  const capture = hostCapture();
  const bytes = JSON.stringify(capture.hostClips);
  assert.doesNotThrow(() => validateQuickstartHostClipArtifact(capture, evidenceArtifact(bytes), Buffer.from(bytes)));
  const reordered = JSON.stringify(Object.fromEntries(Object.entries(capture.hostClips).reverse()));
  assert.doesNotThrow(() => validateQuickstartHostClipArtifact(capture, evidenceArtifact(reordered), reordered));
  assert.throws(() => validateQuickstartHostClipArtifact(capture));
  assert.throws(() => validateQuickstartHostClipArtifact(capture, evidenceArtifact(bytes)), /hash mismatch/u);
  assert.throws(() => validateQuickstartHostClipArtifact(capture, evidenceArtifact(bytes), `${bytes} `), /hash mismatch/u);
  const other = hostCapture();
  other.hostClips.clips[0]!.sha256 = 'e'.repeat(64);
  const changed = JSON.stringify(other.hostClips);
  assert.throws(() => validateQuickstartHostClipArtifact(capture, evidenceArtifact(changed), changed), /does not match/u);
  assert.throws(() => validateQuickstartHostClipArtifact(capture, evidenceArtifact('invalid-json'), 'invalid-json'));
  const privateData = JSON.stringify({ ...capture.hostClips, privatePath: '/private/clip.mp4' });
  assert.throws(() => validateQuickstartHostClipArtifact(capture, evidenceArtifact(privateData), privateData));
});

test('evidence import rejects arbitrary paths and stale host claims on the card-only path', () => {
  const bytes = JSON.stringify(hostCapture().hostClips);
  for (const path of ['/tmp/evidence.json', '../evidence.json', 'clips/../../evidence.json',
    'C:\\private\\evidence.json', 'clips/./evidence.json', 'https://example.org/evidence.json']) {
    assert.throws(() => validateQuickstartHostClipArtifact(hostCapture(), { ...evidenceArtifact(bytes), path }, bytes));
  }
  assert.doesNotThrow(() => validateQuickstartHostClipArtifact(cardCapture()));
  assert.throws(() => validateQuickstartHostClipArtifact(cardCapture(), evidenceArtifact(bytes), bytes), /must not contain/u);
  assert.throws(() => validateQuickstartHostClipArtifact(cardCapture(), undefined, bytes), /must not contain/u);
});

test('original-tempo export reports the real duration and preserves every caption boundary', () => {
  const srt = '1\n00:00:00,000 --> 00:00:11,700\nWillkommen bei SkillPilot.\n\n'
    + '2\n00:05:38,123 --> 00:05:44,799\nBeispiel: 00:00:11,700\n';
  const output = prepareOriginalTempoExport(344.8, srt);
  assert.equal(output.editorialPlaybackRate, 1);
  assert.equal(output.durationSeconds, 344.8);
  assert.equal(output.captions,
    'WEBVTT\n\n1\n00:00:00.000 --> 00:00:11.700\nWillkommen bei SkillPilot.\n\n'
    + '2\n00:05:38.123 --> 00:05:44.799\nBeispiel: 00:00:11,700\n');
});

test('caption conversion never clips late or short cues to manufacture a five-minute runtime', () => {
  const srt = '1\n00:05:38,000 --> 00:05:52,000\nLetzter Satz.\n';
  assert.throws(() => convertQuickstartCaptions(srt, 300000), /beyond the original video duration/u);
  assert.equal(convertQuickstartCaptions('1\n00:00:00,002 --> 00:00:00,003\nKurz.\n', 1000),
    'WEBVTT\n\n1\n00:00:00.002 --> 00:00:00.003\nKurz.\n');
});

test('caption conversion handles CRLF and rejects invalid durations, times and overlaps', () => {
  assert.match(convertQuickstartCaptions('\uFEFF1\r\n00:00:00,000 --> 00:00:01,000\r\nHallo.\r\n', 300000), /00:00:01\.000\nHallo\./u);
  for (const duration of [0, -1, Infinity, NaN]) assert.throws(() => prepareOriginalTempoExport(duration, ''));
  assert.throws(() => convertQuickstartCaptions('1\n00:60:00,000 --> 00:61:00,000\nInvalid.\n', 300000), /Invalid source caption timestamp/u);
  assert.throws(() => convertQuickstartCaptions('1\n00:00:02,000 --> 00:00:01,000\nInvalid.\n', 300000), /positive duration/u);
  assert.throws(() => convertQuickstartCaptions('1\n00:00:00,000 --> 00:00:03,000\nFirst.\n\n2\n00:00:02,000 --> 00:00:04,000\nSecond.\n', 300000), /must not overlap/u);
});
