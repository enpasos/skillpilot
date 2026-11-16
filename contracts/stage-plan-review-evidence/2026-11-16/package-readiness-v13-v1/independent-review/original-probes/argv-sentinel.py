import json,pathlib,sys
pathlib.Path(__file__).with_suffix('.argv.json').write_text(json.dumps(sys.argv))
