#!/usr/bin/env python3
"""Make reviewable private core/schema copies; active sources are read only."""
import hashlib, json
from pathlib import Path
OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[3]
sha = lambda raw: hashlib.sha256(raw).hexdigest()
index = json.loads((OUT / 'candidate-index.json').read_bytes())
reader = OUT / 'economicsQ2MonetarySocialContext.private.ts'
text = reader.read_text()
text = text.replace('__PIN_SHA__', index['privateFamilyPins']['sha256'])
reader.write_text(text)
schema = json.loads((ROOT / 'contracts/goal-visualization-context/v1/qualification.schema.json').read_bytes())
schema['properties']['reviewProfile']['enum'].append('economics-q2-monetary-social-embedded-v1')
(OUT / 'qualification.private.schema.json').write_text(json.dumps(schema, indent=2) + '\n')
(OUT / 'package.json').write_text('{"type":"module","private":true}\n')
original = (ROOT / 'app/scripts/goalVisualizationReviewedContext.ts').read_text()
copy = original.replace("from 'ajv/dist/2020.js'", "from '" + str(ROOT / 'app/node_modules/ajv/dist/2020.js') + "'")
copy = copy.replace("from 'ajv-formats'", "from '" + str(ROOT / 'app/node_modules/ajv-formats/dist/index.js') + "'")
copy = copy.replace("from '../../scripts/goal_visualization_scope.mjs'", "from '" + str(ROOT / 'scripts/goal_visualization_scope.mjs') + "'")
copy = copy.replace("from './lib/authenticatedGitEvidence'", "from '" + str(ROOT / 'app/scripts/lib/authenticatedGitEvidence') + "'")
copy = copy.replace("from './lib/goalVisualizationEconomicsQ3Contexts'", "from './goalVisualizationEconomicsQ3Contexts.private'")
copy = copy.replace("export interface VisualizationReviewArtifact", "import { readEconomicsQ2MonetarySocialContext } from './economicsQ2MonetarySocialContext.private'\n\nexport interface VisualizationReviewArtifact", 1)
copy = copy.replace("| 'economics-q3-trade-finance-v1'\n", "| 'economics-q3-trade-finance-v1' | 'economics-q2-monetary-social-embedded-v1'\n", 1)
copy = copy.replace("const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')", "const repoRoot = '" + str(ROOT) + "'")
copy = copy.replace("resolve(repoRoot, 'contracts/goal-visualization-context/v1/qualification.schema.json')", "new URL('./qualification.private.schema.json', import.meta.url)")
target = "const reviewOwners = {"
copy = copy.replace(target, target + "\n  'economics-q2-monetary-social-embedded-v1': { landscapeId: '605bdaf6-32d5-56fd-8d92-5a80c2fd2901', subject: 'wirtschaftswissenschaften',\n    sourcePath: 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json' },", 1)
target = "      } else if (receipt.reviewProfile === 'economics-q3-embedded-v1' || receipt.reviewProfile === 'economics-q3-trade-finance-v1') {"
copy = copy.replace(target, "      } else if (receipt.reviewProfile === 'economics-q2-monetary-social-embedded-v1') {\n        ;({ native, decision, reviewedAt, reviewer, reason, assetPath } = readEconomicsQ2MonetarySocialContext(receipt, review, assetRaw, artifact, parseVisualizationReviewJson))\n" + target, 1)
assert copy != original
(OUT / 'goalVisualizationReviewedContext.private.ts').write_text(copy)
q3 = (ROOT / 'app/scripts/lib/goalVisualizationEconomicsQ3Contexts.ts').read_text()
(OUT / 'goalVisualizationEconomicsQ3Contexts.private.ts').write_text(q3.replace("from '../goalVisualizationReviewedContext'", "from './goalVisualizationReviewedContext.private'"))
import difflib
(OUT / 'private-core-proposal.diff').write_text(''.join(difflib.unified_diff(original.splitlines(True), copy.splitlines(True), fromfile='active/goalVisualizationReviewedContext.ts', tofile='PRIVATE/goalVisualizationReviewedContext.private.ts')))
print(json.dumps({'privateCoreSha256': sha(copy.encode()), 'privateReaderSha256': sha(text.encode()), 'privateSchemaSha256': sha((OUT / 'qualification.private.schema.json').read_bytes())}))
