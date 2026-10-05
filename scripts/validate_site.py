# -*- coding: utf-8 -*-
"""
Site-wide checks for the published GitHub Pages site (stdlib only).

    python scripts/validate_site.py [--base origin/main]

Published files = repository files minus Jekyll's hidden names (., _, #, ~)
minus the _config.yml "exclude" list. Checks:
  1. ads/GA4   every published page except 404.html, offline.html and the
               Google verification file has exactly one AdSense auto-ads tag
               (adsbygoogle.js?client=ca-pub-7479840445702290), one GA4 gtag.js
               tag + config call, at most one google-adsense-account meta, and
               no manual <ins class="adsbygoogle"> slot; 404.html has GA4 and
               no AdSense
  2. head      <title>, meta description, canonical and robots meta of every
               page that exists on --base are unchanged (404.html is new)
  3. links     internal href/src targets exist
  4. sitemap   every <loc> maps to a published file; lastmod (if present)
               equals the file's last git commit date
  5. email     no e-mail address @timertools.pro anywhere published
  6. og        og:image / twitter:image / JSON-LD "image" targets exist
  7. jsonld    every application/ld+json block parses
  8. faq       FAQPage questions are visible on the page
Exit code 1 if any check fails.
"""
import argparse
import html
import json
import os
import re
import subprocess
import sys
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SITE_HOSTS = {"gon.ai.kr", "www.gon.ai.kr"}
SITE = "https://gon.ai.kr"
NO_ADS_PAGES = {"404.html", "offline.html"}
ADS_RE = re.compile(r'<script async src="https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js\?client=ca-pub-7479840445702290"\s+crossorigin="anonymous"></script>')
ANY_ADS_RE = re.compile(r"adsbygoogle\.js")
GA_SRC_RE = re.compile(r'<script async src="https://www\.googletagmanager\.com/gtag/js\?id=G-BNRL6FRMMM"></script>')
GA_CFG_RE = re.compile(r"gtag\('config', 'G-BNRL6FRMMM'\);")
META_ACCT_RE = re.compile(r'<meta name="google-adsense-account" content="ca-pub-7479840445702290">')
INS_RE = re.compile(r'<ins\b[^>]*class="[^"]*adsbygoogle', re.I)


# ---------------------------------------------------------------- files ----
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
    if any(p.startswith((".", "_", "#", "~")) for p in rel.split("/")):
        return False
    return not any(rel == e or rel.startswith(e + "/") for e in EXCLUDES)


def published_files():
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        rel_dir = os.path.relpath(dirpath, ROOT).replace("\\", "/")
        rel_dir = "" if rel_dir == "." else rel_dir + "/"
        dirnames[:] = [d for d in dirnames if published(rel_dir + d)]
        out += [rel_dir + f for f in filenames if published(rel_dir + f)]
    return sorted(out)


FILES = published_files()
FILESET = set(FILES)
HTML = [f for f in FILES if f.endswith(".html")]


def read(rel):
    return open(os.path.join(ROOT, rel), "rb").read().decode("utf-8").replace("\r\n", "\n")


def is_verification(rel, text):
    return bool(re.match(r"^google[0-9a-f]+\.html$", os.path.basename(rel))) and "<body" not in text.lower()


