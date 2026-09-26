/*
  scenekit — shared 2.5D scene runtime for the Duo explainer.

  Follows the stop-motion-cadence law (compositions/components/stop-motion-cadence.html):
  every frame the scene time is quantized FIRST, ts = floor(t * FPS) / FPS, and ts drives
  the camera, parallax planes, puppets and glints. Entrances, caption pops and scribble
  draws stay as ordinary smooth GSAP tweens on the same paused timeline (the guide keeps
  slides at 30 fps and the drawings at 15).

  Determinism: no Math.random, no clocks. Noise is a sin-hash of integer indices; every
  write is recomputed from tl.time(), so any seek order lands the same frame.

  Usage inside a scene sub-composition:
    SceneKit.mount("f01", {
      duration: 2.4,
      focus: [540, 900],                              // push-in target (px)
      camera: [{ t: 0, s: 1.0 }, { t: 2.4, s: 1.06 }], // eased keys: s, x, y, r
      punches: [{ t: 1.42, s: 1.2 }],                 // hard zoom jumps (multiplied in)
      planes: [{ id: "f01-bg", depth: 0.45 }, { id: "f01-sub", depth: 1 }],
      puppets: [{ id: "f01-duo", keys: [{ t: 0, y: 40 }, { t: 0.6, y: 0, ease: "back.out(2)" }] }],
      breathe: [{ id: "f01-duo" }],
      glints: [{ x: 700, y: 520, t: 0.8 }],
      build: function (tl, kit) { ...smooth tweens... }
    });
*/
(function (global) {
  "use strict";

  var FPS = 15;
  var W = 1080;
  var H = 1920;

  function hash(n) {
    var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  // Smooth 1D value noise in [-1, 1]; f = cycles per second.
  function noise(t, f, seed) {
    var x = t * f + seed * 17.37;
    var i = Math.floor(x);
    var fr = x - i;
    var a = hash(i + seed * 101.3) * 2 - 1;
    var b = hash(i + 1 + seed * 101.3) * 2 - 1;
    var u = fr * fr * (3 - 2 * fr);
    return a + (b - a) * u;
  }

  function lerp(a, b, p) {
    return a + (b - a) * p;
  }

  // Sample eased keyframes [{t, <prop>: v, ease}] for one prop at time t.
  // Each key's ease shapes the segment arriving at that key.
  function sample(keys, t, prop, fallback) {
    var have = [];
    for (var i = 0; i < keys.length; i++) if (keys[i][prop] !== undefined) have.push(keys[i]);
    if (!have.length) return fallback;
    if (t <= have[0].t) return have[0][prop];
    for (var k = 1; k < have.length; k++) {
      var a = have[k - 1];
      var b = have[k];
      if (t <= b.t) {
        var p = (t - a.t) / Math.max(1e-6, b.t - a.t);
        var ez = gsap.parseEase(b.ease || "power1.inOut");
        return lerp(a[prop], b[prop], ez(p));
      }
    }
    return have[have.length - 1][prop];
  }

  function el(id) {
    var node = document.getElementById(id);
    if (!node) throw new Error("scenekit: missing #" + id);
    return node;
  }

  function mount(id, cfg) {
    var D = cfg.duration;
    var focus = cfg.focus || [W / 2, H / 2];
    var camKeys = cfg.camera || [{ t: 0, s: 1 }];
    var punches = (cfg.punches || []).slice().sort(function (a, b) {
      return a.t - b.t;
    });
    var wig = cfg.wiggle || {};
    var ampX = wig.x !== undefined ? wig.x : 2.6;
    var ampY = wig.y !== undefined ? wig.y : 2.4;
    var ampR = wig.r !== undefined ? wig.r : 0.1;
    var wigF = wig.f !== undefined ? wig.f : 1.2;
    var seed = cfg.seed !== undefined ? cfg.seed : id.length * 7 + id.charCodeAt(id.length - 1);

    var planes = (cfg.planes || []).map(function (p) {
      var node = el(p.id);
      gsap.set(node, { transformOrigin: focus[0] + "px " + focus[1] + "px" });
      return { node: node, depth: p.depth, drift: p.drift || 0 };
    });
    var puppets = (cfg.puppets || []).map(function (p) {
      var node = el(p.id);
      if (p.origin) gsap.set(node, { transformOrigin: p.origin });
      return { node: node, keys: p.keys };
    });
    var breathers = (cfg.breathe || []).map(function (b) {
      return { id: b.id, amp: b.amp || 0.015, period: b.period || 2.6 };
    });
    var shakes = cfg.shake || [];
    var glints = (cfg.glints || []).map(function (g, i) {
      var node = document.createElement("div");
      node.className = "sk-glint";
      node.id = id + "-glint-" + i;
      node.appendChild(document.createElement("i"));
      el(cfg.glintLayer || id + "-ov").appendChild(node);
      return { node: node, x: g.x, y: g.y, t: g.t, life: g.life || 5, size: g.size || 1 };
    });

    function apply(time) {
      var step = Math.floor(time * FPS + 1e-6);
      var ts = step / FPS;

      var s = sample(camKeys, ts, "s", 1);
      var cx = sample(camKeys, ts, "x", 0);
      var cy = sample(camKeys, ts, "y", 0);
      var cr = sample(camKeys, ts, "r", 0);
      for (var p = 0; p < punches.length; p++) if (ts >= punches[p].t) s *= punches[p].s;

      var wx = noise(ts, wigF, seed) * ampX;
      var wy = noise(ts, wigF, seed + 1) * ampY;
      var wr = noise(ts, wigF * 0.7, seed + 2) * ampR;
      // Impact shakes: a short, decaying, high-frequency burst on top of the wiggle.
      for (var sh = 0; sh < shakes.length; sh++) {
        var u = (ts - shakes[sh].t) / shakes[sh].dur;
        if (u >= 0 && u < 1) {
          var a = shakes[sh].amp * (1 - u);
          wx += noise(ts, 11, seed + 5 + sh) * a;
          wy += noise(ts, 11, seed + 9 + sh) * a;
          wr += noise(ts, 9, seed + 13 + sh) * a * 0.06;
        }
      }

      for (var i = 0; i < planes.length; i++) {
        var pl = planes[i];
        var d = pl.depth;
        gsap.set(pl.node, {
          x: cx * d + wx * (0.6 + 0.4 * d) + pl.drift * ts,
          y: cy * d + wy * (0.6 + 0.4 * d),
          scale: 1 + (s - 1) * d,
          rotation: cr + wr,
        });
      }

      var breath = {};
      for (var b = 0; b < breathers.length; b++) {
        breath[breathers[b].id] =
          1 + breathers[b].amp * Math.sin((2 * Math.PI * ts) / breathers[b].period);
      }

      for (var q = 0; q < puppets.length; q++) {
        var pu = puppets[q];
        var k = pu.keys;
        gsap.set(pu.node, {
          x: sample(k, ts, "x", 0),
          y: sample(k, ts, "y", 0),
          rotation: sample(k, ts, "r", 0),
          scale: sample(k, ts, "s", 1),
          scaleY: sample(k, ts, "s", 1) * (breath[pu.node.id] || 1),
          opacity: sample(k, ts, "o", 1),
        });
      }
      for (var bb = 0; bb < breathers.length; bb++) {
        var isPuppet = false;
        for (var qq = 0; qq < puppets.length; qq++) if (puppets[qq].node.id === breathers[bb].id) isPuppet = true;
        if (!isPuppet) gsap.set(el(breathers[bb].id), { scaleY: breath[breathers[bb].id], transformOrigin: "50% 100%" });
      }

      if (cfg.onStep) cfg.onStep(ts, step);

      // Glints live an exact number of steps, alternating big / small-rotated like a
      // drawn twinkle.
      for (var g = 0; g < glints.length; g++) {
        var gl = glints[g];
        var since = step - Math.round(gl.t * FPS);
        if (since >= 0 && since < gl.life) {
          var big = since % 2 === 0;
          gsap.set(gl.node, {
            x: gl.x - 24,
            y: gl.y - 24,
            scale: gl.size * (big ? 1 : 0.6) * (since === gl.life - 1 ? 0.5 : 1),
            rotation: big ? 0 : 45,
            opacity: 1,
          });
        } else {
          gsap.set(gl.node, { opacity: 0 });
        }
      }
    }

    var tl = gsap.timeline({
      paused: true,
      onUpdate: function () {
        apply(tl.time());
      },
    });
    tl.to({ p: 0 }, { p: 1, duration: D, ease: "none" }, 0);

    var kit = {
      FPS: FPS,
      // Hand-drawn SVG stroke that draws on over `dur` seconds.
      draw: function (pathId, t, dur) {
        var path = el(pathId);
        var len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        tl.fromTo(
          path,
          { strokeDashoffset: len },
          { strokeDashoffset: 0, duration: dur || 0.35, ease: "power2.out", immediateRender: false },
          t,
        );
      },
      // Spring pop entrance (spring-pop-entrance rule).
      pop: function (targetId, t, from) {
        tl.fromTo(
          "#" + targetId,
          Object.assign({ scale: 0, opacity: 0 }, from || {}),
          { scale: 1, opacity: 1, duration: 0.32, ease: "back.out(2.2)", immediateRender: false },
          t,
        );
      },
      // Hard show / hide on an exact beat.
      show: function (targetId, t) {
        tl.set("#" + targetId, { opacity: 1 }, t);
      },
      hide: function (targetId, t) {
        tl.set("#" + targetId, { opacity: 0 }, t);
      },
    };
    if (cfg.build) cfg.build(tl, kit);

    apply(0);
    global.__timelines = global.__timelines || {};
    global.__timelines[id] = tl;
    return tl;
  }

  global.SceneKit = { mount: mount, noise: noise, hash: hash, FPS: FPS };
})(window);
