# -*- coding: utf-8 -*-
"""
Point og:image / twitter:image (and Article JSON-LD "image") references that
target files missing from this repository to the default OG images:
    Korean pages  -> https://gon.ai.kr/assets/og/default-ko.png
    English pages -> https://gon.ai.kr/assets/og/default-en.png
(language from <html lang>). References to files that exist are left alone.
Only published pages are touched (_config.yml "exclude" is honoured).
Idempotent: once every reference resolves, re-running changes nothing.
"""
import os
import re
from urllib.parse import urlparse

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SITE = "https://gon.ai.kr"
DEFAULTS = {"ko": SITE + "/assets/og/default-ko.png", "en": SITE + "/assets/og/default-en.png"}


def config_excludes():
    excludes, inside = [], False
    with open(os.path.join(ROOT, "_config.yml"), encoding="utf-8") as f:
        for line in f:
            if re.match(r"^exclude:\s*$", line):
                inside = True
                continue
            if inside:
                m = re.match(r"^\s+-\s+(.+?)\s*$", line)
                if m:
                    excludes.append(m.group(1).strip("'\"").rstrip("/"))
                elif line.strip() and not line.lstrip().startswith("#"):
                    inside = False
    return excludes


EXCLUDES = config_excludes()


def published(rel):
    if any(part.startswith((".", "_", "#", "~")) for part in rel.split("/")):
        return False
    return not any(rel == e or rel.startswith(e + "/") for e in EXCLUDES)


def target_exists(url):
    u = urlparse(url)
    if u.netloc and u.netloc not in ("gon.ai.kr", "www.gon.ai.kr"):
        return False  # other domains (e.g. a retired one) are treated as missing
    path = u.path.lstrip("/")
    return bool(path) and os.path.isfile(os.path.join(ROOT, path))


PATTERNS = [
    re.compile(r'(<meta\s+property="og:image"\s+content=")([^"]*)(")'),
    re.compile(r'(<meta\s+name="twitter:image"\s+content=")([^"]*)(")'),
    re.compile(r'("image"\s*:\s*")([^"]*)(")'),
]


def process(rel):
    path = os.path.join(ROOT, rel)
    raw = open(path, "rb").read().decode("utf-8")
    m = re.search(r'<html[^>]*\blang="([a-zA-Z-]+)"', raw)
    lang = "en" if (m and m.group(1).lower().startswith("en")) else "ko"
    changed = []

    def repl(mo):
        url = mo.group(2)
        if target_exists(url):
            return mo.group(0)
        changed.append(url)
        return mo.group(1) + DEFAULTS[lang] + mo.group(3)

    new = raw
    for pat in PATTERNS:
        new = pat.sub(repl, new)
    if new != raw:
        open(path, "wb").write(new.encode("utf-8"))
    return lang, changed


def main():
    total_refs = total_files = 0
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel_dir = os.path.relpath(dirpath, ROOT).replace("\\", "/")
        rel_dir = "" if rel_dir == "." else rel_dir + "/"
        dirnames[:] = [d for d in dirnames if published(rel_dir + d)]
        for fn in sorted(filenames):
            rel = rel_dir + fn
            if not fn.endswith(".html") or not published(rel):
                continue
            lang, changed = process(rel)
            if changed:
                total_files += 1
                total_refs += len(changed)
                print("%-40s %s  %d ref(s): %s" % (rel, lang, len(changed), ", ".join(sorted(set(changed)))))
    print("\nDone. Replaced %d reference(s) in %d file(s)." % (total_refs, total_files))


if __name__ == "__main__":
    main()
