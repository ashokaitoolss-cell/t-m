"""Builds videos/kling-4/storyboard.html: drawn 21:9 frames, overhead plans, shot list."""
import html
import os
import math
import random

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "storyboard.html")
W, H = 840, 360  # 21:9

# ---------------------------------------------------------------- frame palette (fixed: these are pictures)
NIGHT0, NIGHT1, NIGHT2 = "#070b10", "#0d141c", "#16202b"
FACADE = "#1b2531"
COLD = "#cfe0f0"
AMBER, AMBER_D = "#f2a64a", "#b8691f"
SIL = "#05080b"
NAVY = "#1c2940"
SKIN, SKIN_D = "#cf946a", "#6b4128"
MARK = "#ffffff"
CAM = "#ffb347"


def f(v):
    return f"{v:.1f}".rstrip("0").rstrip(".")


def defs_common(p):
    return f"""
    <marker id="{p}-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,1 L9,5 L0,9 z" fill="{MARK}"/></marker>
    <radialGradient id="{p}-vig" cx="50%" cy="50%" r="75%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".75"/></radialGradient>
    <filter id="{p}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="{p}-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="4"/></filter>
    """


def rain(n, box, seed, op, color=COLD, length=16, slant=-4, width=1.1):
    rnd = random.Random(seed)
    x0, y0, x1, y1 = box
    out = []
    for _ in range(n):
        x = rnd.uniform(x0, x1)
        y = rnd.uniform(y0, y1)
        l = length * rnd.uniform(0.6, 1.3)
        out.append(f'<line x1="{f(x)}" y1="{f(y)}" x2="{f(x + slant)}" y2="{f(y + l)}"/>')
    return f'<g stroke="{color}" stroke-width="{width}" stroke-opacity="{op}" stroke-linecap="round">{"".join(out)}</g>'


def dust(n, tri, seed, color="#fff3dc"):
    rnd = random.Random(seed)
    (ax, ay), (bx, by), (cx, cy) = tri
    out = []
    for _ in range(n):
        r1, r2 = rnd.random(), rnd.random()
        if r1 + r2 > 1:
            r1, r2 = 1 - r1, 1 - r2
        x = ax + r1 * (bx - ax) + r2 * (cx - ax)
        y = ay + r1 * (by - ay) + r2 * (cy - ay)
        out.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(rnd.uniform(.6, 1.8))}" fill-opacity="{f(rnd.uniform(.25, .9))}"/>')
    return f'<g fill="{color}">{"".join(out)}</g>'


def arrow(d, label=None, lx=0, ly=0, p="x", anchor="start", dashed=False):
    dash = ' stroke-dasharray="6 5"' if dashed else ""
    s = f'<path d="{d}" fill="none" stroke="{MARK}" stroke-width="2.2" stroke-linecap="round"{dash} marker-end="url(#{p}-ah)"/>'
    if label:
        s += note(label, lx, ly, anchor)
    return s


def eyeline(d):
    return f'<path d="{d}" fill="none" stroke="{MARK}" stroke-width="1.6" stroke-dasharray="1.5 5" stroke-linecap="round" opacity=".9"/>'


def note(text, x, y, anchor="start", color=MARK, size=13):
    t = html.escape(text)
    return (f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-family="Courier Prime, Courier New, monospace" '
            f'font-size="{size}" font-weight="700" fill="{color}" paint-order="stroke" stroke="#000" '
            f'stroke-width="3.5" stroke-opacity=".75">{t}</text>')


def camtag(text="HANDHELD · HOLDS"):
    return note(text, 16, H - 16, color=CAM, size=12)


def adult(cx, feet, h, fill=SIL, stoop=0.0, arms=""):
    r = h * 0.068
    top = feet - h
    hx = cx + stoop * h
    ys = top + 2.15 * r
    t = h * 0.135
    return f"""<g fill="{fill}">
      <circle cx="{f(hx)}" cy="{f(top + r)}" r="{f(r)}"/>
      <path d="M{f(cx - t)},{f(ys)} Q{f(cx)},{f(ys - r * .5)} {f(cx + t)},{f(ys)} L{f(cx + t * .8)},{f(ys + h * .38)} L{f(cx - t * .8)},{f(ys + h * .38)} Z"/>
      <path d="M{f(cx - t * .75)},{f(ys + h * .36)} L{f(cx - t * .1)},{f(ys + h * .36)} L{f(cx - t * .15)},{f(feet)} L{f(cx - t * .7)},{f(feet)} Z"/>
      <path d="M{f(cx + t * .1)},{f(ys + h * .36)} L{f(cx + t * .75)},{f(ys + h * .36)} L{f(cx + t * .7)},{f(feet)} L{f(cx + t * .15)},{f(feet)} Z"/>
      {arms}</g>"""


def limb(x1, y1, x2, y2, w, color=SIL):
    return f'<line x1="{f(x1)}" y1="{f(y1)}" x2="{f(x2)}" y2="{f(y2)}" stroke="{color}" stroke-width="{f(w)}" stroke-linecap="round"/>'


def frame(p, body):
    return (f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid slice">'
            f'<defs>{defs_common(p)}</defs>{body}'
            f'<rect width="{W}" height="{H}" fill="url(#{p}-vig)"/></svg>')


# ---------------------------------------------------------------- FRAMES

def street(p, lit, figure):
    rnd = random.Random(3)
    sky = f'<linearGradient id="{p}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{NIGHT0}"/><stop offset="1" stop-color="{NIGHT2}"/></linearGradient>'
    cone = (f'<linearGradient id="{p}-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{COLD}" stop-opacity=".34"/>'
            f'<stop offset="1" stop-color="{COLD}" stop-opacity=".03"/></linearGradient>')
    warm = (f'<linearGradient id="{p}-warm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{AMBER}" stop-opacity=".42"/>'
            f'<stop offset="1" stop-color="{AMBER}" stop-opacity=".04"/></linearGradient>')
    board = (f'<linearGradient id="{p}-board" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbe3b4"/>'
             f'<stop offset="1" stop-color="#e9b766"/></linearGradient>')
    s = [f"<defs>{sky}{cone}{warm}{board}</defs>",
         f'<rect width="{W}" height="{H}" fill="url(#{p}-sky)"/>']
    # roofline of dark buildings, left
    x = 0
    while x < 360:
        w = rnd.uniform(60, 110)
        top = rnd.uniform(60, 130)
        s.append(f'<rect x="{f(x)}" y="{f(top)}" width="{f(w + 1)}" height="{f(300 - top)}" fill="#0b1118"/>')
        x += w
    # cinema facade
    s.append(f'<rect x="360" y="34" width="480" height="266" fill="{FACADE}"/>')
    s.append(f'<rect x="360" y="34" width="480" height="10" fill="#222e3c"/>')
    for yy in (64, 94):
        s.append(f'<line x1="360" y1="{yy}" x2="840" y2="{yy}" stroke="#141c26" stroke-width="2"/>')
    # front doors under marquee
    s.append('<rect x="530" y="206" width="136" height="94" fill="#0b1017"/>')
    for xx in (564, 598, 632):
        s.append(f'<line x1="{xx}" y1="206" x2="{xx}" y2="300" stroke="#1e2833" stroke-width="3"/>')
    # side door, far right
    s.append('<rect x="792" y="212" width="34" height="88" fill="#0c1219" stroke="#27323f" stroke-width="2"/>')
    # marquee
    if lit:
        s.append(f'<path d="M396,182 L794,182 L870,300 L320,300 Z" fill="url(#{p}-warm)"/>')
        s.append(f'<rect x="410" y="118" width="370" height="58" fill="url(#{p}-board)"/>')
        s.append('<rect x="404" y="176" width="382" height="7" fill="#3a2a17"/>')
        s.append('<text x="595" y="150" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" '
                 'font-weight="800" font-size="31" letter-spacing="3" fill="#18110a">KLING 4.0</text>')
        s.append('<text x="595" y="170" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" '
                 'font-weight="700" font-size="15" letter-spacing="4.5" fill="#2a1d0f">NOW SHOWING</text>')
    else:
        s.append('<rect x="410" y="118" width="370" height="58" fill="#121922"/>')
        s.append('<rect x="404" y="176" width="382" height="7" fill="#0b1016"/>')
    bulbs = []
    for i in range(32):
        bx = 414 + i * 11.8
        for by in (114, 186):
            if lit:
                bulbs.append(f'<circle cx="{f(bx)}" cy="{by}" r="6" fill="{AMBER}" opacity=".35" filter="url(#{p}-glow)"/>')
                bulbs.append(f'<circle cx="{f(bx)}" cy="{by}" r="2.6" fill="#ffe0a8"/>')
            else:
                bulbs.append(f'<circle cx="{f(bx)}" cy="{by}" r="2.6" fill="#28313b"/>')
    s.append("".join(bulbs))
    # street lamp (cold)
    s.append(f'<path d="M168,74 L196,74 L310,300 L40,300 Z" fill="url(#{p}-cone)"/>')
    s.append('<rect x="146" y="64" width="5" height="236" fill="#080c11"/>')
    s.append('<path d="M149,66 Q160,54 182,62" stroke="#080c11" stroke-width="4" fill="none"/>')
    s.append(f'<ellipse cx="182" cy="70" rx="13" ry="5" fill="{COLD}"/>')
    s.append(f'<ellipse cx="182" cy="70" rx="30" ry="14" fill="{COLD}" opacity=".28" filter="url(#{p}-glow)"/>')
    # ground
    s.append(f'<rect x="0" y="300" width="{W}" height="60" fill="#0c131b"/>')
    s.append(f'<ellipse cx="175" cy="314" rx="140" ry="16" fill="{COLD}" opacity=".13"/>')
    streaks = []
    for i in range(9):
        y = 306 + i * 6
        streaks.append(f'<line x1="{120 + i * 7}" y1="{y}" x2="{230 - i * 5}" y2="{y}" stroke="{COLD}" stroke-opacity=".16" stroke-width="1.4"/>')
        if lit:
            streaks.append(f'<line x1="{470 + i * 9}" y1="{y}" x2="{720 - i * 9}" y2="{y}" stroke="{AMBER}" stroke-opacity=".22" stroke-width="1.6"/>')
    s.append("".join(streaks))
    # rain everywhere, stronger in the cone (and under the lit marquee)
    s.append(rain(170, (0, 20, W, 330), 1, .10))
    s.append(f'<clipPath id="{p}-cc"><path d="M168,74 L196,74 L310,300 L40,300 Z"/></clipPath>')
    s.append(f'<g clip-path="url(#{p}-cc)">{rain(110, (40, 74, 310, 300), 2, .5)}</g>')
    if lit:
        s.append(f'<clipPath id="{p}-wc"><path d="M396,182 L794,182 L870,300 L320,300 Z"/></clipPath>')
        s.append(f'<g clip-path="url(#{p}-wc)">{rain(120, (320, 182, 870, 300), 5, .45, color="#ffd08a")}</g>')
    # foreground awning (operator stands under it)
    scal = "".join(f"Q{f(x + 15)},30 {f(x + 30)},16 " for x in range(0, W, 30))
    s.append(f'<path d="M0,0 L{W},0 L{W},16 L0,16 Z M0,16 {scal} L{W},16 Z" fill="#04070a"/>')
    s.append(rain(22, (0, 16, W, 40), 9, .55, length=9, slant=0, width=1.6))
    if figure:
        # small running figure, coat held over head, in the lamp pool
        fx, feet = 290, 300
        s.append(f"""<g fill="{SIL}">
          <path d="M{fx - 20},{feet - 42} Q{fx},{feet - 66} {fx + 24},{feet - 44} L{fx + 16},{feet - 36} Q{fx},{feet - 50} {fx - 14},{feet - 34} Z" fill="{NAVY}"/>
          <circle cx="{fx + 2}" cy="{feet - 36}" r="5"/>
          <path d="M{fx - 8},{feet - 32} L{fx + 11},{feet - 32} L{fx + 8},{feet - 14} L{fx - 5},{feet - 14} Z"/>
          {limb(fx - 2, feet - 15, fx - 13, feet - 1, 5)}{limb(fx + 4, feet - 15, fx + 15, feet - 4, 5)}
          {limb(fx - 6, feet - 30, fx - 14, feet - 41, 3.5)}{limb(fx + 9, feet - 30, fx + 16, feet - 40, 3.5)}</g>""")
        s.append(arrow(f"M{fx + 30},{feet - 58} C 520,232 700,236 784,246", "runs L→R to the side door", 440, 226, p))
    else:
        s.append(note("SAME SETUP AS 1.1", 824, 44, "end", color=CAM, size=12))
    s.append(camtag("HANDHELD · UNDER THE AWNING · HOLDS"))
    return frame(p, "".join(s))


