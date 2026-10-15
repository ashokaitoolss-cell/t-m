# Blue Crayon — "The Knock": direction

How every shot is staged, framed, cut and animated, so the film plays like an animated feature.
It holds the rules, how they apply to this story, and how to write them into a video prompt.

## 1. Every shot carries one emotion

Each shot answers one question: **what should the audience feel here?** The framing, the
movement and the cut all serve that one feeling. If a shot is only information, combine it with
another shot or cut it.

- **Emotion first, geography second.** Open a beat on the feeling (a close-up), then cut wide to
  show what is happening. For example, Scene 1 opens on the robot's face as it is dragged
  helplessly down the steps, and only then goes wide to show the man, the open door and the
  rain.
- **Hold on the reaction, not the action.** The slam lasts a few frames; the robot's flinch and
  the dimming of its eyes get the hold.
- **Mystery is a feeling too.** In Scene 1 Papa is only a hand, a silhouette against the door
  light and a pair of legs. We see his face only once we are inside with him. That is why the
  hook works: *why would he do that?*

## 2. Cinematography

### Shot sizes, and when to use each

| Size | What it says | Use it for |
| --- | --- | --- |
| Wide | Where we are; how small someone is in it | Establishing, aloneness, the door rhyme in 01/04/14 |
| Medium | What someone is doing | Action that needs the body, two characters together |
| Close-up | What someone feels | Every emotional turn: fear, hurt, the jaw that breaks |
| Insert | The one detail that matters | The knock, the crayon tape, the paper under the door, the drawing |

- **Cut sizes in sequence, not at random.** Use one or two cuts per beat and change size each
  time, for example close → wide → medium → insert. Don't cut between two similar sizes; that
  reads as a jump cut.
- **Don't overdo it.** Two to four shots per generated sequence. A still frame with good acting
  beats a busy edit.

### Camera height, lens and movement

- **Camera height is point of view.**
  - Shoot the robot at its own eye level, so we are on its side.
  - Shoot Papa from below in the present, when he towers and is shut off.
  - Bring the camera down to his level only when he breaks (shot 13) and kneels (shot 15).
- **Lens.**
  - Wides use a wide lens, low and across the street, so the robot looks tiny in a big world.
  - Close-ups use a longer lens with a soft background, which isolates the face. This matches
    the lens falloff in `BRIEF.md`.
- **Movement has a motive.** Most shots are locked off; the cuts do the work.
  - The camera moves only when it is following something, such as tracking down the steps with
    the dragged robot.
  - Or when it is pushing toward a feeling, such as the slow push on the drawing in shot 12.
  - Never more than one camera move per shot.

### Continuity

- **Screen direction (the 180° rule).**
  - On the doorstep, the door is always on the right of frame.
  - Leaving home moves right → left (Papa drags the robot from the door to the bins).
  - Coming home moves left → right (the robot climbs back to knock; Papa opens the door toward
    it).
  - The camera stays on the street side of that line in every exterior.
- **Cut on action.** Change shots in the middle of a movement, such as the drop, the turn or the
  slam, so the cut hides inside it.
- **Eyelines match.** When the robot looks up at the door, the next shot of the door is from
  below.

### Light and colour tell the story

| Light | Meaning |
| --- | --- |
| Warm amber | Home and the boy |
| Cold blue | Grief |
| Grey | Loss |

- In shot 01 the warm light is turned against the robot: it spills out as the robot is thrown
  away, then the slam cuts it off.
- In shot 14 the same light spills out *toward* the robot. That is the rhyme the whole film is
  built on.
- Keep one key light per shot and let everything else fall into shadow.

## 3. Animation: the twelve principles applied

These are the principles from Disney's *The Illusion of Life*. They are what separate a feature
from floaty AI motion.

1. **Timing.** Real time at 24 fps, never slow motion.
   - A normal adult walk lands a step about every 12 frames (0.5 s). Papa in anger strides
     faster and heavier, at about 10 frames per step.
   - The robot is small, so its steps are short and quick.
   - A slam or impact takes 3–6 frames. Emotion gets the holds: 12–36 frames of stillness.
2. **Slow in and slow out.** Movements ease into and out of their key poses; mechanical,
   constant speed reads as AI.
   - The exception is a hard stop: the door slam and the drop into the puddle stop dead.
3. **Anticipation.** Before every big action comes a small opposite move.
   - Papa swings the robot back before he lets go.
   - The robot's hand rises and hesitates before it knocks.
   - Papa draws a breath before he breaks.
