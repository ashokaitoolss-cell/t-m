#!/usr/bin/env python3
"""PozPad logo sting: rebuild the logo as clean vectors and write the composition.

The source logo (assets/logo/pozpad-source.jpg, 609x616) was measured, not traced: every
edge below is a sub-pixel 0.5-alpha crossing, a least-squares circle, or a tangent-constrained
Bezier fitted to the pin's outline (rms error 0.1-0.3 px). The 609-wide source is centred on
a 616x616 square tile (DX), so all source x values are shifted by 3.5.

    python3 scripts/build.py   # writes index.html, compositions/logo.html, assets/logo/pozpad.svg
"""
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DX = 3.5

TILE = 616
TILE_R = 85
BLUE_TOP, BLUE_BOTTOM = "#3766b1", "#21418f"  # vertical gradient, measured at the tile edges
PIN_FILL = "#fbfbfb"  # the pin is a hair off-white; dots, rings and type are pure white

# Orbits: two concentric circles, the outer one open at the bottom around the wordmark.
CX, CY = 304.5 + DX, 241.0
R_INNER, R_OUTER, RING_W = 215.7, 309.4, 2.4
OUTER_GAP = (47.4, 132.8)  # degrees, y down (90 = straight down)

# Dots: measured centres (kept exactly, so the end frame matches the logo) and radii.
DOTS = {
    "dotBig": (157.20 + DX, 89.97, 22.4),
    "dotRight": (515.60 + DX, 294.83, 14.7),
    "dotSmall": (51.91 + DX, 414.59, 11.4),
}

# Pin: straight left edge, a dome of two Bezier quadrants, a straight right edge, a Bezier
# shoulder into a straight slanted bottom that ends in the sharp tail tip.
XL, XR = 156.45, 451.6
SLOPE, Y158 = -0.2621, 428.45
DOME = dict(yL=232.83, xT=302.87, yR=221.01, h1=82.23, h2=81.82, h3=80.41, h4=80.42)
SHOULDER = dict(yR2=252.13, xB=342.52, h5=67.22, h6=65.10)
# The blue P cut into the pin: stem, bowl with an open aperture at its lower left.
SL, SR, TOP, CT, CB, BB, IR, OR, GAP = 218.0, 266.2, 154.8, 182.9, 300.1, 328.2, 347.2, 391.5, 282.5


def bottom(x):
    return Y158 + SLOPE * (x - 158)


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def pt(x, y, shift=True):
    return f"{f(x + (DX if shift else 0))} {f(y)}"


def poly(verts, shift=True):
    """Closed polygon [(x, y, r)]; a vertex with r > 0 becomes a circular arc of radius r."""
    n, d = len(verts), ""
    for i, (x, y, r) in enumerate(verts):
        cmd = "M" if i == 0 else "L"
        if r <= 0:
            d += cmd + pt(x, y, shift)
            continue
        px, py, _ = verts[i - 1]
        nx, ny, _ = verts[(i + 1) % n]
        d1, d2 = math.hypot(px - x, py - y), math.hypot(nx - x, ny - y)
        a = (x + (px - x) * r / d1, y + (py - y) * r / d1)
        b = (x + (nx - x) * r / d2, y + (ny - y) * r / d2)
        sweep = 1 if (x - px) * (ny - y) - (y - py) * (nx - x) > 0 else 0
        d += cmd + pt(*a, shift) + f"A{f(r)} {f(r)} 0 0 {sweep} " + pt(*b, shift)
    return d + "Z"


# ---------------------------------------------------------------- the pin
def bubble():
    D, S = DOME, SHOULDER
    n = math.hypot(1, SLOPE)
    u = (-1 / n, -SLOPE / n)  # along the bottom edge, heading for the tail
    B = (S["xB"], bottom(S["xB"]))
    tip = (XL, bottom(XL))
    d = "M" + pt(*tip) + "L" + pt(XL, D["yL"])
    d += "C" + pt(XL, D["yL"] - D["h1"]) + " " + pt(D["xT"] - D["h2"], 89.5) + " " + pt(D["xT"], 89.5)
    d += "C" + pt(D["xT"] + D["h3"], 89.5) + " " + pt(XR, D["yR"] - D["h4"]) + " " + pt(XR, D["yR"])
    d += "L" + pt(XR, S["yR2"])
    d += "C" + pt(XR, S["yR2"] + S["h5"]) + " " + pt(B[0] - u[0] * S["h6"], B[1] - u[1] * S["h6"]) + " " + pt(*B)
    return d + "Z", (tip[0] + DX, tip[1])


