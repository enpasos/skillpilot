from pathlib import Path

BASE = Path('/home/enpasos/projects/skillpilot')
RAW_DIR = BASE / 'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/raw'

TITLES = {
    'PH2127': {
        'title': 'Oberflächenphysik',
        'title_en': 'Surface Physics',
    },
    'PH2141': {
        'title': 'Nanotechnologie',
        'title_en': 'Nanotechnology',
    },
}

for code, values in TITLES.items():
    path = RAW_DIR / f'DE_BAY_U_TUM_{code}.txt'
    if not path.exists():
        raise SystemExit(f'Missing raw file: {path}')
    lines = path.read_text(encoding='utf-8').splitlines()
    new_lines = []
    for line in lines:
        if line.startswith('title: '):
            new_lines.append(f"title: {values['title']}")
        elif line.startswith('title_en: '):
            new_lines.append(f"title_en: {values['title_en']}")
        else:
            new_lines.append(line)
    path.write_text('\n'.join(new_lines).strip() + '\n', encoding='utf-8')
