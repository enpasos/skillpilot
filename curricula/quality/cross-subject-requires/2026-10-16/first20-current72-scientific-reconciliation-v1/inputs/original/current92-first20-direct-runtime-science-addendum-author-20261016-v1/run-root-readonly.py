"""Run this task's private regressions with OS-enforced source immutability.

SPDX-License-Identifier: Apache-2.0
"""
from pathlib import Path
import hashlib
import os
import subprocess
import sys

R = Path('/home/enpasos/projects/skillpilot')
lane = R / 'tmp/cross-subject-requires/current92-first20-direct-runtime-science-addendum-author-20261016-v1'
base = R / 'tmp/ci-tools/hermetic-consumer-tools-20261015-v1'
bwrap = base / 'root/usr/bin/bwrap'
merged = base / 'usr-bin-with-verified-tools'
assert lane.is_dir() and lane.resolve() == lane
assert Path.cwd().resolve().is_relative_to(lane), 'Use the private candidate working directory'
assert hashlib.sha256(bwrap.read_bytes()).hexdigest() == 'e318903862396f96de3df57264e0158682b952fd3fb53ac23d876413e7b30f71'
assert hashlib.sha256((merged / 'bwrap').read_bytes()).hexdigest() == 'e318903862396f96de3df57264e0158682b952fd3fb53ac23d876413e7b30f71'
assert hashlib.sha256((merged / 'strace').read_bytes()).hexdigest() == '28f957c227012de0b18d1bd7fff2d396cb693ea60ed8013be68de071e84b5001'
assert len(sys.argv) > 1
argv = [str(bwrap), '--die-with-parent', '--new-session', '--unshare-user',
        '--unshare-pid', '--unshare-ipc', '--unshare-uts', '--unshare-net',
        '--cap-drop', 'ALL', '--ro-bind', '/', '/', '--bind', str(lane), str(lane),
        '--tmpfs', '/run', '--ro-bind', '/usr/bin', '/run/skillpilot-host-usr-bin',
        '--ro-bind', str(merged), '/usr/bin', '--tmpfs', '/tmp',
        '--proc', '/proc', '--dev', '/dev', '--chdir', os.getcwd(), '--', *sys.argv[1:]]
raise SystemExit(subprocess.run(argv).returncode)
