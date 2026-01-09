import json
import os
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path("/home/enpasos/projects/skillpilot")
QST_DIR = ROOT / "curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json"

# Basic language heuristics
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
    # If most tokens are english-like (no umlauts) but known english words present
    if en_score == 0 and de_score == 0:
        return "unknown"
    if de_score >= en_score + 2:
        return "de"
    if en_score >= de_score + 2:
        return "en"
    return "unknown"


def translate_text(text, target, source):
    if not text:
        return text
    cache_key = (text, source, target)
    if cache_key in CACHE:
        return CACHE[cache_key]
    # Preserve line structure, translate line by line to keep bullets.
    lines = text.split("\n")
    out_lines = []
    for line in lines:
        if not line.strip():
            out_lines.append(line)
            continue
        # Do not translate pure separators
        if line.strip() in {"-", "•"}:
            out_lines.append(line)
            continue
        # Preserve leading bullet markers and whitespace
        prefix = ""
        rest = line
        m = re.match(r"^(\s*[-•*]+\s*)(.+)$", line)
        if m:
            prefix = m.group(1)
            rest = m.group(2)
        # Translate the rest
        translated = _translate_single(rest, target, source)
        out_lines.append(prefix + translated)
    result = "\n".join(out_lines)
    CACHE[cache_key] = result
    return result


def _translate_single(text, target, source):
    # Use Google translate API (free endpoint)
    q = urllib.parse.quote(text)
    url = (
        "https://translate.googleapis.com/translate_a/single"
        f"?client=gtx&sl={source}&tl={target}&dt=t&q={q}"
    )
    with urllib.request.urlopen(url) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    # data[0] is list of translations
    translated = "".join(chunk[0] for chunk in data[0] if chunk[0])
    # Light cleanup
    return translated.strip()


def ensure_bilingual(entry, context_label):
    changed = False
    title = entry.get("title") or ""
    title_en = entry.get("titleEn") or ""
    desc = entry.get("description") or ""
    desc_en = entry.get("descriptionEn") or ""

    title_lang = lang_hint(title)
    title_en_lang = lang_hint(title_en)
    desc_lang = lang_hint(desc)
    desc_en_lang = lang_hint(desc_en)

    # Fix title/titleEn
    if not title and title_en:
        entry["title"] = translate_text(title_en, "de", "en")
        changed = True
    elif not title_en and title:
        entry["titleEn"] = translate_text(title, "en", "de")
        changed = True
    else:
        if title == title_en and title:
            # If identical, translate based on hint or default to de->en
            if title_lang == "en":
                entry["title"] = translate_text(title, "de", "en")
            else:
                entry["titleEn"] = translate_text(title, "en", "de")
            changed = True
        else:
            if title_lang == "en" and title_en_lang == "de":
                # likely swapped
                entry["title"], entry["titleEn"] = title_en, title
                changed = True
            elif title_lang == "en" and title_en_lang != "en":
                entry["title"] = translate_text(title, "de", "en")
                changed = True
            elif title_lang == "de" and title_en_lang != "en":
                entry["titleEn"] = translate_text(title, "en", "de")
                changed = True

    # Fix description/descriptionEn
    if not desc and desc_en:
        entry["description"] = translate_text(desc_en, "de", "en")
        changed = True
    elif not desc_en and desc:
        entry["descriptionEn"] = translate_text(desc, "en", "de")
        changed = True
    else:
        if desc == desc_en and desc:
            if desc_lang == "en":
                entry["description"] = translate_text(desc, "de", "en")
            else:
                entry["descriptionEn"] = translate_text(desc, "en", "de")
            changed = True
        else:
            if desc_lang == "en" and desc_en_lang == "de":
                entry["description"], entry["descriptionEn"] = desc_en, desc
                changed = True
            elif desc_lang == "en" and desc_en_lang != "en":
                entry["description"] = translate_text(desc, "de", "en")
                changed = True
            elif desc_lang == "de" and desc_en_lang != "en":
                entry["descriptionEn"] = translate_text(desc, "en", "de")
                changed = True

    return changed


def main():
    files = sorted(QST_DIR.glob("*.json"))
    if not files:
        print("No JSON files found.")
        return
    total_changed = 0
    for path in files:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        changed = False
        # Top-level
        if ensure_bilingual(data, f"top:{path.name}"):
            changed = True
        # Goals
        goals = data.get("goals") or []
        for goal in goals:
            if ensure_bilingual(goal, f"goal:{goal.get('shortKey','')}@{path.name}"):
                changed = True
        if changed:
            total_changed += 1
            with path.open("w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=4)
    print(f"Updated {total_changed} files.")


if __name__ == "__main__":
    main()
