# -*- coding: utf-8 -*-
"""
Render a VISIBLE FAQ section on the pages whose FAQPage JSON-LD is not shown.

Problem: these pages ship a FAQPage JSON-LD block, but none of its questions
are rendered on the page. Google's structured-data guidelines require the
marked-up FAQ content to be visible to users.

Same pattern as scripts/add_visible_faq_en_minute.py / _en_specialty.py: read
each page's own FAQPage JSON-LD and render the exact same Q&A as a visible
<section> right before </main>, reusing the existing classes
(guide-section / faq-section / faq-list / faq-item).
Headings: Korean pages "❓ <name> 자주 묻는 질문", English pages
"❓ <name> — Frequently Asked Questions".

Idempotent: a page that already has id="faq-title" is skipped.
Titles, meta tags and the JSON-LD itself are not touched.
"""
import html
import json
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")

PAGES = [
    "index.html",
    # Korean minute / second timers
    "timer/1min.html", "timer/2min.html", "timer/3min.html", "timer/5min.html",
    "timer/7min.html", "timer/10min.html", "timer/15min.html", "timer/20min.html",
    "timer/25min.html", "timer/30min.html", "timer/45min.html", "timer/60min.html",
    "timer/90min.html",
    "timer/10sec.html", "timer/15sec.html", "timer/20sec.html", "timer/30sec.html",
    "timer/45sec.html",
    # Korean life / specialty timers
    "timer/brushing.html", "timer/coffee.html", "timer/meditation.html",
    "timer/microwave.html", "timer/nap.html", "timer/plank.html",
    "timer/presentation.html", "timer/reading.html", "timer/skincare.html",
    "timer/stretching.html", "timer/tabata.html",
    # English pages
    "en/timer/10sec.html", "en/timer/15sec.html", "en/timer/20sec.html",
    "en/timer/30sec.html", "en/timer/45sec.html", "en/timer/multi.html",
]

# Pages without an id="timer-title" heading
FALLBACK_TITLES = {
    "index.html": "TimerTools Pro",
    "en/timer/multi.html": "Multi Timer",
}
# Pages whose other <h2>s use the shared .section-title style
SECTION_TITLE_PAGES = {"index.html"}


def extract_faq(content):
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>',
                        content, re.DOTALL)
    for b in blocks:
        try:
            data = json.loads(b.strip())
        except Exception:
            continue
        if isinstance(data, dict) and data.get("@type") == "FAQPage":
            qas = []
            for item in data.get("mainEntity", []):
                q = (item.get("name") or "").strip()
                a = ((item.get("acceptedAnswer") or {}).get("text") or "").strip()
                if q and a:
                    qas.append((q, a))
            return qas
    return []


def extract_title(rel, content):
    m = re.search(r'id="timer-title"[^>]*>([^<]+)<', content)
    if m and m.group(1).strip():
        return m.group(1).strip()
    return FALLBACK_TITLES.get(rel, "")


def page_lang(content):
    m = re.search(r'<html[^>]*\blang="([a-zA-Z-]+)"', content)
    return (m.group(1) if m else "ko").lower()


def build_faq_html(rel, lang, title, qas):
    if lang.startswith("ko"):
        heading = "❓ %s 자주 묻는 질문" % html.escape(title, quote=False)
    else:
        heading = "❓ %s — Frequently Asked Questions" % html.escape(title, quote=False)
    h2_class = ' class="section-title"' if rel in SECTION_TITLE_PAGES else ""
    items = []
    for i, (q, a) in enumerate(qas):
        margin = "" if i == len(qas) - 1 else ' style="margin-bottom: var(--space-5);"'
        items.append(
            '                    <div class="faq-item"%s>\n'
            '                        <h3>%s</h3>\n'
            '                        <p>%s</p>\n'
            '                    </div>' % (margin,
                                           html.escape(q, quote=False),
                                           html.escape(a, quote=False)))
    return (
        "\n        <!-- FAQ Section (visible, matches structured data) -->\n"
        '        <section class="guide-section faq-section" aria-labelledby="faq-title">\n'
        '            <div class="container">\n'
        '                <h2 id="faq-title"%s>%s</h2>\n'
        '                <div class="faq-list" style="max-width: 820px; margin: 0 auto;">\n'
        "%s\n"
        "                </div>\n"
        "            </div>\n"
        "        </section>\n" % (h2_class, heading, "\n".join(items)))


def process(rel):
    path = os.path.join(ROOT, rel)
    if not os.path.exists(path):
        print("SKIP %s: page not found" % rel)
        return False
    raw = open(path, "rb").read().decode("utf-8")
    newline = "\r\n" if "\r\n" in raw else "\n"
    content = raw.replace("\r\n", "\n")
    if 'id="faq-title"' in content:
        print("SKIP %s: already has visible FAQ" % rel)
        return False
    qas = extract_faq(content)
    if not qas:
        print("WARN %s: no FAQPage JSON-LD found" % rel)
        return False
    if content.count("</main>") != 1:
        print("WARN %s: expected exactly one </main> anchor" % rel)
        return False
    title = extract_title(rel, content)
    if not title:
        print("SKIP %s: no title for the FAQ heading" % rel)
        return False
    lang = page_lang(content)
    faq_html = build_faq_html(rel, lang, title, qas)
    new = re.sub(r"\n[ \t]*</main>", lambda m: faq_html + "    </main>", content, count=1)
    with open(path, "wb") as f:
        f.write(new.replace("\n", newline).encode("utf-8"))
    print("OK %s: added %d visible FAQ items (lang=%s, title='%s')" % (rel, len(qas), lang, title))
    return True


def main():
    count = sum(1 for p in PAGES if process(p))
    print("\nDone. Modified %d / %d pages." % (count, len(PAGES)))


if __name__ == "__main__":
    main()
