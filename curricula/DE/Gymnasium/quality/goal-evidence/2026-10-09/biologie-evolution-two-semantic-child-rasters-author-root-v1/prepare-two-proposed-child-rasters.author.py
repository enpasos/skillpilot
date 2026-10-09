#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare two image candidates for the proposed split, using the ordinary CLI."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
def read(p): return json.loads(p.read_text())
def bind(p):
    data = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(p, value):
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    if p.suffix == '.json': assert read(p) == value

canon_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
split_path = BASE / 'biologie-evolution-one-fossil-culture-semantic-split-author-c-v1/two-child-semantic-bodies-and-parent-cluster.author-candidate.json'
split = read(split_path)
canon = read(canon_path)
original = next(g for g in canon['goals'] if g['id'] == split['originalParentId'])
assert original == split['wholeOriginalParent']
children = split['candidateChildren']
assert len(children) == 2
assert all(not g['contains'] and not g['resourceLinks'] for g in children)
canonical_candidate = json.loads(json.dumps(canon))
canonical_candidate['goals'] = [split['candidateParentCluster'] if g['id'] == original['id'] else g for g in canon['goals']] + children
candidate_path = OUT / 'inactive-current481-for-ordinary-image-preparation.canonical.json'
write(candidate_path, canonical_candidate)
prompts = [
'''Use case: scientific-educational. Create one landscape PNG, approximately 16:9, around 1600 by 900 pixels or a close native size. Friendly, clear, abstract comic illustration matching a school biology learning landscape: rounded dark-blue outlines, warm cream and pale-blue background, bright but gentle colours. This is a raster classroom learning image, no photorealism and no sterile technical redesign.
Learning objective: infer limited hypotheses about human evolution from fossil traits and age evidence, order finds chronologically, and distinguish temporal succession from a proven direct ancestor sequence.
Composition: three large, separate illustrated evidence cards spread across the upper half, each holding a schematic fossil fragment and a broad colour-coded time strip. Use one jaw fragment, one pelvis fragment, and one skull fragment, all clearly schematic rather than named real specimens. The cards have only the large labels A, B, C. Underneath, an arrow marked with the exact large German text "älter" on the left and "jünger" on the right orders the card dates; do not draw an ape-to-human parade or a progressively improving row of bodies. In a visually separate lower corner, a small branched possible relationship is drawn with dotted lines and question marks, clearly separate from the chronology arrow. The main large text is exactly "Abfolge ≠ Abstammung". Other optional text is only "Hypothese" beside the dotted branch. The colours used in the branch match the cards. Show chronological ordering as evidence and direct ancestry as uncertain: no solid ancestry arrow connecting A to B to C, no claim that different fossil elements reveal an evolutionary progression, no invented named species or measurements, no DNA letters. Keep all important motifs large and clear at an actual displayed width of 360 pixels; generous whitespace, very little text, no tiny legends, no border crop. No branding or technical IDs.''',
'''Use case: scientific-educational. Create one landscape PNG, approximately 16:9, around 1600 by 900 pixels or a close native size. Friendly, clear, abstract comic illustration matching a school biology learning landscape: rounded dark-blue outlines, warm cream and pale-blue background, bright but gentle colours. Raster illustration, no photorealism and no sterile technical redesign.
Learning objective: analyze how learned and socially transmitted knowledge and modified technical or cultural practices affect humans today and their environment, distinguish learned knowledge from biological inheritance, and see benefits and limits.
Composition: two large connected present-day garden scenes. On the left a friendly adult demonstrates mulching and careful watering to a teenager, who watches and tries the technique; the actual actions and tools clearly face the acting people. On the right the teenager passes on an adapted watering technique to another peer; the mulched vegetable bed is healthy and a large rain-water barrel supplies water. A small inset beside this second garden shows a water gauge low on a dry day, so the positive effect is not represented as unlimited water creation. Large speech bubbles contain only a simple drawn leaf and water-drop motif, with one clear arrow between the two people indicating teaching; arrows must not emerge from DNA or imply that learning changes inherited genes. Below the main scene, one unobtrusive separate DNA icon has the exact large label "Vererbung", while the teaching arrow has the exact large label "Lernen". Keep the two channels distinct; do not claim culture is independent of human biology. The main scene illustrates learned practice and consequences, not a progression from primitive to superior people. Top labels, if needed, are only the exact text "Weitergeben" and "Verändern". No open book, board or readable notebook; no smaller sentences, no numeric experimental data, no teleological DNA changes. Important actions, faces, materials and water limit must be clear at 360 pixels display width. Generous whitespace, friendly simplified shapes, no technical IDs or branding.''',
]
guards = [bind(canon_path), bind(ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')]
input_first = OUT / 'two-child-raster-author.input.first.freeze.json'
write(input_first, {'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(),
      'inputs': [bind(split_path), *guards], 'proposedWholeGoalObjects': children,
      'candidateLandscape': bind(candidate_path), 'splitScienceAMSourceNativeApproval': False,
      'activeWrites': [], 'generationExecuted': False})
receipts = []
for child, prompt in zip(children, prompts):
    out = OUT / child['id']
    out.mkdir()
    prompt_path = out / 'actual-generator-prompt.en.md'
    write(prompt_path, prompt + '\n')
    argv = ['node', 'scripts/prepare_goal_visualization.mjs', child['id'], '--landscape', str(candidate_path.relative_to(ROOT)),
            '--subject', 'biologie', '--provider', 'built-in ChatGPT/Codex image_gen', '--license', 'CC-BY-4.0']
    result = subprocess.run(argv, cwd=ROOT, capture_output=True, text=True)
    write(out / 'ordinary-prepare.stdout.actual.txt', result.stdout)
    write(out / 'ordinary-prepare.stderr.actual.txt', result.stderr)
    terminal = {'schemaVersion': 1, 'argv': argv, 'actualExitCode': result.returncode,
                'wholeGoal': child, 'actualPreparedLandscape': bind(candidate_path),
                'actualSubmittedPrompt': bind(prompt_path), 'generationExecuted': False, 'activeWrites': []}
    write(out / 'ordinary-prepare.terminal.actual.json', terminal)
    receipts.append(bind(out / 'ordinary-prepare.terminal.actual.json'))
    assert result.returncode == 0, result.stderr
for guard in guards: assert bind(ROOT / guard['path']) == guard
write(OUT / 'two-child-raster-author.pre-generation.entry.json', {
    'schemaVersion': 1, 'role': 'Ordinary prepared proposed-child PNGs, not scientific approval',
    'inputFirst': bind(input_first), 'actualPrepareTerminals': receipts,
    'goalIds': [g['id'] for g in children], 'generationExecuted': False,
    'independentScienceAMSourceNativeV': 'pending', 'activeWrites': [], 'strictGain': 0})
print(json.dumps({'actualPreparedChildren': len(children), 'generationExecuted': False, 'strictGain': 0}))