def side_door(p):
    g = (f'<linearGradient id="{p}-in" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6c47a"/>'
         f'<stop offset="1" stop-color="#b8641f"/></linearGradient>'
         f'<linearGradient id="{p}-spill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{AMBER}" stop-opacity=".55"/>'
         f'<stop offset="1" stop-color="{AMBER}" stop-opacity=".05"/></linearGradient>'
         f'<pattern id="{p}-brick" width="44" height="22" patternUnits="userSpaceOnUse">'
         f'<path d="M0,0.5 H44 M0,11.5 H44 M22,0 V11 M0,11 V22 M44,11 V22" stroke="#0b1016" stroke-width="1.2"/></pattern>')
    s = [f"<defs>{g}</defs>", f'<rect width="{W}" height="{H}" fill="#121a24"/>',
         f'<rect width="{W}" height="{H}" fill="url(#{p}-brick)"/>',
         '<rect x="462" y="22" width="146" height="312" fill="#0a0f15"/>',
         f'<rect x="472" y="30" width="126" height="304" fill="url(#{p}-in)"/>',
         # stairwell hint inside
         '<path d="M520,334 L598,270 L598,334 Z" fill="#8a4b19" opacity=".55"/>',
         # door leaf swung inward, right side
         '<path d="M572,30 L598,30 L598,334 L572,322 Z" fill="#3b2715"/>',
         f'<path d="M340,360 L472,334 L598,334 L780,360 Z" fill="url(#{p}-spill)"/>',
         '<rect x="0" y="334" width="840" height="26" fill="#0b1118" opacity=".55"/>']
    # grandpa in the doorway, backlit, arm across to the left jamb
    arms = limb(514, 118, 474, 164, 14) + limb(556, 120, 574, 206, 13)
    s.append(adult(535, 334, 282, SIL, stoop=-0.02, arms=arms))
    s.append('<path d="M510,76 Q535,52 560,76" stroke="#ffcf8a" stroke-width="2.5" fill="none" opacity=".7"/>')
    # girl ducking in from the left, under his arm
    s.append(f"""<g fill="{SIL}"><circle cx="436" cy="226" r="15"/>
      <path d="M412,238 Q430,230 458,236 L462,290 L416,292 Z" fill="{NAVY}"/>
      {limb(422, 290, 410, 334, 11)}{limb(450, 290, 462, 334, 11)}</g>""")
    s.append(rain(140, (0, 0, 462, 334), 4, .22))
    s.append(rain(80, (608, 0, W, 334), 6, .22))
    s.append(rain(40, (420, 300, 660, 360), 7, .35, color="#ffd08a"))
    s.append(arrow("M330,262 C370,258 400,252 470,250", "ducks under his arm", 250, 236, p))
    s.append(arrow("M572,58 C556,36 526,36 506,52", "looks up the street", 470, 30, p, anchor="end"))
    s.append(note("door shuts: the spill narrows to a line", 824, 352, "end", size=12))
    s.append(camtag("HANDHELD · LOW, 30° OFF THE DOOR · HOLDS"))
    return frame(p, "".join(s))


def stairs(p):
    g = (f'<radialGradient id="{p}-key" cx="85%" cy="-10%" r="95%"><stop offset="0" stop-color="{AMBER}" stop-opacity=".55"/>'
         f'<stop offset="1" stop-color="{AMBER}" stop-opacity="0"/></radialGradient>')
    s = [f"<defs>{g}</defs>", f'<rect width="{W}" height="{H}" fill="#0c0f13"/>',
         f'<rect width="{W}" height="{H}" fill="url(#{p}-key)"/>']
    for i in range(6):
        x = -60 + i * 160
        y = 330 - i * 62
        s.append(f'<rect x="{x}" y="{y}" width="176" height="14" fill="#2a2724"/>')
        s.append(f'<line x1="{x}" y1="{y}" x2="{x + 176}" y2="{y}" stroke="#c58a47" stroke-width="2.4" opacity=".85"/>')
        s.append(f'<rect x="{x + 162}" y="{y - 62}" width="14" height="62" fill="#1a1816"/>')
        s.append("".join(f'<circle cx="{x + 10 + k * 14}" cy="{y + 7}" r="1.3" fill="#4a423a"/>' for k in range(12)))
    # her boots on tread 3 (top at y=144) and lifting to tread 4
    s.append(f"""<g fill="#0e1622" stroke="#3d5573" stroke-width="1.5">
      <path d="M470,144 L470,84 L500,84 L502,128 L534,132 Q540,144 530,144 Z"/>
      <path d="M548,70 L552,14 L582,16 L580,58 L612,66 Q616,78 604,78 L552,80 Z"/></g>""")
    s.append(f'<path d="M430,0 L650,0 L660,26 Q560,40 420,24 Z" fill="{NAVY}"/>')
    s.append("".join(f'<ellipse cx="{x}" cy="{y}" rx="2" ry="4" fill="{COLD}" opacity=".85"/>'
                     for x, y in ((470, 44), (512, 62), (556, 38), (598, 50), (490, 104), (630, 64))))
    # his heavier shoes entering bottom left, trouser cuffs
    s.append("""<g fill="#050607" stroke="#5a4634" stroke-width="1.5">
      <path d="M120,330 L124,262 L170,262 L176,312 L232,318 Q244,330 226,330 Z"/></g>
      <rect x="116" y="200" width="60" height="66" fill="#1d1f24"/>""")
    s.append(arrow("M620,150 L760,40", "two at a time", 668, 132, p))
    s.append(arrow("M60,300 L110,266", "his steps follow", 20, 250, p))
    s.append(camtag("HANDHELD · LOW, SIDE-ON TO THE FLIGHT · HOLDS"))
    return frame(p, "".join(s))


