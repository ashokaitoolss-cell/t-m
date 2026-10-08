#!/usr/bin/env python3
"""PozStar logo sting: lift the shapes out of the supplied SVG and write the composition.

The logo is used exactly as supplied (assets/logo/pozstar-source.svg): its three speed bars,
the seven "PozStar" letters and the tagline glyphs are copied path for path; only the timing
below is ours.

    python3 scripts/build.py   # writes index.html and compositions/logo.html
"""
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SVG_NS = "{http://www.w3.org/2000/svg}"

# Display: the 93.8 x 29.4 artboard drawn 1100 px wide, centred on the 1920 x 1080 frame.
DISPLAY_W = 1100

TIMES = dict(
    END=4.8,
    T_BARS=0.2,     # the three bars shoot out of their slot, top to bottom
    BAR_STAGGER=0.09,
    T_WORD=0.62,    # "PozStar" streams out of its slot and spreads into place
    WORD_DUR=1.1,
    T_TAG=1.55,     # tagline fades up, glyph by glyph
    T_PUSH=1.9,     # slow push-in to the end
)


def f(v):
    return f"{v:.3f}".rstrip("0").rstrip(".")


def shapes(group):
    return [e for e in group.iter() if e.tag in (SVG_NS + "path", SVG_NS + "polygon")]


def main():
    root = ET.parse(ROOT / "assets/logo/pozstar-source.svg").getroot()
    vb = [float(v) for v in root.get("viewBox").split()]
    style = root.find(SVG_NS + "style").text
    colors = {}
    for rule in style.split("}"):
        if "{" in rule:
            name, body = rule.split("{")
            colors[name.strip().lstrip(".")] = body.split(":")[1].strip().rstrip(";")

    mark, tagline = root.find(SVG_NS + "g").findall(SVG_NS + "g")
    bars = [e for e in shapes(mark) if e.tag == SVG_NS + "polygon"]
    letters = [e for e in shapes(mark) if e.tag == SVG_NS + "path"]
    tag = shapes(tagline)
    assert (len(bars), len(letters), len(tag)) == (3, 7, 29), (len(bars), len(letters), len(tag))

    # Bars, top to bottom (the source lists them orange, green, blue).
    def top(p):
        return min(float(xy.split(",")[1]) for xy in p.get("points").split())

    bars.sort(key=top)
    bar_svg = "\n".join(
        f'                  <polygon class="bar" points="{" ".join(b.get("points").split())}" fill="{colors[b.get("class")]}" />'
        for b in bars)

    def clean(d):
        return " ".join(d.split())

    ink = colors[letters[0].get("class")]
    letter_svg = "\n".join(f'                  <path class="letter" d="{clean(p.get("d"))}" />' for p in letters)
    tag_svg = "\n".join(f'                  <path class="glyph" d="{clean(p.get("d"))}" />' for p in tag)

    tokens = {
        "VB": " ".join(f(v) for v in vb),
        "VB_W": f(vb[2]),
        "DISPLAY_W": str(DISPLAY_W),
        "DISPLAY_H": f(DISPLAY_W * vb[3] / vb[2]),
        "INK": ink,
        "BARS": bar_svg,
        "LETTERS": letter_svg,
        "TAGLINE": tag_svg,
        **{k: f(v) for k, v in TIMES.items()},
    }
    for src, out in (("src/index.html", "index.html"), ("src/logo.html", "compositions/logo.html")):
        html = (ROOT / src).read_text()
        for k, v in tokens.items():
            html = html.replace("{{" + k + "}}", v)
        assert "{{" not in html, (src, html[html.index("{{"):html.index("{{") + 40])
        (ROOT / out).write_text(html)
    print("wrote index.html and compositions/logo.html")


if __name__ == "__main__":
    main()
