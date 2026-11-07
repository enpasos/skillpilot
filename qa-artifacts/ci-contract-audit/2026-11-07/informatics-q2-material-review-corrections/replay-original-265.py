#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Run the byte-preserved265fixture tests with their captured input path rebound only."""
from pathlib import Path
import hashlib
r=Path(__file__).parent
assert hashlib.sha256((r/'shared-author-input.json').read_bytes()).hexdigest()=='4cc15cc59ada804de389b10b1a6c381d22690eba70857df8748eaada48944002'
p=r/'run-reference-checks.py';source=p.read_text();old='/dev/shm/informatics-q2-implementation-20261107/shared-author-input.json';assert source.count(old)==1
source=source.replace(old,str(r/'shared-author-input.json'))
exec(compile(source,str(p),'exec'),{'__file__':str(p),'__name__':'__main__'})
