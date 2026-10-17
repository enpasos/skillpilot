import fitz, pathlib, sys, json
BASE=pathlib.Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-requires-closure-source-surrogate-neutral-preparation-technical-v1')
OUT=pathlib.Path(__file__).parent
if sys.argv[1]=='extract':
    rows=[];(OUT/'primary-text').mkdir(exist_ok=True)
    for p in sorted((BASE/'primary').glob('*.pdf')):
        doc=fitz.open(p); dest=OUT/'primary-text'/(p.name+'.txt')
        dest.write_text('\n'.join(f'\n=== PDF PAGE {i+1} ===\n'+page.get_text(sort=True) for i,page in enumerate(doc)))
        rows.append({'primaryPath':str(p),'pages':len(doc),'extractedText':str(dest)})
    (OUT/'PRIMARY-TEXT-INDEX.json').write_text(json.dumps(rows,indent=2)+'\n');print('extracted',len(rows))
else:
    pats=list((BASE/'primary').glob('*'+sys.argv[1]+'*'))
    assert len(pats)==1,pats
    doc=fitz.open(pats[0]);print(pats[0])
    for num in map(int,sys.argv[2:]):print('PDF PAGE',num,doc[num-1].get_text(sort=True))
