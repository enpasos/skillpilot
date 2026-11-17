#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Negative producer regressions for the strict Java course-pair boundary."""
from copy import deepcopy
import unittest
from check_mathematics_course_view_pairs import inspect_pair


def unit(identifier, label, children=()):
    return dict(kind='structure', id=identifier, label=label, children=list(children), childOrder={'after': []})


class MathematicsCourseViewPairsTest(unittest.TestCase):
    def pair(self):
        left = dict(viewId='gk', rootNodes=[unit('math-gk-root', 'Mathematik GK', [unit('first', 'Grundlagen'), unit('second', 'Anwendungen')])])
        right = deepcopy(left)
        right['viewId'] = 'lk'
        right['rootNodes'][0].update(id='math-lk-root', label='Mathematik LK')
        return left, right

    def test_course_tokens_are_the_only_identity_alias(self):
        left, right = self.pair()
        self.assertEqual(inspect_pair(left, right), [])
        right['rootNodes'][0]['children'][0]['label'] = 'Andere Grundlagen'
        self.assertTrue(any(issue['kind'] == 'label' for issue in inspect_pair(left, right)))

    def test_shared_metadata_and_parent_path_must_agree(self):
        left, right = self.pair()
        right['rootNodes'][0]['children'][0]['canonicalSourceGoalId'] = 'different-source'
        self.assertTrue(any(issue['kind'] == 'metadata' for issue in inspect_pair(left, right)))
        left, right = self.pair()
        child = right['rootNodes'][0]['children'].pop(0)
        right['rootNodes'][0]['children'][0]['children'].append(child)
        self.assertTrue(any(issue['kind'] == 'path' for issue in inspect_pair(left, right)))

    def test_each_course_can_be_acyclic_while_union_is_invalid(self):
        left, right = self.pair()
        left['rootNodes'][0]['childOrder']['after'] = [dict(unit='second', after='first')]
        right['rootNodes'][0]['childOrder']['after'] = [dict(unit='first', after='second')]
        self.assertTrue(any(issue['kind'] == 'combinedOrderCycle' for issue in inspect_pair(left, right)))


if __name__ == '__main__':
    unittest.main()
