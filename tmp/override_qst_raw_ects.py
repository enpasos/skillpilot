from pathlib import Path

BASE = Path('/home/enpasos/projects/skillpilot')
RAW_DIR = BASE / 'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/input/raw'

ECTS = {
    'CH3337': '4',
    'CIT4330012': '5',
    'CIT4330013': '5',
    'CIT4430005': '5',
    'EI70760': '5',
    'EI77006': '3',
    'NAT3036': '5',
    'NAT5008m': '5',
    'NAT5030m': '5',
    'NAT7001': '10',
    'NAT7003': '5',
    'NAT7026': '5',
    'PH2127': '5',
    'PH2141': '5',
}

for code, ects in ECTS.items():
    path = RAW_DIR / f'DE_BAY_U_TUM_{code}.txt'
    if not path.exists():
        raise SystemExit(f'Missing raw file: {path}')
    lines = path.read_text(encoding='utf-8').splitlines()
    new_lines = []
    for line in lines:
        if line.startswith('ects: '):
            new_lines.append(f'ects: {ects}')
        elif line.startswith('ects_plan: '):
            new_lines.append(f'ects_plan: {ects}')
        else:
            new_lines.append(line)
    path.write_text('\n'.join(new_lines).strip() + '\n', encoding='utf-8')
