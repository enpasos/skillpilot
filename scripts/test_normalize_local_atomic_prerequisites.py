# SPDX-License-Identifier: Apache-2.0
import copy
import unittest
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from normalize_local_atomic_prerequisites import normalize


class AtomicNormalizationTest(unittest.TestCase):
    def test_inherit_expand_then_close_with_multiple_parents(self):
        document = {'landscapeId': 'fixture', 'goals': [
            {'id': 'left', 'contains': ['a'], 'requires': ['bundle']},
            {'id': 'right', 'contains': ['a'], 'requires': ['c']},
            {'id': 'bundle', 'contains': ['b', 'c']},
            {'id': 'a', 'description': 'unchanged'},
            {'id': 'b', 'requires': ['c']}, {'id': 'c', 'requires': ['d']}, {'id': 'd'},
        ]}
        original = copy.deepcopy(document)
        result, report = normalize(document, set())
        by_id = {goal['id']: goal for goal in result['goals']}
        self.assertEqual(by_id['a']['requires'], ['b'])
        self.assertEqual(by_id['left']['requires'], [])
        self.assertEqual(by_id['right']['requires'], [])
        self.assertTrue(report['atomicReachabilityPreservedAfterSelfRemoval'])
        self.assertEqual(document, original)
        for before, after in zip(document['goals'], result['goals']):
            self.assertEqual({k: v for k, v in before.items() if k != 'requires'},
                             {k: v for k, v in after.items() if k != 'requires'})
        self.assertEqual(normalize(result, set())[0], result)

    def test_orientation_self_pair_requires_exact_authorization(self):
        document = {'landscapeId': 'fixture', 'goals': [
            {'id': 'root', 'contains': ['orientation', 'content'], 'requires': ['orientation']},
            {'id': 'orientation'}, {'id': 'content'},
        ]}
        with self.assertRaisesRegex(ValueError, 'allowlist'):
            normalize(document, set())
        result, report = normalize(document, {'orientation'})
        self.assertEqual(report['removedSelfPairs'], ['orientation'])
        self.assertEqual(result['goals'][2]['requires'], ['orientation'])

    def test_report_only_rejects_source_path_and_filesystem_aliases(self):
        script = Path(__file__).with_name('normalize_local_atomic_prerequisites.py')
        with tempfile.TemporaryDirectory() as directory:
            source = Path(directory) / 'landscape.json'
            original = json.dumps({'landscapeId': 'fixture', 'goals': [{'id': 'a'}]}).encode()
            source.write_bytes(original)
            aliases = [source, source.parent / '.' / source.name]
            for kind in ('symlink', 'hardlink'):
                alias = source.with_name(kind + '.json')
                try:
                    if kind == 'symlink':
                        alias.symlink_to(source)
                    else:
                        os.link(source, alias)
                except (OSError, NotImplementedError):
                    continue
                aliases.append(alias)
            for alias in aliases:
                for write in (False, True):
                    with self.subTest(alias=str(alias), write=write):
                        command = [sys.executable, '-B', str(script), str(source), '--report', str(alias)]
                        if write:
                            command.append('--write')
                        result = subprocess.run(command, capture_output=True, text=True, check=False)
                        self.assertNotEqual(result.returncode, 0)
                        self.assertIn('must not name or alias the source', result.stderr)
                        self.assertEqual(source.read_bytes(), original)

    def test_cycles_foreign_references_and_types_fail_closed(self):
        examples = [
            [{'id': 'a', 'requires': ['b']}, {'id': 'b', 'requires': ['a']}],
            [{'id': 'a', 'contains': ['b']}, {'id': 'b', 'contains': ['a']}],
            [{'id': 'a', 'requires': ['foreign:b']}],
            [{'id': 'a', 'type': 'cluster'}],
        ]
        for goals in examples:
            with self.subTest(goals=goals), self.assertRaises(ValueError):
                normalize({'landscapeId': 'fixture', 'goals': goals}, set())


if __name__ == '__main__':
    unittest.main()
