#!/usr/bin/env python3
"""Build the illustrated reference pack for STYLE.md.

Renders every visual reference listed in tools/pack.json (stills, annotated frames, frame strips,
video clips) from the reference video, puts each one where STYLE.md has its <!-- ref:id -->
marker, and writes a Markdown copy, a self-contained HTML page, a PDF and a zip.
The pack contains frames from the reference, so it lives in the gitignored refs/ folder.

    python3 tools/build_pack.py path/to/reference.mp4 refs/pack
"""
import base64, json, os, re, shutil, subprocess, sys
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
STYLE_DIR = os.path.dirname(HERE)
FONT = next((p for p in ['/usr/share/fonts/opentype/inter/Inter-SemiBold.otf',
                         '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if os.path.exists(p)), None)
CHROME = next((p for p in ['/opt/pw-browsers/chromium', shutil.which('chromium') or '',
                           shutil.which('google-chrome') or ''] if p and os.path.exists(p)), None)


def font(size):
    return ImageFont.truetype(FONT, size) if FONT else ImageFont.load_default()


class Ref:
    def __init__(self, path):
        cap = cv2.VideoCapture(path)
        self.fps = cap.get(cv2.CAP_PROP_FPS)
        self.full = []
        while True:
            ok, f = cap.read()
            if not ok:
                break
            self.full.append(f)
        g = np.stack([cv2.cvtColor(f, cv2.COLOR_BGR2GRAY) for f in self.full[::max(1, len(self.full) // 60)]])
        rows = g.mean(axis=(0, 2))
        self.y0 = int(np.argmax(rows > 8)); self.y1 = len(rows) - int(np.argmax(rows[::-1] > 8))
        small = [cv2.resize(cv2.cvtColor(f, cv2.COLOR_BGR2GRAY), (184, 104)).astype(np.float32) for f in self.full]
        self.new = [True] + [float(np.abs(a - b).mean()) >= 0.35 for a, b in zip(small[1:], small[:-1])]

    def idx(self, t):
        return int(min(len(self.full) - 1, max(0, round(t * self.fps))))

    def frame(self, t, crop=None, full=False):
        f = t if isinstance(t, np.ndarray) else self.full[self.idx(t)]
        f = f if full else f[self.y0:self.y1]
        if crop:
            x0, y0, x1, y1 = crop
            f = f[y0:y1, x0:x1]
        return Image.fromarray(cv2.cvtColor(f, cv2.COLOR_BGR2RGB))

    def new_frames(self, t0, t1):
        return [i for i in range(self.idx(t0), self.idx(t1) + 1) if self.new[i]]


def fit(im, w, h=None):
    """Scale to width w; if h is given, letterbox into w x h on a dark background."""
    if h is None:
        return im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    s = min(w / im.width, h / im.height)
    im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    bg = Image.new('RGB', (w, h), (18, 18, 18)); bg.paste(im, ((w - im.width) // 2, (h - im.height) // 2))
    return bg


def tag(im, text, where='tl', size=None):
    if not text:
        return im
    d = ImageDraw.Draw(im, 'RGBA'); f = font(size or max(12, im.width // 26))
    l, t, r, b = d.textbbox((0, 0), text, font=f); pad = 4
    x = 4 if where in ('tl', 'bl') else im.width - (r - l) - 2 * pad - 4
    y = 4 if where in ('tl', 'tr') else im.height - (b - t) - 2 * pad - 4
    d.rectangle([x, y, x + (r - l) + 2 * pad, y + (b - t) + 2 * pad], fill=(0, 0, 0, 170))
    d.text((x + pad - l, y + pad - t), text, font=f, fill=(255, 255, 255))
    return im


def sheet(tiles, cols, gap=4, bg=(245, 245, 245)):
    rows = [tiles[i:i + cols] for i in range(0, len(tiles), cols)]
    w = max(sum(t.width for t in r) + gap * (len(r) - 1) for r in rows)
    h = sum(max(t.height for t in r) for r in rows) + gap * (len(rows) - 1)
    out = Image.new('RGB', (w, h), bg); y = 0
    for r in rows:
        x = 0
        for t in r:
            out.paste(t, (x, y)); x += t.width + gap
        y += max(t.height for t in r) + gap
    return out


def row_label(text, width, h=30):
    im = Image.new('RGB', (width, h), (245, 245, 245)); d = ImageDraw.Draw(im)
    d.text((6, 6), text, font=font(17), fill=(25, 25, 25)); return im


def stack(parts, gap=4):
    w = max(p.width for p in parts); h = sum(p.height for p in parts) + gap * (len(parts) - 1)
    out = Image.new('RGB', (w, h), (245, 245, 245)); y = 0
    for p in parts:
        out.paste(p, (0, y)); y += p.height + gap
    return out


def render(R, spec):
    k = spec['type']
    if k == 'contact':
        n = int(len(R.full) / R.fps / spec['every'])
        tiles = [tag(fit(R.frame(i * spec['every']), spec['tile_w']), f"{i * spec['every']:.0f} s") for i in range(n + 1)]
        return sheet(tiles, spec['cols'])
    if k == 'grid':
        tiles = []
        for it in spec['items']:
            t, crop, label = (it + [None, None])[:3]
            im = fit(R.frame(t, crop), spec['tile_w'], spec.get('tile_h'))
            tiles.append(tag(tag(im, f'{t:g} s'), label, 'bl'))
        return sheet(tiles, spec['cols'])
    if k == 'rows':
        parts = []
        for label, items in spec['rows']:
            tiles = [tag(fit(R.frame(it[0], (it + [None])[1]), spec['tile_w'], round(spec['tile_w'] * 370 / 736)), f'{it[0]:g} s') for it in items]
            s = sheet(tiles, len(tiles)); parts += [row_label(label, s.width), s]
        return stack(parts)
    if k == 'strips':
        parts = []
        for row in spec['rows']:
            label, t0, t1 = row[:3]; crop = row[3] if len(row) > 3 else None
            idx = R.new_frames(t0, t1)
            if len(idx) > spec['n']:
                idx = [idx[round(j)] for j in np.linspace(0, len(idx) - 1, spec['n'])]
            tiles = [tag(fit(R.frame(R.full[i], crop), spec['tile_w']), f'{i / R.fps:.2f}', size=13) for i in idx]
            s = sheet(tiles, len(tiles)); parts += [row_label(f'{label}  ({t0:g}–{t1:g} s)', s.width), s]
        return stack(parts)
    if k == 'consecutive':
        i0 = R.idx(spec['t'])
        tiles = [tag(tag(fit(R.frame(R.full[i]), spec['tile_w']), f'frame {i}', size=13),
                     'NEW image' if R.new[i] else 'held (same image)', 'bl', size=13) for i in range(i0, i0 + spec['count'])]
        return sheet(tiles, 4)
    if k == 'annotate':
        im = R.frame(spec['t'], full=spec.get('full', False)); scale = 2
        im = im.resize((im.width * scale, im.height * scale), Image.LANCZOS); d = ImageDraw.Draw(im, 'RGBA'); f = font(20)
        for x0, y0, x1, y1, label, col in spec['boxes']:
            d.rectangle([x0 * scale, y0 * scale, x1 * scale - 1, y1 * scale - 1], outline=col, width=4)
            l, t, r, b = d.textbbox((0, 0), label, font=f); tx, ty = x0 * scale + 6, y0 * scale + 6
            d.rectangle([tx - 3, ty - 3, tx + r - l + 3, ty + b - t + 3], fill=(0, 0, 0, 190))
            d.text((tx - l, ty - t), label, font=f, fill=col)
        return tag(im, f"{spec['t']:g} s", 'tr', 20)
    raise ValueError(k)


def clip(ref_path, R, out, name, t0, t1, slow=1.0):
    crop = f'crop=iw:{R.y1 - R.y0}:0:{R.y0}'
    label = name.replace('-', ' ')
    vf = (f"{crop},drawtext=fontfile={FONT}:text='{label}  %{{pts\\:flt}}':x=8:y=8:fontsize=16:"
          f"fontcolor=white:box=1:boxcolor=black@0.55")
    cmd = ['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{t0}', '-to', f'{t1}', '-i', ref_path]
    if slow != 1.0:
        vf = (f"{crop},drawtext=fontfile={FONT}:text='source frame %{{eif\\:n+{R.idx(t0)}\\:d}}  (slowed {slow:g}x)':"
              f"x=8:y=8:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.55,setpts={slow}*PTS")
        cmd += ['-vf', vf, '-an']
    else:
        cmd += ['-vf', vf, '-c:a', 'aac', '-b:a', '128k']
    cmd += ['-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', os.path.join(out, 'clips', name + '.mp4')]
    subprocess.run(cmd, check=True)


CSS = """
body{font-family:Inter,'DejaVu Sans',sans-serif;font-size:10.5pt;line-height:1.45;color:#1b1b1b;max-width:1180px;margin:24px auto;padding:0 16px}
h1{font-size:22pt}h2{font-size:15pt;margin-top:28px;border-bottom:1px solid #ddd;padding-bottom:4px}h3{font-size:12pt}
img{max-width:100%;height:auto;display:block;margin:10px 0 2px;border-radius:3px}
table{border-collapse:collapse;width:100%;font-size:9pt;margin:8px 0}th,td{border:1px solid #ddd;padding:4px 6px;vertical-align:top}
th{background:#f3f3f3}code,pre{font-size:8.5pt;background:#f6f6f6}pre{padding:8px;white-space:pre-wrap}
blockquote{border-left:4px solid #c0582a;margin:8px 0;padding:4px 12px;background:#fbf6f2}
.fig{font-size:9pt;color:#444;margin:0 0 14px}.vid{font-size:9pt;color:#0b5791;margin:0 0 14px}
@media print{body{margin:0;max-width:none}h2{page-break-after:avoid}img{page-break-inside:avoid}}
"""


def main(ref_path, out):
    spec = json.load(open(os.path.join(HERE, 'pack.json')))['refs']
    for d in ('images', 'clips'):
        os.makedirs(os.path.join(out, d), exist_ok=True)
    R = Ref(ref_path)
    print(f'{len(R.full)} frames @ {R.fps:.3f}, active rows {R.y0}-{R.y1}')
    md = open(os.path.join(STYLE_DIR, 'STYLE.md'), encoding='utf-8').read()
    MARK = re.compile(r'^<!-- ref:([\w-]+) -->$', re.M)
    used = MARK.findall(md)
    missing = [u for u in used if u not in spec]
    if missing:
        sys.exit(f'markers without a pack.json entry: {missing}')
    for rid in used:
        s = spec[rid]
        im = render(R, s); im.save(os.path.join(out, 'images', rid + '.jpg'), quality=84)
        for c in s.get('clips', []):
            clip(ref_path, R, out, c[0], c[1], c[2], c[3] if len(c) > 3 else 1.0)
        print('  ', rid, im.size, len(s.get('clips', [])), 'clips')
    shutil.copy(ref_path, os.path.join(out, 'clips', '00-full-reference.mp4'))
    shutil.copytree(os.path.join(STYLE_DIR, 'figures'), os.path.join(out, 'figures'), dirs_exist_ok=True)

    def sub(m):
        s = spec[m.group(1)]
        txt = f"\n![{s['caption']}](images/{m.group(1)}.jpg)\n\n<p class=\"fig\"><b>Reference:</b> {s['caption']}</p>\n"
        if s.get('clips'):
            names = ', '.join(f"<code>clips/{c[0]}.mp4</code>" for c in s['clips'])
            txt += f"\n<p class=\"vid\"><b>Video reference:</b> {names}</p>\n"
        return txt
    intro = ("> **Reference pack.** This is the illustrated copy of `STYLE.md`. Every image captioned "
             "**Reference** is a frame or strip of frames from the reference title sequence, placed next to the rule it shows. Times are in seconds. "
             "If your tool accepts video, the clips named under each figure are in `clips/` "
             "(`00-full-reference.mp4` is the whole reference). These references are for studying the "
             "style only: do not reproduce the reference's people, names, text, logo or music.\n\n")
    md_out = MARK.sub(sub, md)
    md_out = re.sub(r'(\n> \*\*The look in one line\.\*\*)', '\n' + intro + r'\1', md_out, count=1)
    clips = sorted(os.listdir(os.path.join(out, 'clips')))
    md_out += '\n\n## Video reference index\n\n' + '\n'.join(f'- `clips/{c}`' for c in clips) + '\n'
    open(os.path.join(out, 'STYLE-illustrated.md'), 'w', encoding='utf-8').write(md_out)
    open(os.path.join(out, 'style.css'), 'w').write(CSS)
    html = os.path.join(out, 'Collage-Diorama-Style.html')
    subprocess.run(['pandoc', 'STYLE-illustrated.md', '-f', 'gfm', '-t', 'html5', '-s', '--embed-resources',
                    '--css', 'style.css', '--metadata', 'pagetitle=Collage Diorama: style document',
                    '-o', os.path.basename(html)], cwd=out, check=True)
    if CHROME:
        subprocess.run([CHROME, '--headless', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer',
                        f'--print-to-pdf={os.path.abspath(os.path.join(out, "Collage-Diorama-Style.pdf"))}',
                        'file://' + os.path.abspath(html)], check=True, capture_output=True)
    z = os.path.join(out, 'collage-diorama-reference-pack.zip')
    if os.path.exists(z):
        os.remove(z)
    subprocess.run(['zip', '-qr', os.path.basename(z), 'Collage-Diorama-Style.pdf', 'Collage-Diorama-Style.html',
                    'STYLE-illustrated.md', 'images', 'figures', 'clips'], cwd=out, check=True)
    print('done:', out)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
