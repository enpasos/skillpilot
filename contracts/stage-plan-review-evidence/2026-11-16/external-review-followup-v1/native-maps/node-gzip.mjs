import {readFileSync,writeFileSync} from 'node:fs';
import {gzipSync} from 'node:zlib';
// Same native compressor as the actual UI map producer; bytes are checked by pack.py.
writeFileSync(1,gzipSync(readFileSync(0),{level:Number(process.argv[2])}));
