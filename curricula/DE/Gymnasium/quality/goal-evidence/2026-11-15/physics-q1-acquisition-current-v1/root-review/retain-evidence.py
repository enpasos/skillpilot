"""Retain byte-exact author/reviewer evidence, compressing large raw artifacts."""
import datetime, gzip, hashlib, json
from pathlib import Path

DEST = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/physics-q1-acquisition-current-v1')
assert not DEST.exists(), 'Never overwrite a retained evidence epoch.'
sources = {
    'physics-q1-current-acquisition-20261115-v1':'author-v1',
    'physics-q1-current-acquisition-20261115-v2':'author-v2',
    'physics-q1-current-acquisition-20261115-v3':'author-v3',
    'physics-seki-digital-acquisition-20261115-v1':'seki-author',
    'physics-q1-root-nine-review-20261115':'root-review',
    'physics-q1-independent-release-review-20261115':'independent-review',
    'physics-k12-biophysics-current-20261115':'k12-author-v1',
    'physics-k12-biophysics-current-20261115-v2':'k12-author-v2',
}
digest = lambda raw: hashlib.sha256(raw).hexdigest()
records, external = [], []
for source_name,target_name in sources.items():
    source = Path('tmp')/source_name
    for path in sorted(source.rglob('*')):
        if not path.is_file() or '__pycache__' in path.parts:
            continue
        raw = path.read_bytes()
        if path.name == 'lehrplanplus-primary-live.html':
            external.append({'sourcePath':str(path),'sha256':digest(raw),
                'url':'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/physik/grundlegend-bio',
                'reason':'Third-party webpage is cited by the review; its full HTML is not republished in this evidence delivery.'})
            continue
        relative = Path(target_name)/path.relative_to(source)
        compressed = len(raw)>128_000
        if compressed:
            relative = Path(str(relative)+'.gz')
        stored = gzip.compress(raw,compresslevel=9,mtime=0) if compressed else raw
        assert (gzip.decompress(stored) if compressed else stored) == raw
        target = DEST/relative
        target.parent.mkdir(parents=True,exist_ok=True)
        target.write_bytes(stored)
        assert path.read_bytes() == raw, 'Source changed during retention.'
        records.append({'sourcePath':str(path),'retainedPath':str(target),'rawSha256':digest(raw),
                        'rawBytes':len(raw),'encoding':'gzip' if compressed else 'identity',
                        'storedSha256':digest(stored),'storedBytes':len(stored)})
manifest = {'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'kind':'byte-exact-relocation-of-genuine-author-and-independent-review-artifacts',
    'status':'CONTENT_ACCEPTED_NATIVE_INTEGRATION_QA_PENDING',
    'reviewedQ1CandidateRawSha256':'9bf270c86a09fd40cfe577fc7a0bf11c1016be95faccc62315adbc62c028a3b9',
    'records':records,'externalCitedSourceNotRepublished':external,
    'totalRawBytes':sum(r['rawBytes'] for r in records),'totalStoredBytes':sum(r['storedBytes'] for r in records),
    'pathSemantics':'Original source paths inside immutable receipts are not rewritten. Resolve them with records.sourcePath; decompress gzip entries and compare rawSha256 before inspection.',
    'limits':['Author checks are separate from independent content reviews.',
              'No native D/P/CQR, current route/placement, classroom effectiveness, integration or CI approval follows from artifact retention.',
              'No learner-result writes or transfer of historical task scoring contracts.']}
(DEST/'retained-artifact-map.actual.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(DEST/'README.md').write_text('''# Physik: konkrete Q1-Nachweise und frühe digitale Messaufgabe

Die beiden unabhängigen Inhaltsprüfungen akzeptieren zusammen den exakten
Q1-Kandidaten v3 mit 27 Aufgaben für 35 ganze Lernziele. Die frühe Messaufgabe
wurde getrennt geprüft. Der Biophysik-Voraussetzungsvorschlag v1 blieb nach vier
fachlichen Befunden auf HOLD; der korrigierte v2 wurde begrenzt akzeptiert.

Die Rohbelege sind bytegetreu erhalten. Dateien über 128.000 Bytes liegen
verlustfrei komprimiert als `.gz` vor; `gzip -dc DATEI.gz` zeigt ihren Inhalt.
`retained-artifact-map.actual.json` ordnet jeden ursprünglichen Pfad dem
erhaltenen Artefakt zu und bindet sowohl gespeicherte als auch entpackte Bytes.
Die ursprünglichen Reviewpfade und Aussagen werden dadurch nicht umgeschrieben.
Die zitierte fremde Lehrplan-Webseite wird nicht vollständig neu veröffentlicht.

Kontrollpunkte: `root-review/review-v3.ACCEPT.actual.json`,
`independent-review/review.md`, `independent-review/seki-review.md` und
`k12-author-v2/independent-sol-review/review-v2.ACCEPT.md`.
Die früheren HOLD-Befunde bleiben als Geschichte erhalten.

Dies ist die Inhaltsprüfung. Aktuelle native Qualitätsprüfungen, zulässige
Erwerbswege in den echten Sichten, Integration und Main-CI sind eigene Nachweise.
Es wurde keine Unterrichtswirkung oder Übertragung gespeicherter Lernergebnisse
behauptet.
''')
print(json.dumps({'files':len(records),'rawBytes':manifest['totalRawBytes'],'storedBytes':manifest['totalStoredBytes']}))
