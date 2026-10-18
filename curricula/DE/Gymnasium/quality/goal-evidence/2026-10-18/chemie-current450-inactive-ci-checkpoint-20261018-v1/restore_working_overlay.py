#!/usr/bin/env python3
"""Preview the inactive working overlay; --apply restores it locally, without staging."""
import argparse
import json
from verify_checkpoint import ROOT, load_manifest, safe_file, verify


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--apply', action='store_true', help='Restore the frozen work locally; this does not claim M7 or CI PASS.')
    args = parser.parse_args()
    # Check every source and baseline before writing any target. Refuse drift.
    verify()
    manifest = load_manifest()
    entries = [e for e in manifest['files'] if e['restoreDuringM7Resumption']]
    if args.apply:
        for entry in entries:
            target = ROOT / entry['path']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(safe_file(entry['storedPath']).read_bytes())
    print(json.dumps({'operation': 'APPLIED_LOCAL_WORKING_OVERLAY' if args.apply else 'DRY_RUN_ONLY',
                      'files': len(entries), 'ordinaryGoals': 450, 'commit': False, 'push': False, 'M7Claim': False}))


if __name__ == '__main__':
    main()
