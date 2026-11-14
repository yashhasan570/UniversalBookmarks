#!/usr/bin/env python3
"""Reapply the Universal Bookmarks rebrand after an upstream sync."""
from pathlib import Path
import os, shutil

SKIP_DIRS = {'.git', '.github', 'scripts', 'node_modules'}
KEEP_PLAY_ID = 'app.hoarder.hoardermobile'
KEEP_PLUGIN_ID = 'plugins?id=hoarder-sync'

def newpath(s):
    return (s.replace('Karakeep', 'UniversalBookmarks').replace('karakeep', 'universalbookmarks')
             .replace('Hoarder', 'UniversalBookmarks').replace('hoarder', 'universalbookmarks'))

def sweep():
    code_ext = {'.ts', '.tsx', '.json', '.mjs', '.cjs', '.js', '.sh', '.py', '.toml'}
    code_pairs = [
        ('ghcr.io/karakeep-app/karakeep', 'ghcr.io/yashhasan570/universalbookmarks'),
        (KEEP_PLAY_ID, '__KEEP_PLAY_ID__'),
        (KEEP_PLUGIN_ID, '__KEEP_PLUGIN_ID__'),
        ('karakeep', 'universalbookmarks'),
        ('KARAKEEP', 'UNIVERSALBOOKMARKS'),
        ('Karakeep', 'UniversalBookmarks'),
        ('HOARDER', 'UNIVERSALBOOKMARKS'),
        ('Hoarder', 'UniversalBookmarks'),
        ('hoarder', 'universalbookmarks'),
    ]
    text_pairs = [
        ('ghcr.io/karakeep-app/karakeep', 'ghcr.io/yashhasan570/universalbookmarks'),
        (KEEP_PLAY_ID, '__KEEP_PLAY_ID__'),
        (KEEP_PLUGIN_ID, '__KEEP_PLUGIN_ID__'),
        ('karakeep', 'universalbookmarks'),
        ('KARAKEEP', 'UNIVERSALBOOKMARKS'),
        ('Karakeep', 'Universal Bookmarks'),
        ('HOARDER', 'UNIVERSALBOOKMARKS'),
        ('Hoarder', 'Universal Bookmarks'),
        ('hoarder', 'universalbookmarks'),
    ]
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            p = Path(root) / f
            if p.name in ('migrate.py',): continue
            try: t = p.read_text(encoding='utf-8')
            except Exception: continue
            orig = t
            is_code = p.suffix in code_ext or 'Dockerfile' in p.name
            for old, new in (code_pairs if is_code else text_pairs):
                t = t.replace(old, new)
            t = t.replace('__KEEP_PLAY_ID__', KEEP_PLAY_ID).replace('__KEEP_PLUGIN_ID__', KEEP_PLUGIN_ID)
            if t != orig: p.write_text(t)

def merge(src, dst):
    for child in list(src.iterdir()):
        ct = Path(newpath(str(child)))
        ct.parent.mkdir(parents=True, exist_ok=True)
        if ct.exists():
            if child.is_dir() and ct.is_dir():
                merge(child, ct)
                try: child.rmdir()
                except OSError: pass
            elif child.is_dir():
                shutil.rmtree(ct, ignore_errors=True)
                shutil.move(str(child), str(ct))
            else:
                if ct.is_dir(): shutil.rmtree(ct, ignore_errors=True)
                else: ct.unlink()
                shutil.move(str(child), str(ct))
        else:
            shutil.move(str(child), str(ct))
    try: src.rmdir()
    except OSError: pass

def renames():
    targets = []
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in dirs + files:
            if 'karakeep' in name.lower() or 'hoarder' in name.lower():
                targets.append(Path(root) / name)
    targets.sort(key=lambda p: len(p.parts), reverse=True)
    for p in targets:
        if not p.exists(): continue
        tgt = Path(newpath(str(p)))
        if p == tgt: continue
        tgt.parent.mkdir(parents=True, exist_ok=True)
        if p.is_dir() and tgt.exists() and tgt.is_dir():
            merge(p, tgt)
        elif tgt.exists():
            if p.is_dir(): shutil.rmtree(p, ignore_errors=True)
            else:
                if tgt.is_dir(): shutil.rmtree(tgt, ignore_errors=True)
                else: tgt.unlink()
                shutil.move(str(p), str(tgt))
        else:
            shutil.move(str(p), str(tgt))

def cleanup():
    for item in ['.github/FUNDING.yml', 'AGENTS.md', 'CLAUDE.md', 'GEMINI.md', 'CONTRIBUTING.md', 'SECURITY.md', '.agents', '.claude', '.husky', 'docs']:
        p = Path(item)
        if p.is_dir(): shutil.rmtree(p, ignore_errors=True)
        elif p.exists(): p.unlink()

def readme():
    Path('README.md').write_text("""# Universal Bookmarks

A self-hostable bookmark-everything app: save links, notes, and images with AI-based automatic tagging, full-text search, and a mobile-friendly web UI. Runs via Docker.

## Getting started

```
docker compose up -d
```

See `docker/docker-compose.yml` and `.env.sample` for configuration.

## Contact

Telegram: [@johnconstantine570](https://t.me/johnconstantine570)
""")

if __name__ == '__main__':
    sweep(); renames(); cleanup(); readme()
    print('rebrand reapplied')
