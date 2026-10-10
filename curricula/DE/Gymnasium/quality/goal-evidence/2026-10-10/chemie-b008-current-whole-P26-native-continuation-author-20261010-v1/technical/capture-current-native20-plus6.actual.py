# SPDX-License-Identifier: Apache-2.0
"""Capture actual ordinary PDF pages; this is not a visual approval."""
from pathlib import Path
import hashlib
import json
import fitz

ROOT = Path.cwd()
PACKAGE = Path(__file__).resolve().parent.parent

def ref(file):
    data = file.read_bytes()
    return {"path": str(file.relative_to(ROOT)), "sha256": "sha256:" + hashlib.sha256(data).hexdigest(), "bytes": len(data)}

captures = []
for count in [20, 6]:
    bundle = PACKAGE / f"native/current-{count}/bundle"
    manifest = json.loads((bundle / "manifest.json").read_text())
    renderer = json.loads((bundle / "book.pdf.render-manifest.json").read_text())
    document = fitz.open(bundle / "book.pdf")
    assert document.page_count == count + renderer["frontMatterPageCount"]
    assert renderer["goalPageCount"] == count
    for row in manifest["goals"]:
        index = renderer["frontMatterPageCount"] + row["pageNumber"] - 1
        page = document[index]
        assert row["goalId"] in page.get_text()
        file = PACKAGE / "native/captures/pdf-whole-pages" / f'{row["goalId"]}.actual-whole-pdf-page.png'
        file.parent.mkdir(parents=True, exist_ok=True)
        pixmap = page.get_pixmap(matrix=fitz.Matrix(96 / 72, 96 / 72))
        pixmap.save(file)
        captures.append({"goalId": row["goalId"], "normalBundleSize": count, "physicalPageIndexZeroBased": index, "physicalPageNumber": index + 1, "wholeGoalPageNumber": row["pageNumber"], "captureDpi": 96, "captureDimensions": [pixmap.width, pixmap.height], "normalWholePdf": ref(bundle / "book.pdf"), "wholeRendererManifest": ref(bundle / "book.pdf.render-manifest.json"), "goalFingerprint": row["goalFingerprint"], "pageFingerprint": row["pageFingerprint"], "capture": ref(file)})
    document.close()
assert len(captures) == 26
assert len({row["goalId"] for row in captures}) == 26
file = PACKAGE / "checks/actual-whole26-native-pdf-captures.technical.json"
file.write_text(json.dumps({"schemaVersion": 1, "role": "Actual ordinary whole PDF page captures at96dpi for review, not mobile deliverables or independent review", "captures": captures, "independentApproval": False, "humanApproval": False, "activeWrites": 0, "strictGain": 0}, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"actualWholePdfPages": 26, "allPdfGoalIdsConfirmed": True, "independentApproval": False}))
