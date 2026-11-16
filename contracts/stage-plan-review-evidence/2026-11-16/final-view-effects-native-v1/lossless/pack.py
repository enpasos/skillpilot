#!/usr/bin/env python3
"""Retain exact JSON byte fragments and deduplicated goal objects, not reserialized JSON."""
import argparse
import datetime
import gzip
import hashlib
import json
import lzma
import pathlib
import re
import struct
import subprocess
import sys
import zlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = next((p for p in HERE.parents if (p / 'curricula').is_dir() and (p / 'app').is_dir()), HERE.parent.parent)
CHECKPOINT = ROOT / 'tmp/physics-cqr104-consistent-stage-projection-20261115/boundary-b391-final72-receipt.actual.json'
sha = lambda b: hashlib.sha256(b).hexdigest()
GOALS = re.compile(rb'"goals"\s*:\s*\[')
TOKENS = re.compile(rb'"(?:[^"\\]|\\.)*"|[{}\[\]]')


def goal_spans(raw):
    """Find raw direct members of each goals array; nested arrays stay within the goal."""
    pos = 0
    while True:
        match = GOALS.search(raw, pos)
        if match is None:
            return
        pos = match.end()
        while True:
            while raw[pos] in b' \t\r\n,':
                pos += 1
            if raw[pos] == 93:
                pos += 1
                break
            if raw[pos] != 123:
                raise ValueError('A goals member is not an object')
            start, depth = pos, 0
            for token in TOKENS.finditer(raw, pos):
                ch = token.group(0)
                if ch in (b'{', b'['):
                    depth += 1
                elif ch in (b'}', b']'):
                    depth -= 1
                    if depth == 0:
                        pos = token.end()
                        obj = raw[start:pos]
                        parsed = json.loads(obj)
                        if not isinstance(parsed.get('id'), str):
                            raise ValueError('A goal lacks a string id')
                        yield start, pos, parsed['id']
                        break
            else:
                raise ValueError('Unterminated goal object')


