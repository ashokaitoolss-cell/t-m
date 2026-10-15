// Builds a .docx screenplay (Hollywood format) from a .fountain file, written next
// to it with the same name. Defaults to SCRIPT.fountain. Run from videos/blue-crayon:
//   NODE_PATH=$(npm root -g) node scripts/build_script.js [path/to/file.fountain]
// then convert to PDF:
//   soffice --headless --convert-to pdf SCRIPT.docx
//
// Handles the Fountain subset the script uses: title page keys, scene headings
// (INT./EXT. or forced with "."), forced action ("!"), character cues with
// parentheticals and dialogue, transitions ("... TO:" or forced with ">"),
// and centred text (">text<").

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, Header, PageNumber, PageBreak,
} = require("docx");

const FONT = "Courier New";
const SIZE = 24; // 12pt in half-points

let sceneNum = 0;
const run = (text, opts = {}) => new TextRun({ text, font: FONT, size: opts.size || SIZE, bold: !!opts.bold });

const slug = (t) => {
  sceneNum++;
  return new Paragraph({
    spacing: { before: 360, after: 240, line: 240 },
    keepNext: true,
    children: [run(`${sceneNum}  ${t.toUpperCase()}`, { bold: true })],
  });
};
const action = (t, after = 240) =>
  new Paragraph({ spacing: { before: 0, after, line: 240 }, children: [run(t)] });
const character = (t) =>
  new Paragraph({ spacing: { before: 0, after: 0, line: 240 }, indent: { left: 3168 }, keepNext: true, children: [run(t.toUpperCase())] });
const paren = (t) =>
  new Paragraph({ spacing: { before: 0, after: 0, line: 240 }, indent: { left: 2304, right: 2880 }, keepNext: true, children: [run(t)] });
const dial = (t, last) =>
  new Paragraph({ spacing: { before: 0, after: last ? 240 : 0, line: 240 }, indent: { left: 1440, right: 2160 }, children: [run(t)] });
const trans = (t) =>
  new Paragraph({ spacing: { before: 0, after: 240, line: 240 }, alignment: AlignmentType.RIGHT, children: [run(t.toUpperCase(), { bold: true })] });
const center = (t, opts = {}) =>
  new Paragraph({ spacing: { before: opts.before ?? 0, after: opts.after ?? 240, line: 240 }, alignment: AlignmentType.CENTER, children: [run(t, opts)] });

const input = path.resolve(process.argv[2] || path.join(__dirname, "..", "SCRIPT.fountain"));
const src = fs.readFileSync(input, "utf8").replace(/\r/g, "");
const [titleBlock, ...rest] = src.split(/\n\s*\n/);
const title = Object.fromEntries(
  titleBlock.split("\n").map((l) => { const i = l.indexOf(":"); return [l.slice(0, i).trim().toLowerCase(), l.slice(i + 1).trim()]; })
);
const blocks = rest.map((b) => b.split("\n").filter((l) => l.trim() !== "")).filter((b) => b.length);

const isUpper = (s) => /[A-Z]/.test(s) && s === s.toUpperCase();
const body = [];
for (const b of blocks) {
  const first = b[0].trim();
  if (first.startsWith(".") && !first.startsWith("..")) body.push(slug(first.slice(1)));
  else if (/^(INT|EXT|INT\.\/EXT)\./.test(first)) body.push(slug(first));
  else if (first.startsWith(">") && first.endsWith("<")) {
    // The first centred line after the last transition is the end title card.
    const isEndTitle = body.length && !body.some((p) => p.__endTitle);
    const para = center(first.slice(1, -1).trim(), { bold: true, before: isEndTitle ? 2880 : 0 });
    para.__endTitle = true;
    body.push(para);
  }
  else if (first.startsWith(">")) body.push(trans(first.slice(1).trim()));
  else if (/^[A-Z .]+TO:$/.test(first)) body.push(trans(first));
  else if (first.startsWith("!")) b.forEach((l, i) => body.push(action(l.trim().slice(1), i === b.length - 1 ? 240 : 0)));
  else if (b.length > 1 && isUpper(first) && !first.startsWith("-")) {
    body.push(character(first));
    b.slice(1).forEach((l, i, arr) => {
      const t = l.trim();
      if (t.startsWith("(")) body.push(paren(t));
      else body.push(dial(t, i === arr.length - 1));
    });
  } else {
    b.forEach((l, i) => body.push(action(l.trim().replace(/^- /, "– "), i === b.length - 1 ? 240 : 0)));
  }
}

const titlePage = [
  center("", { before: 3600 }),
  center((title.title || "UNTITLED").toUpperCase(), { bold: true, size: 32, after: 480 }),
  center(title.credit || ""),
  center("", { before: 4800 }),
  ...(title.draft ? [center(title.draft, { after: 120 })] : []),
  ...(title.notes ? [center(title.notes)] : []),
  new Paragraph({ children: [new PageBreak()] }),
];

const doc = new Document({
  creator: "Blue Crayon",
  title: title.title || "Screenplay",
  styles: { default: { document: { run: { font: FONT, size: SIZE } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 2160 },
      },
      titlePage: true,
    },
    headers: {
      first: new Header({ children: [new Paragraph({ children: [] })] }),
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ children: [PageNumber.CURRENT, "."], font: FONT, size: 22 })],
        })],
      }),
    },
    children: [...titlePage, ...body],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  const out = input.replace(/\.fountain$/, "") + ".docx";
  fs.writeFileSync(out, buf);
  console.log(`wrote ${out} (${sceneNum} scenes)`);
});
