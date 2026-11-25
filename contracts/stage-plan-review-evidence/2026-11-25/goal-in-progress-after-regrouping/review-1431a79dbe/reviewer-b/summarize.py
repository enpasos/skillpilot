#!/usr/bin/env python3
"""Extract all independent H2 samples from terminal JUnit XML; assert identical pilot outcomes."""
import json
import xml.etree.ElementTree as ET
from pathlib import Path

here = Path(__file__).resolve().parent
raw = here.parent / "raw" / "reviewer-b"
result = {}
for version, revision in [("parent", "53fd44c88b4da1380297112d3e2f67b1bab65980"), ("candidate", "1431a79dbea806dfed00a268b0b2bec4e58f7faa")]:
    rows = []
    for run in (version, version + "-extra"):
        xml, = raw.glob(f"{run}-TEST-*.xml")
        suite = ET.parse(xml).getroot()
        assert all(int(suite.attrib[k]) == 0 for k in ["skipped", "errors", "failures"])
        data = [json.loads(line.removeprefix("REVIEWB_TASK_E ")) for line in suite.findtext("system-out").splitlines() if line.startswith("REVIEWB_TASK_E ")]
        assert len(data) == int(suite.attrib["tests"])
        rows.extend(data)
    comparison = lambda sample: sorted((json.dumps({k:v for k,v in row.items() if k != "pilot"}, sort_keys=True) for row in sample))
    assert comparison([r for r in rows if r["pilot"]]) == comparison([r for r in rows if not r["pilot"]])
    result[version] = {"commit": revision, "tests": len(rows), "pilotOutcomesEqual": True, "samples": rows}
(here / "runtime.actual.json").write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
