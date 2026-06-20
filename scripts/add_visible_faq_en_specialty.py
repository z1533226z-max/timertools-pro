# -*- coding: utf-8 -*-
"""
Add a VISIBLE FAQ section to EN specialty timer pages.

Problem: each /en/timer/<name>.html specialty page (interval, workout, study,
tabata, ...) ships a FAQPage JSON-LD block, but the questions/answers are NOT
rendered on the page. Google requires structured FAQ content to be visible to
qualify for rich results, and the question text is valuable long-tail content
that thickens otherwise-thin (~20KB) pages.

This reuses the EXACT pattern already shipped for pomodoro.html (#40) and the
13 EN minute-timer pages (#49): read each page's own FAQPage JSON-LD and render
the same Q&A as a visible <section> right before </main>, reusing existing CSS
classes (guide-section / faq-section / faq-list / faq-item).

Scope: high-search-volume EN specialty keywords ('interval timer',
'workout timer', 'study timer', 'tabata timer', ...). Excludes pomodoro
(already done #40), cooking/multi (no clean timer-title), skincare (no EN page).

Idempotent: skips any page that already has id="faq-title".
Skips pages missing FAQPage JSON-LD or a clean timer-title (quality guard).
Re-running the original page generator is NOT required (and is discouraged).
"""
import re
import os
import json
import html

PAGES = ["workout", "study", "interval", "tabata", "stretching",
         "meditation", "plank", "nap", "reading", "egg", "coffee",
         "brushing", "ramen", "microwave", "presentation", "basic"]
BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "en", "timer")


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


def extract_title(content):
    m = re.search(r'id="timer-title"[^>]*>([^<]+)<', content)
    return m.group(1).strip() if m else ""


def build_faq_html(title, qas):
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
    items_html = "\n".join(items)
    return (
        "\n        <!-- FAQ Section (visible, matches structured data) -->\n"
        '        <section class="guide-section faq-section" aria-labelledby="faq-title">\n'
        '            <div class="container">\n'
        '                <h2 id="faq-title">❓ %s — Frequently Asked Questions</h2>\n'
        '                <div class="faq-list" style="max-width: 820px; margin: 0 auto;">\n'
        "%s\n"
        "                </div>\n"
        "            </div>\n"
        "        </section>\n" % (html.escape(title, quote=False), items_html))


def process(page):
    path = os.path.join(BASE, page + ".html")
    if not os.path.exists(path):
        print("SKIP %s: page not found" % page)
        return False
    with open(path, encoding="utf-8") as f:
        content = f.read()
    if 'id="faq-title"' in content:
        print("SKIP %s: already has visible FAQ" % page)
        return False
    title = extract_title(content)
    if not title:
        print("SKIP %s: no timer-title anchor (quality guard)" % page)
        return False
    qas = extract_faq(content)
    if not qas:
        print("WARN %s: no FAQPage JSON-LD found" % page)
        return False
    if "</main>" not in content:
        print("WARN %s: no </main> anchor" % page)
        return False
    faq_html = build_faq_html(title, qas)
    new = content.replace("</main>", faq_html + "    </main>", 1)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new)
    print("OK %s: added %d visible FAQ items (title='%s')" % (page, len(qas), title))
    return True


def main():
    count = 0
    for p in PAGES:
        if process(p):
            count += 1
    print("\nDone. Modified %d / %d pages." % (count, len(PAGES)))


if __name__ == "__main__":
    main()