def booth_wide(p):
    g = (f'<radialGradient id="{p}-lamp" cx="77%" cy="22%" r="70%"><stop offset="0" stop-color="{AMBER}" stop-opacity=".62"/>'
         f'<stop offset=".55" stop-color="{AMBER_D}" stop-opacity=".16"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'
         f'<pattern id="{p}-brick" width="40" height="20" patternUnits="userSpaceOnUse">'
         f'<path d="M0,0.5 H40 M0,10.5 H40 M20,0 V10 M0,10 V20 M40,10 V20" stroke="#050404" stroke-width="1.2" opacity=".7"/></pattern>')
    s = [f"<defs>{g}</defs>", f'<rect width="{W}" height="{H}" fill="#120e0b"/>',
         f'<rect width="{W}" height="{H}" fill="url(#{p}-brick)"/>',
         f'<rect width="{W}" height="{H}" fill="url(#{p}-lamp)"/>',
         '<path d="M0,0 L840,0 L840,34 L0,52 Z" fill="#070605"/>',
         '<rect x="0" y="330" width="840" height="30" fill="#0a0807"/>',
         '<rect x="486" y="118" width="30" height="24" fill="#020202" stroke="#2c241c" stroke-width="3"/>']
    # shelves and cans
    for sy in (104, 170, 236):
        s.append(f'<rect x="26" y="{sy}" width="256" height="7" fill="#3b2b1d"/>')
        for k in range(5):
            cx = 36 + k * 49
            for st in range(2):
                y = sy - 13 - st * 13
                col = ["#4b4540", "#57493b", "#443d37", "#5b4b3a"][(k + st + sy) % 4]
                s.append(f'<rect x="{cx}" y="{y}" width="42" height="12" rx="3" fill="{col}" stroke="#2a221b"/>')
    s.append('<rect x="183" y="144" width="42" height="12" rx="3" fill="#d4dbe1" stroke="#ffffff" stroke-opacity=".6"/>')
    s.append('<rect x="183" y="144" width="42" height="12" rx="3" fill="#fff" opacity=".35" filter="url(#%s-glow)"/>' % p)
    s.append(note("NEW CAN · label turned away", 180, 196, "middle", size=12))
    # projector
    s.append("""<g stroke="#6e5436" stroke-width="3" fill="none">
      <circle cx="500" cy="92" r="56"/><circle cx="500" cy="92" r="10"/>
      <line x1="500" y1="36" x2="500" y2="148"/><line x1="444" y1="92" x2="556" y2="92"/></g>
      <rect x="474" y="148" width="62" height="172" fill="#1c1916" stroke="#7a5c3a" stroke-width="2"/>
      <rect x="536" y="170" width="74" height="60" fill="#221c17" stroke="#7a5c3a" stroke-width="2"/>
      <g stroke="#3a2f25" stroke-width="3">""" + "".join(f'<line x1="{548 + k * 12}" y1="180" x2="{548 + k * 12}" y2="220"/>' for k in range(5)) + """</g>
      <rect x="456" y="318" width="100" height="14" fill="#15120f"/>""")
    # caged lamp
    s.append(f'<circle cx="650" cy="74" r="26" fill="{AMBER}" opacity=".55" filter="url(#{p}-glow)"/>'
             '<circle cx="650" cy="74" r="9" fill="#fff0cf"/>'
             '<g stroke="#2a1d10" stroke-width="2" fill="none"><circle cx="650" cy="74" r="15"/>'
             '<line x1="636" y1="68" x2="664" y2="68"/><line x1="636" y1="80" x2="664" y2="80"/><line x1="650" y1="40" x2="650" y2="59"/></g>')
    # crate and girl climbing
    s.append('<rect x="300" y="284" width="84" height="46" fill="#4a3725" stroke="#2a1f14" stroke-width="2"/>'
             '<line x1="300" y1="300" x2="384" y2="300" stroke="#2a1f14" stroke-width="2"/>'
             '<line x1="300" y1="315" x2="384" y2="315" stroke="#2a1f14" stroke-width="2"/>')
    s.append(f"""<g fill="{SIL}"><circle cx="346" cy="204" r="14"/>
      <path d="M326,218 Q346,210 366,218 L364,262 L330,262 Z" fill="{NAVY}"/>
      {limb(336, 262, 332, 284, 10)}{limb(356, 262, 380, 272, 10)}{limb(380, 272, 384, 300, 9)}
      {limb(330, 226, 312, 262, 7)}{limb(362, 226, 372, 256, 7)}</g>""")
    # grandpa hanging the coat on a nail, right
    arms = limb(718, 132, 764, 116, 13) + limb(704, 138, 700, 210, 12)
    s.append(adult(708, 330, 244, "#0b0908", stoop=0.03, arms=arms))
    s.append(f'<path d="M760,112 L790,116 L800,204 L754,206 Z" fill="{NAVY}"/><circle cx="770" cy="110" r="3" fill="#8a6a44"/>')
    s.append("".join(f'<ellipse cx="{x}" cy="{y}" rx="1.8" ry="3.6" fill="{COLD}" opacity=".8"/>' for x, y in ((766, 222), (784, 236), (774, 262))))
    s.append(arrow("M258,300 C270,268 290,244 312,232", "climbs onto a crate", 232, 330, p, anchor="middle"))
    s.append(camtag("HANDHELD · FROM THE DOOR CORNER · HOLDS"))
    return frame(p, "".join(s))


def mech(p, hands):
    """Matched insert: sprocket + gate, film path. hands = 'his' | 'hers'."""
    g = (f'<radialGradient id="{p}-key" cx="95%" cy="10%" r="95%"><stop offset="0" stop-color="{AMBER}" stop-opacity=".5"/>'
         f'<stop offset="1" stop-color="{AMBER}" stop-opacity="0"/></radialGradient>'
         f'<radialGradient id="{p}-gate" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6dd"/>'
         f'<stop offset="1" stop-color="#fff6dd" stop-opacity="0"/></radialGradient>')
    s = [f"<defs>{g}</defs>", f'<rect width="{W}" height="{H}" fill="#0b0908"/>',
         f'<rect width="{W}" height="{H}" fill="url(#{p}-key)"/>',
         '<rect x="470" y="0" width="80" height="360" fill="#221d18" stroke="#6b5236" stroke-width="2"/>',
         f'<ellipse cx="510" cy="186" rx="60" ry="40" fill="url(#{p}-gate)" opacity=".8"/>',
         '<rect x="494" y="170" width="32" height="30" fill="#fff4d6"/>']
    teeth = "".join(
        f'<rect x="-4" y="-78" width="8" height="12" fill="#8a6a44" transform="translate(330 190) rotate({k * 15})"/>' for k in range(24))
    s.append(f'<circle cx="330" cy="190" r="68" fill="#3a3129" stroke="#9a7a50" stroke-width="3"/>{teeth}'
             '<circle cx="330" cy="190" r="18" fill="#1c1814" stroke="#9a7a50" stroke-width="2"/>')
    film = "M510,-20 L510,238 C510,290 450,300 400,292 C340,282 250,262 256,196 C262,130 250,40 214,-20"
    s.append(f'<path d="{film}" fill="none" stroke="#3b2715" stroke-width="30" stroke-linecap="butt" opacity=".96"/>')
    s.append(f'<path d="{film}" fill="none" stroke="#b48a58" stroke-width="4" stroke-dasharray="5 9" opacity=".8"/>')
    if hands == "his":
        s.append(f"""<g fill="{SKIN}" stroke="{SKIN_D}" stroke-width="2">
          <path d="M840,70 L600,112 Q566,120 548,142 L566,156 Q590,146 640,150 L840,170 Z"/>
          <rect x="520" y="126" width="84" height="26" rx="13" transform="rotate(-8 562 139)"/>
          <rect x="530" y="150" width="78" height="24" rx="12" transform="rotate(-4 569 162)"/>
          <path d="M840,240 L520,262 Q470,268 452,290 L470,310 Q520,300 560,304 L840,318 Z"/>
          <rect x="424" y="276" width="86" height="26" rx="13" transform="rotate(8 467 289)"/></g>
          <g stroke="#f0cfae" stroke-width="2" stroke-linecap="round" opacity=".9">
          <line x1="534" y1="132" x2="544" y2="128"/><line x1="540" y1="160" x2="552" y2="158"/><line x1="436" y1="284" x2="446" y2="288"/></g>""")
        s.append(note("big, scarred hands enter from frame RIGHT (his side)", 824, 346, "end", size=12))
        s.append(camtag("HANDHELD · 0.5 m · HOLDS"))
    else:
        s.append(f"""<g fill="#dba77c" stroke="{SKIN_D}" stroke-width="1.6">
          <path d="M0,238 L220,268 Q262,274 276,290 L262,302 Q236,296 200,298 L0,300 Z"/>
          <rect x="248" y="276" width="56" height="16" rx="8" transform="rotate(-10 276 284)"/>
          <rect x="250" y="292" width="50" height="15" rx="7.5" transform="rotate(-4 275 300)"/></g>""")
        s.append(arrow("M300,248 C318,226 330,220 348,226", "slips once", 290, 214, p, anchor="middle"))
        s.append(arrow("M368,236 C372,252 366,262 354,266", "re-seats · click", 380, 260, p))
        s.append(note("small hands enter from frame LEFT (her side)", 824, 346, "end", size=12))
        s.append(camtag("HANDHELD · 0.5 m · FOCUS HUNTS ONCE AS THE FILM SLIPS"))
    s.append(arrow("M488,30 L488,120", None, 0, 0, p))
    s.append(note("film path", 482, 24, "end", size=12))
    return frame(p, "".join(s))


def face(cx, cy, rx, ry, p, gid, turn=1):
    """Stylised lit face: warm key from the right (turn=1) or left (-1)."""
    x1, x2 = ("0", "1") if turn == 1 else ("1", "0")
    g = (f'<linearGradient id="{p}-{gid}" x1="{x1}" y1="0" x2="{x2}" y2="0"><stop offset="0" stop-color="#1a110b"/>'
         f'<stop offset=".55" stop-color="{SKIN_D}"/><stop offset="1" stop-color="{SKIN}"/></linearGradient>')
    return g, f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="url(#{p}-{gid})"/>'


