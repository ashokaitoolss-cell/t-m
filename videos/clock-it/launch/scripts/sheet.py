import sys, glob
from PIL import Image, ImageDraw
d0 = sys.argv[1]
fs = sorted(glob.glob(f'{d0}/frame-*.png'))
tw, th, cols = 384, 216, 6
rows = (len(fs) + cols - 1) // cols
out = Image.new('RGB', (tw * cols, (th + 16) * rows), (20, 20, 20)); d = ImageDraw.Draw(out)
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGB').resize((tw, th)); x = (i % cols) * tw; y = (i // cols) * (th + 16)
    out.paste(im, (x, y + 16)); d.text((x + 4, y + 2), f.split('-at-')[1][:-4], fill=(255, 255, 120))
out.save(f'{d0}/sheet.jpg', quality=85)