def p_cut():
    # The blue region, filled with the tile gradient. The stem ends 1.5 px past the pin's
    # slanted bottom instead of being clipped to it: a clip edge on top of the bubble's own
    # edge leaves a pale anti-aliased seam, and the overhang is invisible on the tile.
    return poly([(SL, TOP, 11), (OR, TOP, 46), (OR, BB, 46), (GAP, BB, 0), (GAP, CB, 0),
                 (IR, CB, 28), (IR, CT, 28), (SR, CT, 0), (SR, bottom(SR) + 1.5, 0), (SL, bottom(SL) + 1.5, 0)])


def p_centerline():
    # Pen path for writing the P on: up the stem, along the top, round the bowl to the aperture.
    sx, ty, rx, by, r = (SL + SR) / 2, (TOP + CT) / 2, (IR + OR) / 2, (CB + BB) / 2, 37
    return ("M" + pt(sx, 425) + "L" + pt(sx, ty) + "L" + pt(rx - r, ty)
            + f"A{r} {r} 0 0 1 " + pt(rx, ty + r) + "L" + pt(rx, by - r)
            + f"A{r} {r} 0 0 1 " + pt(rx - r, by) + "L" + pt(GAP, by))


# ---------------------------------------------------------------- the wordmark
def glyph_p(x0):
    s = x0 - 145.8
    return poly([(145.8 + s, 482, 0), (195 + s, 482, 14), (195 + s, 531, 14), (162.8 + s, 531, 0),
                 (162.8 + s, 524, 0), (183 + s, 524, 9), (183 + s, 489, 9), (158 + s, 489, 0),
                 (158 + s, 564, 0), (145.8 + s, 564, 0)])


def rrect(x0, y0, x1, y1, r, hole=False):
    v = [(x0, y0, r), (x1, y0, r), (x1, y1, r), (x0, y1, r)]
    return poly(v[::-1] if hole else v)


GLYPHS = [
    ("P", glyph_p(145.8)),
    ("o", rrect(202, 499, 253, 564, 13) + rrect(214, 506, 241, 557, 7, hole=True)),
    ("z", poly([(260.2, 499, 0), (301.6, 499, 0), (301.6, 506, 0), (272.6, 557, 0), (302.2, 557, 0),
                (302.2, 564, 0), (259.8, 564, 0), (259.8, 557, 0), (288.8, 506, 0), (260.2, 506, 0)])),
    ("P", glyph_p(310.8)),
    ("a", poly([(369.1, 499, 0), (408, 499, 14), (408, 564, 0), (361, 564, 12), (361, 525.2, 12),
                (388, 525.2, 0), (388, 532, 0), (373, 532, 6), (373, 557, 6), (396, 557, 0),
                (396, 506, 7), (369.1, 506, 0)])),
    ("d", poly([(417, 499, 13), (447.9, 499, 0), (447.9, 506, 0), (429, 506, 7), (429, 557, 7),
                (454, 557, 0), (454, 480, 0), (466, 480, 0), (466, 564, 0), (417, 564, 13)])),
]
BASELINE = 564

# ---------------------------------------------------------------- timing (seconds)
TIMES = dict(
    END=5.5,
    T_DOT=0.2,      # blue dot pops
    T_GROW=0.46,    # ...and opens into the tile
    T_PIN=0.98,     # pin grows from its tip
    T_WRITE=1.18,   # P is written in
    T_COMET=1.34,   # big dot runs its orbit, drawing the inner ring
    COMET_DUR=1.3,
    T_OUTER=1.52,   # outer arcs sweep down from the top
    OUTER_DUR=1.0,
    T_WORD=2.36,    # wordmark rises
    T_SHEEN=3.25,   # one soft sheen
    T_PUSH=2.9,     # slow push-in to the end
)


def inv_power_inout(p, k):
    """Time fraction at which GSAP's power{k-1}.inOut (a degree-k in-out curve) reaches p."""
    if p < 0.5:
        return (p / 2 ** (k - 1)) ** (1 / k)
    return 1 - (2 * (1 - p)) ** (1 / k) / 2


# ---------------------------------------------------------------- orbits
def on_circle(r, deg):
    a = math.radians(deg)
    return CX + r * math.cos(a), CY + r * math.sin(a)


def ring_inner(start_deg):
    """Full inner circle as two clockwise half-arcs starting at start_deg (for draw-on)."""
    p0, p1 = on_circle(R_INNER, start_deg), on_circle(R_INNER, start_deg + 180)
    r = f(R_INNER)
    return (f"M{f(p0[0])} {f(p0[1])}A{r} {r} 0 0 1 {f(p1[0])} {f(p1[1])}"
            f"A{r} {r} 0 0 1 {f(p0[0])} {f(p0[1])}")


