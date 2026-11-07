#!/usr/bin/env python3
"""Verify the bounded evidence packet, not image quality or native eligibility."""
import argparse
import collections
import gzip
import hashlib
import json
import lzma
from pathlib import Path
import tarfile


def digest(data):
    return hashlib.sha256(data).hexdigest()


def load(path):
    data = path.read_bytes()
    if path.suffix == '.gz':
        data = gzip.decompress(data)
    elif path.suffix == '.xz':
        data = lzma.decompress(data)
    return json.loads(data)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check-current-inputs', action='store_true')
    args = parser.parse_args()
    here = Path(__file__).resolve().parent
    manifest = load(here / 'packet-manifest.json')
    for entry in manifest['files']:
        data = (here / entry['name']).read_bytes()
        assert digest(data) == entry['sha256'], entry['name']
        assert len(data) == entry['bytes'], entry['name']
    original = load(here / 'five-ledger-disjoint-context-census.json.gz')
    disposition = load(here / 'goal-disposition-index.json.gz')
    rows = disposition['rows']
    keys = {(r['subject'], r['goalId']) for r in rows}
    assert len(rows) == len(keys) == 2562
    assert keys == {(r['subject'], r['goalId']) for r in original['rows']}
    assert sum(r['kindPartition'] == 'curricularAtomic' for r in rows) == 2483
    expected = {
        'existing-profile-candidate': 18,
        'matching-original-context-adapter-pending': 945,
        'original-context-unclosed-in-bounded-corpus': 1550,
        'original-text-differs': 44,
        'reviewed-asset-differs': 5,
    }
    assert dict(collections.Counter(r['disposition'] for r in rows)) == expected
    chains = {
        c['chainId']: c['record']
        for c in load(here / 'non-chemistry-original-context-chains.json.gz')
    }
    chains.update({
        c['chainId']: c
        for c in load(here / 'chemistry-chemie-original-chains.json.gz')
    })
    for row in rows:
        assert row['nativeQualificationIssued'] is False
        assert row['newReviewPerformed'] is False
        for chain in row['originalChains']:
            original_chain = chains[chain['chainId']]
            assert original_chain['goalId'] == row['goalId']
            assert original_chain['originalReview'] == chain['originalReview']
        assert set(row['matchingChainIds']) <= {
            c['chainId'] for c in row['originalChains']
        }
    reader = load(here / 'historical-reader-worklist.json.gz')
    routed = [(g['subject'], r['goalId']) for g in reader['groups'] for r in g['rows']]
    assert len(routed) == len(set(routed)) == 945
    assert set(routed) == {
        (r['subject'], r['goalId']) for r in rows
        if r['disposition'] == 'matching-original-context-adapter-pending'
    }
    review = load(here / 'current-context-review-worklist.json.gz')
    assert len(review['rows']) == 1599
    assert sum(r['kindPartition'] == 'curricularAtomic' for r in review['rows']) == 1528
    assert len(review['additionalOriginalMetadataHolds']) == 32
    time = load(here / 'original-time-granularity-addendum.json.gz')
    assert dict(collections.Counter(r['status'] for r in time['rows'])) == {
        'at-least-one-explicit-original-instant': 853,
        'date-only-original-no-invented-instant': 60,
        'original-actor-or-time-missing': 32,
    }
    transport = load(here / 'chemistry-lossless-xz-receipt.json')
    raw = lzma.decompress((here / 'chemistry-chemie-478-context-census.json.xz').read_bytes())
    assert digest(raw) == transport['rawSha256']
    assert len(raw) == transport['rawBytes']
    assert len(json.loads(raw)['rows']) == 478
    summary = load(here / 'summary.json')
    with tarfile.open(here / 'family-originals-and-reproduction-scripts.tar.gz') as archive:
        for family in summary['familyCensusArtifacts']:
            member = 'family-artifacts/' + family['sha256'] + '.json'
            data = archive.extractfile(member).read()
            assert digest(data) == family['sha256']
    if args.check_current_inputs:
        root = next(parent for parent in here.parents if (parent / '.git').exists())
        for entry in summary['currentInputs']:
            assert digest((root / entry['path']).read_bytes()) == entry['sha256'], entry['path']
    print(json.dumps({
        'packetValid': True,
        'rows': 2562,
        'curricularAtomic': 2483,
        'counts': expected,
        'currentInputPinsChecked': 16 if args.check_current_inputs else 0,
        'nativeQualificationsIssued': 0,
        'imagesReviewed': 0,
        'activeWrites': 0,
    }, sort_keys=True))


if __name__ == '__main__':
    main()
