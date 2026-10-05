# -*- coding: utf-8 -*-
"""
Set every <lastmod> in sitemap.xml to the date of the last git commit that
touched the URL's file (git log -1 --format=%cs -- <file>).

The URL set, order, changefreq and priority are left exactly as they are.
Run it after the page changes are committed; it warns about files with
uncommitted edits because their new date is not in git yet.
"""
import os
import re
import subprocess
import sys
from urllib.parse import urlparse, unquote

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SITEMAP = os.path.join(ROOT, "sitemap.xml")


def git(*args):
    return subprocess.run(["git", "-C", ROOT] + list(args), capture_output=True, text=True).stdout.strip()


def loc_to_file(loc):
    path = unquote(urlparse(loc).path or "/")
    rel = path.lstrip("/")
    if rel == "" or rel.endswith("/"):
        rel += "index.html"
    return rel


def main():
    raw = open(SITEMAP, "rb").read().decode("utf-8")
    newline = "\r\n" if "\r\n" in raw else "\n"
    text = raw.replace("\r\n", "\n")
    dirty = set(git("status", "--porcelain").splitlines())
    errors, changed = [], 0

    def fix(block_match):
        nonlocal changed
        block = block_match.group(0)
        loc = re.search(r"<loc>\s*(.*?)\s*</loc>", block).group(1)
        rel = loc_to_file(loc)
        if not os.path.isfile(os.path.join(ROOT, rel)):
            errors.append("%s -> %s does not exist" % (loc, rel))
            return block
        date = git("log", "-1", "--format=%cs", "--", rel)
        if not date:
            errors.append("%s -> %s has no commit" % (loc, rel))
            return block
        if any(line[3:] == rel for line in dirty):
            print("WARN %s has uncommitted changes; using last commit date %s" % (rel, date))
        if "<lastmod>" in block:
            new = re.sub(r"<lastmod>[^<]*</lastmod>", "<lastmod>%s</lastmod>" % date, block)
        else:
            new = re.sub(r"(\n([ \t]*)<loc>[^<]*</loc>)", r"\1\n\2<lastmod>%s</lastmod>" % date, block, count=1)
        if new != block:
            changed += 1
        return new

    new_text = re.sub(r"<url>.*?</url>", fix, text, flags=re.S)
    for e in errors:
        print("ERROR " + e)
    if errors:
        sys.exit(1)
    if new_text != text:
        open(SITEMAP, "wb").write(new_text.replace("\n", newline).encode("utf-8"))
    dates = re.findall(r"<lastmod>(.*?)</lastmod>", new_text)
    summary = {}
    for d in dates:
        summary[d] = summary.get(d, 0) + 1
    print("URLs: %d, lastmod updated: %d" % (len(dates), changed))
    for d in sorted(summary, reverse=True):
        print("  %s x%d" % (d, summary[d]))


if __name__ == "__main__":
    main()
