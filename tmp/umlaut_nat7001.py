import json
from pathlib import Path

path = Path('curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json/DE_BAY_U_TUM_NAT7001.de.json')

data = json.loads(path.read_text(encoding='utf-8'))

replacements = [
    ("Verschraenkungsressourcen", "Verschränkungsressourcen"),
    ("Verschraenkung", "Verschränkung"),
    ("Zustandsgroessen", "Zustandsgrößen"),
    ("Einfuehrung", "Einführung"),
    ("Uebergang", "Übergang"),
    ("Gauss'sche", "Gaußsche"),
    ("Gauss-Strahlen", "Gauß-Strahlen"),
    ("Intensitaetsprofile", "Intensitätsprofile"),
    ("Kohaerenzeigenschaften", "Kohärenzeigenschaften"),
    ("Kohaerenzfunktionen", "Kohärenzfunktionen"),
    ("Kohaerenz", "Kohärenz"),
    ("Kohaerent", "Kohärent"),
    ("kohaerent", "kohärent"),
    ("Zerstoerungsfreie", "Zerstörungsfreie"),
    ("abschaetzen", "abschätzen"),
    ("benoetigten", "benötigten"),
    ("repraesentative", "repräsentative"),
    ("verknuepfen", "verknüpfen"),
    ("erklaeren", "erklären"),
    ("verstaerkte", "verstärkte"),
    ("zurueckgefuehrt", "zurückgeführt"),
    ("loesen", "lösen"),
    ("fuer", "für"),
    ("Laenge", "Länge"),
    ("Zustaende", "Zustände"),
]


def apply_replacements(text: str) -> str:
    for old, new in replacements:
        text = text.replace(old, new)
    return text


def walk(obj):
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in {'title', 'description'} and isinstance(v, str):
                obj[k] = apply_replacements(v)
            elif isinstance(v, (dict, list)):
                walk(v)
    elif isinstance(obj, list):
        for item in obj:
            walk(item)

walk(data)

path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + "\n", encoding='utf-8')