def two_shot(p):
    lamp = (f'<radialGradient id="{p}-lamp" cx="100%" cy="0%" r="90%"><stop offset="0" stop-color="{AMBER}" stop-opacity=".45"/>'
            f'<stop offset="1" stop-color="{AMBER}" stop-opacity="0"/></radialGradient>')
    g1, her = face(272, 150, 34, 40, p, "fh")
    g2, him = face(574, 112, 44, 54, p, "fm")
    s = [f"<defs>{lamp}{g1}{g2}</defs>", f'<rect width="{W}" height="{H}" fill="#0c0907"/>',
         f'<rect width="{W}" height="{H}" fill="url(#{p}-lamp)"/>',
         '<g stroke="#4f3d2a" stroke-width="4" fill="none"><circle cx="420" cy="18" r="92"/><circle cx="420" cy="18" r="16"/></g>',
         # her: jumper, dark hair
         f'<path d="M178,360 Q186,214 272,204 Q360,214 368,360 Z" fill="{NAVY}"/>',
         her, '<path d="M236,142 Q238,96 276,98 Q312,100 308,140 Q296,118 272,118 Q250,120 236,142 Z" fill="#0a0806"/>',
         # him: cardigan, grey hair, glasses on a cord
         '<path d="M452,360 Q462,176 574,166 Q690,176 712,360 Z" fill="#23262b"/>',
         him, '<path d="M530,96 Q540,50 580,52 Q622,56 620,98 Q604,70 578,72 Q552,74 530,96 Z" fill="#8e8f91"/>',
         '<g stroke="#b9a58a" stroke-width="1.6" fill="none"><path d="M548,168 Q574,236 606,168"/>'
         '<rect x="558" y="214" width="16" height="10" rx="4"/><rect x="578" y="214" width="16" height="10" rx="4"/></g>',
         '<g fill="#3a3432">' + "".join(f'<circle cx="{560 + (k % 7) * 5}" cy="{134 + (k // 7) * 5}" r="1.1"/>' for k in range(21)) + "</g>",
         # film from the projector to his hand, loose end toward her
         '<path d="M438,0 C440,120 430,210 404,244 L360,256" fill="none" stroke="#3b2715" stroke-width="18"/>',
         '<path d="M438,0 C440,120 430,210 404,244 L360,256" fill="none" stroke="#b48a58" stroke-width="3" stroke-dasharray="4 7"/>',
         f'<path d="M470,300 Q430,262 404,248" stroke="{SKIN}" stroke-width="26" stroke-linecap="round" fill="none"/>']
    s.append(eyeline("M556,106 C480,110 360,124 300,140"))
    s.append(eyeline("M282,148 C310,196 340,230 360,250"))
    s.append(note("“Your turn.”", 824, 40, "end", size=16))
    s.append(note("she's frame LEFT, he's frame RIGHT (holds for all of Sc 2)", 824, 346, "end", size=12))
    s.append(camtag("HANDHELD · HER EYE LEVEL · HOLDS"))
    return frame(p, "".join(s))


def him_close(p):
    lamp = (f'<radialGradient id="{p}-lamp" cx="100%" cy="10%" r="85%"><stop offset="0" stop-color="{AMBER}" stop-opacity=".4"/>'
            f'<stop offset="1" stop-color="{AMBER}" stop-opacity="0"/></radialGradient>')
    g, fc = face(600, 158, 104, 132, p, "fc")
    s = [f"<defs>{lamp}{g}</defs>", f'<rect width="{W}" height="{H}" fill="#0b0806"/>',
         f'<rect width="{W}" height="{H}" fill="url(#{p}-lamp)"/>',
         '<path d="M420,360 Q450,262 600,250 Q760,262 800,360 Z" fill="#23262b"/>', fc,
         '<path d="M500,90 Q512,8 602,10 Q700,14 706,96 Q680,40 602,42 Q530,46 500,90 Z" fill="#8e8f91"/>',
         '<path d="M520,118 Q560,98 596,112" stroke="#1a120c" stroke-width="7" fill="none"/>',
         '<path d="M530,138 Q552,146 574,138 Q552,132 530,138 Z" fill="#0a0604"/>',
         '<path d="M612,120 Q640,176 618,196" stroke="#4a2c19" stroke-width="3" fill="none"/>',
         '<path d="M560,226 Q598,238 634,224" stroke="#3a2012" stroke-width="3" fill="none"/>',
         '<g fill="#3a3432">' + "".join(f'<circle cx="{540 + (k % 12) * 9}" cy="{206 + (k // 12) * 9}" r="1.5"/>' for k in range(48)) + "</g>",
         '<g stroke="#b9a58a" stroke-width="1.8" fill="none"><path d="M520,250 Q600,330 700,250"/></g>',
         # his hand, foreground, thumb over fingertips
         f'<g fill="{SKIN}" stroke="{SKIN_D}" stroke-width="2" opacity=".85"><rect x="300" y="300" width="150" height="80" rx="30"/>'
         '<rect x="286" y="292" width="70" height="26" rx="13"/></g>']
    s.append(arrow("M330,284 C350,262 380,262 398,280", "thumb rubs his fingertips", 190, 262, p))
    s.append(eyeline("M540,140 C420,170 250,240 120,340"))
    s.append(note("eyeline: down, frame LEFT → her hands (2.4)", 16, 30, size=12))
    s.append(camtag("HANDHELD · FROM HER SIDE, 3/4 · HOLDS"))
    return frame(p, "".join(s))


def switch(p):
    lamp = (f'<radialGradient id="{p}-lamp" cx="85%" cy="0%" r="95%"><stop offset="0" stop-color="{AMBER}" stop-opacity=".38"/>'
            f'<stop offset="1" stop-color="{AMBER}" stop-opacity="0"/></radialGradient>'
            f'<radialGradient id="{p}-knob" cx="35%" cy="30%" r="70%"><stop offset="0" stop-color="#3a3632"/>'
            f'<stop offset="1" stop-color="#050505"/></radialGradient>')
    s = [f"<defs>{lamp}</defs>", f'<rect width="{W}" height="{H}" fill="#0b0907"/>',
         f'<rect width="{W}" height="{H}" fill="url(#{p}-lamp)"/>',
         # him, out of focus, frame right
         f'<g filter="url(#{p}-soft)" opacity=".85"><path d="M560,360 Q572,212 660,200 Q752,212 770,360 Z" fill="#2a2c30"/>'
         f'<ellipse cx="662" cy="150" rx="46" ry="56" fill="{SKIN_D}"/><ellipse cx="682" cy="146" rx="26" ry="44" fill="{SKIN}" opacity=".6"/></g>',
         '<rect x="132" y="78" width="250" height="236" rx="6" fill="#2d2925" stroke="#4a4138" stroke-width="2"/>',
         "".join(f'<circle cx="{x}" cy="{y}" r="5" fill="#57504a"/>' for x, y in ((150, 96), (364, 96), (150, 296), (364, 296))),
         f'<circle cx="258" cy="198" r="70" fill="url(#{p}-knob)" stroke="#6a5a48" stroke-width="2"/>',
         '<path d="M214,150 A64,64 0 0 1 300,146" stroke="#6b5a47" stroke-width="7" fill="none" opacity=".75"/>',
         '<rect x="250" y="134" width="16" height="128" rx="7" fill="#161310" stroke="#5b4c3c" stroke-width="2" transform="rotate(-35 258 198)"/>',
         # her hand, fingertips just above the knob
         f'<g fill="#dba77c" stroke="{SKIN_D}" stroke-width="1.6"><path d="M0,40 L150,84 Q190,96 206,116 L194,128 Q170,118 140,116 L0,100 Z"/>'
         '<rect x="180" y="104" width="52" height="16" rx="8" transform="rotate(28 206 112)"/></g>']
    s.append(arrow("M700,64 C716,84 716,104 700,118", "he nods once (soft focus)", 824, 40, p, anchor="end"))
    s.append(note("hold a beat · then she turns it", 16, 30, size=12))
    s.append(camtag("HANDHELD · FOCUS ON THE SWITCH · HE STAYS SOFT"))
    return frame(p, "".join(s))


def auditorium(p):
    beam = (f'<linearGradient id="{p}-beam" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff1d2" stop-opacity=".55"/>'
            f'<stop offset="1" stop-color="#ffd79a" stop-opacity=".1"/></linearGradient>')
    s = [f"<defs>{beam}</defs>", f'<rect width="{W}" height="{H}" fill="#04060a"/>',
         '<rect x="0" y="0" width="840" height="236" fill="#080b10"/>',
         '<path d="M594,78 L616,92 L0,190 L0,-40 Z" fill="url(#%s-beam)"/>' % p,
         dust(140, ((604, 84), (0, -40), (0, 190)), 11),
         f'<rect x="590" y="72" width="30" height="22" fill="#fff6e0"/><rect x="578" y="62" width="54" height="42" fill="#fff0cc" opacity=".35" filter="url(#{p}-glow)"/>',
         '<rect x="640" y="76" width="22" height="16" fill="#1a150f"/>']
    for i in range(6):
        y = 236 + i * 22 + i * i * 2.2
        w = 26 + i * 12
        hump = "".join(f"a{f(w / 2)},{f(w * .38)} 0 0 1 {f(w)},0 " for _ in range(int(W / w) + 2))
        s.append(f'<path d="M-10,{f(y + w * .4)} {hump} L{W + 10},{H} L-10,{H} Z" fill="#06080c" stroke="#2c261d" stroke-width="1.5"/>')
    s.append(arrow("M560,110 L300,150", "beam → screen (behind camera)", 330, 186, p))
    s.append(note("beam passes above the lens · no flare", 824, 40, "end", size=12))
    s.append(note("no characters: a neutral shot", 824, 60, "end", size=12))
    s.append(camtag("HANDHELD · LOW IN THE SEATS, LOOKING BACK UP · HOLDS"))
    return frame(p, "".join(s))


