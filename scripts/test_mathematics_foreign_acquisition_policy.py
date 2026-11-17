#!/usr/bin/env python3
"""A retired observation must not become a fictitious acquisition demand."""
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from types import SimpleNamespace

import generate_mathematics_foreign_acquisition_policy as policy


class ForeignDemandRetirementTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(dir=policy.ROOT / 'tmp')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.physics = self.root / 'physics'
        self.physics.mkdir()
        self.write(self.physics / 'physics.view.json', {'viewId': 'physics', 'scope': {}, 'rootNodes': []})
        self.native = self.root / 'native.json'
        self.write(self.native, {
            'contexts': [{'id': 'actual', 'scope': {'courseProfile': 'GK'},
                          'mathViewKey': 'm', 'physicsViewKey': 'p'}],
            'views': {'m': {'viewId': 'math'}, 'p': {'viewId': 'physics'}},
        })
        self.witness = self.root / 'witness.json'
        self.write(self.witness, {'entries': [{'goalId': 'math-atom', 'proofs': [{'context': 'actual'}]}]})

    @staticmethod
    def write(path, value):
        path.write_text(json.dumps(value))

    def run_build(self, dependencies, places, retired=None):
        class Graph:
            math_atoms = {'math-atom'}
            goals = {goal: {'requires': refs} for goal, refs in dependencies.items()}

            def prerequisite_closure(self, goal):
                seen, todo = set(), list(dependencies.get(goal, []))
                while todo:
                    item = todo.pop()
                    if item not in seen:
                        seen.add(item)
                        todo.extend(dependencies.get(item, []))
                return seen

            @staticmethod
            def placement_rank(_place):
                return (0, 7, '')

        with patch.object(policy, 'Normalizer', Graph), patch.object(policy, 'authored_places', return_value=places):
            return policy.build(self.witness, self.native, self.physics, retired)

    def test_missing_current_consumer_fails_without_explicit_report(self):
        places = {'current-target': {'place': ('SekI', 'J7'), 'path': ['j7']}}
        with self.assertRaisesRegex(ValueError, 'no longer has source authority'):
            self.run_build({'current-target': ['preparation'], 'preparation': []}, places)

    def test_explicit_retirement_binds_full_current_seed_and_learning_sets(self):
        places = {'current-target': {'place': ('SekI', 'J7'), 'path': ['j7']}}
        retired = []
        result = self.run_build({'current-target': ['preparation'], 'preparation': []}, places, retired)
        self.assertEqual(result['views']['math'], [])
        self.assertEqual(len(retired), 1)
        row = retired[0]
        self.assertEqual(row['currentAtomicTargets'], ['current-target'])
        self.assertEqual(row['currentLearningClosure'], ['current-target', 'preparation'])
        self.assertEqual(row['actualContexts'], ['actual'])
        self.assertEqual(row['currentPhysicsSourceSha256'], policy.digest(self.physics / 'physics.view.json'))
        self.assertNotIn('math-atom', row['currentLearningClosure'])

    def test_active_transitive_consumer_cannot_be_retired(self):
        places = {'current-target': {'place': ('SekI', 'J7'), 'path': ['j7']}}
        retired = []
        result = self.run_build({'current-target': ['bridge'], 'bridge': ['math-atom'], 'math-atom': []}, places, retired)
        self.assertEqual(retired, [])
        self.assertEqual(result['views']['math'][0]['requiresPath'], ['current-target', 'bridge', 'math-atom'])

    def test_selected_math_atom_itself_cannot_be_falsely_retired(self):
        places = {'math-atom': {'place': ('SekI', 'J7'), 'path': ['j7']}}
        with self.assertRaisesRegex(ValueError, 'still-selected learning atom'):
            self.run_build({'math-atom': []}, places, [])

    def test_nested_source_year_title_does_not_replace_authored_phase(self):
        def structure(identity, label, children):
            return {'kind': 'structure', 'id': identity, 'label': label, 'children': children}
        def atom(identity):
            return {'kind': 'goalEntry', 'goalId': identity}
        view = {'scope': {}, 'rootNodes': [
            structure('upper', 'Sekundarstufe II', [
                structure('e10', 'Einführungsphase: Jahrgangsstufe 10', [
                    structure('source-topic', 'Klassenstufen 7-10: Bewegungen und Kräfte', [atom('a')]),
                ]),
                structure('q', 'Qualifikationsphase: Jahrgangsstufen 11/12', [atom('b')]),
            ]),
            structure('lower', 'Sekundarstufe I', [
                structure('j8', 'Jahrgangsstufe 8', [atom('c')]),
            ]),
        ]}
        normalizer = SimpleNamespace(
            atomic_roles=lambda _: {'a': 'target', 'b': 'target', 'c': 'target'},
            goal_applies=lambda *_: True, stage=policy.Normalizer.stage,
        )
        result = policy.authored_places(view, normalizer)
        self.assertEqual(result['a']['place'], ('SekII', 'E'))
        self.assertEqual(result['b']['place'], ('SekII', 'J11_12'))
        self.assertEqual(result['c']['place'], ('SekI', 'J8'))
        self.assertEqual(result['a']['path'], ['upper', 'e10', 'source-topic'])


if __name__ == '__main__':
    unittest.main()
