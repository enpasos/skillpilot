# SPDX-License-Identifier: Apache-2.0
"""Compose the exact given SVG paths; enlarge labels for the bounded renderer."""
from pathlib import Path
import copy
import hashlib
import json
import xml.etree.ElementTree as ET

ROOT = next(p for p in Path(__file__).resolve().parents if (p/'LICENSING.md').is_file() and (p/'app').is_dir())
HERE = Path(__file__).resolve().parent
GOAL = "632a3837-7381-5701-9cfa-4ae15ccae8ba"
NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", NS)
q = lambda tag: f"{{{NS}}}{tag}"

svg = ET.Element(q("svg"), {
    "width": "780", "height": "1080", "viewBox": "0 0 780 1080",
    "role": "img", "aria-labelledby": "title description",
    "font-family": "DejaVu Sans, sans-serif",
})
ET.SubElement(svg, q("title"), {"id": "title"}).text = "Zwei unabhängige gegebene Graphen"
ET.SubElement(svg, q("desc"), {"id": "description"}).text = (
    "Aufgabe 1: gegebener Funktionsgraph f auf [-2;2]. "
    "Aufgabe 2, unabhängig: gegebener Ableitungsgraph q′ auf [-3;1]."
)
ET.SubElement(svg, q("rect"), {"width": "780", "height": "1080", "fill": "white"})
bindings = []
for index, (name, title, shift_y) in enumerate([
    ("given-function.svg", "Aufgabe 1: f", 40),
    ("given-derivative.svg", "Aufgabe 2: q′ · unabhängig", 590),
]):
    public = ROOT / "app/public/assets/assessment-materials/mathematik" / GOAL / name
    canonical = ROOT / "curricula/DE/Gymnasium/assessments/mathematik/derivative-split-2026-09-28/graph-materials" / name
    assert canonical.read_bytes() == public.read_bytes()
    original = ET.fromstring(public.read_bytes())
    ET.SubElement(svg, q("text"), {
        "x": "40", "y": str(shift_y - 6), "font-size": "35",
        "font-weight": "600", "fill": "#23334d",
    }).text = title
    panel = ET.SubElement(svg, q("g"), {"transform": f"translate(40 {shift_y})"})
    before_paths = [ET.tostring(e) for e in original if e.tag == q("path")]
    original_labels = []
    for element in original:
        if element.tag == q("title"):
            continue
        clone = copy.deepcopy(element)
        if clone.tag == q("text"):
            original_labels.append({"text": clone.text, "x": clone.get("x"), "y": clone.get("y")})
            clone.set("font-size", "38")
            if clone.get("y") == "440":
                clone.set("y", "470")
            if clone.text == "y":
                clone.set("y", "32")
        panel.append(clone)
    assert [ET.tostring(e) for e in panel if e.tag == q("path")] == before_paths
    assert [e.text for e in panel if e.tag == q("text")] == [e["text"] for e in original_labels]
    bindings.append({
        "panel": index + 1, "heading": title,
        "source": str(public.relative_to(ROOT)),
        "canonicalCopy": str(canonical.relative_to(ROOT)),
        "sha256": hashlib.sha256(public.read_bytes()).hexdigest(),
        "allOriginalPathsPreservedExactly": True,
        "allOriginalLabelValuesPreserved": original_labels,
        "styleOnlyChanges": {"fontSize": 38, "yAxisLabelY": 32, "xAxisTickBaselineY": 470},
    })
out = HERE / "given-panels.svg"
out.write_bytes(ET.tostring(svg, encoding="utf-8", xml_declaration=True))
(HERE / "composition.json").write_text(json.dumps({
    "status": "PRIVATE_GIVEN_ONLY_PANEL_CANDIDATE_NOT_HOST_ACCEPTANCE",
    "panels": bindings,
    "svgSha256": hashlib.sha256(out.read_bytes()).hexdigest(),
    "license": "CC-BY-4.0",
    "noAddedEquationsOrAnswerGraphs": True,
}, ensure_ascii=False, indent=2) + "\n")
print(json.dumps({"svg": str(out.relative_to(ROOT)), "bytes": out.stat().st_size}))