def port(p):
    flick = (f'<radialGradient id="{p}-fl" cx="50%" cy="100%" r="90%"><stop offset="0" stop-color="#ffe9c4" stop-opacity=".5"/>'
             f'<stop offset="1" stop-color="#ffe9c4" stop-opacity="0"/></radialGradient>')
    g1, himf = face(360, 176, 52, 64, p, "pm", turn=-1)
    g2, herf = face(498, 196, 38, 46, p, "ph", turn=-1)
    s = [f"<defs>{flick}{g1}{g2}</defs>", f'<rect width="{W}" height="{H}" fill="#05070a"/>',
         '<rect x="236" y="54" width="380" height="266" fill="#0e0b09" stroke="#1d2126" stroke-width="16"/>',
         f'<rect x="244" y="62" width="364" height="250" fill="url(#{p}-fl)"/>',
         '<path d="M252,312 Q262,238 360,230 Q456,238 470,312 Z" fill="#23262b"/>', himf,
         '<path d="M316,140 Q326,104 362,106 Q400,110 404,140 Q390,122 362,122 Q336,124 316,140 Z" fill="#8e8f91"/>',
         f'<path d="M430,312 Q438,246 498,240 Q560,246 568,312 Z" fill="{NAVY}"/>', herf,
         '<path d="M462,176 Q466,142 500,144 Q532,146 534,176 Q522,160 498,160 Q476,162 462,176 Z" fill="#0a0806"/>',
         '<ellipse cx="498" cy="220" rx="7" ry="4" fill="#1a0c07"/>',
         '<path d="M250,64 L330,64 L256,150 Z" fill="#fff" opacity=".04"/>']
    s.append(eyeline("M374,168 C410,160 450,170 482,186"))
    s.append(eyeline("M504,190 C560,210 640,250 700,300"))
    s.append(note("she stares at the screen", 824, 316, "end", size=12))
    s.append(note("he watches her", 236, 40, size=12))
    s.append(note("LINE CROSSED ON PURPOSE: she's now frame RIGHT", 824, 30, "end", color=CAM, size=12))
    s.append(camtag("HANDHELD · AT THE PORT, OUTSIDE THE GLASS · HOLDS"))
    return frame(p, "".join(s))


def bulb(p):
    g = (f'<radialGradient id="{p}-b" cx="50%" cy="48%" r="50%"><stop offset="0" stop-color="#ffe7b0"/>'
         f'<stop offset=".35" stop-color="{AMBER}" stop-opacity=".85"/><stop offset="1" stop-color="{AMBER_D}" stop-opacity=".15"/></radialGradient>')
    s = [f"<defs>{g}</defs>", f'<rect width="{W}" height="{H}" fill="#070a0e"/>',
         rain(90, (0, 0, W, 300), 21, .18)]
    for k in range(7):
        x = 470 + k * 58
        on = k < 3
        s.append(f'<ellipse cx="{x}" cy="176" rx="16" ry="32" fill="{AMBER if on else "#2a323c"}" opacity="{.45 if on else .5}" filter="url(#{p}-glow)"/>')
    s.append(f'<circle cx="300" cy="176" r="118" fill="{AMBER}" opacity=".22" filter="url(#{p}-soft)"/>')
    s.append(f'<circle cx="300" cy="176" r="84" fill="url(#{p}-b)" stroke="#ffe0a8" stroke-opacity=".5" stroke-width="2"/>')
    s.append(f'<path d="M270,178 l8,-14 l8,14 l8,-14 l8,14 l8,-14 l8,14" stroke="#fffbe8" stroke-width="3.5" fill="none" filter="url(#{p}-glow)"/>')
    s.append('<path d="M270,178 l8,-14 l8,14 l8,-14 l8,14 l8,-14 l8,14" stroke="#fffbe8" stroke-width="2" fill="none"/>')
    s.append('<rect x="262" y="256" width="76" height="46" fill="#2a2f35" stroke="#454c55" stroke-width="2"/>'
             '<rect x="0" y="300" width="840" height="60" fill="#12171d"/>' +
             "".join(f'<circle cx="{30 + k * 60}" cy="330" r="4" fill="#2b323a"/>' for k in range(14)))
    s.append("".join(f'<ellipse cx="{x}" cy="{y}" rx="4" ry="6" fill="#fff" opacity=".45"/>'
                     for x, y in ((262, 140), (330, 120), (318, 214), (250, 200), (352, 170))))
    s.append(note("dark → filament glows → amber", 824, 40, "end", size=12))
    s.append(note("oval bokeh: the rest of the row still waking", 824, 262, "end", size=12))
    s.append(camtag("HANDHELD · UNDER THE MARQUEE EDGE · HOLDS"))
    return frame(p, "".join(s))


def card(p):
    return (f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img"><rect width="{W}" height="{H}" fill="#000"/>'
            '<text x="420" y="188" text-anchor="middle" font-family="Big Shoulders Display, Impact, sans-serif" font-weight="700" '
            'font-size="30" letter-spacing="6" fill="#e9e4da">KLING 4.0</text></svg>')


# ---------------------------------------------------------------- PLANS (theme-aware, drawn with currentColor + tokens)

def cam(x, y, ang, label, lx=None, ly=None, anchor="middle", active=True):
    a = math.radians(ang)
    L, spread = 34, math.radians(22)
    p1 = (x + L * math.cos(a - spread), y + L * math.sin(a - spread))
    p2 = (x + L * math.cos(a + spread), y + L * math.sin(a + spread))
    cls = "cam" if active else "cam ghost"
    if lx is None:
        lx, ly = x - 16 * math.cos(a), y - 16 * math.sin(a) + 4
    return (f'<g class="{cls}"><path d="M{f(x)},{f(y)} L{f(p1[0])},{f(p1[1])} L{f(p2[0])},{f(p2[1])} Z"/>'
            f'<circle cx="{f(x)}" cy="{f(y)}" r="4.5"/><text x="{f(lx)}" y="{f(ly)}" text-anchor="{anchor}">{label}</text></g>')


def person(x, y, ang, label):
    a = math.radians(ang)
    return (f'<g class="who"><circle cx="{x}" cy="{y}" r="9"/>'
            f'<line x1="{x}" y1="{y}" x2="{f(x + 15 * math.cos(a))}" y2="{f(y + 15 * math.sin(a))}"/>'
            f'<text x="{x}" y="{y + 24}" text-anchor="middle">{label}</text></g>')


def plan(body, title):
    return (f'<svg class="plan" viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{html.escape(title)}">'
            f'<defs><marker id="pl-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">'
            f'<path d="M0,1 L9,5 L0,9 z" class="ahfill"/></marker></defs>{body}</svg>')


def plan_street(cams):
    b = ['<rect class="ground" x="0" y="0" width="420" height="300"/>',
         '<rect class="road" x="0" y="130" width="420" height="80"/>',
         '<text class="lbl" x="14" y="148">STREET · WET COBBLES</text>',
         '<rect class="bldg" x="230" y="18" width="176" height="104"/>',
         '<text class="lbl" x="288" y="74" text-anchor="middle">CINEMA</text>',
         '<rect class="mq" x="250" y="118" width="128" height="10"/>',
         '<text class="lbl sm" x="314" y="112" text-anchor="middle">MARQUEE</text>',
         '<rect class="door" x="386" y="116" width="16" height="8"/>',
         '<text class="lbl sm" x="404" y="110" text-anchor="end">SIDE DOOR</text>',
         '<rect class="hatch" x="352" y="30" width="46" height="70"/>',
         '<text class="lbl sm" x="375" y="26" text-anchor="middle">STAIRS</text>',
         '<rect class="bldg" x="20" y="226" width="150" height="60"/>',
         '<rect class="awn" x="24" y="214" width="142" height="10"/>',
         '<text class="lbl sm" x="95" y="280" text-anchor="middle">BAKERY · AWNING</text>',
         '<circle class="lamp" cx="170" cy="124" r="6"/><text class="lbl sm" x="170" y="112" text-anchor="middle">LAMP</text>',
         '<path class="move" d="M20,196 C120,190 250,170 390,128" marker-end="url(#pl-ah)"/>',
         '<text class="lbl sm" x="150" y="206">her path · L→R</text>']
    b += cams
    return "".join(b)


def plan_booth(cams, extra=""):
    b = ['<rect class="ground" x="0" y="0" width="420" height="300"/>',
         '<rect class="room" x="40" y="30" width="340" height="260"/>',
         '<rect class="gap" x="196" y="26" width="22" height="8"/><rect class="gap" x="232" y="26" width="18" height="8"/>',
         '<text class="lbl sm" x="222" y="20" text-anchor="middle">PORTS → AUDITORIUM</text>',
         '<rect class="bldg" x="182" y="56" width="50" height="92"/><text class="lbl sm" x="207" y="106" text-anchor="middle">PROJ.</text>',
         '<rect class="bldg" x="42" y="44" width="16" height="190"/><text class="lbl sm" x="64" y="140">CANS</text>',
         '<circle class="new" cx="50" cy="120" r="4.5"/>',
         '<circle class="lamp" cx="374" cy="100" r="6"/><text class="lbl sm" x="366" y="88" text-anchor="end">LAMP</text>',
         '<text class="lbl sm" x="366" y="210" text-anchor="end">NAIL · COAT</text>',
         '<rect class="gap" x="70" y="286" width="50" height="8"/><text class="lbl sm" x="100" y="280" text-anchor="middle">DOOR</text>',
         '<rect class="crate" x="140" y="176" width="36" height="28"/>',
         '<line class="axis" x1="44" y1="192" x2="376" y2="196"/>',
         '<text class="lbl sm axisl" x="376" y="186" text-anchor="end">180° LINE</text>',
         person(158, 190, 0, "SHE"), person(250, 194, 180, "HE"), extra]
    b += cams
    b.append('<line class="scale" x1="300" y1="274" x2="360" y2="274"/><text class="lbl sm" x="330" y="268" text-anchor="middle">1 m</text>')
    return "".join(b)


