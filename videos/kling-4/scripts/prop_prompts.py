"""First Light object locks. Every description is read off the approved location plates
(assets/locations/picks), so the props match the rooms they live in.

Round 1 (assets/props/round1_*.json) ran each object twice in Soul Cinema: once with a crop of its
location plate as the reference, once from the text alone. Every run with a reference rebuilt the
room around the object and ignored the grey ground, so the locks are text-only from round 2 on.
Round 1 kept @FILM_REEL, @BOOTH_LAMP and @SWITCH. The lit marquee is locked by the CINEMA_EXT_LIT
pick itself.

The projector appears in two picks that disagree (BOOTH shows a blue-green machine on a tapered
box pedestal; BOOTH_PORT_WALL shows a black lamp-house drum from behind). The lock merges them: the
BOOTH machine is canonical, and the black drum is its lamp house at the back. Round 1 read "a long
lens barrel" as a gun, so round 2 builds the machine up from the pedestal and keeps the lens short.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
FOLDER = "bacdfb1d-ac88-4446-a945-24b7dc558d01"

PROJECTOR = (
    "a massive old cinema projection machine from the 1940s, about 1.7 metres tall and 1.6 metres long, built like "
    "factory machinery. From the floor up: a heavy tapered box pedestal of dark blue-green sheet steel about a metre "
    "tall, wider at the floor than at the top, with a low plinth and a flat steel top plate; on the top plate a "
    "horizontal cast-iron mechanism housing in dark gunmetal with a blue-green cast, the enamel worn to bare metal at "
    "the edges; on the operator side of the housing a round dark glass inspection door about 45 centimetres across, "
    "and over it a large cast-iron handwheel with five curved spokes and a round hub; above the housing a short thick "
    "column carrying a large upright cast-iron wheel with four curved spokes, about 50 centimetres across; a steel "
    "lever angled up from the housing; at the front a thick dull-steel lens tube about 60 centimetres long and 20 "
    "centimetres across with a ribbed collar ring, level with the housing; under the lens tube a squat round motor "
    "drum with ribbed bands; at the back a short black cylindrical lamp house with a pale weathered riveted end cap "
    "and a curved black cable arm rising from it. The pedestal and housing are the bulk of the machine; the lens tube "
    "is short beside them")

LOCKS = [
    dict(tag="@PROJECTOR", view="three-quarter from the operator side, camera at chest height, the lens tube pointing "
         "to camera-right", name="the projection machine", desc=PROJECTOR,
         materials="chipped blue-green enamel, bare iron, the dull steel lens tube, oil, dust in the rivets",
         extra_neg="cannon, gun, artillery, telescope, microscope, thin pole stand, tripod",
         runs=[("soul_cinematic", 2), ("soul_2", 1)]),
    dict(tag="@PROJECTOR_BACK", view="three-quarter from behind, the black lamp house nearest the camera and the lens "
         "tube pointing away", name="the projection machine", desc=PROJECTOR,
         materials="the scorched black lamp house, the pale riveted end cap, chipped blue-green enamel, dull steel",
         extra_neg="cannon, gun, artillery, telescope, microscope, thin pole stand, tripod",
         runs=[("soul_cinematic", 1)]),
    dict(tag="@FILM_CANS", view="three-quarter from slightly above", name="the film tins",
         desc=("a leaning stack of five plain round flat film tins in dull grey tin plate, each about forty "
               "centimetres across and five centimetres deep, lids with a rolled rim, dented, scuffed, with spots of "
               "rust; beside the stack one new tin of the same size: bright, unscratched, mirror-clean tin plate all "
               "over, lid and base alike. No paper, no labels, no writing anywhere on any tin"),
         materials="dull tin plate, dents, rust spots, the flawless bright new tin",
         extra_neg="paper label, sticker, wooden lid, cardboard", runs=[("soul_cinematic", 1)]),
    dict(tag="@CRATE", view="three-quarter from slightly above", name="the wooden crate",
         desc=("a low, wide, open-topped wooden crate, about 60 centimetres long, 40 centimetres deep and 35 "
               "centimetres tall, sturdy enough for a child to stand on; plain planks of warm honey-coloured pine "
               "nailed at the corners, the wood darkened and worn smooth along the top edges, a dark knot in one plank"),
         materials="honey pine grain, nail heads, worn top edges",
         extra_neg="tall box, narrow box, grey wood, painted wood, lid", runs=[("soul_cinematic", 1)]),
]

LOOK = ("Flat mid-grey seamless ground, even neutral grey, no seam, no floor line, a soft shadow under the object. One "
        "broad soft source from camera-left and slightly above, no rim light. The object reads matte at its true "
        "colour, never cool-shifted by the grey. Real 35mm film capture (Vision3 500T), fine organic grain, softer "
        "than digital, NOT digital-clean. OVER-real: {materials}. If any surface looks clean, smooth, plastic, CGI or "
        "rendered — WRONG.")
NEG = ("NOT: people, hands, room, walls, shelves, other objects, text, labels, logos, brand names, numbers, watermark, "
       "frame borders, CGI, 3D render, plastic, toy, miniature, glossy, new paint, {extra}.")


def prompt(lock):
    head = (f"Museum object photograph of {lock['name']}, set alone on a flat mid-grey seamless ground, seen "
            f"{lock['view']}, the whole object in frame with grey space around it, nothing else in frame.")
    return " ".join([head, f"The object: {lock['desc']}.", LOOK.format(materials=lock["materials"]),
                     NEG.format(extra=lock["extra_neg"])])


def requests():
    out, i = [], 0
    for lock in LOCKS:
        for model, n in lock["runs"]:
            for _ in range(n):
                out.append({"index": i, "tag": lock["tag"], "model": model,
                            "params": {"model": model, "aspect_ratio": "16:9", "quality": "2k", "folder_id": FOLDER,
                                       "prompt": prompt(lock)}})
                i += 1
    return out


if __name__ == "__main__":
    reqs = requests()
    with open(os.path.join(HERE, "..", "assets", "props", "round2_requests.json"), "w") as fh:
        json.dump(reqs, fh, indent=1, ensure_ascii=False)
    print(len(reqs), "prop requests")