def build():
    CHECKPOINT = HERE / 'input-manifest.actual.json'
    checkpoint_bytes = CHECKPOINT.read_bytes()
    checkpoint = json.loads(checkpoint_bytes)
    objects, object_kinds, manifest, duplicates = {}, {}, [], {}
    occurrences, goal_raw_bytes = 0, 0

    def put(raw, kind):
        digest = sha(raw)
        if digest in objects:
            assert objects[digest] == raw
        else:
            objects[digest] = raw
            object_kinds[digest] = kind
        return digest

    for artifact in checkpoint['artifacts']:
        path = ROOT / artifact['path']
        original = path.read_bytes()
        assert len(original) == artifact['bytes'] and sha(original) == artifact['sha256']
        is_gzip = path.suffix == '.gz'
        raw = gzip.decompress(original) if is_gzip else original
        refs, previous, count = [], 0, 0
        if path.name in ('api-inputs.json.gz', 'six-api-inputs.json.gz'):
            for start, end, goal_id in goal_spans(raw):
                if start > previous:
                    refs.append(put(raw[previous:start], 'structural-fragment'))
                digest = put(raw[start:end], 'goal-object')
                refs.append(digest)
                duplicates[digest] = duplicates.get(digest, 0) + 1
                occurrences += 1
                count += 1
                goal_raw_bytes += end-start
                previous = end
        if previous < len(raw):
            refs.append(put(raw[previous:], 'measurement-or-structural-fragment'))
        item = dict(artifact, uncompressedBytes=len(raw), uncompressedSha256=sha(raw),
                    pieces=refs, goalObjectOccurrences=count)
        if is_gzip:
            assert original[:3] == b'\x1f\x8b\x08' and original[3] == 0
            level = 9 if original[8] == 2 else 6
            item['gzip'] = dict(headerHex=original[:10].hex(), trailerHex=original[-8:].hex(),
                                compressionLevel=level, windowBits=-15, memoryLevel=8,
                                strategy=zlib.Z_DEFAULT_STRATEGY,
                                zlibRuntimeVersion=zlib.ZLIB_RUNTIME_VERSION,
                                compressionEngine='node:zlib.gzipSync' if original[9] == 3 else 'python:zlib.rawDeflate')
            if item['gzip']['compressionEngine'] == 'node:zlib.gzipSync':
                item['gzip']['nodeRuntime'] = json.loads(subprocess.check_output([
                    'node','-p','JSON.stringify({node:process.version,zlib:process.versions.zlib})']))
        manifest.append(item)
        print(path.parent.name, path.name, len(raw), count, 'goals', flush=True)

    # Also retain the checkpoint itself as the fourth exact artifact.
    manifest.append(dict(path='retention/input-manifest.actual.json', bytes=len(checkpoint_bytes),
                         sha256=sha(checkpoint_bytes), uncompressedBytes=len(checkpoint_bytes),
                         uncompressedSha256=sha(checkpoint_bytes),
                         pieces=[put(checkpoint_bytes, 'checkpoint')], goalObjectOccurrences=0))
    pool = HERE / 'objects.cas.xz'
    with lzma.open(pool, 'wb', preset=6) as out:
        out.write(b'SKILLPILOT-RAW-CAS-V1\n')
        for digest, raw in objects.items():
            out.write(bytes.fromhex(digest))
            out.write(struct.pack('>Q', len(raw)))
            out.write(raw)
    index = dict(format='skillpilot-exact-raw-json-cas-v1',
                 checkpointSha256=sha(checkpoint_bytes), canonicalPhysicsSHA256=checkpoint['canonicalPhysicsSHA256'], objectPool=dict(
                     path=pool.name, sha256=sha(pool.read_bytes()), bytes=pool.stat().st_size,
                     uniqueObjects=len(objects), uncompressedObjectBytes=sum(map(len, objects.values()))),
                 artifacts=manifest,
                 statistics=dict(sourceGoalOccurrences=occurrences,
                     uniqueRawGoalObjects=sum(k == 'goal-object' for k in object_kinds.values()),
                     sourceGoalOccurrenceBytes=goal_raw_bytes,
                     uniqueRawGoalObjectBytes=sum(len(objects[h]) for h,k in object_kinds.items() if k == 'goal-object'),
                     originalArtifactBytes=sum(a['bytes'] for a in checkpoint['artifacts']),
                     sourceArtifacts=len(checkpoint['artifacts']), retainedArtifactsIncludingCheckpoint=len(checkpoint['artifacts'])+1),
                 byteContract='Exact original UTF-8 byte fragments; no parsed JSON reserialization. Gzip reproduced using retained header/trailer and raw DEFLATE parameters; final compressed SHA-256 must match.',
                 originalInputsWritten=False)
    with lzma.open(HERE / 'index.json.xz', 'wb', preset=6) as out:
        out.write((json.dumps(index, ensure_ascii=False, indent=2)+'\n').encode())
    print(json.dumps(index['statistics']), flush=True)


def load_objects(index):
    pool = HERE / index['objectPool']['path']
    assert sha(pool.read_bytes()) == index['objectPool']['sha256']
    result = {}
    with lzma.open(pool, 'rb') as src:
        magic = b'SKILLPILOT-RAW-CAS-V1\n'
        assert src.read(len(magic)) == magic
        while True:
            digest = src.read(32)
            if not digest:
                break
            assert len(digest) == 32
            size = struct.unpack('>Q', src.read(8))[0]
            raw = src.read(size)
            assert len(raw) == size and sha(raw) == digest.hex()
            assert digest.hex() not in result
            result[digest.hex()] = raw
    assert len(result) == index['objectPool']['uniqueObjects']
    return result