def ring_outer_halves():
    """Outer arc as two halves that start at the top and run down to the gap's ends."""
    top = on_circle(R_OUTER, -90)
    left, right = on_circle(R_OUTER, OUTER_GAP[1]), on_circle(R_OUTER, OUTER_GAP[0])
    r = f(R_OUTER)
    L = f"M{f(top[0])} {f(top[1])}A{r} {r} 0 0 0 {f(left[0])} {f(left[1])}"
    R = f"M{f(top[0])} {f(top[1])}A{r} {r} 0 0 1 {f(right[0])} {f(right[1])}"
    return L, R


def angle_of(x, y):
    return math.degrees(math.atan2(y - CY, x - CX))


# ---------------------------------------------------------------- outputs
def static_svg():
    bub, _ = bubble()
    L, R = ring_outer_halves()
    dots = "".join(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}"/>' for x, y, r in DOTS.values())
    glyphs = "".join(f'<path d="{d}"/>' for _, d in GLYPHS)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{TILE}" height="{TILE}" viewBox="0 0 {TILE} {TILE}">
  <title>PozPad</title>
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="0" y2="{TILE}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="{BLUE_TOP}"/><stop offset="1" stop-color="{BLUE_BOTTOM}"/></linearGradient>
    <clipPath id="tileClip"><rect width="{TILE}" height="{TILE}" rx="{TILE_R}"/></clipPath>
  </defs>
  <rect width="{TILE}" height="{TILE}" rx="{TILE_R}" fill="url(#tile)"/>
  <g clip-path="url(#tileClip)" fill="none" stroke="#fff" stroke-width="{RING_W}"><path d="{ring_inner(0)}"/><path d="{L}"/><path d="{R}"/></g>
  <g fill="#fff">{dots}</g>
  <path d="{bub}" fill="{PIN_FILL}"/>
  <path d="{p_cut()}" fill="url(#tile)"/>
  <g fill="#fff" fill-rule="evenodd">{glyphs}</g>
</svg>
'''


def main():
    bub, tip = bubble()
    big = DOTS["dotBig"]
    big_angle = angle_of(big[0], big[1])
    L, R = ring_outer_halves()
    tokens = {
        "TILE": str(TILE),
        "TILE_RADIUS_PCT": f(TILE_R / TILE * 100),
        "BLUE_TOP": BLUE_TOP,
        "BLUE_BOTTOM": BLUE_BOTTOM,
        "PIN_FILL": PIN_FILL,
        "RING_W": f(RING_W),
        "RING_INNER": ring_inner(big_angle),
        "RING_OUTER_L": L,
        "RING_OUTER_R": R,
        "BUBBLE": bub,
        "P_CUT": p_cut(),
        "P_PEN": p_centerline(),
        "BASELINE_CLIP_Y": f(BASELINE - 98),
        "BASELINE_CLIP_H": f(98.8),
        "GLYPHS": "\n".join(
            f'                  <g class="glyph"><path d="{d}" /></g>' for _, d in GLYPHS),
        "ORBIT_ORIGIN": f"{f(CX)} {f(CY)}",
        "PIN_ORIGIN": f"{f(tip[0])} {f(tip[1])}",
    }
    for k, (x, y, r) in DOTS.items():
        tokens[f"{k}_CX"], tokens[f"{k}_CY"], tokens[f"{k}_R"] = f(x), f(y), f(r)
        tokens[f"{k}_ANGLE"] = f(angle_of(x, y))
    # The right-hand dot pops as the inner ring's pen passes it (power3.inOut), the small
    # one as the left outer arc's pen does (power2.inOut); the big dot lands as the ring closes.
    T = dict(TIMES)
    right_frac = ((angle_of(*DOTS["dotRight"][:2]) - big_angle) % 360) / 360
    small_frac = (-90 - (angle_of(*DOTS["dotSmall"][:2]) - 360)) / (-90 - (OUTER_GAP[1] - 360))
    T["T_RIGHT_DOT"] = T["T_COMET"] + T["COMET_DUR"] * inv_power_inout(right_frac, 4) - 0.03
    T["T_SMALL_DOT"] = T["T_OUTER"] + T["OUTER_DUR"] * inv_power_inout(small_frac, 3) - 0.03
    T["T_LAND"] = T["T_COMET"] + T["COMET_DUR"]
    T["T_SHEEN_SFX"] = T["T_SHEEN"] + 0.1
    tokens.update({k: f(v) for k, v in T.items()})

    for src, out in (("src/index.html", "index.html"), ("src/logo.html", "compositions/logo.html")):
        html = (ROOT / src).read_text()
        for k, v in tokens.items():
            html = html.replace("{{" + k + "}}", v)
        assert "{{" not in html, (src, html[html.index("{{"):html.index("{{") + 40])
        (ROOT / out).write_text(html)
    (ROOT / "assets/logo/pozpad.svg").write_text(static_svg())
    print("wrote index.html, compositions/logo.html and assets/logo/pozpad.svg")


if __name__ == "__main__":
    main()
