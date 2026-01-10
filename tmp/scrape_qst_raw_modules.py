import html
import json
import re
import urllib.request
from pathlib import Path

BASE = Path("/home/enpasos/projects/skillpilot")
RAW_DIR = BASE / "curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

CODES = [
    "CH3337",
    "CIT4330012",
    "CIT4330013",
    "CIT4430005",
    "EI70760",
    "EI77006",
    "NAT3036",
    "NAT5008m",
    "NAT5030m",
    "NAT7001",
    "NAT7003",
    "NAT7026",
    "PH2127",
    "PH2141",
]


def fetch(code: str) -> dict:
    url = f"https://academics.nat.tum.de/api/v1/mhb/{code}"
    with urllib.request.urlopen(url, timeout=20) as resp:
        return json.load(resp)


def clean_html(text: str) -> str:
    if not text:
        return ""
    text = html.unescape(text)
    text = re.sub(r"<\s*br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"</\s*li\s*>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<\s*li\s*>", "- ", text, flags=re.IGNORECASE)
    text = re.sub(r"</?\s*(div|ul|ol|p|span|font)[^>]*>", "\n", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    lines = [line.strip() for line in text.splitlines()]
    cleaned = []
    for line in lines:
        if line:
            cleaned.append(line)
        elif cleaned and cleaned[-1] != "":
            cleaned.append("")
    while cleaned and cleaned[-1] == "":
        cleaned.pop()
    return "\n".join(cleaned).strip()


def normalize_enumerations(text: str) -> str:
    if not text:
        return text
    lines = []
    token_pattern = re.compile(r"(?:(?<=\s)|^)(?:\(?[A-Za-z]+|\d+\)?)[\).]\s+")
    head_pattern = re.compile(r"^(\(?[A-Za-z]+|\d+\)?)[\).]\s*(.+)$")
    solo_pattern = re.compile(r"^(\(?[A-Za-z]+|\d+\)?)[\).]$")
    pending_bullet = False

    for line in text.splitlines():
        stripped = line.strip()
        if not stripped:
            lines.append("")
            continue
        if solo_pattern.match(stripped):
            pending_bullet = True
            continue
        if stripped.startswith("-"):
            lines.append(stripped)
            pending_bullet = False
            continue
        if pending_bullet:
            lines.append(f"- {stripped}")
            pending_bullet = False
            continue
        if token_pattern.search(stripped):
            parts = token_pattern.split(stripped)
            for part in parts:
                part = part.strip()
                if part:
                    lines.append(f"- {part}")
            continue
        match = head_pattern.match(stripped)
        if match:
            lines.append(f"- {match.group(2).strip()}")
            continue
        lines.append(stripped)

    cleaned = []
    for line in lines:
        if line:
            cleaned.append(line)
        elif cleaned and cleaned[-1] != "":
            cleaned.append("")
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

    content = normalize_enumerations(clean_html(content))
    outcomes = normalize_enumerations(clean_html(outcomes))
    preconditions = normalize_enumerations(clean_html(preconditions))

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
    if content:
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
            lines.append(preconditions)
        else:
            lines.append(preconditions)

    out_path = RAW_DIR / f"DE_BAY_U_TUM_{code}.txt"
    out_path.write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    print(f"Wrote {out_path}")
