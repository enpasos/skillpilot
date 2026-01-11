#!/usr/bin/env python3
import re
from pathlib import Path

BASE = Path(__file__).resolve().parents[1]
RAW_DIR = BASE / 'curricula/DE/BY/TUM/MBA/input/raw'
RAWGRAPH_DIR = BASE / 'curricula/DE/BY/TUM/MBA/input/rawgraph'

GERUND_MAP = {
    'analyzing': 'analyze',
    'evaluating': 'evaluate',
    'understanding': 'understand',
    'applying': 'apply',
    'defining': 'define',
    'explaining': 'explain',
    'interpreting': 'interpret',
    'distinguishing': 'distinguish',
    'designing': 'design',
    'implementing': 'implement',
    'monitoring': 'monitor',
    'controlling': 'control',
    'managing': 'manage',
    'planning': 'plan',
    'leading': 'lead',
    'developing': 'develop',
    'assessing': 'assess',
    'communicating': 'communicate',
}


def normalize_spaces(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()


def parse_raw_file(path: Path):
    text = path.read_text(encoding='utf-8')
    def extract(label):
        pattern = re.compile(rf'^{label}:\s*(.*)$', re.MULTILINE)
        match = pattern.search(text)
        return match.group(1).strip() if match else ''

    code = extract('code')
    title = extract('title')
    title_en = extract('title_en') or title

    content_match = re.search(r'^content:\n(.*?)\n\noutcomes:', text, re.DOTALL | re.MULTILINE)
    outcomes_match = re.search(r'^outcomes:\n(.*?)\n\npreconditions:', text, re.DOTALL | re.MULTILINE)

    content_text = content_match.group(1).strip() if content_match else ''
    outcomes_text = outcomes_match.group(1).strip() if outcomes_match else ''

    return {
        'code': code,
        'title': title,
        'title_en': title_en,
        'content_text': content_text,
        'outcomes_text': outcomes_text,
    }


def split_content_items(content_text: str):
    lines = [line.strip() for line in content_text.splitlines() if line.strip()]
    bullet_lines = [line[2:].strip() for line in lines if line.startswith('- ')]
    if bullet_lines:
        return bullet_lines

    text = normalize_spaces(content_text)
    if not text:
        return []
    if ';' in text:
        items = [item.strip() for item in text.split(';') if item.strip()]
        return items
    return [text]


def split_outcome_items(outcomes_text: str):
    lines = [line.strip() for line in outcomes_text.splitlines() if line.strip()]
    bullet_lines = [line[2:].strip() for line in lines if line.startswith('- ')]
    if bullet_lines:
        return bullet_lines

    text = normalize_spaces(outcomes_text)
    if not text:
        return []
    # Split into sentences.
    sentences = re.split(r'(?<=[.!?])\s+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    return sentences


def normalize_gerunds(text: str) -> str:
    words = text.split()
    if not words:
        return text
    first = re.sub(r'[^a-zA-Z]', '', words[0]).lower()
    if first in GERUND_MAP:
        words[0] = GERUND_MAP[first]
    text = ' '.join(words)

    for gerund, base in GERUND_MAP.items():
        text = re.sub(rf'\band\s+{gerund}\b', f'and {base}', text, flags=re.IGNORECASE)
    return text


def clean_outcome_item(item: str) -> str:
    item = normalize_spaces(item.strip(' -'))

    replacements = [
        (r'^This Certificate Program covers\s+', 'understand '),
        (r'^This program covers\s+', 'understand '),
        (r'^This program on .*?students learn how to\s+', ''),
        (r'^In this program on .*?students learn how to\s+', ''),
    ]
    for pattern, repl in replacements:
        item = re.sub(pattern, repl, item, flags=re.IGNORECASE)

    patterns = [
        r'^After participating in this module,\s*(students|participants)\s*(are able to|will be able to|will)\s+',
        r'^After participating in this module\s*(students|participants)\s*(are able to|will be able to|will)\s+',
        r'^After participating in this module,\s*the students\s*(are able to|will be able to|will)\s+',
        r'^After participating in this module,\s*the participants\s*(are able to|will be able to|will)\s+',
        r'^After participation in this module,\s*(students|participants)\s*(are able to|will be able to|will)\s+',
        r'^After participation in this module,\s*the students\s*(are able to|will be able to|will)\s+',
        r'^After participation in this module,\s*the participants\s*(are able to|will be able to|will)\s+',
        r'^After the course,\s*participants\s*(can|are able to|will be able to)\s+',
        r'^Participants\s*(acquire the ability to|will be able to|are able to)\s+',
        r'^Students\s*(are able to|will be able to|will)\s+',
        r'^The students\s*are able to\s+',
        r'^The participants\s*are able to\s+',
        r'^(Furthermore,\s*)?they\s*(are capable of|are able to|will be able to|will)\s+',
    ]
    for pattern in patterns:
        item = re.sub(pattern, '', item, flags=re.IGNORECASE)

    item = item.strip()
    # Normalize common phrasing.
    item = item.replace(' and how to ', ' and ')
    item = item.replace(' and to ', ' and ')

    # Clean leading punctuation or connectors.
    item = re.sub(r'^(and|furthermore|therefore)\s+', '', item, flags=re.IGNORECASE)
    item = normalize_gerunds(item)
    return item.strip()


def make_title(text: str, max_len: int = 80) -> str:
    title = text.strip().rstrip('.')
    if ':' in title:
        title = title.split(':', 1)[0].strip()
    title = normalize_spaces(title)
    if len(title) > max_len:
        title = title[:max_len - 3].rstrip() + '...'
    return title


def make_description(prefix: str, text: str) -> str:
    desc = normalize_spaces(text)
    if not desc:
        return f"{prefix} apply the module topics."
    if not desc.endswith(('.', '!', '?')):
        desc += '.'
    return f"{prefix} {desc}"


def build_rawgraph(data: dict) -> str:
    code = data['code']
    title_en = data['title_en'] or data['title']

    content_items = split_content_items(data['content_text'])
    outcome_items = split_outcome_items(data['outcomes_text'])

    cleaned_outcomes = [clean_outcome_item(item) for item in outcome_items if clean_outcome_item(item)]

    root_desc = ''
    if cleaned_outcomes:
        root_desc = make_description('The learner can', cleaned_outcomes[0])
    else:
        root_desc = 'The learner can apply the module topics in practice.'

    lines = []
    lines.append(f"# {code} {title_en} - rawgraph breakdown")
    lines.append("")
    lines.append(f"Node: {title_en} ({code})")
    lines.append(f"Description: {root_desc}")
    lines.append("")

    # Core topics category
    lines.append("  Node: Core topics")
    lines.append("  Description: The learner can explain and apply the core topics of the module.")
    lines.append("")

    for item in content_items:
        title = make_title(item)
        desc = make_description('The learner can explain and apply', item)
        lines.append(f"    Node: {title}")
        lines.append(f"    Description: {desc}")
        lines.append("")

    # Learning outcomes category
    lines.append("  Node: Learning outcomes")
    lines.append("  Description: The learner can demonstrate the intended learning outcomes.")
    lines.append("")

    for item in cleaned_outcomes:
        title = make_title(item)
        desc = make_description('The learner can', item)
        lines.append(f"    Node: {title}")
        lines.append(f"    Description: {desc}")
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"


def main():
    RAWGRAPH_DIR.mkdir(parents=True, exist_ok=True)
    for path in sorted(RAW_DIR.glob('DE_BAY_U_TUM_*.txt')):
        data = parse_raw_file(path)
        if not data['code']:
            continue
        rawgraph_text = build_rawgraph(data)
        out_path = RAWGRAPH_DIR / path.name
        out_path.write_text(rawgraph_text, encoding='utf-8')
        print(f"Wrote {out_path}")


if __name__ == '__main__':
    main()
