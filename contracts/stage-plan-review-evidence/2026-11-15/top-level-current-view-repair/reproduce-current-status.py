#!/usr/bin/env python3
"""Replay the retained native harness against the subsequent task-release epoch."""
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

HERE = Path(__file__).resolve().parent
ROOT = next(p for p in HERE.parents if (p / 'curricula/curriculum_manifest.json').exists())

with tempfile.TemporaryDirectory(prefix='stage-current-status-', dir=ROOT / 'tmp') as temporary:
    runner = Path(temporary)
    for name in ('reproduce.py', 'comparison.actual.json', 'native-probe.mts.template', 'CompactMergeViewsProbe.java'):
        shutil.copyfile(HERE / name, runner / name)
    shutil.copyfile(HERE / 'current-status-input-pins.json', runner / 'input-pins.json')
    subprocess.run([sys.executable, str(runner / 'reproduce.py'), *sys.argv[1:]], cwd=ROOT, check=True)
