#!/usr/bin/env python3
"""Capture own native PDF pages; normalize renderer line-wrap hyphenation only."""
from pathlib import Path
import json
import re
import hashlib
import fitz

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[6]
directory = HERE / 'native/pdf-whole-page-captures'
directory.mkdir(exist_ok=True)
parents = {'7be6f951-a614-52dc-94d3-2ce0d33765ff', '53fd1bfd-facb-54ae-b2dc-f667ed1414fc'}
receipts = []

def normalized(value):
    # Chromium inserts U+2010 at soft wraps; authored ASCII hyphens must stay.
    return ' '.join(re.sub(r'\u2010\s*\n\s*', '', value).split())

for role in ['baseline-affected-contexts', 'candidate-affected-contexts']:
    folder = HERE / 'native' / role / 'bundle'
    model = json.loads((folder / 'book-model.json').read_text())
    manifest = json.loads((folder / 'book.pdf.render-manifest.json').read_text())
    wanted = parents if role.startswith('baseline') else {
        row['goalId'] for row in json.loads((HERE / 'native/current-whole-selected-pages-and-contexts.raw.json').read_text())['candidateRoutinePages']
    }
    with fitz.open(folder / 'book.pdf') as document:
        for page in model['pages']:
            if page['goalId'] not in wanted:
                continue
            index = manifest['frontMatterPageCount'] + page['pageNumber'] - 1
            actual_page = document[index]
            text = actual_page.get_text()
            assert normalized(page['title']) in normalized(text), page['goalId']
            assert normalized(page['description']) in normalized(text), page['goalId']
            output = directory / (page['goalId'] + '.' + ('baseline' if role.startswith('baseline') else 'candidate') + '.png')
            actual_page.get_pixmap(matrix=fitz.Matrix(1, 1), alpha=False).save(output)
            raw = output.read_bytes()
            receipts.append({
                'goalId': page['goalId'], 'role': role, 'physicalPage': index + 1,
                'wholeNativeGoalPageTitleAndDescriptionTextExactAfterDeclaredLineWrapNormalization': True,
                'textNormalization': 'whitespace and renderer-inserted U+2010/newline only; authored ASCII hyphens retained',
                'capture': {'path': output.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)},
                'newLearningAsset': False,
            })
(HERE / 'checks/whole-native-pdf-goal-pages.actual.json').write_text(json.dumps({
    'captures': receipts, 'role': 'actual whole own native PDF page captures; no independent verdict',
    'firstDirectTextCheckFailurePreserved': 'checks/pdf-capture.attempt1.actual.stderr.txt',
    'humanApproval': False, 'newLearningImagesGenerated': 0,
}, indent=2) + '\n')
print(json.dumps({'actualWholeNativeGoalPagesCaptured': len(receipts), 'newLearningImagesGenerated': 0, 'scientificApproval': False}))