def verify(outdir=None):
    index_compressed_bytes = (HERE / 'index.json.xz').read_bytes()
    index_bytes = lzma.decompress(index_compressed_bytes)
    index = json.loads(index_bytes)
    objects = load_objects(index)
    results = []
    for artifact in index['artifacts']:
        raw_hash, final_hash = hashlib.sha256(), hashlib.sha256()
        raw_size = final_size = 0
        output = None
        if outdir is not None:
            relative = pathlib.Path(artifact['path'])
            assert not relative.is_absolute() and '..' not in relative.parts
            dest = outdir / relative
            dest.parent.mkdir(parents=True, exist_ok=True)
            output = dest.open('xb')

        def emit(chunk):
            nonlocal final_size
            final_hash.update(chunk)
            final_size += len(chunk)
            if output:
                output.write(chunk)

        gz = artifact.get('gzip')
        compressor = None
        node_gzip = gz and gz['compressionEngine'] == 'node:zlib.gzipSync'
        node_parts = []
        if gz and not node_gzip:
            compressor = zlib.compressobj(gz['compressionLevel'], zlib.DEFLATED,
                                         gz['windowBits'], gz['memoryLevel'], gz['strategy'])
            emit(bytes.fromhex(gz['headerHex']))
        for ref in artifact['pieces']:
            raw = objects[ref]
            raw_hash.update(raw)
            raw_size += len(raw)
            if node_gzip:
                node_parts.append(raw)
            else:
                emit(compressor.compress(raw) if compressor else raw)
        if node_gzip:
            restored = subprocess.run(['node',str(HERE / 'node-gzip.mjs'),str(gz['compressionLevel'])],
                                      input=b''.join(node_parts),stdout=subprocess.PIPE,check=True).stdout
            assert restored[:10].hex() == gz['headerHex'] and restored[-8:].hex() == gz['trailerHex']
            emit(restored)
        if compressor:
            emit(compressor.flush())
            emit(bytes.fromhex(gz['trailerHex']))
        if output:
            output.close()
        assert raw_size == artifact['uncompressedBytes']
        assert raw_hash.hexdigest() == artifact['uncompressedSha256']
        assert final_size == artifact['bytes']
        assert final_hash.hexdigest() == artifact['sha256'], (
            artifact['path'], 'Exact gzip reconstruction failed; check pinned zlib version')
        original = ROOT / artifact['path']
        compared_to_original = original.is_file()
        if compared_to_original:
            assert original.stat().st_size == artifact['bytes']
            with original.open('rb') as inp:
                original_hash = hashlib.file_digest(inp, 'sha256').hexdigest()
            assert original_hash == artifact['sha256']
        results.append(dict(path=artifact['path'], uncompressedBytes=raw_size,
                            reconstructedBytes=final_size, sha256=final_hash.hexdigest(),
                            exactOriginalByteHash=True, originalCompared=compared_to_original,
                            originalUnchanged=True if compared_to_original else None))
        print('EXACT', artifact['path'], flush=True)
    receipt = dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),
                   status='ALL_EXACT_BYTE_HASH_RECONSTRUCTIONS_PASS',
                   indexSha256=sha(index_bytes), compressedIndexSha256=sha(index_compressed_bytes), poolSha256=index['objectPool']['sha256'],
                   scriptSha256=sha(pathlib.Path(__file__).read_bytes()),
                   nodeHelperSha256=sha((HERE / 'node-gzip.mjs').read_bytes()),
                   pythonVersion=sys.version, zlibRuntimeVersion=zlib.ZLIB_RUNTIME_VERSION,
                   nodeRuntime=json.loads(subprocess.check_output(['node','-p','JSON.stringify({node:process.version,zlib:process.versions.zlib})'])),
                   originalInputsWritten=False, verificationWritesRestoredFiles=outdir is not None,
                   results=results, statistics=index['statistics'],
                   limitations='Retains distinct actual final72+12-before and targetedHE12-after epochs. No fresh replay of unaffected contexts, full stage-plan completion, browser acceptance, CI, main integration or independent package approval.')
    destination = HERE / ('restored-output-verification.actual.json' if outdir else 'verification.actual.json')
    destination.write_text(json.dumps(receipt, indent=2)+'\n')
    print(json.dumps(dict(status=receipt['status'], poolBytes=index['objectPool']['bytes'],
                         indexBytes=len(index_bytes), artifacts=len(results))), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('action', choices=['build','verify','unpack'])
    parser.add_argument('--out', type=pathlib.Path)
    args = parser.parse_args()
    if args.action == 'build':
        build()
    elif args.action == 'unpack':
        if args.out is None:
            parser.error('unpack requires --out pointing to a new output directory')
        verify(args.out.resolve())
    else:
        verify()