# --------------------------------------------------------------- parsing ---
class PageParser(HTMLParser):
    LINK_ATTRS = {"a": "href", "link": "href", "script": "src", "img": "src",
                  "source": "src", "iframe": "src", "form": "action"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.links, self.text, self.ldjson = [], [], []
        self._skip = 0
        self._in_ld = False
        self._ld_buf = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        attr = self.LINK_ATTRS.get(tag)
        if attr and a.get(attr):
            self.links.append((tag, a[attr].strip()))
        if tag in ("script", "style", "template", "noscript"):
            self._skip += 1
            if tag == "script" and (a.get("type") or "").lower() == "application/ld+json":
                self._in_ld, self._ld_buf = True, []

    def handle_endtag(self, tag):
        if tag in ("script", "style", "template", "noscript") and self._skip:
            self._skip -= 1
            if tag == "script" and self._in_ld:
                self.ldjson.append("".join(self._ld_buf))
                self._in_ld = False

    def handle_data(self, data):
        if self._in_ld:
            self._ld_buf.append(data)
        elif not self._skip:
            self.text.append(data)


def parse(text):
    p = PageParser()
    p.feed(text)
    body_text = re.sub(r"\s+", " ", " ".join(p.text))
    return p.links, body_text, p.ldjson


def head_items(text):
    def one(pattern):
        m = re.search(pattern, text, re.I | re.S)
        return m.group(1).strip() if m else None
    return {
        "title": one(r"<title>(.*?)</title>"),
        "description": one(r'<meta\s+name="description"\s+content="([^"]*)"'),
        "canonical": one(r'<link\s+rel="canonical"\s+href="([^"]*)"'),
        "robots": one(r'<meta\s+name="robots"\s+content="([^"]*)"'),
    }


def site_path(page, url):
    """Return the site path of an internal URL, or None for external ones."""
    u = urlparse(url)
    if u.scheme in ("mailto", "tel", "javascript", "data"):
        return None
    if u.scheme in ("http", "https") or url.startswith("//"):
        if u.netloc not in SITE_HOSTS:
            return None
        path = u.path or "/"
    else:
        if not u.path:
            return None
        if u.path.startswith("/"):
            path = u.path
        else:
            path = os.path.normpath(os.path.join("/" + os.path.dirname(page), u.path)).replace("\\", "/")
            if u.path.endswith("/") and not path.endswith("/"):
                path += "/"
    return unquote(path)


def path_exists(path):
    rel = path.lstrip("/")
    if rel == "" or rel.endswith("/"):
        return rel + "index.html" in FILESET
    return rel in FILESET or rel + ".html" in FILESET or rel + "/index.html" in FILESET


def git(*args):
    return subprocess.run(["git", "-C", ROOT] + list(args), capture_output=True)


# ---------------------------------------------------------------- checks ---
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="origin/main")
    args = ap.parse_args()

    fails, warns, notes = {}, [], {}

    def fail(check, msg):
        fails.setdefault(check, []).append(msg)

    pages = {}
    for rel in HTML:
        text = read(rel)
        pages[rel] = (text, parse(text))

    # 1. ads / GA4
    ads_pages = 0
    for rel, (text, _) in pages.items():
        if is_verification(rel, text):
            continue
        n_ads, n_any = len(ADS_RE.findall(text)), len(ANY_ADS_RE.findall(text))
        n_ga, n_cfg = len(GA_SRC_RE.findall(text)), len(GA_CFG_RE.findall(text))
        n_meta = len(META_ACCT_RE.findall(text))
        if INS_RE.search(text):
            fail("ads", "%s: manual <ins class=adsbygoogle> slot" % rel)
        if rel in NO_ADS_PAGES:
            if n_any:
                fail("ads", "%s: must not carry AdSense" % rel)
            if rel == "404.html" and (n_ga, n_cfg) != (1, 1):
                fail("ads", "404.html: GA4 tag/config count %d/%d" % (n_ga, n_cfg))
            continue
        ads_pages += 1
        if (n_ads, n_any) != (1, 1):
            fail("ads", "%s: AdSense tag count %d (any adsbygoogle.js: %d)" % (rel, n_ads, n_any))
        if (n_ga, n_cfg) != (1, 1):
            fail("ads", "%s: GA4 tag/config count %d/%d" % (rel, n_ga, n_cfg))
        if n_meta > 1:
            fail("ads", "%s: google-adsense-account meta x%d" % (rel, n_meta))
    notes["ads"] = "%d pages checked for exactly 1 AdSense + 1 GA4 tag; 404.html GA4 only; offline.html and Google verification file exempt" % ads_pages

    # 2. head items unchanged vs base
    compared = new_pages = 0
    for rel, (text, _) in pages.items():
        r = git("show", "%s:%s" % (args.base, rel))
        if r.returncode != 0:
            new_pages += 1
            continue
        old, cur = head_items(r.stdout.decode("utf-8")), head_items(text)
        compared += 1
        for k in ("title", "description", "canonical", "robots"):
            if old[k] != cur[k]:
                fail("head", "%s: %s changed %r -> %r" % (rel, k, old[k], cur[k]))
    notes["head"] = "%d pages compared with %s (title/description/canonical/robots), %d new page(s)" % (compared, args.base, new_pages)

    # 3. internal links
    n_links = 0
    for rel, (_, (links, _, _)) in pages.items():
        for tag, url in links:
            p = site_path(rel, url)
            if p is None:
                continue
            n_links += 1
            if not path_exists(p):
                fail("links", "%s: <%s> %s -> %s" % (rel, tag, url, p))
    notes["links"] = "%d internal references checked" % n_links

    # 4. sitemap
    sm = read("sitemap.xml")
    urls = re.findall(r"<url>(.*?)</url>", sm, re.S)
    for block in urls:
        loc = re.search(r"<loc>(.*?)</loc>", block).group(1).strip()
        p = site_path("index.html", loc)
        rel = (p.lstrip("/") + "index.html") if (p == "/" or p.endswith("/")) else p.lstrip("/")
        if rel not in FILESET:
            fail("sitemap", "%s -> %s not a published file" % (loc, rel))
            continue
        lm = re.search(r"<lastmod>(.*?)</lastmod>", block)
        if lm:
            d = git("log", "-1", "--format=%cs", "--", rel).stdout.decode().strip()
            if d and lm.group(1).strip() != d:
                fail("sitemap", "%s: lastmod %s != last commit %s" % (loc, lm.group(1).strip(), d))
    notes["sitemap"] = "%d URLs map to published files; lastmod = git last-commit date" % len(urls)

    # 5. e-mail on the dead timertools.pro domain
    for rel in FILES:
        if rel.endswith((".html", ".js", ".css", ".xml", ".txt", ".json", ".md", ".webmanifest")):
            for m in re.finditer(r"[A-Za-z0-9._%+-]+@timertools\.pro", read(rel)):
                fail("email", "%s: %s" % (rel, m.group(0)))
    notes["email"] = "no address @timertools.pro in %d published files" % len(FILES)

    # 6. og:image / twitter:image / JSON-LD image targets
    n_og = 0
    pat = re.compile(r'<meta\s+(?:property="og:image"|name="twitter:image")\s+content="([^"]*)"|"image"\s*:\s*"([^"]*)"')
    for rel, (text, _) in pages.items():
        for m in pat.finditer(text):
            url = m.group(1) or m.group(2)
            n_og += 1
            p = site_path(rel, url)
            if p is None or not path_exists(p):
                fail("og", "%s: %s" % (rel, url))
    notes["og"] = "%d image references resolve to files in the repo" % n_og

    # 7. JSON-LD
    n_ld = 0
    for rel, (_, (_, _, lds)) in pages.items():
        for block in lds:
            n_ld += 1
            try:
                json.loads(block)
            except Exception as e:
                fail("jsonld", "%s: %s" % (rel, e))
    notes["jsonld"] = "%d JSON-LD blocks parse" % n_ld

    # 8. FAQ visibility
    faq_pages = 0
    for rel, (_, (_, body, lds)) in pages.items():
        qs = []
        for block in lds:
            try:
                d = json.loads(block)
            except Exception:
                continue
            for o in (d if isinstance(d, list) else [d]):
                if isinstance(o, dict) and o.get("@type") == "FAQPage":
                    qs += [re.sub(r"\s+", " ", html.unescape(q.get("name", ""))).strip() for q in o.get("mainEntity", [])]
        if not qs:
            continue
        faq_pages += 1
        shown = sum(1 for q in qs if q and q in body)
        if shown == len(qs):
            continue
        if re.search(r"자주 묻는 질문|Frequently Asked Questions", body):
            warns.append("faq: %s shows a FAQ section but %d/%d questions are worded differently" % (rel, len(qs) - shown, len(qs)))
        else:
            fail("faq", "%s: %d/%d FAQ questions not visible" % (rel, len(qs) - shown, len(qs)))
    notes["faq"] = "%d pages with FAQPage JSON-LD" % faq_pages

    print("Published files: %d (HTML %d), base: %s" % (len(FILES), len(HTML), args.base))
    for check in ("ads", "head", "links", "sitemap", "email", "og", "jsonld", "faq"):
        status = "FAIL" if check in fails else "PASS"
        print("[%s] %-8s %s" % (status, check, notes.get(check, "")))
        for msg in fails.get(check, [])[:50]:
            print("        - " + msg)
    for w in warns:
        print("[WARN] " + w)
    print("RESULT: %s" % ("FAIL" if fails else "ALL CHECKS PASSED"))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
