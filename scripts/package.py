"""Create a clean, portable ZIP without dependencies, host identity or test data."""
from pathlib import Path
import sys, zipfile
root=Path(__file__).resolve().parents[1]
out=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else root.parent/'Habits-App.zip'
excluded={'node_modules','.git','.openai','coverage','playwright-report','test-results'}
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
    for file in sorted(root.rglob('*')):
        rel=file.relative_to(root)
        if not file.is_file() or any(p in excluded for p in rel.parts): continue
        if file.name.endswith('.tsbuildinfo') or file.name.startswith('.env') or file.name=='qa-mobile.html': continue
        archive.write(file,Path('Habits-App')/rel)
with zipfile.ZipFile(out) as archive:
    assert archive.testzip() is None
    for required in ['package.json','package-lock.json','src/main.tsx','docs/START-HIER.md','dist/index.html','dist/sw.js','e2e/app.spec.ts']:
        assert 'Habits-App/'+required in archive.namelist()
print(f'{out}: {out.stat().st_size:,} bytes')