4. **Follow-through and overlapping action.** Parts stop at different times.
   - Papa's loose tie and jacket tails keep swinging after his step lands.
   - The robot's heavy head bobs and settles a beat after its body hits the ground.
5. **Squash and stretch, and weight.** The robot is metal and heavy for its size: it lands with
   a hard, short bounce and a splash, not a float. Papa's weight shows in his heel strikes on the
   steps.
6. **Arcs.** Swings, turns and head moves travel in curves: the fling toward the bins, the
   robot's look back over its shoulder.
7. **Staging.** One clear action per shot, readable in silhouette. Papa's dark shape is against
   the warm door; the robot's pale shape is against the dark street.
8. **Secondary action.** This is what keeps the frame alive without stealing focus: rain,
   ripples, steam of breath, a blink, fingers tightening on the folded paper.
9. **Exaggeration.** Push poses just past real: the robot's flinch, its head sinking low, Papa's
   fist on the drawing. Keep it within the grounded tone.
10. **Pose to pose.** Describe the key poses of each action in the prompt (start, extreme, end),
    and let the model fill the in-betweens.
11. **Solid drawing.** Volumes stay consistent. The references hold the designs, and the prompt
    names two or three fixed features of each character.
12. **Appeal.** The robot's appeal is in its eyes, so its expression range stays small (see the
    eye states in `BRIEF.md`). Papa's appeal is restraint: he is grieving, not a villain.

### Acting

- **Think, then act.** A character registers something (a beat), then reacts. For example, the
  slam lands, the robot flinches, holds, and only then do its eyes dim.
- **Small beats big.** Most of Papa's acting is in what he holds back: fingers tightening,
  swallowing, eyes squeezing shut. The one big release is the hug.
- **The robot never speaks.** Its acting is all posture, head angle and eyes.

## 4. Writing a sequence prompt

Each scene is generated as **multi-shot sequences from references, not from a start frame**.

**References.** Give 3–5 reference images, assigned at the top of the prompt in order.
- Each character gets a single-view full-body crop and a face crop from their sheet, in
  `assets/painted/video_refs/`. Multi-view sheets can read as several people.
- Add the scene's empty location plate from `assets/locations/`.

**Write the prompt in this order:**
1. **References.** Name what each image is, with two or three fixed features of each character.
   End with "Keep the characters and the place exactly as in the images."
2. **Style.** The painted look and the scene's one light.
3. **Shots.** `Shot 1:`, `Shot 2:` and so on, in story order. Within each shot:
   - shot size and camera (one move at most);
   - the action as key poses, with the emotion shown in the body;
   - the change in space or light;
   - sound in `<angle brackets>`.
   Leave the timing to the model; fixed seconds are unreliable.
4. **Motion.** "Real-time speed at 24 frames per second, never slow motion", plus the principles
   that matter in that scene.
5. **Constraints.** End with: no music (unless it is the piano theme), no speech (except the one
   line), no subtitles, no text, no logo, no watermark.

**Settings.** Use Seedance 2.5 in `omni_reference` mode, at 1080p, 16:9 and
`bitrate_mode: high`, with native sound on.
- Generate 10–12 s for three or four shots (192 credits for 12 s), then cut the shots apart
  and trim them in the edit with `scripts/cut.py`.
- In the Scene 1 test, Seedance 2.0 made the same cuts but looked glossier and more 3D, with a
  shakier close-up.
- Characters in a held pose can freeze into a still image. Always write secondary action into
  holds: breathing, rain light moving, a thumb, a blink.

## 5. Scene 1 as directed

**Outside**, one generation of 12 s:
1. **Close-up, tracking down the steps.** The robot is dragged by its wrist, its head jolting on
   every step, its eyes small, looking back up at the warm doorway. *Helpless.*
2. **Wide, low, across the street, locked off.** The whole picture: the open door's warm slab
   of light, the tall man in the funeral suit, the bins. He flings it and it sits down hard in
   a puddle. *What is happening?*
3. **Medium, at the robot's eye level.** The man goes back up out of focus; the slam cuts off
   the warm light. The robot flinches, holds, its eyes dim and it curls over the paper.
   *Abandoned.*
4. **Insert.** Its small hand rises, hesitates and knocks twice. *It won't give up.*

**Inside**, one generation of 7 s:
1. **Wide, low, down the dark hall.** Papa sits against the door, eyes shut, the red sneakers
   beside him. A muffled knock comes through the door, and he doesn't move. *Shut off.*
2. **Close-up on his face in blue rim light.** A second knock; his eyes squeeze tighter and he
   swallows. *He is hurting too.*

The prompts and job IDs are in `video/scene1/candidates.json`.
