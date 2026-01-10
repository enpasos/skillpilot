import html
import json
import re
import sys
import urllib.request
from pathlib import Path

BASE = Path("/home/enpasos/projects/skillpilot")
RAW_DIR = BASE / "curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

CODES = ["MA3001", "IN2381", "IN2388", "NAT5040m"]


def fetch(code: str) -> dict:
    url = f"https://academics.nat.tum.de/api/v1/mhb/{code}"
    with urllib.request.urlopen(url, timeout=20) as resp:
        return json.load(resp)


def clean_html(text: str) -> str:
    if not text:
        return ""
    text = html.unescape(text)
    # Normalize line breaks for list-like fields
    text = re.sub(r"<\s*br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</\s*li\s*>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<\s*li\s*>", "- ", text, flags=re.IGNORECASE)
    # Replace block tags with newlines
    text = re.sub(r"</?\s*(div|ul|ol|p|span)[^>]*>", "\n", text, flags=re.IGNORECASE)
    # Strip remaining tags
    text = re.sub(r"<[^>]+>", "", text)
    # Normalize whitespace
    lines = [line.strip() for line in text.splitlines()]
    # Remove empty lines at start/end, keep internal empties minimal
    cleaned = []
    for line in lines:
        if line:
            cleaned.append(line)
        elif cleaned and cleaned[-1] != "":
            cleaned.append("")
    # Trim trailing blank
    while cleaned and cleaned[-1] == "":
        cleaned.pop()
    return "\n".join(cleaned).strip()


for code in CODES:
    data = fetch(code)

    title = data.get("module_title") or ""
    title_en = data.get("module_title_en") or ""
    ects = data.get("module_credits")
    if ects is None:
        ects = ""

    content = data.get("module_content") or data.get("module_content_en") or ""
    outcomes = data.get("module_outcome") or data.get("module_outcome_en") or ""
    preconditions = data.get("module_precondition") or data.get("module_precondition_en") or ""

    content = clean_html(content)
    outcomes = clean_html(outcomes)
    preconditions = clean_html(preconditions)

    # Ensure content/outcomes/preconditions are not empty strings with stray whitespace
    content = content.strip()
    outcomes = outcomes.strip()
    preconditions = preconditions.strip()

    lines = []
    lines.append(f"code: {code}")
    lines.append(f"title: {title}")
    lines.append(f"title_en: {title_en}")
    lines.append(f"ects: {ects}")
    lines.append(f"ects_plan: {ects}")
    lines.append("semester_plan: -")
    lines.append("")
    lines.append("content:")
    lines.append("")
    lines.append(content)
    lines.append("")
    lines.append("outcomes:")
    lines.append("")
    if outcomes:
        if not outcomes.lstrip().startswith("-"):
            lines.append(f"- {outcomes}")
        else:
            lines.append(outcomes)
    lines.append("")
    lines.append("preconditions:")
    lines.append("")
    if preconditions:
        if not preconditions.lstrip().startswith("-"):
            # Handle bullet list already encoded as multiple lines starting with '-'
            if "\n" in preconditions and any(line.lstrip().startswith("-") for line in preconditions.splitlines()):
                lines.append(preconditions)
            else:
                lines.append(preconditions)
        else:
            lines.append(preconditions)

    out_path = RAW_DIR / f"DE_BAY_U_TUM_{code}.txt"
    out_path.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    print(f"Wrote {out_path}")
