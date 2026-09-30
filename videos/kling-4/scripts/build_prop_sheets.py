"""Builds the projector sheet and the labelled props board from assets/props/picks.

Every other prop is a single museum still on grey, so its pick is its sheet. The projector gets
a two-view sheet, both views lifted from the location plates so it can never drift from the room:
the machine cut out of BOOTH and set on grey, and the lamp-house end cropped from BOOTH_PORT_WALL.
No text goes on a sheet (it would leak into generations); the board is for picking only.
"""
import os

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "props")
PICKS = os.path.join(ROOT, "picks")
GREY = (128, 128, 128)
H = 1333  # same height as the character sheets

BOARD = [
    ("@PROJECTOR", "PROJECTOR.jpg", "cut out of the BOOTH plate"),
    ("@PROJECTOR (back)", "PROJECTOR_BACK.jpg", "cropped from BOOTH_PORT_WALL"),
    ("@FILM_REEL", "FILM_REEL.jpg", "Soul Cinema, round 1"),
    ("@FILM_CANS", "FILM_CANS.jpg", "Soul Cinema, round 2"),
    ("@CRATE", "CRATE.jpg", "Soul Cinema, round 2"),
    ("@BOOTH_LAMP", "BOOTH_LAMP.jpg", "Soul Cinema, round 1"),
    ("@SWITCH", "SWITCH.jpg", "Soul Cinema, round 1"),
    ("@MARQUEE", "MARQUEE.jpg", "cropped from CINEMA_EXT_LIT"),
]


def at_height(im, h):
    return im.resize((round(im.width * h / im.height), h), Image.LANCZOS)


def projector_sheet():
    front = at_height(Image.open(os.path.join(PICKS, "PROJECTOR.jpg")).convert("RGB"), H)
    back = at_height(Image.open(os.path.join(PICKS, "PROJECTOR_BACK.jpg")).convert("RGB"), H)
    sheet = Image.new("RGB", (front.width + back.width, H), GREY)
    sheet.paste(front, (0, 0))
    sheet.paste(back, (front.width, 0))
    out = os.path.join(ROOT, "SHEET_PROJECTOR.jpg")
    sheet.save(out, quality=92)
    return out, sheet.size


def board(cols=4, cell=(760, 428), pad=24, cap=64):
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
    small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
    rows = -(-len(BOARD) // cols)
    W = cols * cell[0] + (cols + 1) * pad
    Hb = rows * (cell[1] + cap) + (rows + 1) * pad
    img = Image.new("RGB", (W, Hb), (18, 18, 20))
    d = ImageDraw.Draw(img)
    for i, (tag, fn, src) in enumerate(BOARD):
        r, c = divmod(i, cols)
        x = pad + c * (cell[0] + pad)
        y = pad + r * (cell[1] + cap + pad)
        im = Image.open(os.path.join(PICKS, fn)).convert("RGB")
        im.thumbnail(cell, Image.LANCZOS)
        tile = Image.new("RGB", cell, GREY)
        tile.paste(im, ((cell[0] - im.width) // 2, (cell[1] - im.height) // 2))
        img.paste(tile, (x, y))
        d.text((x, y + cell[1] + 8), tag, font=font, fill=(235, 225, 205))
        d.text((x, y + cell[1] + 38), src, font=small, fill=(150, 150, 155))
    out = os.path.join(ROOT, "PROPS_BOARD.jpg")
    img.save(out, quality=88)
    return out, img.size


if __name__ == "__main__":
    print(*projector_sheet())
    print(*board())
