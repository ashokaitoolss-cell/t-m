# Blue Crayon — "The Knock": scenes for video

The 16 storyboard shots are grouped into six scenes, each one continuous place and time, so
each scene is made as one batch with the same plates, cast and light.

How each scene is made (see `DIRECTION.md`):
1. Each continuous stretch of a scene is generated as one multi-shot sequence on Seedance 2.5,
   10–12 s long, with three or four cuts between close, wide, medium and insert. It is generated
   from character and location references, not from a start frame.
2. `scripts/cut.py` trims the shots out of the takes and joins them per `video/sceneN/edl.json`.
3. The scene goes into the edit.

The Seedream stills in `assets/knock/` are now look references, not start frames. Plates are
in `assets/locations/`. The cast is in `assets/painted/`, with single-view crops for video in
`assets/painted/video_refs/`.

Scene 1 is done: `video/scene1/scene1_cut_v1.mp4`, 15.4 s. With its close-ups and holds it runs
about 6 s over its slot in the table below, so the later scenes need tightening to bring the
film back near a minute.

| Scene | Time | Shots | Place | Who |
| --- | --- | --- | --- | --- |
| 1. Thrown out | 0:00–0:09 | 01–03 | Doorstep, night rain; front hall | Papa (suit), robot |
| 2. The first knock | 0:09–0:15 | 04–05 | Doorstep, sunny morning (flashback) | Boy, robot, Papa (work shirt) |
| 3. The crayon | 0:15–0:23 | 06–07 | Drawing corner, lamplight (flashback) | Boy, robot, Papa |
| 4. Give it to Papa | 0:23–0:31 | 08–09 | Bedroom, grey day (flashback) | Boy, robot |
| 5. Under the door | 0:31–0:45 | 10–13 | Doorstep, night rain; front hall | Robot, Papa (suit) |
| 6. The door opens | 0:45–0:57 | 14–16 | Doorstep, night rain | Papa (suit), robot |

## Scene 1 — Thrown out (0:00–0:09)

The hook. Cold blue rain; the only warm light is the open door, and then it's gone.

| Shot | Length | Start frame | What moves | Sound |
| --- | --- | --- | --- | --- |
| 01 | 3 s | `s01.jpg` (have) | Papa drags the robot over the wet pavement, drops it by the bins and turns back toward the door | Pouring rain, splashing steps, metal scraping on stone |
| 02 | 3 s | to make | The door slams and the warm light is cut off. The robot sits alone in the rain, hunched over the folded paper | The slam, then rain |
| 03a | 1.5 s | to make | Insert: small metal knuckles tap the door twice | *Knock-knock* |
| 03b | 1.5 s | `s03.jpg` (have) | Inside, Papa against the door, eyes shut, with a tiny flinch at the knock | A muffled *knock-knock*, rain on the glass |

## Scene 2 — The first knock (0:09–0:15, flashback)

A soft dissolve on the robot's flickering eyes into warm morning light.

| Shot | Length | Start frame | What moves | Sound |
| --- | --- | --- | --- | --- |
| 04 | 3 s | to make | A timid knock; the door opens; the boy looks down at the scared robot on the step and grins | A small *knock-knock*, birds, the street |
| 05 | 3 s | to make | Behind him, Papa shakes his head and points away; the boy grabs the robot's hand and pulls it inside | Footsteps, a giggle |

## Scene 3 — The crayon (0:15–0:23, flashback)

Warm lamplight. The four-note piano theme starts here.

| Shot | Length | Start frame | What moves | Sound |
| --- | --- | --- | --- | --- |
| 06 | 4 s | `s06.jpg` (have) | The boy wraps the tape around the crayon; the robot's eyes curve into happy arcs | *Rrrip*, a giggle, piano |
| 07a | 1.3 s | to make | Montage: two heads bent over one sheet of paper | Piano |
| 07b | 1.3 s | to make | Montage: the wall fills with drawings | Piano |
| 07c | 1.4 s | to make | Montage: Papa passes the doorway without looking in | Piano |

## Scene 4 — Give it to Papa (0:23–0:31, flashback)

Grey rain light. The film's only line.

| Shot | Length | Start frame | What moves | Sound |
| --- | --- | --- | --- | --- |
| 08 | 5 s | `s08.jpg` (have; redo the boy paler) | The boy presses the folded paper into the robot's hand and whispers | **"Give it to Papa... when he's sad."** Rain; the piano stops |
| 09 | 3 s | to make (same frame as 08, empty bed) | Nothing moves except the rain light on the wall | Rain, silence |

## Scene 5 — Under the door (0:31–0:45)

Back in the present. The robot gives up knocking and slides the drawing under the door.

| Shot | Length | Start frame | What moves | Sound |
| --- | --- | --- | --- | --- |
| 10 | 3 s | to make | The robot knocks once more, waits, then bends and slides the paper under the door | One knock, rain |
| 11 | 4 s | to make | Inside, the paper slides in and stops against Papa's shoe; his hand unfolds it | Paper on wood, rain |
| 12 | 4 s | `s12.jpg` (have) | The drawing in his hands; a slow push in, and a tremor in the hands | Rain, his breath |
| 13 | 3 s | to make | Close on Papa: his jaw holds, then breaks | His breath catching |

## Scene 6 — The door opens (0:45–0:57)

The same door and the same warm light as shot 01, but now it opens toward the robot.

| Shot | Length | Start frame | What moves | Sound |
| --- | --- | --- | --- | --- |
| 14 | 3 s | to make | The door flies open; warm light spills down onto the soaked robot looking up | The door, rain |
| 15 | 4 s | to make | Papa drops to his knees on the wet step and pulls the robot into his chest | A sob, rain |
| 16 | 5 s | `s16.jpg` (have) | Over his shoulder: rain runs down the visor like tears; the eyes stay wide and still | Rain; three of the four notes; then silence |
