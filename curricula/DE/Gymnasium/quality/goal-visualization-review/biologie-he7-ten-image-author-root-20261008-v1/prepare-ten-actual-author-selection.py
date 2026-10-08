# SPDX-License-Identifier: Apache-2.0
"""Select actually inspected PNG candidates; this is no quality approval."""
from pathlib import Path
import hashlib
import json
import struct

own = Path(__file__).resolve().parent
root = own.parents[5]
selections = [
    ('8d35381e-d646-512c-b0c2-bb90c4974208', 1, 'Ein Kind beobachtet eine blühende Pflanze; Tiere veranschaulichen weitere Gegenstände der Biologie.'),
    ('55bdfb1d-5c14-5b1c-bc8e-4ab428ef59ba', 2, 'Pflanze und Schnecke mit Motiven für Wachstum, Ernährung, Fortpflanzung, Zellen und Reaktion auf Licht.'),
    ('91df35c7-e384-50d6-bb3a-37e74a6086f1', 1, 'Schulmikroskop, einfaches Zwiebelhautpräparat und mikroskopischer Zellenausschnitt.'),
    ('e0d04e58-1591-5230-bfa6-5c685b56d25b', 1, 'Vereinfachte grüne Blattzelle mit Zellwand, Zellmembran, Zellkern, Zentralvakuole, Chloroplasten und Mitochondrien.'),
    ('b1dff57f-329e-5264-b2b9-2db71a0b2172', 1, 'Vergleich einer grünen Blattzelle mit einer Tierzelle; gemeinsame und verschiedene Strukturen sind erkennbar.'),
    ('fc89ed54-1a78-55a9-8e54-751d6d46dad6', 1, 'Ein teilweise lichtdicht abgedecktes Blatt und die unterschiedliche Stärkefärbung nach dem Test.'),
    ('0d96a802-2a8d-5445-a7fa-02387f6b1f2d', 1, 'Zwei gleich beleuchtete, mit Wasser versorgte Pflanzen unter Glasglocken; nur rechts wird Kohlenstoffdioxid absorbiert.'),
    ('e6f128c8-b38e-5167-9367-77e079a994c3', 2, 'Stärkenachweis am entfärbten Blatt und getrennte Gasgewinnung mit anschließender positiver Glimmspanprobe.'),
    ('576d59e2-397a-5654-b853-7c0c4870fbd3', 1, 'Wortgleichung der Fotosynthese: Kohlenstoffdioxid und Wasser werden unter Licht zu Traubenzucker und Sauerstoff.'),
    ('8678d0b5-8b74-5b01-8143-91bfea1e4482', 1, 'Fotosynthese liefert organische Stoffe und Sauerstoff; Pflanze und Tier nutzen organische Stoffe und Sauerstoff für die Zellatmung.'),
]
rows = []
for ordinal, (gid, version, alt) in enumerate(selections, 1):
    p = own / 'candidates' / gid / f'candidate-v{version}.png'
    data = p.read_bytes()
    assert data[:8] == b'\x89PNG\r\n\x1a\n'
    width, height = struct.unpack('>II', data[16:24])
    assert width >= 1500 and 1.70 <= width / height <= 1.85
    rows.append({
        'ordinal': ordinal, 'goalId': gid, 'path': str(p.relative_to(root)),
        'sha256': hashlib.sha256(data).hexdigest(), 'version': version,
        'width': width, 'height': height, 'provider': 'ChatGPT/Codex builtin image_gen',
        'servingModel': 'not exposed by tool',
        'promptPath': str((own / 'prompts' / f'{gid}.v{version}.actual.prompt.md').relative_to(root)),
        'toolProvenancePath': str((p.parent / f'generation-v{version}.actual.provenance.json').relative_to(root)),
        'altDe': alt,
        'fullImageAuthorInspectionBasis': 'Actual full PNG viewed by root image author. Both concrete targeted corrections and prior versions remain preserved. Actual widths and native independent reviews are separate pending steps.',
        'independentApproval': 'pending', 'humanApproval': False,
    })
with (own / 'selected-ten-author-images.exact.json').open('x') as f:
    json.dump({'artifactKind': 'ten-explicit-actual-PNG-author-selection', 'images': rows,
               'generationIsNotApproval': True, 'strictGainClaimed': 0}, f, ensure_ascii=False, indent=2)
    f.write('\n')
print(json.dumps({'selected': len(rows), 'newStrictCompletions': 0}))
