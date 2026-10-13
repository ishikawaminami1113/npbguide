#!/usr/bin/env python3
"""Inject Article JSON-LD into every blog post (idempotent)."""
import glob
import html
import json
import os
import re

DATED = {
    "blog/japan-wbc-2026-exit.html",
    "blog/2026-climax-series-format.html",
    "blog/2026-postseason-guide.html",
}

TITLE_RE = re.compile(r"<title>(.*?)</title>", re.S)
DESC_RE = re.compile(r'<meta name="description" content="([^"]*)"')
OG_RE = re.compile(r'<meta property="og:image" content="([^"]*)"')


def main():
    count = 0
    for path in sorted(glob.glob("/Applications/baseball-site/blog/*.html")):
        with open(path, encoding="utf-8") as fh:
            doc = fh.read()
        if "application/ld+json" in doc and '"@type": "Article"' in doc:
            continue  # already injected

        title = html.unescape(TITLE_RE.search(doc).group(1)).strip()
        headline = title.split(" | ")[0]
        desc = html.unescape(DESC_RE.search(doc).group(1)).strip()
        image = OG_RE.search(doc).group(1)

        rel = os.path.relpath(path, "/Applications/baseball-site")
        article = {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": headline,
            "description": desc,
            "image": image,
            "author": {"@type": "Organization", "name": "NPB Guide"},
            "publisher": {
                "@type": "Organization",
                "name": "NPB Guide",
                "url": "https://npbtourguide.com/",
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "https://npbtourguide.com/" + rel.replace(os.sep, "/"),
            },
        }
        if path in DATED:
            article["datePublished"] = "2026-10-09"

        block = (
            "\n  <script type=\"application/ld+json\">\n  "
            + json.dumps(article, ensure_ascii=False, indent=2).replace("\n", "\n  ")
            + "\n  </script>"
        )

        # Insert right after the og:image:alt line if present, else after </title>.
        anchor = re.search(r'<meta property="og:image:alt"[^>]*>', doc)
        if anchor:
            pos = anchor.end()
        else:
            pos = TITLE_RE.search(doc).end()
        doc = doc[:pos] + block + doc[pos:]

        with open(path, "w", encoding="utf-8") as fh:
            fh.write(doc)
        count += 1
        print("injected:", path)
    print("total:", count)


if __name__ == "__main__":
    main()