def plan_audi(cams):
    rows = "".join(f'<path class="row" d="M{110 - i * 8},{70 + i * 22} Q210,{58 + i * 22} {310 + i * 8},{70 + i * 22}"/>' for i in range(6))
    b = ['<rect class="ground" x="0" y="0" width="420" height="300"/>',
         '<line class="screen" x1="120" y1="16" x2="300" y2="16"/><text class="lbl sm" x="210" y="12" text-anchor="middle">SCREEN</text>',
         '<path class="beam" d="M206,212 L120,16 L300,16 L214,212 Z"/>', rows,
         '<line class="wall" x1="60" y1="212" x2="360" y2="212"/>',
         '<rect class="room" x="130" y="212" width="160" height="80"/>',
         '<text class="lbl sm" x="126" y="290" text-anchor="end">BOOTH</text>',
         '<text class="lbl sm" x="200" y="206" text-anchor="end">PORT</text>',
         '<rect class="bldg" x="196" y="222" width="30" height="24"/>',
         '<line class="axis" x1="112" y1="264" x2="308" y2="268"/>',
         person(170, 262, 270, "SHE"), person(250, 266, 250, "HE")]
    b += cams
    return "".join(b)


# ---------------------------------------------------------------- CONTENT

SCENES = [
    dict(n=1, slug="EXT. CINEMA CORNER / SIDE STAIRS — NIGHT", tone="cold", time="0:00–0:13",
         beat="She arrives. The cinema is dark and the marquee is blank.",
         plan=plan(plan_street([cam(100, 236, -62, "1.1", 84, 250, "end"), cam(318, 186, -48, "1.2", 318, 206), cam(360, 64, 0, "1.3", 375, 92)]), "Scene 1 overhead"),
         notes=["Screen direction is set here: she always moves left to right, toward the cinema.",
                "Both exterior setups stay on the south side of her path, so she never flips direction.",
                "1.1 is the bookend: shot 4.2 repeats it frame for frame."]),
    dict(n=2, slug="INT. PROJECTION BOOTH — NIGHT", tone="warm", time="0:13–0:35",
         beat="He hands it over. She threads the new reel.",
         plan=plan(plan_booth([cam(64, 268, -48, "2.1", 54, 284, "end"), cam(214, 232, -90, "2.2/2.4", 230, 250, "start"),
                              cam(196, 278, -88, "2.3", 178, 284, "end"), cam(126, 250, -40, "2.5", 114, 246, "end")]), "Scene 2 overhead"),
         notes=["The 180° line runs through their heads. Every camera stays on the door side, so she is always frame left and he is always frame right.",
                "2.2 and 2.4 are matched inserts from one setup: his hands enter from the right, hers from the left.",
                "2.5's eyeline goes down and frame left into 2.4 (eyeline match).",
                "Every cut jumps at least two shot sizes (wide → insert → medium → insert → close)."]),
    dict(n=3, slug="INT. BOOTH / AUDITORIUM — NIGHT", tone="dark", time="0:35–0:48",
         beat="She starts the picture.",
         plan=plan(plan_audi([cam(150, 236, 25, "3.1", 146, 226, "end"), cam(250, 150, 118, "3.2", 266, 146, "start"),
                             cam(210, 190, 90, "3.3", 226, 188, "start")]), "Scene 3 overhead"),
         notes=["3.2 is a neutral reverse with no characters. It lets 3.3 cross the line: from the auditorium side she moves to frame right.",
                "The beam never hits the lens in 3.2. It passes over the camera toward the screen.",
                "The screen is never shown. We only see its light on their faces."]),
    dict(n=4, slug="EXT. CINEMA CORNER — NIGHT", tone="cold", time="0:48–0:58",
         beat="The town finds out what's showing.",
         plan=plan(plan_street([cam(300, 152, -100, "4.1", 300, 172), cam(100, 236, -62, "4.2", 84, 250, "end")]), "Scene 4 overhead"),
         notes=["4.2 is the same setup, lens and framing as 1.1. The only change is the lit marquee.",
                "Warm light appears outside for the first time. Colour carries the meaning.",
                "CUT TO BLACK on the last bulb settling. Two seconds of silence, then the card."]),
]

SHOTS = [
    # id, scene, size, angle/height, lens, move, dur, tc, action, dialogue, sound, transition, drawing
    ("1.1", 1, "WIDE (EWS)", "Eye level 1.6 m, across the street under the bakery awning", "40 mm", "Handheld, holds; breathes, a few degrees off level", 6, "0:00–0:06",
     "Rain, the empty corner, the dark cinema and blank marquee. A small figure runs in from frame left with a coat held over her head, crosses through the lamp's pool and disappears toward the side door at frame right.",
     "—", "Rain on the awning and cobbles; her boots in water", "CUT", street("f11", False, True)),
    ("1.2", 1, "MEDIUM", "Low 1.2 m, 3 m from the door, 30° off its axis from the left", "50 mm", "Handheld, holds", 4, "0:06–0:10",
     "The side door opens before she knocks, warm light behind him. She ducks under his arm without stopping. He looks once up the empty street, then shuts the door; the spill narrows to a line.",
     "—", "Latch; the rain cuts off when the door shuts", "CUT", side_door("f12")),
    ("1.3", 1, "CLOSE", "Low 0.4 m, side-on to the iron flight", "75 mm", "Handheld, holds", 3, "0:10–0:13",
     "Her wet rubber boots climb two at a time, water dripping from the coat hem. His heavier shoes follow into frame.",
     "—", "Boots on iron, his breath", "CUT (the lamp's hum comes in)", stairs("f13")),
    ("2.1", 2, "WIDE", "1.7 m from the door corner, looking in; the low ceiling in frame", "32 mm", "Handheld, holds", 5, "0:13–0:18",
     "The cramped booth under one caged lamp, with the projector, the shelves of dented cans and the one new can with its label turned away. He hangs her dripping coat on a nail; she climbs onto a crate to see.",
     "—", "Drips, the lamp's faint buzz", "CUT", booth_wide("f21")),
    ("2.2", 2, "INSERT (ECU)", "Gate height 1.3 m, 0.5 m away, 30° off the gate", "100 mm macro", "Handheld, holds", 4, "0:18–0:22",
     "The new reel is on. His hands thread the film through the gate and round the sprockets. Thick, scarred and sure; he isn't looking at them.",
     "—", "Film ticking over metal", "CUT", mech("f22", "his")),
    ("2.3", 2, "MEDIUM TWO-SHOT", "Her eye level on the crate, 1.4 m; 1 m away", "50 mm", "Handheld, holds", 5, "0:22–0:27",
     "He stops with the last loop undone, looks at her and holds out the loose end. She takes it.",
     "HE (low, on the tail of an exhale): “Your turn.”", "The line, then nothing", "CUT", two_shot("f23")),
    ("2.4", 2, "INSERT (ECU)", "Same setup as 2.2 (matched)", "100 mm macro", "Handheld; focus hunts once as the film slips", 4, "0:27–0:31",
     "Her small hands. The film slips off a sprocket tooth once. She seats it again and the teeth catch.",
     "—", "One small click", "CUT", mech("f24", "hers")),
    ("2.5", 2, "CLOSE", "His chest height, 0.9 m, 3/4 front from her side", "75 mm", "Handheld, holds", 4, "0:31–0:35",
     "He watches her hands, not her face. His thumb rubs across his own fingertips, as if he were threading it himself.",
     "—", "His breath, held", "CUT", him_close("f25")),
    ("3.1", 3, "CLOSE", "Switch height, 0.4 m away", "100 mm", "Handheld, holds; he stays out of focus", 3, "0:35–0:38",
     "Her fingers over the worn bakelite switch. A held beat. Behind her, out of focus, he nods once. She turns it.",
     "—", "Silence, then the clunk", "CUT on the clunk", switch("f31")),
    ("3.2", 3, "WIDE (REVERSE)", "Low 0.8 m in row 6, looking back and up at the port", "40 mm", "Handheld, holds", 5, "0:38–0:43",
     "The empty auditorium in the dark. The beam fires out of the small port window and across the room over the empty rows, with dust turning in it. The screen stays behind the camera.",
     "—", "The projector starts to chatter", "CUT", auditorium("f32")),
    ("3.3", 3, "MEDIUM", "At the port, 3 m up, 1.2 m from the glass, straight on", "75 mm", "Handheld, holds", 5, "0:43–0:48",
     "Through the port glass, both faces in the flicker. She stares at the screen, lips parted, breath held. He isn't watching the screen. He's watching her.",
     "—", "Projector, muffled by the glass", "CUT (the chatter carries under)", port("f33")),
    ("4.1", 4, "INSERT (ECU)", "Under the marquee edge, 0.3 m from one bulb, looking up", "100 mm macro", "Handheld, holds", 2, "0:48–0:50",
     "One wet marquee bulb. The filament warms from dark to amber; the rest of the row wakes out of focus behind it.",
     "—", "Filament tick, rain on the glass", "CUT", bulb("f41")),
    ("4.2", 4, "WIDE (EWS)", "Same setup as 1.1", "40 mm", "Handheld, holds; drifts a beat late", 6, "0:50–0:56",
     "The same corner in the same rain. The marquee is lit, a few bulbs at a time, and the letters read KLING 4.0 / NOW SHOWING. Warm light on the wet street for the first time.",
     "—", "Rain; the projector faint through the wall; bulbs ticking", "CUT TO BLACK", street("f42", True, False)),
    ("CARD", 4, "TITLE CARD", "—", "—", "—", 2, "0:56–0:58",
     "Black. KLING 4.0, small and centred.", "—", "Silence", "END", card("fc")),
]

TONE = {1: "cold", 2: "warm", 3: "dark", 4: "cold"}


def esc(s):
    return html.escape(str(s), quote=True)


