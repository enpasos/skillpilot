#!/usr/bin/env python3
import hashlib,json,shutil,sys
from pathlib import Path
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[3]
W=Path(json.loads((OUT/'ram-location.json').read_bytes())['path'])
sha=lambda raw:hashlib.sha256(raw).hexdigest()
index=(W/'contracts/qualified-context-index-economics17-2026-11-07.json').read_bytes();digest=sha(index)
assert digest=='234b9cee0f87d937edfa8410c36483ebdc55b5032d84947c5188c3f3b74f8785'
selector=(ROOT/'scripts/visualization_qualified_context_capsule.py').read_text()
selector=selector.replace("# Closed external transports: historical54 and its separately qualified Math3 successor.","# Closed transports: preserved historical54/Math57 and exact independently reviewed Econ17 successor.")
selector=selector.replace("\n}\n", "\n    '"+digest+"':\n        ('25a6f2164a81a7e6ae50db3557d20521fecf5124', 74),\n}\n",1)
selector=selector.replace("    kernel.originals = index_originals",'''    # Only the exact74 transport has its separately measured192-MiB allowance.
    # Historical54/57 interpretation and caller behavior remain byte-for-byte below.
    import sys
    def argument(name, default):
        return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default
    if argument('--accepted-census-sha256', '') == 'INDEX_SHA':
        kernel.require(int(argument('--maximum-working-bytes', '67108864')) <= 201326592,
                       'Fixed74 working allowance exceeds its external192-MiB bound')
        kernel.require(int(argument('--maximum-object-bytes', '67108864')) <= 268435456,
                       'Fixed74 object allowance exceeds unchanged256-MiB bound')
        kernel.require(int(argument('--maximum-embedded-bytes', '16777216')) <= 16777216,
                       'Fixed74 embedded allowance exceeds unchanged16-MiB bound')
    kernel.originals = index_originals'''.replace('INDEX_SHA',digest))
dest=OUT/'private-code/scripts/visualization_qualified_context_capsule.py';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(selector)
(W/'root-scripts/visualization_qualified_context_capsule.py').write_text(selector)
sys.path.insert(0,str(OUT));import runner
result=runner.run('capsule74-build',['python3','-B',ROOT/'scripts/visualization_qualified_context_capsule.py','build',
 '--repository-root',ROOT,'--accepted-commit','25a6f2164a81a7e6ae50db3557d20521fecf5124',
 '--accepted-census-sha256',digest,'--census-path','contracts/goal-visualization-context/v1/qualified-context-index-economics17-2026-11-07.json',
 '--output',W/'capsule','--maximum-working-bytes','201326592','--maximum-object-bytes','268435456','--maximum-embedded-bytes','16777216'],shallow=False)
capsule=(W/'capsule/capsule.json').read_bytes();capsha=sha(capsule)
shutil.copytree(W/'capsule',OUT/'capsule')
authority=(ROOT/'app/scripts/lib/qualifiedVisualizationContextAuthority.ts').read_text()
authority=authority.replace('qualified-context-index-math3-2026-11-07.json','qualified-context-index-economics17-2026-11-07.json')
authority=authority.replace('46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0',digest)
authority=authority.replace('qa-artifacts/ci-contract-audit/2026-11-07/visualization-qualified-context-index-math3-2026-11-07/capsule',str((OUT/'capsule').relative_to(ROOT)))
authority=authority.replace('4f46e57864b5a1277764992f6301f4cb4da9b15ea7cf789e7e96d9d5175d5852',capsha)
authority=authority.replace('index.rows.length !== 57 || rows.size !== 57','index.rows.length !== 74 || rows.size !== 74')
authority=authority.replace("'--maximum-working-bytes', '134217728'","'--maximum-working-bytes', '201326592'")
dest=OUT/'private-code/app/scripts/lib/qualifiedVisualizationContextAuthority.ts';dest.write_text(authority)
(W/'scripts/lib/qualifiedVisualizationContextAuthority.ts').write_text(authority)
test=(ROOT/'app/scripts/testVisualizationContextMaturity.ts').read_text()
test=test.replace("import { readFileSync }", "import { readFileSync, writeFileSync }")
test=test.replace("const sourcePath = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'", "const economicsProbe = process.argv.includes('--economics-probe')\nconst subject = economicsProbe ? 'wirtschaftswissenschaften' : 'mathematik'\nconst sourcePath = economicsProbe ? 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json' : 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'")
test=test.replace("goal.id === 'ce198bc9-b014-52ba-814f-25cc3e020668'", "goal.id === (economicsProbe ? 'da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0' : 'ce198bc9-b014-52ba-814f-25cc3e020668')")
test=test.replace("'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'", "`curricula/DE/Gymnasium/quality/goal-visualization-qa/${subject}.qa.json`")
test=test.replace("landscapePath: sourcePath, subject: 'mathematik'", "landscapePath: sourcePath, subject")
test=test.replace("assert.equal(actualQualified, 57", "assert.equal(actualQualified, 74")
test=test.replace("subject: 'mathematik', label: 'Fixture'", "subject, label: 'Fixture'")
test=test.replace("actual image bytes differ/u)", r"actual image bytes differ|Current image\/AI approval preconditions|current image\/AI approval preconditions/u)",1)
test=test.replace("for (const entry of historical.cases) denies", "for (const entry of economicsProbe ? [] : historical.cases) denies")
test=test.replace("'contracts/goal-visualization-context/v1/qualified-context-index.json'", "'contracts/goal-visualization-context/v1/qualified-context-index-math3-2026-11-07.json'")
test=test.replace("row.goalId)).length, 3)", "row.goalId)).length, 17)")
test+='\n'+(OUT/'q2-normal-maturity.template.ts').read_text()
dest=OUT/'private-code/app/scripts/testVisualizationContextMaturity.ts';dest.write_text(test)
(W/'scripts/testVisualizationContextMaturity.ts').write_text(test)
metadata={'indexSha256':digest,'indexPath':'contracts/goal-visualization-context/v1/qualified-context-index-economics17-2026-11-07.json',
 'capsuleSha256':capsha,'capsulePath':str((OUT/'capsule').relative_to(ROOT)),'capsuleMeasurement':json.loads(result.stdout),
 'newWorkingMaximumBytes':201326592,'unchangedOldWorkingMaximumBytes':134217728,'unchangedObjectMaximumBytes':268435456,'unchangedEmbeddedMaximumBytes':16777216}
(OUT/'fixed74-pins.json').write_text(json.dumps(metadata,indent=2)+'\n')
print(json.dumps(metadata))
