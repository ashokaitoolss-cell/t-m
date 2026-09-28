// Clock It! launch film — DOM timeline (type, the red dot, hairlines, rings, particles,
// living backgrounds). One paused GSAP timeline, built after the fonts load and registered
// at the end of the build. The 3D layer (assets/scene.js) renders from the same film time.
(function () {
  const B = (n) => n * 0.6; // 100 BPM
  const CX = 960, CY = 540, TOTAL = 38.4;
  const OLIVE = "#596047", CHARCOAL = "#242521", PAPER = "#f3efe6", OXIDE = "#913f3b";
  const tl = gsap.timeline({ paused: true });
  const $ = (id) => document.getElementById(id);
  const ctx = document.createElement("canvas").getContext("2d");
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

  function metrics(font) {
    ctx.font = font;
    const m = ctx.measureText("Hxgy");
    return { asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent };
  }
  // Measure with the same letter-spacing the CSS applies (em-based, so read the size).
  const width = (text, font, ls = null) => {
    ctx.font = font;
    const px = parseFloat(font.match(/(\d+(?:\.\d+)?)px/)[1]);
    const em = ls !== null ? ls : font.includes("Instrument Sans") ? -0.012 : 0;
    ctx.letterSpacing = `${em * px}px`;
    return ctx.measureText(text).width;
  };

  // Lay a line of words out absolutely inside `el`; returns word spans, x offsets, widths.
  function layWords(el, words, size, colorOf, ls = null) {
    const font = `500 ${size}px "Instrument Sans"`;
    const space = width(" ", font, ls);
    let x = 0;
    const spans = [], xs = [], ws = [];
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "word";
      s.textContent = w;
      s.style.left = `${x}px`;
      if (colorOf) s.style.color = colorOf(i);
      el.appendChild(s);
      const ww = width(w, font, ls);
      spans.push(s); xs.push(x); ws.push(ww);
      x += ww + space;
    });
    return { spans, xs, ws, total: x - space, font };
  }
  // Baseline offset from the top of a line box (line-height 1).
  function baseline(size, family = "Instrument Sans", weight = 500) {
    const m = metrics(`${weight} ${size}px "${family}"`);
    return (size - (m.asc + m.desc)) / 2 + m.asc;
  }

  function wordIn(t, span, { dy = 26, blur = 8, dur = 0.42, from = OLIVE, to = CHARCOAL, hold = 0.3 } = {}) {
    tl.fromTo(span, { opacity: 0, y: dy, filter: `blur(${blur}px)`, color: from },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: dur, ease: "power3.out", immediateRender: false }, t);
    if (from !== to) tl.to(span, { color: to, duration: 0.3, ease: "power1.inOut" }, t + hold);
  }
  function lineOut(t, targets, { dy = -28, blur = 10, dur = 0.34, stagger = 0.03 } = {}) {
    tl.to(targets, { opacity: 0, y: dy, filter: `blur(${blur}px)`, duration: dur, ease: "power2.in", stagger }, t);
  }

  // Deterministic character scramble from `a` to `b` over [t0, t1]; `accent` = [from, to]
  // character range of `b` to colour.
  function scramble(el, a, b, t0, t1, accent, accentColor) {
    const glyphs = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz0123456789/<>*";
    const n = Math.max(a.length, b.length);
    const proxy = { p: 0 };
    tl.fromTo(proxy, { p: 0 }, {
      p: 1, duration: t1 - t0, ease: "none", immediateRender: false,
      onUpdate() {
        const step = Math.floor(tl.time() * 30);
        let html = "";
        for (let i = 0; i < n; i++) {
          const at = 0.12 + (i / n) * 0.68;
          let ch;
          if (proxy.p >= at + 0.14) ch = b[i] || "";
          else if (proxy.p >= at) ch = (b[i] || a[i]) === " " ? " " : glyphs[Math.floor(hash(i * 37 + step) * glyphs.length)];
          else ch = a[i] || "";
          const acc = accent && i >= accent[0] && i < accent[1] && proxy.p >= at + 0.14;
          html += acc ? `<span style="color:${accentColor}">${ch}</span>` : ch;
        }
        el.innerHTML = html.replace(/ /g, "&nbsp;");
      },
    }, t0);
  }

  // Rings: expanding hairline circles from a hero edge.
  let ringN = 0;
  function rings(t, r0, r1, color, count = 2, gap = 0.14, cx = CX, cy = CY) {
    const g = $("rings");
    for (let i = 0; i < count; i++) {
      const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      c.setAttribute("cx", cx); c.setAttribute("cy", cy); c.setAttribute("r", r0);
      c.setAttribute("stroke", color); c.style.opacity = 0;
      c.id = `ring${ringN++}`;
      g.appendChild(c);
      tl.fromTo(c, { attr: { r: r0 }, opacity: 0.5 }, { attr: { r: r1 }, opacity: 0, duration: 1.1, ease: "power2.out", immediateRender: false }, t + i * gap);
    }
  }
  // Particles: small outline shapes that drift out from the hero and fade.
  let partN = 0;
  function particles(t, r0, color, count = 8, cx = CX, cy = CY, fade = 0.8) {
    const g = $("particles");
    const shapes = ["M -7 5 L 0 -7 L 7 5 Z", "M 0 -8 L 8 0 L 0 8 L -8 0 Z", "M -6 0 A 6 6 0 1 0 6 0 A 6 6 0 1 0 -6 0", "M -7 0 L 7 0 M 0 -7 L 0 7"];
    for (let i = 0; i < count; i++) {
      const k = partN++;
      const a = (i / count) * Math.PI * 2 + hash(k) * 0.6;
      const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
      p.setAttribute("d", shapes[k % shapes.length]);
      p.setAttribute("stroke", color);
      p.style.opacity = 0;
      g.appendChild(p);
      const r1 = r0 + 70 + hash(k + 9) * 80;
      tl.fromTo(p, { x: cx + Math.cos(a) * r0, y: cy + Math.sin(a) * r0, rotation: 0, scale: 0.4, opacity: 0 },
        { x: cx + Math.cos(a) * r1, y: cy + Math.sin(a) * r1, rotation: (hash(k + 3) - 0.5) * 240, scale: 1, opacity: 0.85,
          duration: 0.6, ease: "power3.out", immediateRender: false }, t + hash(k + 5) * 0.12);
      const f = fade / 0.8;
      tl.to(p, { opacity: 0, duration: 0.7 * f, ease: "power1.in" }, t + fade + hash(k + 7) * 0.3 * f);
    }
  }

  function build() {
    const dot = $("dot");
    gsap.set(dot, { x: CX, y: CY, scale: 0, opacity: 1 });

    // ------------------------------------------------ living backgrounds (finite loops)
    const loop = (el, prop, amp, period, phase = 0) => {
      const reps = Math.max(0, Math.floor(TOTAL / period) - 1);
      tl.fromTo(el, { [prop]: -amp }, { [prop]: amp, duration: period / 2, ease: "sine.inOut", yoyo: true, repeat: reps * 2 + 1, immediateRender: true }, phase);
    };
    loop($("pool"), "x", 70, 7.4); loop($("pool"), "y", 45, 5.6, 0.8);
    loop($("olive-pool"), "x", 110, 6.2, 0.3); loop($("olive-pool"), "y", 70, 4.8, 1.1);
    loop($("bk1"), "y", 40, 6.8, 0.2); loop($("bk2"), "x", 36, 7.6, 0.6); loop($("bk3"), "y", 30, 5.2, 1.4);

    // ================================================= ACT I — the problem (b0–b16)
    // The dot arrives; hairlines draw out of it into a cell.
    tl.to(dot, { scale: 1, duration: 0.45, ease: "back.out(3)" }, 0.3);
    const gh = [$("gh1"), $("gh2")], gv = [$("gv1"), $("gv2")];
    gsap.set(gh[0], { y: CY - 74, scaleX: 0, transformOrigin: "50% 50%" });
    gsap.set(gh[1], { y: CY + 74, scaleX: 0, transformOrigin: "50% 50%" });
    gsap.set(gv[0], { x: CX - 70, scaleY: 0, transformOrigin: "50% 50%" });
    gsap.set(gv[1], { x: CX + 70, scaleY: 0, transformOrigin: "50% 50%" });
    tl.to(gh, { scaleX: 1, duration: 0.9, ease: "expo.out", stagger: 0.06 }, B(1));
    tl.to(gv, { scaleY: 1, duration: 0.9, ease: "expo.out", stagger: 0.06 }, B(1) + 0.1);

    // "You build what comes next." types on eighth notes; the dot is the cursor, then the full stop.
    const L1 = ["You", "build", "what", "comes", "next"];
    const l1 = $("l1");
    const size = 84, bl = baseline(size);
    const w1 = layWords(l1, L1, size);
    const dotGap = 12;
    gsap.set(l1, { y: CY - bl + 30, x: CX });
    w1.spans.forEach((s) => gsap.set(s, { opacity: 0 }));
    const dotY = CY + 30 - 10; // resting on the baseline
    L1.forEach((_, i) => {
      const t = B(2.5) + i * 0.3;
      const partial = w1.xs[i] + w1.ws[i];
      const left = CX - (partial + dotGap + 18) / 2; // centre the partial line incl. the dot
      tl.to(l1, { x: left, duration: 0.36, ease: "power3.out" }, t);
      wordIn(t, w1.spans[i]);
      tl.to(dot, { x: left + partial + dotGap + 9, y: dotY, duration: 0.36, ease: "power3.out" }, t);
      tl.to(gv[0], { x: left - 56, duration: 0.42, ease: "power3.out" }, t);
      tl.to(gv[1], { x: left + partial + dotGap + 18 + 56, duration: 0.42, ease: "power3.out" }, t);
    });

    // Decode into "Then wear what everyone wears." — same dot, new line.
    const A = "You build what comes next", Bt = "Then wear what everyone wears";
    const font1 = w1.font;
    const wA = width(A, font1), wB = width(Bt, font1);
    const scr = document.createElement("span");
    scr.className = "word"; scr.style.left = "0px"; scr.style.opacity = 0;
    l1.appendChild(scr);
    const T2 = B(7);
    tl.set(w1.spans, { opacity: 0 }, T2);
    tl.set(scr, { opacity: 1, textContent: A }, T2);
    scramble(scr, A, Bt, T2, T2 + 0.62, [15, 23], OLIVE);
    const leftB = CX - (wB + dotGap + 18) / 2;
    tl.to(l1, { x: leftB, duration: 0.62, ease: "power2.inOut" }, T2);
    tl.to(dot, { x: leftB + wB + dotGap + 9, duration: 0.62, ease: "power2.inOut" }, T2);
    tl.to(gv[0], { x: leftB - 56, duration: 0.62, ease: "power2.inOut" }, T2);
    tl.to(gv[1], { x: leftB + wB + dotGap + 18 + 56, duration: 0.62, ease: "power2.inOut" }, T2);

    // The line lifts away; the full stop becomes the smartwatch's badge at dead centre.
    lineOut(B(9), [scr], { stagger: 0 });
    tl.to(gh, { scaleX: 0, opacity: 0, duration: 0.45, ease: "power3.in", stagger: 0.04 }, B(9));
    tl.to(gv, { x: CX, opacity: 0, duration: 0.45, ease: "power3.in" }, B(9));
    tl.to(dot, { x: CX, y: CY, scale: 96 / 18, duration: 0.56, ease: "power3.inOut" }, B(9));
    tl.to(dot, { opacity: 0, duration: 0.08, ease: "none" }, B(10) + 0.02);
    // After the implosion the dot takes back over from the shrinking badge, then breathes.
    tl.set(dot, { scale: 1, x: CX, y: CY }, B(13));
    tl.to(dot, { opacity: 1, duration: 0.1, ease: "none" }, 8.55);
    tl.to(dot, { scale: 1.28, duration: 0.3, ease: "sine.inOut", yoyo: true, repeat: 1 }, 8.95);

    // ================================================= ACT II — the watch (b16–b28)
    // The dot rides on top of the spinning-in centre cap, then hands over on landing.
    tl.to(dot, { opacity: 0, duration: 0.2, ease: "none" }, B(18) + 0.05);
    rings(B(18), 250, 470, OLIVE, 2);
    particles(B(18), 280, OLIVE, 8);

    // "An analog ● point of view." — the watch is the point.
    const fl = $("flankL"), fr = $("flankR");
    const wl = layWords(fl, ["An", "analog"], size);
    const wr = layWords(fr, ["point", "of", "view."], size, (i) => (i === 0 ? OLIVE : CHARCOAL));
    gsap.set(fl, { x: CX - 300 - wl.total, y: CY - bl + 30 });
    gsap.set(fr, { x: CX + 300, y: CY - bl + 30 });
    [...wl.spans, ...wr.spans].forEach((s) => gsap.set(s, { opacity: 0 }));
    wl.spans.forEach((s, i) => wordIn(B(20) + i * 0.3, s, { dy: 0, from: CHARCOAL, to: CHARCOAL }));
    wr.spans.forEach((s, i) => wordIn(B(21) + i * 0.3, s, { dy: 0, from: i === 0 ? OLIVE : CHARCOAL, to: i === 0 ? OLIVE : CHARCOAL }));
    wl.spans.forEach((s) => gsap.set(s, { x: -30 }));
    wr.spans.forEach((s) => gsap.set(s, { x: 30 }));
    tl.to(wl.spans, { x: 0, duration: 0.6, ease: "power3.out", stagger: 0.3 }, B(20));
    tl.to(wr.spans, { x: 0, duration: 0.6, ease: "power3.out", stagger: 0.3 }, B(21));
    tl.to(wl.spans, { x: -60, opacity: 0, filter: "blur(10px)", duration: 0.4, ease: "power2.in", stagger: 0.04 }, B(24.6));
    tl.to(wr.spans, { x: 60, opacity: 0, filter: "blur(10px)", duration: 0.4, ease: "power2.in", stagger: 0.04 }, B(24.6));

    // ================================================= ACT III — why it's different (b28–b44)
    const why = $("why");
    const whyY = 905 - baseline(76);
    function whyLine(words, tIn, tOut) {
      const holder = document.createElement("div");
      holder.className = "line on-olive";
      holder.style.fontSize = "76px";
      why.appendChild(holder);
      const w = layWords(holder, words, 76);
      gsap.set(holder, { x: CX - w.total / 2, y: whyY });
      w.spans.forEach((s) => gsap.set(s, { opacity: 0 }));
      w.spans.forEach((s, i) => wordIn(tIn + i * 0.14, s, { dy: 30, from: PAPER, to: PAPER, blur: 10 }));
      lineOut(tOut, w.spans, { stagger: 0.035 });
    }
    whyLine(["Olive,", "not", "black."], B(31), B(32.3));
    whyLine(["Fluted,", "not", "flashy."], B(34), B(36.6));
    whyLine(["Quiet,", "not", "smart."], B(37.6), B(40));
    rings(B(31) + 0.3, 215, 420, PAPER, 2);
    particles(B(31) + 0.3, 240, PAPER, 8);

    // ================================================= ACT IV — Clock It! (b44–b50)
    // The head collapses into the dot, which sits in the logo's interval, then becomes the "!".
    tl.set(dot, { x: CX, y: CY, scale: 0.9, opacity: 0 }, B(42.9));
    tl.to(dot, { opacity: 1, duration: 0.12, ease: "none" }, B(43.05));
    rings(B(45), 200, 380, OLIVE, 2);
    particles(B(45), 220, OLIVE, 6, CX, CY, 0.35); // gone before the wordmark arrives

    // A ballistic hop: x glides while y rises and falls on gravity curves. x arrives a beat
    // early so the last of the fall is straight down (never across a letter), then a squash
    // and two small rebounds in place make the contact tactile. Lands at t + dur.
    const hop = (t, x1, yLand, yPeak, dur, s) => {
      tl.to(dot, { x: x1, duration: dur * 0.85, ease: "sine.inOut" }, t);
      tl.to(dot, { keyframes: [
        { y: yPeak, duration: dur * 0.45, ease: "power2.out" },
        { y: yLand, duration: dur * 0.55, ease: "power2.in" },
        { y: yLand - 14, duration: 0.09, ease: "power2.out" },
        { y: yLand, duration: 0.09, ease: "power2.in" },
        { y: yLand - 4, duration: 0.05, ease: "power2.out" },
        { y: yLand, duration: 0.05, ease: "power2.in" },
      ] }, t);
      tl.to(dot, { keyframes: [
        { scaleX: s * 1.22, scaleY: s * 0.8, duration: 0.05, ease: "power2.out" },
        { scaleX: s, scaleY: s, duration: 0.4, ease: "elastic.out(1, 0.45)" },
      ] }, t + dur);
    };

    const mark = $("mark"), bang = $("bang"), tag = $("tagline");
    const mSize = 150, mbl = baseline(mSize);
    const wm = layWords(mark, ["Clock", "It"], mSize, null, -0.02);
    const markLeft = 783;
    gsap.set(mark, { x: markLeft, y: CY - mbl + 50 });
    wm.spans.forEach((s) => gsap.set(s, { opacity: 0 }));
    wm.spans.forEach((s, i) => wordIn(B(46.4) + i * 0.3, s, { dy: 40, from: CHARCOAL, to: CHARCOAL, blur: 12, dur: 0.5 }));
    const bangX = markLeft + wm.total + 18;
    const baseY = CY + 50;
    gsap.set(bang, { x: bangX, y: baseY - 108, scaleY: 0, transformOrigin: "50% 100%", opacity: 1 });
    tl.to(bang, { scaleY: 1, duration: 0.45, ease: "back.out(2)" }, B(47.1));
    // The dot hops from the logo's interval over the wordmark into place under the bar.
    tl.to(dot, { scale: 1.25, duration: 0.3, ease: "power2.out" }, B(46.6));
    hop(B(46.2), bangX + 5.5, baseY - 12, CY - 210, 0.55, 1.25);

    const tbl = baseline(40, "Inter", 400);
    gsap.set(tag, { x: markLeft + 6, y: baseY + 54 - tbl + 22, opacity: 0 });
    tag.textContent = "An analog point of view.";
    tl.fromTo(tag, { opacity: 0, y: baseY + 54 - tbl + 44 }, { opacity: 1, y: baseY + 54 - tbl + 22, duration: 0.5, ease: "power3.out", immediateRender: false }, B(48));

    // ================================================= ACT V — it isn't real (b50–b64)
    scramble(tag, "An analog point of view.", "This brand isn't real.", B(50.4), B(51.4), [11, 21], OXIDE);
    lineOut(B(52.2), [...wm.spans, bang, tag], { stagger: 0.05, dy: -36 });
    tl.to(dot, { x: CX, y: CY, scale: 1, duration: 0.6, ease: "power3.inOut" }, B(52.2));
    tl.to(dot, { opacity: 0, scale: 0, duration: 0.3, ease: "power2.in" }, B(53));

    // One slot rolls through everything that was generated.
    const slot = $("slot");
    const sSize = 96, sbl = baseline(sSize);
    const items = ["The idea.", "The product.", "The photos.", "The brand.", "This film."];
    const slotY = 905 - sbl;
    items.forEach((txt, i) => {
      const holder = document.createElement("div");
      holder.className = "line";
      holder.style.fontSize = `${sSize}px`;
      holder.textContent = txt;
      slot.appendChild(holder);
      const w = width(txt, `500 ${sSize}px "Instrument Sans"`);
      gsap.set(holder, { x: CX - w / 2, y: slotY + 50, opacity: 0 });
      const tIn = B(53) + i * 0.6;
      tl.fromTo(holder, { y: slotY + 50, opacity: 0, filter: "blur(10px)" }, { y: slotY, opacity: 1, filter: "blur(0px)", duration: 0.34, ease: "power3.out", immediateRender: false }, tIn);
      const tOut = i < items.length - 1 ? tIn + 0.6 : B(58.2);
      tl.to(holder, { y: slotY - 50, opacity: 0, filter: "blur(10px)", duration: 0.28, ease: "power2.in" }, tOut - 0.02);
    });

    // The wireframe collapses into the dot; the dot becomes the full stop of the final line.
    const fin = document.createElement("div");
    fin.className = "line";
    fin.style.fontSize = "104px";
    slot.appendChild(fin);
    const wf = layWords(fin, ["All", "made", "with", "AI"], 104, (i) => (i === 3 ? OLIVE : CHARCOAL));
    const fbl = baseline(104);
    const finLeft = CX - (wf.total + 14 + 20) / 2;
    gsap.set(fin, { x: finLeft, y: CY - fbl + 34 });
    wf.spans.forEach((s) => gsap.set(s, { opacity: 0 }));
    tl.set(dot, { x: CX, y: CY, scale: 0, opacity: 1 }, B(59.2));
    tl.to(dot, { scale: 1.15, duration: 0.3, ease: "back.out(3)" }, B(59.3));
    wf.spans.forEach((s, i) => wordIn(B(59.6) + i * 0.2, s, { dy: 34, from: i === 3 ? OLIVE : CHARCOAL, to: i === 3 ? OLIVE : CHARCOAL, blur: 10, dur: 0.5 }));
    // The dot rises out of the line as the words arrive, arcs over them and lands as the full stop.
    hop(B(59.6) - 0.05, finLeft + wf.total + 14 + 10, CY + 34 - 12, CY - 200, 1.0, 1.15);
    const sp = $("smallprint");
    sp.textContent = "Clock It! is a concept brand. Every part of it was made with AI.";
    const spW = width(sp.textContent, '400 30px "Inter"');
    gsap.set(sp, { x: CX - spW / 2, y: CY + 110, opacity: 0 });
    tl.fromTo(sp, { opacity: 0, y: CY + 128 }, { opacity: 1, y: CY + 110, duration: 0.6, ease: "power3.out", immediateRender: false }, B(61));
    // A breath of push-in to finish, never fully still.
    tl.fromTo($("type"), { scale: 1 }, { scale: 1.025, duration: TOTAL - B(59.6), ease: "none", transformOrigin: "50% 50%", immediateRender: false }, B(59.6));

    window.__timelines = window.__timelines || {};
    window.__timelines["main"] = tl;
    if (window.__hfForceTimelineRebind) window.__hfForceTimelineRebind();
  }

  Promise.all([
    document.fonts.load('500 84px "Instrument Sans"'),
    document.fonts.load('400 40px "Inter"'),
    document.fonts.load('500 40px "Inter"'),
  ]).then(build);
})();