def panel(sh):
    sid, sc, size, angle, lens, move, dur, tc, action, dia, snd, trans, svg = sh
    dia_html = f'<div class="kv"><dt>Dialogue</dt><dd class="dia">{esc(dia)}</dd></div>' if dia != "—" else ""
    cam_html = "" if sid == "CARD" else f'<div class="kv"><dt>Camera</dt><dd>{esc(lens)} anamorphic. {esc(angle)}. {esc(move)}.</dd></div>'
    return f"""
    <figure class="panel" id="shot-{sid.replace('.', '-').lower()}">
      <div class="panel-head"><span class="badge">{esc(sid)}</span><span class="size">{esc(size)}</span><span class="tc">{esc(tc)} · {esc(dur)}s</span></div>
      <div class="frame">{svg}</div>
      <figcaption>
        <p class="action">{esc(action)}</p>
        <dl>{dia_html}{cam_html}
          <div class="kv"><dt>Sound</dt><dd>{esc(snd)}</dd></div>
        </dl>
        <div class="trans">{esc(trans)}</div>
      </figcaption>
    </figure>"""


def scene_block(sc):
    shots = [s for s in SHOTS if s[1] == sc["n"]]
    notes = "".join(f"<li>{esc(n)}</li>" for n in sc["notes"])
    total = sum(s[6] for s in shots)
    return f"""
  <section class="scene" id="scene-{sc['n']}" data-tone="{sc['tone']}">
    <header class="scene-head">
      <div class="scene-no">SC {sc['n']}</div>
      <div class="scene-title">
        <h2 class="slug">{esc(sc['slug'])}</h2>
        <p class="beat">{esc(sc['beat'])} <span class="muted">{esc(sc['time'])} · {total}s · {len(shots)} {'panel' if len(shots) == 1 else 'panels'}</span></p>
      </div>
    </header>
    <div class="overhead">
      <div class="plan-wrap">{sc['plan']}<div class="plan-cap">Overhead: camera setups, blocking and the line</div></div>
      <ul class="rules">{notes}</ul>
    </div>
    <div class="panels">{''.join(panel(s) for s in shots)}</div>
  </section>"""


def timeline():
    total = sum(s[6] for s in SHOTS)
    cells = []
    for s in SHOTS:
        cells.append(f'<a class="seg t-{TONE[s[1]]}{" t-black" if s[0] == "CARD" else ""}" href="#shot-{s[0].replace(".", "-").lower()}" '
                     f'style="flex:{s[6]}" title="{esc(s[0])} · {esc(s[2])} · {s[6]}s"><span>{esc(s[0])}</span></a>')
    ticks = "".join(f'<span style="left:{t / total * 100:.3f}%">{t // 60}:{t % 60:02d}</span>' for t in (0, 13, 35, 48, 58))
    return f'<div class="timeline"><div class="segs">{"".join(cells)}</div><div class="ticks">{ticks}</div></div>'


def shotlist_table():
    rows = []
    for s in SHOTS:
        sid, sc, size, angle, lens, move, dur, tc, action, dia, snd, trans, _ = s
        rows.append(f"<tr><td class='mono'>{esc(sid)}</td><td class='mono'>{sc}</td><td>{esc(size)}</td><td>{esc(angle)}</td>"
                    f"<td class='mono'>{esc(lens)}</td><td>{esc(move)}</td><td>{esc(action)}</td><td>{esc(dia)}</td>"
                    f"<td>{esc(snd)}</td><td class='mono num'>{dur}s</td><td class='mono nowrap'>{esc(tc)}</td><td class='mono out'>{esc(trans)}</td></tr>")
    return ("<div class='table-wrap'><table><thead><tr><th>Shot</th><th>Sc</th><th>Size</th><th>Angle / height</th><th>Lens</th>"
            "<th>Movement</th><th>Action</th><th>Dialogue</th><th>Sound</th><th>Dur</th><th>TC</th><th>Out</th></tr></thead>"
            f"<tbody>{''.join(rows)}</tbody></table></div>")


CSS = """
/* Layout: a production binder. Slugline headers, an overhead plan per scene, then 21:9 panels two-up. */
:root{
  --paper:#eceef1; --sheet:#f7f8f9; --ink:#14181e; --muted:#5a6472; --rule:#cfd5dc; --soft:#e2e6ea;
  --amber:#b96a14; --amber-ink:#8a4d0c; --cold:#3f6d93; --plan-bg:#f3f5f7; --plan-line:#2a323c; --plan-fill:#d7dde3;
  --display:"Big Shoulders Display", Impact, "Arial Narrow", sans-serif;
  --body:"IBM Plex Sans", "Helvetica Neue", Arial, sans-serif;
  --mono:"Courier Prime", "Courier New", Courier, monospace;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  --paper:#0f1216; --sheet:#151a20; --ink:#e7eaee; --muted:#95a0ad; --rule:#28303a; --soft:#1c222a;
  --amber:#eda14a; --amber-ink:#f2b46a; --cold:#8fb6d8; --plan-bg:#12171c; --plan-line:#c5cdd6; --plan-fill:#232b34; color-scheme:dark }}
:root[data-theme="dark"]{
  --paper:#0f1216; --sheet:#151a20; --ink:#e7eaee; --muted:#95a0ad; --rule:#28303a; --soft:#1c222a;
  --amber:#eda14a; --amber-ink:#f2b46a; --cold:#8fb6d8; --plan-bg:#12171c; --plan-line:#c5cdd6; --plan-fill:#232b34; color-scheme:dark }
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font-family:var(--body);font-size:15px;line-height:1.5}
.wrap{max-width:1240px;margin:0 auto;padding-inline:clamp(16px,3vw,40px);padding-block:32px 72px;display:grid;gap:44px}
.mono{font-family:var(--mono)}
.muted{color:var(--muted)}
h1,h2,h3{text-wrap:balance;margin:0}
/* cover */
.cover{display:grid;gap:18px;border-bottom:2px solid var(--ink);padding-bottom:24px}
.eyebrow{font-family:var(--mono);font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.cover h1{font-family:var(--display);font-weight:800;font-size:clamp(56px,10vw,120px);line-height:.86;letter-spacing:.01em;text-transform:uppercase}
.cover h1 span{color:var(--amber)}
.logline{max-width:62ch;font-size:17px;margin:0}
.meta{display:flex;flex-wrap:wrap;gap:0;border:1px solid var(--rule);background:var(--sheet)}
.meta div{padding:10px 16px;border-right:1px solid var(--rule);min-width:0}
.meta div:last-child{border-right:0}
.meta dt{font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.meta dd{margin:0;font-family:var(--display);font-weight:700;font-size:24px;line-height:1.1;font-variant-numeric:tabular-nums}
/* timeline */
.timeline{display:grid;gap:6px}
.segs{display:flex;gap:2px;height:44px}
.seg{display:flex;align-items:flex-end;padding:4px 5px;color:#fff;text-decoration:none;font-family:var(--mono);font-size:11px;font-weight:700;min-width:0;overflow:hidden}
.seg span{white-space:nowrap}
.seg:focus-visible{outline:2px solid var(--amber);outline-offset:2px}
.t-cold{background:linear-gradient(180deg,#22364b,#0e1823)}
.t-warm{background:linear-gradient(180deg,#b86a1f,#3b220e)}
.t-dark{background:linear-gradient(180deg,#3a3024,#07090c)}
.t-black{background:#000}
.ticks{position:relative;height:16px;font-family:var(--mono);font-size:11px;color:var(--muted)}
.ticks span{position:absolute;transform:translateX(-50%)}
.ticks span:first-child{transform:none}.ticks span:last-child{transform:translateX(-100%)}
.tl-cap{font-size:13px;color:var(--muted);margin:0}
/* legend */
.legend{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;background:var(--rule);border:1px solid var(--rule)}
.legend div{background:var(--sheet);padding:12px 14px;display:grid;grid-template-columns:48px 1fr;gap:12px;align-items:center;font-size:13.5px}
.legend svg{width:48px;height:24px}
.legend b{font-family:var(--mono);font-size:12px;letter-spacing:.04em;text-transform:uppercase;display:block}
.sec-title{font-family:var(--display);font-weight:800;font-size:34px;text-transform:uppercase;letter-spacing:.02em}
.intro{display:grid;gap:14px}
.intro p{margin:0;max-width:70ch}
/* scenes */
.scene{display:grid;gap:22px;padding-top:26px;border-top:2px solid var(--ink)}
.scene-head{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:start}
.scene-no{font-family:var(--display);font-weight:800;font-size:56px;line-height:.85;color:var(--amber)}
.slug{font-family:var(--mono);font-weight:700;font-size:clamp(17px,2.2vw,22px);letter-spacing:.02em}
.beat{margin:4px 0 0;font-size:16px}
.overhead{display:grid;grid-template-columns:minmax(0,420px) minmax(0,1fr);gap:24px;align-items:start}
.plan-wrap{background:var(--plan-bg);border:1px solid var(--rule)}
.plan{display:block;width:100%;height:auto}
.plan-cap{font-family:var(--mono);font-size:11.5px;color:var(--muted);padding:6px 10px;border-top:1px solid var(--rule)}
.rules{margin:0;padding:0;list-style:none;display:grid;gap:10px;font-size:14.5px;max-width:62ch}
.rules li{padding-left:18px;position:relative}
.rules li::before{content:"";position:absolute;left:0;top:.62em;width:8px;height:2px;background:var(--amber)}
.panels{display:grid}
.panel{margin:0;display:grid;grid-template-columns:minmax(0,1.65fr) minmax(0,1fr);column-gap:28px;row-gap:8px;padding-block:20px;border-top:1px solid var(--rule);min-width:0}
.panel-head{grid-column:1;display:flex;align-items:baseline;gap:12px;min-width:0}
.badge{background:var(--amber);color:#111;font-family:var(--mono);font-weight:700;font-size:15px;padding:2px 9px}
.size{font-family:var(--mono);font-weight:700;font-size:13px;letter-spacing:.06em}
.tc{margin-left:auto;font-family:var(--mono);font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}
.frame{grid-column:1;aspect-ratio:21/9;max-width:100%;background:#000;border:1px solid var(--ink);overflow:hidden}
.frame svg{display:block;width:100%;height:100%}
figcaption{grid-column:2;grid-row:1 / span 2;display:grid;gap:10px;align-content:start;min-width:0}
.action{margin:0;font-size:15px}
dl{margin:0;display:grid;gap:6px}
.kv{display:grid;grid-template-columns:78px 1fr;gap:10px;font-size:13.5px}
dt{font-family:var(--mono);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding-top:2px}
dd{margin:0}
.dia{font-family:var(--mono);font-weight:700}
.trans{font-family:var(--mono);font-size:12px;font-weight:700;letter-spacing:.06em;text-align:right;color:var(--amber-ink)}
/* plan drawing */
.plan .ground{fill:var(--plan-bg)}
.plan .road{fill:var(--plan-fill);opacity:.55}
.plan .bldg{fill:var(--plan-fill);stroke:var(--plan-line);stroke-width:1.2}
.plan .room{fill:none;stroke:var(--plan-line);stroke-width:3}
.plan .gap{fill:var(--plan-bg)}
.plan .mq,.plan .awn{fill:var(--plan-line)}
.plan .door{fill:var(--amber)}
.plan .hatch{fill:none;stroke:var(--plan-line);stroke-width:1;stroke-dasharray:3 3}
.plan .lamp,.plan .new{fill:var(--amber)}
.plan .crate{fill:none;stroke:var(--plan-line);stroke-width:1.2}
.plan .lbl{font-family:var(--mono);font-size:12px;fill:var(--muted);font-weight:700}
.plan .lbl.sm{font-size:10px}
.plan .move{fill:none;stroke:var(--cold);stroke-width:2.2;stroke-dasharray:6 4}
.plan .ahfill{fill:var(--cold)}
.plan .axis{stroke:var(--plan-line);stroke-width:1.4;stroke-dasharray:8 5}
.plan .axisl{fill:var(--ink)}
.plan .who circle{fill:var(--sheet);stroke:var(--plan-line);stroke-width:2}
.plan .who line{stroke:var(--plan-line);stroke-width:2.4}
.plan .who text{font-family:var(--mono);font-size:10.5px;font-weight:700;fill:var(--ink)}
.plan .cam path{fill:var(--amber);fill-opacity:.28;stroke:var(--amber);stroke-width:1.6}
.plan .cam circle{fill:var(--amber)}
.plan .cam text{font-family:var(--mono);font-size:11px;font-weight:700;fill:var(--amber-ink)}
.plan .row{fill:none;stroke:var(--plan-line);stroke-width:1.2;opacity:.6}
.plan .screen{stroke:var(--plan-line);stroke-width:4}
.plan .wall{stroke:var(--plan-line);stroke-width:3}
.plan .beam{fill:var(--amber);opacity:.14}
.plan .scale{stroke:var(--ink);stroke-width:2}
/* shot list */
.table-wrap{overflow-x:auto;border:1px solid var(--rule);background:var(--sheet)}
table{border-collapse:collapse;min-width:1180px;font-size:13px}
th,td{text-align:left;vertical-align:top;padding:9px 10px;border-bottom:1px solid var(--rule)}
th{font-family:var(--mono);font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--muted);background:var(--soft);position:sticky;top:0}
td.num,td.nowrap{font-variant-numeric:tabular-nums;white-space:nowrap}
td.out{min-width:150px}
tbody tr:hover{background:var(--soft)}
.sources{font-size:13px;color:var(--muted);display:grid;gap:6px}
.sources a{color:var(--cold)}
.sources ul{margin:0;padding-left:18px;display:grid;gap:3px}
@media (max-width: 860px){
  .panel{grid-template-columns:minmax(0,1fr)}
  figcaption{grid-column:1;grid-row:auto}
  .legend{grid-template-columns:repeat(2,minmax(0,1fr))}
  .overhead{grid-template-columns:minmax(0,1fr)}
  .scene-no{font-size:40px}
}
@media (max-width: 520px){
  .meta div{flex:1 1 45%}
  .legend{grid-template-columns:minmax(0,1fr)}
  .seg span{display:none}
}
"""

