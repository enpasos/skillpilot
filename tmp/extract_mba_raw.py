#!/usr/bin/env python3
import re
from pathlib import Path
from typing import List, Tuple
from PyPDF2 import PdfReader

BASE = Path(__file__).resolve().parents[1]
PDF_PATH = BASE / 'curricula/DE/BY/TUM/MBA/input/Modulehandbook_MBA Executive Master of Business Administration.pdf'
RAW_DIR = BASE / 'curricula/DE/BY/TUM/MBA/input/raw'

CODE_LINE_RE = re.compile(r'^([A-Z]{2,4}\d{6})\s*:\s*(.+?)\s*\|\s*(.+)$')
CODE_PREFIX_RE = re.compile(r'^[A-Z]{2,4}\d{6}:')


def normalize_spaces(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()


def normalize_ascii(text: str) -> str:
    replacements = {
        '\u2013': '-',
        '\u2014': '-',
        '\u2018': "'",
        '\u2019': "'",
        '\u201c': '"',
        '\u201d': '"',
        '\u2022': '-',
        '\u00a0': ' ',
    }
    for src, dst in replacements.items():
        text = text.replace(src, dst)
    return text


def clean_lines(lines: List[str]) -> List[str]:
    cleaned = []
    for line in lines:
        line = normalize_ascii(line)
        line = line.strip()
        if not line:
            continue
        if line.startswith('Module Catalog of the study program'):
            continue
        if line.startswith('Generated on '):
            continue
        if line == 'Module Description':
            continue
        if CODE_LINE_RE.match(line) or CODE_PREFIX_RE.match(line):
            continue
        cleaned.append(line)
    return cleaned


def extract_section(text: str, start_label: str, end_labels: List[str]) -> str:
    pattern = re.compile(rf'{re.escape(start_label)}\s*(.*)', re.DOTALL)
    match = pattern.search(text)
    if not match:
        return ''
    section = match.group(1)
    end_positions = []
    for label in end_labels:
        end_match = re.search(rf'(?:^|\n){re.escape(label)}', section)
        if end_match:
            end_positions.append(end_match.start())
    if end_positions:
        section = section[:min(end_positions)]
    return section.strip()


def normalize_section(text: str) -> str:
    text = normalize_ascii(text)
    lines = [line.strip() for line in text.splitlines()]
    lines = [line for line in lines if line]

    merged = []
    current = ''
    for line in lines:
        line = normalize_spaces(line)
        if line.startswith('-'):
            if current:
                merged.append(current)
                current = ''
            line = line[1:].strip()
            current = f"- {line}"
        else:
            if current:
                current += f" {line}"
            else:
                current = line
    if current:
        merged.append(current)

    return '\n'.join(merged).strip()


def parse_ects(text: str) -> str:
    flat = normalize_spaces(normalize_ascii(text))
    match = re.search(r'Credits:\*\s*(\d+(?:\.\d+)?)', flat)
    if match:
        return match.group(1)
    return ''


def parse_prerequisites(text: str) -> str:
    for label in ['(Recommended) Prerequisites:', 'Prerequisites:']:
        section = extract_section(text, label, ['Content:', 'Intended Learning Outcomes:', 'Teaching and Learning Methods:'])
        if section:
            return normalize_section(section)
    return ''


def parse_module_blocks(reader: PdfReader) -> List[Tuple[int, str, str, str]]:
    starts = []
    for idx, page in enumerate(reader.pages):
        text = page.extract_text() or ''
        if 'Module Description' not in text:
            continue
        lines = text.splitlines()
        for line in lines:
            line = line.strip()
            match = CODE_LINE_RE.match(line)
            if match:
                code, title, title_en = match.groups()
                title = normalize_ascii(title).strip()
                title_en = normalize_ascii(title_en).strip()
                if title_en and title_en in title and len(title_en) < len(title):
                    title_en = title
                starts.append((idx, code, title, title_en))
                break
    return starts


def main():
    RAW_DIR.mkdir(parents=True, exist_ok=True)

    reader = PdfReader(str(PDF_PATH))
    starts = parse_module_blocks(reader)
    if not starts:
        raise SystemExit('No module blocks detected.')

    starts_sorted = sorted(starts, key=lambda x: x[0])

    for i, (start_page, code, title, title_en) in enumerate(starts_sorted):
        end_page = starts_sorted[i + 1][0] if i + 1 < len(starts_sorted) else len(reader.pages)

        pages_text = []
        for idx in range(start_page, end_page):
            pages_text.append(reader.pages[idx].extract_text() or '')

        raw_text = '\n'.join(pages_text)
        raw_lines = clean_lines(raw_text.splitlines())
        raw_text = '\n'.join(raw_lines)

        ects = parse_ects(raw_text)
        content = extract_section(raw_text, 'Content:', ['Intended Learning Outcomes:', 'Teaching and Learning Methods:', 'Media:', 'Reading List:', 'Responsible for Module:', 'Courses (Type of course, Weekly hours per semester), Instructor:'])
        outcomes = extract_section(raw_text, 'Intended Learning Outcomes:', ['Teaching and Learning Methods:', 'Media:', 'Reading List:', 'Responsible for Module:', 'Courses (Type of course, Weekly hours per semester), Instructor:'])
        preconditions = parse_prerequisites(raw_text)

        content = normalize_section(content)
        outcomes = normalize_section(outcomes)
        preconditions = normalize_section(preconditions) or 'None'

        title_ascii = normalize_ascii(title)
        title_en_ascii = normalize_ascii(title_en)

        out_path = RAW_DIR / f'DE_BAY_U_TUM_{code}.txt'
        with out_path.open('w', encoding='utf-8') as f:
            f.write(f"code: {code}\n")
            f.write(f"title: {title_ascii}\n")
            f.write(f"title_en: {title_en_ascii}\n")
            if ects:
                f.write(f"ects: {ects}\n")
            f.write("\ncontent:\n")
            f.write(content + "\n" if content else "\n")
            f.write("\noutcomes:\n")
            f.write(outcomes + "\n" if outcomes else "\n")
            f.write("\npreconditions:\n")
            f.write(preconditions + "\n")

        print(f"Wrote {out_path}")


if __name__ == '__main__':
    main()
