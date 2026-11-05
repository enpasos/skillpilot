"""Prepare the unpublished 0.2.0 learning-unit instruction candidate locally.

The tested 0.1.0 import artifact and first-party download are never overwritten.
"""
from hashlib import sha256
from io import BytesIO
import json
from pathlib import Path
from zipfile import ZipFile, ZipInfo, ZIP_STORED


def main():
    root = Path(__file__).resolve().parents[1]
    repo = root.parents[2]
    sources = {'SKILL.md': (root / 'candidates/0.2.0/SKILL.md').read_bytes(), 'LICENSE.txt': (repo / 'LICENSE').read_bytes()}
    buffer = BytesIO()
    with ZipFile(buffer, 'w', compression=ZIP_STORED) as archive:
        for name, content in sources.items():
            info = ZipInfo(name, (1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            archive.writestr(info, content)
    artifact = buffer.getvalue()
    output = repo / 'tmp/gemini-learning-units-candidate'
    output.mkdir(parents=True, exist_ok=True)
    archive_path = output / 'skillpilot-coach-v1-0.2.0.zip'
    archive_path.write_bytes(artifact)
    receipt = {'schemaVersion': 1, 'name': 'skillpilot-coach-v1', 'provider': 'gemini-v1', 'version': '0.2.0',
               'status': 'LOCAL_CANDIDATE', 'actualGeminiHostAcceptance': 'NOT_RUN',
               'path': str(archive_path.relative_to(repo)), 'sha256': sha256(artifact).hexdigest(),
               'files': {name: sha256(content).hexdigest() for name, content in sources.items()}}
    (output / 'manifest.json').write_text(json.dumps(receipt, indent=2) + '\n')
    print(json.dumps(receipt))


if __name__ == '__main__':
    main()
