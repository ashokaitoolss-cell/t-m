"""First Light asset prompts. Fixed blocks are adapted from the Anerneq project skill (see
Anerneq, Decoded) and pasted verbatim into every prompt, so every asset shares one look.

Run it to print the prompts as JSON (for Higgsfield) and to rebuild ../ASSETS.md.
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))

# ------------------------------------------------------------------ FIXED BLOCKS (paste verbatim, never rewrite)

def STYLE(wide=True):
    ar = ", aspect ratio 21:9" if wide else ""
    return (f"Style: a real photographed frame of 65mm anamorphic FILM{ar} — indistinguishable from a still lifted out of a "
            "modern photochemical arthouse feature. Cinematic, filmic, MEGA-REAL, NOT a render, NOT 3D, NOT AI-CGI, "
            "NOT digital-clean. Absolute live-action naturalism. NOBODY can tell this is AI.")


def LIGHT(temp, source):
    return (f"LIGHT — PRACTICAL LIGHT ONLY, NIGHT, DIM & {temp} (KEY): {source} Deep shadow, real falloff, strong "
            "chiaroscuro, low-key, underexposed. NO bright light, NO studio light, NO flat even light, NO fill light, "
            "NO daylight, NO milky blacks.")


def NO_FLARES(contain):
    return f"No lens flares, no light streaks, no floating bokeh orbs, no glow overlays. {contain}"


def ANAMORPHIC(wide=True):
    ar = "21:9 aspect ratio, " if wide else ""
    return (f"HARD ANAMORPHIC LENS (KEY): true 65mm ANAMORPHIC — {ar}strong squeeze, edge distortion, oval bokeh, "
            "shallow cinemascope focus, anamorphic breathing; heavy organic film grain, halation, slight softness — "
            "NOT over-sharpened, NOT digital-clean, NOT crisp AI look.")


def CAPTURE(materials):
    return (f"HYPER-REAL CAPTURE: real 65mm film (Vision3 500T pushed), heavy organic grain, softer than digital, "
            f"MEGA-REAL. OVER-real: {materials}. If any surface looks clean, smooth, plastic, CGI or rendered — WRONG.")


def COLOUR(where):
    return (f"COLOUR: graphite and deep cold blue everywhere; warm amber only where a person made the light by hand — "
            f"{where}. No teal-and-orange grade, no saturated colour, no HDR.")


SPINE = ("NOT: centred, symmetrical, bright light, daylight, flat even light, milky blacks, plastic skin, waxy, smooth "
         "skin, clean faces, modern clothes, lens flare, subtitles, captions, on-screen text, watermark, over-sharpened, "
         "clean 4K, digital clean, CGI, 3D render, doll, HDR glow, warped hands, extra fingers, teal-and-orange grade, "
         "sodium-orange streetlight, light rays from nowhere, modern cars, phones, neon")


def NEG(extra="", letters=True):
    s = SPINE + (", letters" if letters else "")
    return s + (", " + extra if extra else "") + "."


# Reference sheets: costume and props on a flat grey ground, read as objects, not scenes (Anerneq assets).
def SHEET(subject, materials):
    return ("Flat mid-grey seamless ground, even neutral grey, no seam, no gradient, no floor line. One broad soft source "
            "from camera-left and slightly above, a soft shadow falling right, no rim light, no hair light. "
            f"{subject} reads matte at its true colour, never cool-shifted by the grey. Real 65mm film capture "
            "(Vision3 500T), fine organic grain, softer than digital, NOT digital-clean. "
            f"OVER-real: {materials}. If any surface looks clean, smooth, plastic, CGI or rendered — WRONG.")


SHEET_NEG = ("NOT: text, labels, logos, brand names, watermark, captions, frame borders, mannequin, furniture, CGI, "
             "3D render, plastic sheen, glossy, digital clean")

# Describe, don't name: naming "a bulb in a wire cage" makes the model draw the bulb in frame.
LAMP = ("the only light is warm tungsten light falling from above and to camera-right, from a source outside the "
        "frame about a metre away; it lands on the near side of the face, the brow ridge and the cheekbone; the far "
        "side of the face falls into darkness; the background is bare brick lost in black.")

# ------------------------------------------------------------------ ASSETS

GRANDPA = ("a tall, stooped man with a long weathered face: deep lines across the forehead and around the eyes, sunken "
           "cheeks, heavy grey eyebrows, deep-set dark brown eyes, a large straight nose, thin lips, white-grey hair "
           "thinning at the crown and combed back, three days of grey stubble, olive skin gone leathery with faint age "
           "spots at the temples")
GRANDPA_COSTUME = ("a long charcoal-grey hand-knitted wool cardigan, hip length, pilled and worn thin at the elbows and "
                   "cuffs, a darned patch on the left elbow, five dark horn buttons, the pockets stretched out of shape; "
                   "under it a faded pale grey-blue cotton shirt with a soft frayed collar, buttoned to the top, no tie; "
                   "reading glasses with thin tortoiseshell frames hanging on a thin black cord at the chest; "
                   "high-waisted baggy dark brown wool trousers with an old crease; heavy brown leather lace-up shoes, "
                   "scuffed and creased at the toes. Everything old, worn and cared for, nothing new")
GIRL = ("a small girl of about nine with a round face: olive skin, dark brown eyes, thick straight dark eyebrows, a small "
        "straight nose, lips chapped from the cold, cheeks flushed, shoulder-length dark brown hair damp and flattened by "
        "rain with a few wet strands stuck to the forehead and cheek")
GIRL_COAT = ("a navy-blue wool duffel coat two sizes too big: the hem below the knees, the sleeves rolled back twice at the "
             "cuffs, four pale horn toggles on rope loops, a deep hood hanging at the back, the wool soaked darker at the "
             "shoulders and hem by rain; dark grey corduroy trousers; black rubber boots, wet and scuffed")
GIRL_JUMPER = ("an oatmeal cable-knit wool jumper, slightly too big, the neck stretched and the cuffs pushed up; dark grey "
               "corduroy trousers worn pale at the knees; black rubber boots, wet and scuffed")

ASSETS = [
    # ---------------- characters
    dict(tag="@GRANDPA", kind="character", part="face base", model="soul_cinematic", ar="3:4", n=3, prompt=" ".join([
        f"Close-up portrait lit the way the film lights it: {GRANDPA}. A charcoal knitted cardigan collar and a faded "
        "grey-blue shirt at the bottom of frame, tortoiseshell reading glasses hanging on a black cord. His face sits "
        "off-centre in the right half of the frame; he looks down and to camera-left, as if watching something in "
        "someone else's hands; mouth closed, face still, one brow a fraction higher than the other; his pupils are "
        "wide in the dark with one small warm catchlight.",
        LIGHT("WARM", LAMP), STYLE(False), ANAMORPHIC(False), NO_FLARES("No light source visible anywhere in frame."),
        CAPTURE("deep wrinkles and pores, grey stubble catching the light, loose wool fibres of the cardigan, the "
                "scratched lenses of the glasses"),
        COLOUR("the warm light on his face; everything the light does not reach falls to graphite black"),
        NEG("beauty retouch, youthful skin, smiling, looking at camera, light bulb in frame, lamp in frame")])),
    dict(tag="@GIRL", kind="character", part="face base", model="soul_cinematic", ar="3:4", n=3, prompt=" ".join([
        f"Close-up portrait lit the way the film lights it: {GIRL}. The stretched neck of an oatmeal cable-knit jumper at "
        "the bottom of frame. Her face sits off-centre in the left half of the frame; she looks up and to camera-right "
        "at someone much taller, lips slightly parted, holding her breath; her eyes are alive, pupils wide in the dark, "
        "one small warm catchlight.",
        LIGHT("WARM", LAMP), STYLE(False), ANAMORPHIC(False), NO_FLARES("No light source visible anywhere in frame."),
        CAPTURE("the wet strands of hair, the chapped lips, fine skin texture and cold-flushed cheeks, the wool of the "
                "jumper"),
        COLOUR("the warm light on her face; everything the light does not reach falls to graphite black"),
        NEG("makeup, beauty retouch, glossy lips, smiling, looking at camera, adult face, light bulb in frame, lamp in frame")])),
    dict(tag="@GRANDPA", kind="character", part="costume front + back", model="soul_2", ar="16:9", n=2, prompt=" ".join([
        "Costume reference sheet, two panels side by side on one flat mid-grey seamless ground: the left panel shows the "
        "costume from the front, the right panel shows the same costume from the back. The costume is worn by a tall, "
        "lean, slightly stooped man standing straight with his arms relaxed at his sides, framed from the collarbone "
        "down to the shoes in both panels, so the head is out of frame and the garment is the only subject. The "
        f"costume: {GRANDPA_COSTUME}.",
        SHEET("The costume", "the knit of the wool and its pilling, the darn on the elbow, the frayed shirt collar, the "
              "creases and scuffs of the leather shoes"),
        SHEET_NEG + ", head, face, second person, props, new clothes, modern clothes."])),
    dict(tag="@GIRL", kind="character", part="coat front + back", model="soul_2", ar="16:9", n=2, prompt=" ".join([
        "Costume reference sheet, two panels side by side on one flat mid-grey seamless ground: the left panel shows the "
        "costume from the front, the right panel shows the same costume from the back. The costume is worn by a small, "
        "slight girl of about nine standing straight with her arms relaxed at her sides, framed from the collarbone "
        "down to the boots in both panels, so the head is out of frame and the garment is the only subject. The "
        f"costume: {GIRL_COAT}.",
        SHEET("The costume", "the felted navy wool and its rain-darkened patches, the horn toggles and rope loops, the "
              "rolled cuffs, the wet rubber of the boots"),
        SHEET_NEG + ", head, face, second person, props, new clothes, modern clothes, bright colours."])),
    dict(tag="@GIRL_BOOTH", kind="character", part="coat off (booth state)", model="soul_2", ar="3:4", n=2, prompt=" ".join([
        "Costume reference, one full-length view on a flat mid-grey seamless ground: a small, slight girl of about nine "
        "standing straight, arms relaxed, framed from the collarbone down to the boots, so the head is out of frame and "
        f"the garment is the only subject. The costume: {GIRL_JUMPER}.",
        SHEET("The costume", "the cable knit of the jumper, the worn corduroy wales, the wet rubber of the boots"),
        SHEET_NEG + ", head, face, second person, props, new clothes, modern clothes, bright colours."])),
    dict(tag="@GRANDPA_HANDS", kind="character", part="hands", model="soul_cinematic", ar="16:9", n=2, prompt=" ".join([
        "Hand reference on a flat mid-grey seamless ground, two views side by side: on the left the backs of both hands "
        "resting flat, on the right both palms turned up. Only the hands and the charcoal knitted cardigan cuffs at the "
        "wrists. Large, heavy hands of a tall stooped man who has worked machines all his life: thick fingers, big "
        "knuckles, dark hair on the backs of the hands, raised veins, small old pale burn scars on the fingertips, "
        "short clean nails with a thin line of black machine grease in the cuticles, deep palm creases.",
        SHEET("The skin", "the scars, the grease in the cuticles, the hair on the backs of the hands, the wool of the cuffs"),
        SHEET_NEG + ", face, second person, props, rings, jewellery, manicure, smooth young skin, extra fingers."])),
    dict(tag="@GIRL_HANDS", kind="character", part="hands", model="soul_cinematic", ar="16:9", n=2, prompt=" ".join([
        "Hand reference on a flat mid-grey seamless ground, two views side by side: on the left the backs of both hands "
        "resting flat, on the right both palms turned up. Only the hands and the pushed-up oatmeal jumper cuffs at the "
        "wrists. Small, slim hands of a girl of about nine: narrow fingers, short unpainted nails, knuckles pink from "
        "the cold, a faint scrape on one knuckle. These hands must never look like a grown man's hands.",
        SHEET("The skin", "fine skin texture, cold-pink knuckles, the wool of the cuffs"),
        SHEET_NEG + ", face, second person, props, rings, jewellery, nail polish, adult hands, extra fingers."])),

    # ---------------- props (shot like museum objects on plain grounds)
    dict(tag="@PROJECTOR", kind="prop", part="hero", model="soul_cinematic", ar="16:9", n=2, prompt=" ".join([
        "Museum object photograph, the whole object in frame with space around it, seen three-quarter from slightly "
        "above: a heavy mid-century cinema film projector standing on a cast-iron pedestal, about the height of a man. "
        "Dark green-grey enamel chipped to bare iron at the edges; a tall lamp house at the back with vent louvres and a "
        "short chimney; two large round spoked metal reels on arms, one above and one below, the upper reel loaded with "
        "dark film; the film path running down through a gate beside a brass lens barrel that points forward; oil "
        "stains and paint worn bright on the handles.",
        SHEET("The machine", "chipped enamel, bare iron, oil film, worn brass, dust in the vent louvres"),
        SHEET_NEG + ", people, hands, modern equipment, digital projector, other objects."])),
    dict(tag="@PROJECTOR_GATE", kind="prop", part="threading detail", model="soul_cinematic", ar="16:9", n=2, prompt=" ".join([
        "Close detail photograph of the threading side of an old cinema film projector: a brass gate with a small "
        "rectangular aperture, two toothed sprocket wheels, and a strip of dark 35mm film threaded down through the gate "
        "and round the sprockets in two loose loops, the perforations catching the light. Oil on the steel, paint worn "
        "bright where fingers have threaded it for fifty years.",
        LIGHT("WARM", "the only light is one bare tungsten bulb above and to camera-right; it rakes across the sprocket "
              "teeth and the brass gate; the rest of the machine falls into black."),
        STYLE(False), ANAMORPHIC(False), NO_FLARES("The bulb stays out of frame."),
        CAPTURE("sprocket teeth, film perforations, oil on steel, worn brass, dust"),
        COLOUR("the warm light of the bulb on the metal"),
        NEG("people, hands, modern equipment, digital parts")])),
    dict(tag="@FILM_CANS", kind="prop", part="old cans + the new can", model="soul_cinematic", ar="16:9", n=2, prompt=" ".join([
        "Museum object photograph, seen three-quarter from slightly above: a leaning stack of old round metal film cans, "
        "dented, rusted at the rims, paint scratched and worn, and beside them one new film can, clean and unscratched "
        "bright silver aluminium that catches the light. The new can's paper label is on the side turned away from the "
        "camera, so no writing is visible anywhere.",
        SHEET("The metal", "rust blooms, dents, scratched paint, the flawless bright aluminium of the one new can"),
        SHEET_NEG + ", readable labels, people, hands, other objects."])),
    dict(tag="@SWITCH", kind="prop", part="hero", model="soul_cinematic", ar="16:9", n=2, prompt=" ".join([
        "Museum object photograph, seen almost straight on and slightly from the side: an old black bakelite rotary "
        "switch with a ridged pointer knob, mounted on a rectangular grey-painted steel plate with four slotted screws. "
        "The paint is rubbed away to bright metal in a crescent around the knob where thumbs have turned it for decades; "
        "two positions marked only by small engraved dots.",
        SHEET("The switch", "bakelite with fine scratches, rubbed paint, bright worn steel, slotted screw heads"),
        SHEET_NEG + ", engraved words, numbers, people, hands, modern switch, plastic."])),
    dict(tag="@BOOTH_LAMP", kind="prop", part="hero", model="soul_cinematic", ar="16:9", n=2, prompt=" ".join([
        "Museum object photograph, seen from the side and slightly below: an old industrial work lamp, a bare clear "
        "tungsten bulb inside a round steel wire cage, hung from a steel hook on a cloth-covered cable. The bulb is "
        "switched on and glows warm; dust on the cage wires.",
        SHEET("The lamp", "the glowing filament, the dusty wire cage, the frayed cloth cable"),
        SHEET_NEG + ", people, hands, modern LED bulb, other objects."])),
    dict(tag="@MARQUEE_BULBS", kind="prop", part="marquee edge", model="soul_cinematic", ar="16:9", n=2, prompt=" ".join([
        "Museum object photograph: a section of an old cinema marquee edge, a painted riveted steel strip carrying a row "
        "of clear round incandescent bulbs in brass sockets. The nearest bulb is lit, its filament glowing orange-amber; "
        "the rest of the row is unlit. Raindrops bead on the glass.",
        SHEET("The marquee edge", "rivets, flaking paint, brass sockets, raindrops on glass, the glowing filament"),
        SHEET_NEG + ", letters, people, hands, LED, other objects."])),

    # ---------------- locations (plates: no people, lit the way the film lights them)
    dict(tag="@CINEMA_EXT_NIGHT", kind="location", part="1.1 wide · marquee dark", model="soul_cinematic", ar="21:9", n=2, prompt=" ".join([
        "Location plate, no people. Night, steady rain. A wide frame from across a narrow cobbled street, taken from under "
        "the dripping scalloped edge of a shop awning that crosses the top of frame. A small single-screen cinema fills "
        "the right two-thirds: a 1950s rendered facade, dark; a projecting marquee with rows of unlit bulbs and a blank "
        "letter board; dark glass front doors; a narrow side door at the far right edge. A single street lamp stands on "
        "the left third. The street is empty: no cars, no shop signs, no lit windows. Horizon a few degrees off level.",
        LIGHT("COLD", "the only light is the single cold blue-white street lamp on the left; the rain shows only inside its "
              "cone; the cobbles shine wet in its pool and go black beyond it; the cinema facade is barely lifted out "
              "of the dark."),
        STYLE(), ANAMORPHIC(), NO_FLARES("The lamp stays a small contained source."),
        CAPTURE("wet cobbles, rain streaks in the lamp cone, peeling render, rust on the marquee edge, water beading on "
                "the unlit bulbs"),
        COLOUR("nowhere in this frame; nobody has made a light here yet"),
        NEG("people, cars, lit windows, lit marquee")])),
    dict(tag="@CINEMA_EXT_LIT", kind="location", part="4.2 wide · marquee lit", model="soul_cinematic", ar="21:9", n=2, prompt=" ".join([
        "Location plate, no people. Night, steady rain. A wide frame from across a narrow cobbled street, taken from under "
        "the dripping scalloped edge of a shop awning that crosses the top of frame. A small single-screen cinema fills "
        "the right two-thirds: a 1950s rendered facade; a projecting marquee now lit, its rows of bulbs glowing warm "
        "amber, the lit letter board reading KLING 4.0 in large black letters on the top line and NOW SHOWING in "
        "smaller black letters below; warm light spilling from under the marquee onto the wet pavement; a narrow side "
        "door at the far right edge. A single cold street lamp on the left third. The street is empty: no cars, no shop "
        "signs. Horizon a few degrees off level.",
        LIGHT("COLD", "two sources only: the cold blue-white street lamp on the left with rain showing inside its cone, and "
              "the warm lit marquee on the right, its light dying on the pavement a few metres out; between them the "
              "street stays dark."),
        STYLE(), ANAMORPHIC(), NO_FLARES("The bulbs stay small contained points."),
        CAPTURE("wet cobbles, rain streaks in both pools of light, peeling render, the glowing bulb filaments, the black "
                "letters on the lit board"),
        COLOUR("the lit marquee and its spill on the wet pavement"),
        NEG("people, cars, lit windows, any other text or signs", letters=False)])),
    dict(tag="@SIDE_DOOR", kind="location", part="1.2 medium", model="soul_cinematic", ar="21:9", n=2, prompt=" ".join([
        "Location plate, no people. Night, rain. A narrow wooden side door in a dark brick wall, framed medium from "
        "slightly low and about thirty degrees off the door's axis from the left. The door stands open inward onto the "
        "bottom of a stairwell. Rain streaks are visible where they cross the light at the threshold.",
        LIGHT("COLD", "the only light is warm tungsten spilling out through the open door from a bulb inside the stairwell; "
              "it paints the threshold and a tongue of the wet cobbles and dies within two metres; outside it the wall "
              "and street are cold blue and dark."),
        STYLE(), ANAMORPHIC(), NO_FLARES("The bulb inside stays out of sight."),
        CAPTURE("wet brick, flaking paint on the door, a worn brass handle, the wet cobbles in the spill"),
        COLOUR("the warm spill from the open door"),
        NEG("people, signs, lit windows")])),
    dict(tag="@STAIRWELL", kind="location", part="1.3 close-side", model="soul_cinematic", ar="21:9", n=2, prompt=" ".join([
        "Location plate, no people. A narrow steep flight of iron stairs with diamond-plate treads and open risers, "
        "rising from left to right against bare brick, seen side-on from low, close to the treads. Wet footprints on the "
        "treads, water dripping from the edges.",
        LIGHT("WARM", "the only light is a caged tungsten bulb at the top of the flight, out of frame above right; it "
              "catches the edges of the upper treads warm; the bottom of the flight falls into darkness."),
        STYLE(), ANAMORPHIC(), NO_FLARES("The bulb stays out of frame."),
        CAPTURE("diamond-plate iron worn smooth in the middle of each tread, rust, wet footprints, water drops, damp brick"),
        COLOUR("the warm light of the bulb on the upper treads"),
        NEG("people, feet, handrail signs")])),
    dict(tag="@BOOTH", kind="location", part="2.1 wide from the door corner", model="soul_cinematic", ar="21:9", n=2, prompt=" ".join([
        "Location plate, no people. A cramped projection booth, seen from the corner by the door at head height, the low "
        "ceiling of dark beams in frame. Bare brick walls. A heavy cast-iron cinema projector stands middle-right on its "
        "pedestal with two big film reels on its arms, its lens pointing through a small square port window in the far "
        "wall into darkness. Wooden shelves on the left wall stacked with dented old round film cans, and among them "
        "one clean bright silver can. A wooden crate on the floor near the projector. A nail on the right wall.",
        LIGHT("WARM", "the only light is one bare tungsten bulb in a wire cage on the right wall; it makes a warm pool "
              "around the projector; everything beyond two metres falls into black."),
        STYLE(), ANAMORPHIC(), NO_FLARES("The bulb stays a small contained source."),
        CAPTURE("bare brick, chipped enamel on the projector, rust on the old cans, the one bright silver can, dust in "
                "the air, worn floorboards"),
        COLOUR("the pool of the caged bulb; the port window stays black"),
        NEG("people, readable labels, modern equipment, digital projector, computers")])),
    dict(tag="@BOOTH_PORT_WALL", kind="location", part="booth front wall · ports", model="soul_cinematic", ar="21:9", n=2, prompt=" ".join([
        "Location plate, no people. Inside a cramped projection booth, looking at the front wall: two small square "
        "glass ports side by side in bare brick, the larger one with the brass lens of a cast-iron projector pressed up "
        "to it, the smaller one a viewing window at head height; through both ports only the darkness of a big empty "
        "auditorium. A worn black rotary switch on a steel plate on the wall beside the projector.",
        LIGHT("WARM", "the only light is a caged tungsten bulb behind camera-right; it grazes the brick and the projector; "
              "the ports stay black."),
        STYLE(), ANAMORPHIC(), NO_FLARES("No reflections of the bulb in the port glass."),
        CAPTURE("bare brick, chipped enamel, worn brass, the scratched bakelite switch, dust on the glass"),
        COLOUR("the bulb's light on the wall"),
        NEG("people, reflections, readable labels, modern equipment")])),
    dict(tag="@AUDITORIUM", kind="location", part="3.2 reverse · beam on", model="soul_cinematic", ar="21:9", n=2, prompt=" ".join([
        "Location plate, no people. A dark, empty single-screen auditorium seen from low among the seats, about row six, "
        "looking back and up at the rear wall. Rows of worn velvet seat backs in silhouette fill the lower third. High "
        "on the rear wall a small square projection port; a projector beam fires out of it and passes above the camera "
        "toward a screen behind the camera, dust turning slowly inside the beam. The screen is never visible.",
        LIGHT("WARM", "the only light is the projector beam itself; it lights the dust inside it and faintly grazes the "
              "tops of the nearest seat backs; the walls and ceiling stay black."),
        STYLE(), ANAMORPHIC(), NO_FLARES("The beam never hits the lens; the port stays a small contained source."),
        CAPTURE("dust in the beam, worn velvet nap on the seat tops, the rear wall's old plaster"),
        COLOUR("the projector beam"),
        NEG("people, screen, exit signs, modern seats")])),
    dict(tag="@PORT_EXTERIOR", kind="location", part="3.3 port from the auditorium side", model="soul_cinematic", ar="21:9", n=2, prompt=" ".join([
        "Location plate, no people. The rear wall of a dark auditorium high up, seen straight on at the height of a small "
        "rectangular glass viewing port set in the wall: a thick old frame around the glass, the wall around it black. "
        "Through the glass, the inside of the booth is dark except for flickering light bouncing back from the screen. "
        "The glass is clean and shows no reflections.",
        LIGHT("WARM", "the only light is the flicker of the projected film bouncing back off the screen onto the port "
              "glass and the booth's back wall; the auditorium wall around the port stays black."),
        STYLE(), ANAMORPHIC(), NO_FLARES("No reflections in the glass."),
        CAPTURE("old plaster, the worn wooden frame of the port, fine dust on the glass"),
        COLOUR("the warm flicker through the glass"),
        NEG("people, faces, reflections, exit signs")])),
]


def requests_json():
    out = []
    i = 0
    for a in ASSETS:
        for _ in range(a["n"]):
            out.append({"index": i, "tag": a["tag"], "part": a["part"],
                        "params": {"model": a["model"], "aspect_ratio": a["ar"], "quality": "2k",
                                   "prompt": a["prompt"],
                                   "folder_id": "bacdfb1d-ac88-4446-a945-24b7dc558d01"}})
            i += 1
    return out


if __name__ == "__main__":
    reqs = requests_json()
    with open(os.path.join(HERE, "asset_requests.json"), "w") as fh:
        json.dump(reqs, fh, indent=1, ensure_ascii=False)
    print(len(reqs), "requests;", len(ASSETS), "assets")
    for a in ASSETS:
        print(f'{a["tag"]:<18} {a["part"]:<34} {a["model"]:<15} {a["ar"]:<5} x{a["n"]}  {len(a["prompt"].split())} words')
