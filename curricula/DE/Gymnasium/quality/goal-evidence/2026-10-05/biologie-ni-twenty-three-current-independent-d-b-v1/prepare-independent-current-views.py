# SPDX-License-Identifier: Apache-2.0
"""Render exact frozen inputs for independent reading, without any verdict."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import fitz

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = OWN.with_name('biologie-ni-ten-current-native-author-candidate-v2')
sources = [
    ('d18', AUTHOR / 'native-eighteen-current49-all-images-finalbook/bundle/book.pdf', None),
    ('d5', AUTHOR / 'native-existing-five-current49-bindings-finalbook/bundle/book.pdf', None),
    ('NI', ROOT / 'curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf',
     [75, 76, 77, 81, 84, 87, 88, 89, 90, 91, 103, 104]),
    ('HE-current-retained', AUTHOR.with_name('biologie-ephase-seven-current-native-candidate-v1') / 'primary-excerpts/HE2025.original.pdf',
     [35, 36, 39]),
]
sha = lambda data: hashlib.sha256(data).hexdigest()
views = OWN / 'actual-independent-pdf-views'
views.mkdir(exist_ok=True)
rows = []
for label, source, selection in sources:
    with fitz.open(source) as pdf:
        numbers = selection if selection is not None else list(range(1, len(pdf) + 1))
        text = []
        for number in numbers:
            page = pdf[number - 1]
            out = views / f'{label}-physical-{number:03d}.png'
            assert not out.exists(), out
            page.get_pixmap(matrix=fitz.Matrix(1.5, 1.5), alpha=False).save(out)
            text.append(f'PHYSICAL PAGE {number}\n' + page.get_text())
            rows.append({'source': str(source.relative_to(ROOT)), 'sourceSHA256': sha(source.read_bytes()),
                         'physicalPage': number, 'actualPNG': str(out.relative_to(ROOT)),
                         'pngSHA256': sha(out.read_bytes()), 'seenByReviewer': False})
        (OWN / f'{label}.complete-affected-pages.actual.txt').write_text('\n\n'.join(text) + '\n')
receipt = {'preparedUTC': datetime.now(timezone.utc).isoformat(), 'pages': rows,
           'actualPageCount': len(rows), 'preparationIsNotScientificReview': True,
           'reviewer': '/root independent D-B', 'authorRole': False,
           'individualOtherReviewerScientificJudgementsConsulted': False,
           'technicalOtherReviewerCompletionCountsReceived': True,
           'technicalCountsUsedForScientificVerdict': False,
           'humanApproval': False, 'activeWrites': 0}
(OWN / 'actual-independent-view-preparation.receipt.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps({'actualPreparedPages': len(rows), 'reviewApproval': False, 'activeWrites': 0}))