LEGEND = """
<div class="legend" role="list">
  <div role="listitem"><svg viewBox="0 0 48 24"><rect width="48" height="24" fill="#0b1119"/><path d="M6,16 C18,6 30,6 40,12" stroke="#fff" stroke-width="2" fill="none"/><path d="M36,8 L43,13 L35,16 z" fill="#fff"/></svg><span><b>Subject move</b>Thin white arrow drawn next to whoever moves.</span></div>
  <div role="listitem"><svg viewBox="0 0 48 24"><rect width="48" height="24" fill="#0b1119"/><path d="M6,12 C18,8 30,12 44,16" stroke="#fff" stroke-width="1.6" stroke-dasharray="1.5 4" fill="none"/></svg><span><b>Eyeline</b>Dotted line from the eyes to what they look at.</span></div>
  <div role="listitem"><svg viewBox="0 0 48 24"><rect width="48" height="24" fill="#0b1119"/><text x="4" y="16" font-family="Courier Prime, monospace" font-size="9" font-weight="700" fill="#ffb347">HOLDS</text></svg><span><b>Camera note</b>Amber, bottom left. There are no camera-move arrows: every shot is handheld and never travels.</span></div>
  <div role="listitem"><svg viewBox="0 0 48 24"><path d="M6,12 L30,4 L30,20 Z" fill="var(--amber)" fill-opacity=".3" stroke="var(--amber)"/><circle cx="6" cy="12" r="3" fill="var(--amber)"/></svg><span><b>Setup on a plan</b>Wedge shows lens direction; number is the shot.</span></div>
  <div role="listitem"><svg viewBox="0 0 48 24"><line x1="2" y1="12" x2="46" y2="12" stroke="var(--plan-line)" stroke-width="1.4" stroke-dasharray="8 5"/></svg><span><b>180° line</b>The axis between two characters. Cameras stay on one side.</span></div>
  <div role="listitem"><svg viewBox="0 0 48 24"><rect x="2" y="4" width="30" height="16" fill="#000"/><rect x="2" y="4" width="10" height="7" fill="var(--amber)"/></svg><span><b>Panel number</b>Scene.shot, e.g. 2.3 is scene 2, shot 3. Size is top right.</span></div>
</div>"""

SOURCES = [
    ("StudioBinder: storyboard arrows", "https://www.studiobinder.com/blog/storyboard-arrows-meaning/"),
    ("StudioBinder: how to storyboard camera movement", "https://www.studiobinder.com/blog/storyboard-camera-movement/"),
    ("Filmlocal: storyboarding quick-start (scene.shot numbering)", "https://filmlocal.com/filmmaking/how-to-storyboard/"),
    ("Yamdu: camera coverage and the 180° rule", "https://yamdu.com/en/learn/preproduction/coverage/"),
    ("EditMentor: the 30-degree rule", "https://editmentor.com/blog/the-30-degree-rule-in-filmmaking-how-to-maintain-continuity/"),
    ("Boords: shot list template fields", "https://boords.com/shot-list-template"),
    ("Learn About Film: continuity and screen direction", "https://learnaboutfilm.com/film-language/sequence/"),
]


def page():
    n_shots = len([s for s in SHOTS if s[0] != "CARD"])
    total = sum(s[6] for s in SHOTS)
    src = "".join(f'<li><a href="{u}" target="_blank" rel="noopener">{esc(t)}</a></li>' for t, u in SOURCES)
    return f"""<title>First Light Storyboard</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800&family=Courier+Prime:wght@400;700&family=IBM+Plex+Sans:wght@400;500;600&display=swap">
<style>{CSS}</style>
<main class="wrap">
  <header class="cover">
    <div class="eyebrow">Storyboard &amp; shot list · a film for the Kling 4.0 release · generated in Seedance 2.5</div>
    <h1>First <span>Light</span></h1>
    <p class="logline">On a rainy night in a small town, the cinema premieres a new picture, and the old projectionist lets his granddaughter start it. We only learn what's showing when the marquee lights up: KLING 4.0.</p>
    <dl class="meta">
      <div><dt>Runtime</dt><dd>0:{total:02d}</dd></div>
      <div><dt>Frame</dt><dd>21:9</dd></div>
      <div><dt>Scenes</dt><dd>4</dd></div>
      <div><dt>Shots</dt><dd>{n_shots} + card</dd></div>
      <div><dt>Light</dt><dd>1 source a scene</dd></div>
      <div><dt>Score</dt><dd>None</dd></div>
    </dl>
  </header>

  <section class="intro" aria-label="Cut rhythm">
    <h2 class="sec-title">The cut, to scale</h2>
    {timeline()}
    <p class="tl-cap">Each block is one shot, sized by its length and coloured by its light: cold blue outside, amber in the booth, near-black in the auditorium. Select a block to jump to its panel.</p>
  </section>

  <section class="intro" aria-label="How to read the boards">
    <h2 class="sec-title">How to read the boards</h2>
    <p>Panels follow the usual conventions: scene.shot numbering, frames drawn at the delivery ratio (21:9), a thin arrow next to the subject for any movement, the camera note on the frame edge, and action, dialogue, sound and the transition written under each panel. Each scene opens with an overhead plan showing where every setup sits, who stands where, and the 180° line.</p>
    {LEGEND}
  </section>

  {''.join(scene_block(sc) for sc in SCENES)}

  <section class="intro" id="shot-list">
    <h2 class="sec-title">Shot list</h2>
    <p>The same {n_shots} shots as one table, for the prompt pass. Anamorphic lenses throughout; lengths are cut lengths, not generation lengths.</p>
    {shotlist_table()}
  </section>

  <footer class="sources">
    <span class="eyebrow">Method sources</span>
    <ul>{src}</ul>
  </footer>
</main>
"""


with open(OUT, "w") as fh:
    fh.write(page())
print("wrote", OUT, sum(1 for _ in open(OUT)), "lines")
