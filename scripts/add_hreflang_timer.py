#!/usr/bin/env python3
"""
Complete reciprocal ko<->en hreflang for /timer/*.html pages.

Background
----------
16 KO timer pages declared only `hreflang="ko"` (or, for workout.html, not even
that) while their EN counterparts at /en/timer/*.html already pointed back to KO.
Google requires hreflang to be *bidirectional*; a one-way declaration is ignored,
so the EN versions were not being surfaced in English-language search results.

This script is idempotent and self-correcting. For every timer/<name>.html that
has a matching en/timer/<name>.html it guarantees the final ordering:

    <link rel="canonical" href=".../timer/<name>.html">
    <link rel="alternate" hreflang="ko" href=".../timer/<name>.html">
    <link rel="alternate" hreflang="en" href=".../en/timer/<name>.html">

  * The en tag is inserted directly after the existing ko tag (matching its
    indentation), so ordering stays canonical -> ko -> en.
  * If the ko tag is missing (workout.html), both ko and en are inserted right
    after the canonical tag.
  * Pages with no EN counterpart (e.g. skincare.html) are skipped.
  * Pages already reciprocal are left untouched.
"""

import re
import sys
from pathlib import Path

BASE = "https://gon.ai.kr"
ROOT = Path(__file__).resolve().parent.parent
KO_DIR = ROOT / "timer"
EN_DIR = ROOT / "en" / "timer"


def en_tag(indent: str, name: str) -> str:
    return f'{indent}<link rel="alternate" hreflang="en" href="{BASE}/en/timer/{name}.html">'


def ko_tag(indent: str, name: str) -> str:
    return f'{indent}<link rel="alternate" hreflang="ko" href="{BASE}/timer/{name}.html">'


def fix_page(ko_path: Path) -> str:
    name = ko_path.stem
    if name.endswith("_failed"):
        return "skip(_failed)"
    if not (EN_DIR / f"{name}.html").exists():
        return "skip(no EN counterpart)"

    html = ko_path.read_text(encoding="utf-8")

    has_ko = f'hreflang="ko" href="{BASE}/timer/{name}.html"' in html
    has_en = f'hreflang="en" href="{BASE}/en/timer/{name}.html"' in html
    if has_ko and has_en:
        return "ok(already reciprocal)"

    # Preferred anchor: the existing ko hreflang line -> insert en right after it.
    ko_line_re = re.compile(
        r'^([ \t]*)<link rel="alternate" hreflang="ko" href="'
        + re.escape(f"{BASE}/timer/{name}.html") + r'">[ \t]*$',
        re.MULTILINE,
    )
    m = ko_line_re.search(html)
    if m:
        indent = m.group(1)
        new_html = html[:m.end()] + "\n" + en_tag(indent, name) + html[m.end():]
        ko_path.write_text(new_html, encoding="utf-8")
        return "FIXED (+en after ko)"

    # No ko line: anchor on canonical -> insert ko then en after it.
    canon_re = re.compile(
        r'^([ \t]*)<link rel="canonical" href="'
        + re.escape(f"{BASE}/timer/{name}.html") + r'">[ \t]*$',
        re.MULTILINE,
    )
    m = canon_re.search(html)
    if not m:
        return "ERROR(no canonical/ko anchor)"
    indent = m.group(1)
    addition = "\n" + ko_tag(indent, name) + "\n" + en_tag(indent, name)
    new_html = html[:m.end()] + addition + html[m.end():]
    ko_path.write_text(new_html, encoding="utf-8")
    return "FIXED (+ko +en after canonical)"


def main() -> int:
    fixed = 0
    pages = sorted(KO_DIR.glob("*.html"))
    for p in pages:
        result = fix_page(p)
        if result.startswith("FIXED"):
            fixed += 1
            print(f"  {p.name:24} {result}")
        elif result.startswith("ERROR"):
            print(f"  {p.name:24} {result}", file=sys.stderr)
    print(f"\nDone. {fixed} page(s) updated, {len(pages)} scanned.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
