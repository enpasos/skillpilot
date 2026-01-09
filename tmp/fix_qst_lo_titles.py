import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/home/enpasos/projects/skillpilot")
QST_DIR = ROOT / "curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json"

GERMAN_WORDS = {
    "der", "die", "das", "und", "ist", "sind", "kann", "können", "nicht", "mit",
    "für", "auf", "eine", "einer", "einem", "eines", "wird", "werden", "zwischen",
    "aus", "nach", "dass", "über", "unter", "ohne", "bzw", "sowie", "durch",
    "des", "dem", "den", "als", "auch", "bei", "im", "in", "oder", "von", "zu",
    "gegen", "etwa", "mehr", "weniger", "beispiel", "beispiele", "z.b", "z", "b"
}
ENGLISH_WORDS = {
    "the", "and", "is", "are", "can", "will", "with", "for", "of", "to", "in",
    "this", "that", "students", "learners", "ability", "able", "understand",
    "introduction", "overview", "fundamentals", "methods", "applications", "using",
    "between", "from", "into", "without", "also", "as", "an", "a", "by", "be",
    "such", "e.g", "example", "examples", "or"
}
UMLAUT_PATTERN = re.compile(r"[äöüßÄÖÜ]")

CACHE = {}


def normalize_text(text):
    return re.sub(r"\s+", " ", text.strip().lower())


def lang_hint(text):
    if not text:
        return "unknown"
    low = normalize_text(text)
    tokens = re.findall(r"[a-zA-ZäöüßÄÖÜ]+", low)
    de_score = 0
    en_score = 0
    for token in tokens:
        if token in GERMAN_WORDS:
            de_score += 1
        if token in ENGLISH_WORDS:
            en_score += 1
    if UMLAUT_PATTERN.search(text):
        de_score += 2
    if en_score == 0 and de_score == 0:
        return "unknown"
    if de_score >= en_score + 2:
        return "de"
    if en_score >= de_score + 2:
        return "en"
    return "unknown"


def first_clause(text):
    if not text:
        return text
    line = text.split("\n", 1)[0].strip()
    # Cut before bullet list markers
    for sep in [" - ", " – ", " — ", "• ", "\n- "]:
        idx = line.find(sep)
        if idx > 0:
            line = line[:idx].strip()
            break
    # Cut at first period or colon if present
    for sep in [".", ":", ";"]:
        idx = line.find(sep)
        if idx > 0:
            line = line[:idx].strip()
            break
    return line.rstrip(",")


def translate_text(text, target, source):
    if not text:
        return text
    cache_key = (text, source, target)
    if cache_key in CACHE:
        return CACHE[cache_key]
    lines = text.split("\n")
    out_lines = []
    for line in lines:
        if not line.strip():
            out_lines.append(line)
            continue
        if line.strip() in {"-", "•"}:
            out_lines.append(line)
            continue
        prefix = ""
        rest = line
        m = re.match(r"^(\s*[-•*]+\s*)(.+)$", line)
        if m:
            prefix = m.group(1)
            rest = m.group(2)
        translated = _translate_single(rest, target, source)
        out_lines.append(prefix + translated)
    result = "\n".join(out_lines)
    CACHE[cache_key] = result
    return result


def _translate_single(text, target, source):
    q = urllib.parse.quote(text)
    url = (
        "https://translate.googleapis.com/translate_a/single"
        f"?client=gtx&sl={source}&tl={target}&dt=t&q={q}"
    )
    with urllib.request.urlopen(url) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    translated = "".join(chunk[0] for chunk in data[0] if chunk[0])
    return translated.strip()


def fix_goal(goal):
    changed = False
    title = goal.get("title") or ""
    title_en = goal.get("titleEn") or ""
    desc = goal.get("description") or ""
    desc_en = goal.get("descriptionEn") or ""

    # Ensure descriptions in correct language if swapped or missing
    if desc and lang_hint(desc) == "en":
        desc = translate_text(desc, "de", "en")
        goal["description"] = desc
        changed = True
    if desc_en and lang_hint(desc_en) == "de":
        desc_en = translate_text(desc_en, "en", "de")
        goal["descriptionEn"] = desc_en
        changed = True
    if not desc and desc_en:
        desc = translate_text(desc_en, "de", "en")
        goal["description"] = desc
        changed = True
    if not desc_en and desc:
        desc_en = translate_text(desc, "en", "de")
        goal["descriptionEn"] = desc_en
        changed = True

    if desc_en and desc_en.rstrip().endswith(","):
        desc_en = translate_text(desc, "en", "de")
        goal["descriptionEn"] = desc_en
        changed = True
    if desc and desc.rstrip().endswith(","):
        desc = translate_text(desc_en, "de", "en")
        goal["description"] = desc
        changed = True

    title_lang = lang_hint(title)
    title_en_lang = lang_hint(title_en)

    if not title or "..." in title or title_lang == "en":
        if desc:
            goal["title"] = first_clause(desc)
        elif title_en:
            goal["title"] = translate_text(title_en, "de", "en")
        changed = True
    if not title_en or "..." in title_en or title_en_lang == "de":
        if desc_en:
            goal["titleEn"] = first_clause(desc_en)
        elif goal.get("title"):
            goal["titleEn"] = translate_text(goal["title"], "en", "de")
        changed = True

    return changed


def main():
    files = sorted(QST_DIR.glob("*.json"))
    updated = []
    for path in files:
        data = json.loads(path.read_text(encoding="utf-8"))
        changed = False
        for goal in data.get("goals", []):
            if str(goal.get("shortKey", "")).endswith("_lo1"):
                if fix_goal(goal):
                    changed = True
        if changed:
            updated.append(path.name)
            path.write_text(json.dumps(data, ensure_ascii=False, indent=4), encoding="utf-8")
    print("Updated", len(updated), "files")
    for name in updated:
        print(name)

if __name__ == "__main__":
    main()
