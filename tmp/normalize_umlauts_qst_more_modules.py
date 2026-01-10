import json
from pathlib import Path

BASE = Path('/home/enpasos/projects/skillpilot')
JSON_DIR = BASE / 'curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json'

MODULES = [
    'CH3337',
    'CIT4330012',
    'CIT4330013',
    'CIT4430005',
    'EI70760',
    'EI77006',
    'NAT3036',
    'NAT5008m',
    'NAT5030m',
    'NAT7003',
    'NAT7026',
    'PH2127',
    'PH2141',
]

REPLACEMENTS = [
    ("Aenderungen", "Änderungen"),
    ("Aetzen", "Ätzen"),
    ("Aktivitaet", "Aktivität"),
    ("Ansaetze", "Ansätze"),
    ("Ansaetzen", "Ansätzen"),
    ("Ausfuehren", "Ausführen"),
    ("ausfuehren", "ausführen"),
    ("Baender", "Bänder"),
    ("Duenne", "Dünne"),
    ("duenne", "dünne"),
    ("Duennfilmwachstum", "Dünnfilmwachstum"),
    ("Eigenzustaende", "Eigenzustände"),
    ("Einfuehrung", "Einführung"),
    ("Fertigungsansaetze", "Fertigungsansätze"),
    ("Festkoerpereigenschaften", "Festkörpereigenschaften"),
    ("Festkoerpern", "Festkörpern"),
    ("Festkoerperplattformen", "Festkörperplattformen"),
    ("Festkoerperstrukturen", "Festkörperstrukturen"),
    ("festkoerperphysikalische", "festkörperphysikalische"),
    ("Geraete", "Geräte"),
    ("Geraeteanwendungen", "Geräteanwendungen"),
    ("Geraeteverhalten", "Geräteverhalten"),
    ("Grenzflaechen", "Grenzflächen"),
    ("Grenzflaecheneffekte", "Grenzflächeneffekte"),
    ("Grenzflaecheneigenschaften", "Grenzflächeneigenschaften"),
    ("Grenzflaechenphaenomene", "Grenzflächenphänomene"),
    ("Grenzflächenphaenomene", "Grenzflächenphänomene"),
    ("Groesseneffekte", "Größeneffekte"),
    ("Gross", "Groß"),
    ("Grundzustaende", "Grundzustände"),
    ("Hohlraeume", "Hohlräume"),
    ("Kanaele", "Kanäle"),
    ("Kohaerente", "Kohärente"),
    ("Kohaerenz", "Kohärenz"),
    ("Kohaerenzeigenschaften", "Kohärenzeigenschaften"),
    ("Konnektivitaet", "Konnektivität"),
    ("Kuehlung", "Kühlung"),
    ("Lektuere", "Lektüre"),
    ("Loesung", "Lösung"),
    ("Loesungsmethoden", "Lösungsmethoden"),
    ("Molekuele", "Moleküle"),
    ("Molekuelen", "Molekülen"),
    ("Molekuels", "Moleküls"),
    ("Molekuelsymmetrie", "Molekülsymmetrie"),
    ("Nanodraehte", "Nanodrähte"),
    ("Oberflaechen", "Oberflächen"),
    ("Oberflaechenanalytik", "Oberflächenanalytik"),
    ("Oberflaechencharakterisierung", "Oberflächencharakterisierung"),
    ("Oberflaecheneffekte", "Oberflächeneffekte"),
    ("Oberflaecheneigenschaften", "Oberflächeneigenschaften"),
    ("Oberflaechenkristallographie", "Oberflächenkristallographie"),
    ("Oberflaechenmessmethoden", "Oberflächenmessmethoden"),
    ("Oberflaechenphysik", "Oberflächenphysik"),
    ("Oberflaechenstruktur", "Oberflächenstruktur"),
    ("Oberflaechensymmetrie", "Oberflächensymmetrie"),
    ("Oberflaechenzustaende", "Oberflächenzustände"),
    ("Oberflächenzustaende", "Oberflächenzustände"),
    ("Phaenomene", "Phänomene"),
    ("Phasenuebergaenge", "Phasenübergänge"),
    ("Praeparation", "Präparation"),
    ("Praesentation", "Präsentation"),
    ("Praesentationen", "Präsentationen"),
    ("praesentieren", "präsentieren"),
    ("Schroedinger", "Schrödinger"),
    ("Superfluiditaet", "Superfluidität"),
    ("Uebergaenge", "Übergänge"),
    ("Uebergang", "Übergang"),
    ("Verschraenkung", "Verschränkung"),
    ("Verschraenkungsverteilung", "Verschränkungsverteilung"),
    ("Verschraenkungsverteilungsprotokolle", "Verschränkungsverteilungsprotokolle"),
    ("Vortraege", "Vorträge"),
    ("quantennaoelektronische", "quantennanoelektronische"),
    ("Woechentliche", "Wöchentliche"),
    ("Zustaende", "Zustände"),
    ("Quantenzustaende", "Quantenzustände"),
    ("Quantenzustaenden", "Quantenzuständen"),
    ("aehnlichen", "ähnlichen"),
    ("auswaehlen", "auswählen"),
    ("einschaetzen", "einschätzen"),
    ("erklaeren", "erklären"),
    ("erlaeutern", "erläutern"),
    ("erschliessen", "erschließen"),
    ("fuehrt", "führt"),
    ("fuer", "für"),
    ("gaengige", "gängige"),
    ("gegenueberstellen", "gegenüberstellen"),
    ("groessenabhaengige", "größenabhängige"),
    ("kohaerente", "kohärente"),
    ("praesentieren", "präsentieren"),
    ("pruefen", "prüfen"),
    ("selbstaendig", "selbständig"),
    ("verknuepfen", "verknüpfen"),
    ("verschraenkte", "verschränkte"),
    ("verstaendlich", "verständlich"),
    ("verstaendliche", "verständliche"),
]


def apply_replacements(text: str) -> str:
    for old, new in REPLACEMENTS:
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


for code in MODULES:
    path = JSON_DIR / f'DE_BAY_U_TUM_{code}.de.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    walk(data)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=4) + '\n', encoding='utf-8')
    print(f'Updated umlauts in {path}')
