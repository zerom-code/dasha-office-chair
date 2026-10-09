import { OBSTACLES, target, POINTS } from "./engine.js";
import { outfitColor } from "./customization.js";
const C = {
  ink: "#244b40",
  floor: "#e9e3d5",
  tile: "#f0ece3",
  wood: "#c98e65",
  sage: "#9aae91",
  green: "#78a768",
  line: "#c9cabb",
  chair: "#2f4540",
  paper: "#faf9f1",
  orange: "#e9a66e",
  pink: "#e0a0a5",
  blue: "#78a7bd",
};
function rr(c, x, y, w, h, r = 5, fill, stroke) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = 1.8;
    c.stroke();
  }
}
function line(c, x, y, a, b, color, width = 2) {
  c.strokeStyle = color;
  c.lineWidth = width;
  c.beginPath();
  c.moveTo(x, y);
  c.lineTo(a, b);
  c.stroke();
}
function circle(c, x, y, r, fill, stroke) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  if (fill) {
    c.fillStyle = fill;
    c.fill();
  }
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = 2;
    c.stroke();
  }
}
function polygon(c, points, fill) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
}
function shadow(c, x, y, w, h) {
  c.save();
  c.globalAlpha = 0.12;
  rr(c, x + 9, y + 11, w, h, 9, "#384e37");
  c.restore();
}
function text(c, str, x, y, size = 15, color = C.ink, align = "left") {
  c.fillStyle = color;
  c.font = `600 ${size}px system-ui, sans-serif`;
  c.textAlign = align;
  c.fillText(str, x, y);
}
function base(c, x, y, w, h, height = 22, color = C.paper) {
  shadow(c, x, y, w, h);
  rr(c, x, y - height, w, h + height, 6, "#c2c5b7");
  rr(c, x, y - height, w, h, 6, color, "#9dafa0");
  line(c, x + 8, y + h - height, x + 8, y + h + 5, "#9caa99", 5);
  line(c, x + w - 8, y + h - height, x + w - 8, y + h + 5, "#9caa99", 5);
}
function officeChair(c, x, y, small = false) {
  c.save();
  c.translate(x, y);
  const s = small ? 0.72 : 1;
  c.scale(s, s);
  c.fillStyle = "#26473724";
  c.beginPath();
  c.ellipse(0, 16, 31, 14, 0, 0, Math.PI * 2);
  c.fill();
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    line(c, 0, 8, Math.cos(a) * 24, 8 + Math.sin(a) * 11, C.chair, 4);
    circle(c, Math.cos(a) * 24, 8 + Math.sin(a) * 11, 4, "#1b3430");
  }
  rr(c, -21, -24, 42, 29, 9, C.chair);
  rr(c, -23, -49, 46, 29, 6, "#3e554b", "#243e36");
  for (let i = 0; i < 4; i++)
    line(c, -17, -44 + i * 6, 17, -44 + i * 6, "#708474", 1.6);
  line(c, -29, -21, -29, -7, C.chair, 4);
  line(c, 29, -21, 29, -7, C.chair, 4);
  c.restore();
}
function mug(c, x, y, scale = 1) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  circle(c, 12, 2, 6, null, "#547065");
  rr(c, -9, -8, 20, 24, 4, "#faf6df", "#819e87");
  c.fillStyle = "#825b43";
  c.beginPath();
  c.ellipse(1, -7, 9, 3, 0, 0, Math.PI * 2);
  c.fill();
  line(c, -4, -16, -2, -21, "#839c825f", 2);
  line(c, 4, -16, 6, -25, "#839c825f", 2);
  c.restore();
}
function paper(c, x, y) {
  rr(c, x, y, 25, 33, 2, "#fffdf7", "#8ea395");
  for (let j = 0; j < 4; j++)
    line(c, x + 5, y + 8 + j * 5, x + 20, y + 8 + j * 5, "#b0b9aa", 1.5);
}
function stationery(c, x, y) {
  rr(c, x - 12, y, 24, 24, 4, "#b1be92", "#6d8c67");
  const colors = ["#d7755b", "#467e95", "#5a8b64", "#edb450", "#ae819a"];
  for (let j = 0; j < 5; j++)
    line(
      c,
      x - 8 + j * 4,
      y + 8,
      x - 11 + j * 6,
      y - 20 + (j % 2) * 5,
      colors[j],
      3,
    );
  circle(c, x - 15, y - 4, 4, null, "#5a84b2");
  circle(c, x - 9, y - 5, 4, null, "#5a84b2");
}
function boxStack(c, x, y, levels = 3) {
  const w = 45,
    h = 28;
  shadow(c, x, y, w, h);
  for (let i = 0; i < levels; i++) {
    const yy = y - i * 27;
    rr(c, x, yy - 25, w, h, 3, "#d5dbc194", "#9aa889");
    rr(c, x + 2, yy - 28, w - 4, 5, 2, "#dfe4d0", "#9da990");
    for (let j = 0; j < 3; j++)
      rr(
        c,
        x + 5 + j * 12,
        yy - 18 + (j % 2) * 5,
        9,
        8,
        1,
        ["#debd7f", "#e4a294", "#82a2a6"][j],
      );
    rr(c, x + 10, yy - 16, 25, 10, 1, "#f8f6dc");
    text(c, "FCA", x + 22, yy - 8, 7, "#6c8d54", "center");
    rr(c, x - 2, yy - 22, 5, 10, 2, "#8eae61");
    rr(c, x + w - 3, yy - 22, 5, 10, 2, "#8eae61");
  }
}
function drawObject(c, o, time) {
  let x = o.x,
    y = o.y * 0.78,
    w = o.w,
    h = o.h * 0.78;
  switch (o.type) {
    case "board": {
      shadow(c, x, y, w, h);
      line(c, x + 26, y + 7, x + 26, y + h + 27, "#9ba798", 4);
      line(c, x + w - 25, y + 7, x + w - 25, y + h + 27, "#9ba798", 4);
      rr(c, x, y - 61, w, h + 35, 5, "#f7f8ec", "#89a591");
      line(c, x + 5, y + h - 27, x + w - 5, y + h - 27, "#8a9f8b", 5);
      c.save();
      c.strokeStyle = "#bd8b81";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(x + 128, y - 12);
      c.bezierCurveTo(x + 113, y - 26, x + 98, y - 6, x + 128, y + 8);
      c.bezierCurveTo(x + 158, y - 6, x + 143, y - 26, x + 128, y - 12);
      c.stroke();
      c.restore();
      line(c, x + 19, y - 20, x + 74, y - 20, "#a8b6a1");
      line(c, x + 19, y - 7, x + 61, y - 7, "#a8b6a1");
      for (let j = 0; j < 4; j++)
        rr(
          c,
          x + 35 + j * 16,
          y + h - 31,
          11,
          5,
          2,
          ["#ca807b", "#678f9c", "#87a365", "#d1ad5d"][j],
        );
      rr(c, x + w - 38, y + h - 33, 22, 7, 2, "#355a51");
      break;
    }
    case "boxes":
      for (let row = 1; row >= 0; row--)
        for (let col = 0; col < 3; col++)
          boxStack(c, x + col * 53, y + row * 57, 3 + ((row + col) % 2));
      break;
    case "coffee": {
      base(c, x, y, w, h, 22);
      rr(c, x + 7, y - 41, 49, 36, 4, "#dce2d5", "#769282");
      rr(c, x + 11, y - 36, 29, 23, 3, "#42594e");
      circle(c, x + 46, y - 28, 3, "#829782");
      circle(c, x + 46, y - 18, 3, "#829782");
      rr(c, x + 77, y - 65, 35, 42, 6, "#faf8e6", "#8b9e83");
      rr(c, x + 76, y - 24, 40, 6, 3, "#587760");
      rr(c, x + 83, y - 39, 22, 14, 5, "#c2d0b28f", "#557961");
      line(c, x + 108, y - 37, x + 114, y - 35, "#557961", 3);
      rr(c, x + 79, y - 62, 31, 6, 3, "#5b7b66");
      mug(c, x + 133, y + 9, 0.72);
      rr(c, x + 42, y + 23, 23, 10, 2, "#e1a89e");
      break;
    }
    case "printer": {
      base(c, x, y, w, h, 14, "#d4dace");
      rr(c, x + 10, y - 33, w - 20, 43, 5, "#e7ebdd", "#7e9985");
      rr(c, x + 15, y - 43, w - 30, 17, 3, "#435d52");
      rr(c, x + 23, y - 50, w - 45, 16, 2, "#fffef8", "#9eae9a");
      rr(c, x + 20, y - 8, w - 39, 13, 2, "#4a6455");
      rr(c, x + 26, y - 7, w - 52, 20, 2, "#fcfcf2");
      circle(c, x + w - 16, y - 23, 3, "#85ab72");
      break;
    }
    case "desk": {
      base(c, x, y, w, h, 20);
      rr(c, x + 12, y - 67, w - 24, 29, 5, "#bdc5b4", "#8f9f8d");
      for (let j = 0; j < 10; j++)
        line(c, x + 25 + j * 25, y - 63, x + 25 + j * 25, y - 41, "#b1bbaa", 1);
      stationery(c, x + 43, y - 30);
      stationery(c, x + 77, y - 30);
      rr(c, x + 105, y - 41, 22, 27, 3, "#89b6c28f", "#639096");
      rr(c, x + 108, y - 47, 15, 7, 2, "#81a8b8");
      rr(c, x + 160, y - 36, 44, 27, 3, "#345449");
      for (let j = 0; j < 4; j++)
        line(c, x + 166 + j * 8, y - 31, x + 166 + j * 8, y - 15, "#91a38a", 2);
      paper(c, x + 167, y - 44);
      rr(c, x + 225, y - 40, 35, 30, 3, "#fffdf0", "#819a7b");
      rr(c, x + 225, y - 40, 35, 8, 2, "#94ab8b");
      text(c, "17", x + 241, y - 20, 11, C.ink, "center");
      rr(c, x + 259, y - 32, 23, 21, 1, "#7bafd0");
      rr(c, x + 131, y - 15, 18, 15, 1, "#eab4ba");
      rr(c, x + 282, y - 17, 18, 14, 1, "#dfcd83");
      c.strokeStyle = "#314d44";
      c.lineWidth = 4;
      c.beginPath();
      c.arc(x + 40, y + 27, 14, Math.PI, 0);
      c.stroke();
      rr(c, x + 23, y + 22, 7, 16, 3, "#314d44");
      rr(c, x + 51, y + 22, 7, 16, 3, "#314d44");
      rr(c, x + 88, y + 21, 24, 13, 6, "#73b0c5");
      line(c, x + 111, y + 26, x + 126, y + 26, "#73b0c5", 6);
      for (let j = 0; j < 5; j++)
        line(c, x + 92 + j * 4, y + 17, x + 92 + j * 4, y + 24, "#518fab", 1);
      break;
    }
    case "water":
      for (let col = 0; col < 3; col++)
        for (let row = 0; row < 2; row++) {
          rr(
            c,
            x + col * 12,
            y + row * 12 - 13,
            10,
            20,
            3,
            "#aad2d89f",
            "#789e9d",
          );
          rr(c, x + col * 12 + 2, y + row * 12 - 17, 6, 5, 1, "#6b9ba7");
        }
      break;
    case "can":
      shadow(c, x, y, w, h);
      rr(c, x, y - 25, w, h + 18, 5, "#72805c", "#536b48");
      rr(c, x + 7, y - 35, w - 14, 14, 4, null, "#536b48");
      line(c, x + 6, y - 10, x + w - 6, y + 20, "#9eaa80", 2);
      line(c, x + w - 6, y - 10, x + 6, y + 20, "#9eaa80", 2);
      rr(c, x + 10, y + 6, 18, 8, 1, "#e2a3ae");
      break;
    case "chair":
      officeChair(c, x + w / 2, y + h / 2, true);
      break;
  }
}
function drawHero(c, g, time, menu = false, reduced = false) {
  const x = g.x,
    y = g.y * 0.78;
  c.save();
  c.translate(x, y);
  c.fillStyle = "#405b362c";
  c.beginPath();
  c.ellipse(3, 16, 32, 16, 0, 0, Math.PI * 2);
  c.fill();
  c.rotate(
    Math.atan2(Math.sin(g.angle) * 0.78, Math.cos(g.angle)) + Math.PI / 2,
  );
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 + 0.2;
    line(c, 0, 4, Math.cos(a) * 26, 4 + Math.sin(a) * 22, "#43584b", 4);
    circle(c, Math.cos(a) * 26, 4 + Math.sin(a) * 22, 4, "#233c34");
  }
  rr(c, -24, -8, 48, 33, 10, "#2e493f", "#1f3f33");
  rr(c, -25, 11, 50, 19, 6, "#4b6051", "#2f4a3b");
  for (let i = 0; i < 4; i++)
    line(c, -20, 14 + i * 4, 20, 14 + i * 4, "#849279", 1.3);
  for (const [f, side] of [
    ["left", -1],
    ["right", 1],
  ]) {
    const planted = g.feet[f] || g.anim[f] > 0;
    const legLen = planted ? 19 : 33;
    rr(c, side * 10 - 5, -legLen, 10, legLen + 13, 5, "#263d35");
    rr(c, side * 10 - 7, -legLen - 9, 14, 16, 5, "#26372f");
    for (let j = 0; j < 3; j++)
      line(
        c,
        side * 10 - 4,
        -legLen - 5 + j * 3,
        side * 10 + 4,
        -legLen - 5 + j * 3,
        "#718274",
        1,
      );
  }
  drawShirt(c, g.outfit);
  line(c, -28, -3, -26, 13, "#314c3c", 5);
  line(c, 28, -3, 26, 13, "#314c3c", 5);
  line(c, -18, -11, -25, 0, "#e7b79c", 7);
  line(c, 18, -11, 25, 0, "#e7b79c", 7);
  circle(c, -25, 0, 4, "#e8bea3");
  circle(c, 25, 0, 4, "#e8bea3");
  circle(c, 0, -27, 18, "#765039");
  circle(c, -15, -12, 9, "#895d41");
  circle(c, 15, -12, 9, "#895d41");
  circle(c, 0, -28, 13, "#efc2a3");
  c.fillStyle = "#80583f";
  c.beginPath();
  c.arc(0, -28, 17, Math.PI, Math.PI * 2);
  c.bezierCurveTo(18, -22, 15, -17, 10, -16);
  c.lineTo(8, -34);
  c.bezierCurveTo(-2, -30, -9, -28, -14, -24);
  c.closePath();
  c.fill();
  circle(c, -5, -28, 1.3, "#4a4633");
  circle(c, 5, -28, 1.3, "#4a4633");
  line(c, -3, -22, 3, -22, "#bd7d76", 1.5);
  line(c, -13, -30, -15, -18, "#aa7754", 1.8);
  line(c, 13, -30, 15, -17, "#aa7754", 1.8);
  if (g.carrying === "coffee") mug(c, 25, -18, 0.66);
  if (g.carrying === "pen") line(c, 21, -27, 30, -13, "#ca7759", 5);
  if (g.carrying === "paper") paper(c, 13, -30);
  if (g.carrying === "letter") {
    rr(c, 12, -29, 28, 20, 3, "#fcf1da", "#a48b70");
    line(c, 12, -29, 26, -17, "#a48b70", 1);
    line(c, 40, -29, 26, -17, "#a48b70", 1);
    circle(c, 26, -17, 3, "#ce9387");
  }
  c.restore();
}
function drawMat(c, mat = { x: 644, y: 788 }) {
  const x = mat.x,
    y = mat.y * 0.78;
  shadow(c, x, y, 151, 67);
  rr(c, x, y, 151, 67, 3, "#c79662", "#a87746");
  for (let j = 0; j < 65; j++)
    circle(
      c,
      x + 5 + ((j * 23) % 140),
      y + 5 + ((j * 17) % 57),
      0.8,
      "#f5d6a780",
    );
  rr(c, x + 50, y + 20, 54, 17, 4, "#658e69");
  rr(c, x + 47, y + 23, 66, 15, 3, "#658e69");
  rr(c, x + 92, y + 17, 17, 15, 3, "#83a587");
  circle(c, x + 60, y + 39, 6, "#564737");
  circle(c, x + 98, y + 39, 6, "#564737");
  polygon(
    c,
    [
      [x + 48, y + 19],
      [x + 61, y + 4],
      [x + 74, y + 19],
    ],
    "#486d50",
  );
  line(c, x + 61, y + 17, x + 61, y + 26, "#795a3b", 2);
  text(c, "winter time", x + 76, y + 58, 12, "#584934", "center");
}
export function drawScene(
  canvas,
  g,
  time = 0,
  { menu = false, reduced = false, labels = false } = {},
) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = rect.width,
    h = rect.height;
  if (
    canvas.width !== Math.round(w * dpr) ||
    canvas.height !== Math.round(h * dpr)
  ) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const c = canvas.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, w, h);
  const s = Math.min(w / 930, h / 850),
    ox = (w - 900 * s) / 2,
    oy = (h - 750 * s) / 2 + 35 * s;
  c.translate(ox, oy);
  c.scale(s, s);
  // The office is drawn as a cutaway dollhouse: warm tiles, tall blinds, familiar objects.
  shadow(c, 57, 62, 812, 684);
  rr(c, 57, 61, 814, 684, 12, "#d1cbbc");
  rr(c, 65, 70, 794, 658, 5, C.floor);
  c.save();
  c.beginPath();
  c.rect(65, 70, 794, 658);
  c.clip();
  for (let y = 70; y < 735; y += 65)
    for (let x = 65; x < 860; x += 66) {
      rr(
        c,
        x,
        y,
        66,
        65,
        0,
        (Math.round((x - 65) / 66) + Math.round((y - 70) / 65)) % 3
          ? "#ece7dc"
          : "#e5dfd2",
      );
      line(c, x, y, x + 66, y, "#d6d0c3", 1);
      line(c, x, y, x, y + 65, "#d6d0c3", 1);
    }
  for (let i = 0; i < 9; i++)
    polygon(
      c,
      [
        [65, 175 + i * 32],
        [65, 192 + i * 32],
        [471, 380 + i * 24],
        [490, 357 + i * 24],
      ],
      "#fffcdd65",
    );
  c.restore();
  polygon(
    c,
    [
      [65, 70],
      [65, -17],
      [859, -17],
      [859, 70],
    ],
    "#f3f3e8",
  );
  polygon(
    c,
    [
      [65, 70],
      [65, 640],
      [36, 625],
      [36, 41],
      [36, -34],
      [65, -17],
    ],
    "#d8dfd0",
  );
  line(c, 65, 70, 859, 70, "#becaba", 3);
  line(c, 65, -17, 859, -17, "#fffef4", 3);
  // Wooden doorway and a white door; the lower railing echoes the real office.
  rr(c, 386, -17, 100, 86, 2, C.wood, "#a47353");
  rr(c, 402, -7, 70, 76, 2, "#5a6e55");
  rr(c, 408, -4, 56, 72, 2, "#e9eddf");
  line(c, 411, 13, 453, 13, "#ced6c5", 2);
  circle(c, 455, 41, 3, "#849878");
  for (let i = 0; i < 5; i++) {
    let yy = 120 + i * 79;
    polygon(
      c,
      [
        [38, yy],
        [62, yy + 8],
        [62, yy + 69],
        [38, yy + 58],
      ],
      "#bad3c492",
    );
    for (let j = 0; j < 4; j++)
      line(c, 42 + j * 5, yy + 2, 42 + j * 5, yy + 61, "#faf8e6", 3);
    line(c, 39, yy + 61, 62, yy + 69, "#9cad96", 3);
  }
  for (let i = 0; i < 7; i++)
    line(c, 611 + i * 30, 717, 611 + i * 30, 747, "#d7dfce", 5);
  line(c, 599, 716, 826, 716, "#45614d", 7);
  drawMat(c, g?.layout?.mat);
  if (g && !menu) {
    if (!reduced && g.trail.length > 1) {
      c.save();
      c.strokeStyle = "#647e6830";
      c.lineWidth = 3;
      c.setLineDash([4, 10]);
      c.beginPath();
      g.trail.forEach((p, i) =>
        i ? c.lineTo(p.x, p.y * 0.78) : c.moveTo(p.x, p.y * 0.78),
      );
      c.stroke();
      c.restore();
    }
    const t = target(g);
    if (t) {
      const pulse = reduced ? 1 : 1 + Math.sin(time * 3) * 0.03;
      c.save();
      c.translate(t.x, t.y * 0.78);
      c.scale(1, 0.78);
      circle(
        c,
        0,
        0,
        t.radius * pulse,
        "#e8b56b24",
        t.pickup ? "#bd8a57" : "#438d72",
      );
      c.setLineDash([5, 7]);
      circle(c, 0, 0, t.radius + 7, null, "#819a7560");
      c.setLineDash([]);
      if (g.dwell > 0) {
        c.strokeStyle = "#398164";
        c.lineWidth = 6;
        c.beginPath();
        c.arc(
          0,
          0,
          t.radius,
          -Math.PI / 2,
          -Math.PI / 2 + (Math.PI * 2 * g.dwell) / 0.65,
        );
        c.stroke();
      }
      circle(c, 0, 0, 5, t.pickup ? "#c58e58" : "#589d7f");
      c.restore();
    }
  }
  const things = (g?.layout?.obstacles || OBSTACLES).map((o) => ({
    y: o.y + o.h,
    draw: () => drawObject(c, o, time),
  }));
  if (g)
    things.push({
      y: g.y + 14,
      draw: () => drawHero(c, g, time, menu, reduced),
    });
  things.sort((a, b) => a.y - b.y).forEach((t) => t.draw());
  // Small details: purple basket, wall socket and green shrub outside the window.
  rr(c, 80, 540, 26, 26, 7, "#a899ae", "#7d7890");
  for (let i = 0; i < 4; i++)
    line(c, 86 + i * 5, 545, 86 + i * 5, 561, "#d0c3d5", 1.5);
  rr(c, 474, 4, 41, 12, 2, "#8b9c89");
  circle(c, 483, 10, 2, "#eff0e4");
  circle(c, 498, 10, 2, "#eff0e4");
  if (labels && !menu) {
    for (const [key, p] of Object.entries(POINTS)) {
      if (["coffee", "board", "desk"].includes(key)) {
        rr(c, p.x - 41, p.y * 0.78 + 26, 82, 19, 8, "#f8f6e4b8");
        text(
          c,
          key === "desk" ? "ТВОЙ СТОЛ" : key === "board" ? "ДОСКА" : "КОФЕ",
          p.x,
          p.y * 0.78 + 39,
          9,
          "#647e69",
          "center",
        );
      }
    }
  }
  if (menu) {
    c.save();
    c.strokeStyle = "#54735d46";
    c.lineWidth = 3;
    c.setLineDash([6, 11]);
    c.beginPath();
    c.moveTo(289, 525);
    c.bezierCurveTo(340, 330, 622, 426, 621, 531);
    c.bezierCurveTo(620, 641, 494, 681, 468, 589);
    c.stroke();
    c.restore();
  }
}

function drawShirt(c, outfit = {}) {
  const color = outfitColor(outfit),
    style = outfit.style || "crew";
  rr(c, -21, -19, 42, 34, style === "tank" ? 9 : 12, color);
  if (style !== "tank") {
    rr(c, -27, -17, 13, 18, 5, color);
    rr(c, 14, -17, 13, 18, 5, color);
  }
  c.save();
  c.beginPath();
  c.roundRect(-20, -17, 40, 31, 10);
  c.clip();
  drawPrint(
    c,
    outfit.print,
    parseInt(color.slice(1, 3), 16) * 0.299 +
      parseInt(color.slice(3, 5), 16) * 0.587 +
      parseInt(color.slice(5, 7), 16) * 0.114 >
      165
      ? "#40634f"
      : "#fff4df",
  );
  c.restore();
  if (style === "hoodie") {
    c.strokeStyle = "#f6eed9a0";
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, -13, 12, 0, Math.PI);
    c.stroke();
    line(c, -5, -6, -5, 4, "#f6eed9", 1);
    line(c, 5, -6, 5, 4, "#f6eed9", 1);
    rr(c, -11, 7, 22, 7, 3, null, "#355b4960");
  }
  if (style === "zip") {
    line(c, 0, -17, 0, 14, "#f7efdf", 2);
    for (let y = -6; y < 13; y += 6) circle(c, 3, y, 1, "#f7efdf");
  }
  if (style === "collar") {
    polygon(
      c,
      [
        [-12, -18],
        [-2, -10],
        [-8, -6],
      ],
      "#fcf4e4",
    );
    polygon(
      c,
      [
        [12, -18],
        [2, -10],
        [8, -6],
      ],
      "#fcf4e4",
    );
    line(c, 0, -9, 0, 14, "#fcf4e4", 1);
  }
  if (style === "tank") {
    circle(c, -20, -15, 6, "#e7b79c");
    circle(c, 20, -15, 6, "#e7b79c");
  }
}
function drawPrint(c, id = "plain", ink = "#fff4df") {
  c.save();
  c.fillStyle = ink;
  c.strokeStyle = ink;
  c.lineWidth = 2;
  const star = (x, y, r) => {
    const p = [];
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2,
        rad = i % 2 ? r * 0.45 : r;
      p.push([x + Math.cos(a) * rad, y + Math.sin(a) * rad]);
    }
    polygon(c, p, ink);
  };
  if (id === "heart") {
    c.beginPath();
    c.moveTo(0, 8);
    c.bezierCurveTo(-19, -3, -9, -13, 0, -5);
    c.bezierCurveTo(9, -13, 19, -3, 0, 8);
    c.fill();
  }
  if (id === "star") star(0, -1, 10);
  if (id === "flower") {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      circle(c, Math.cos(a) * 6, Math.sin(a) * 6 - 1, 4, ink);
    }
    circle(c, 0, -1, 3, "#d7a24e");
  }
  if (id === "cloud") {
    circle(c, -7, 0, 5, ink);
    circle(c, 0, -4, 7, ink);
    circle(c, 8, 0, 5, ink);
    rr(c, -10, 0, 21, 6, 3, ink);
  }
  if (id === "moon") {
    c.beginPath();
    c.arc(0, -1, 9, 0.3, Math.PI * 1.7);
    c.quadraticCurveTo(-2, 0, 8, 2);
    c.fill();
    star(11, -9, 3);
  }
  if (id === "checker") {
    for (let y = -18; y < 17; y += 8)
      for (let x = -20; x < 21; x += 8)
        if ((x + y + 38) % 16 === 0) rr(c, x, y, 8, 8, 0, ink);
  }
  if (id === "stripes") {
    for (let y = -13; y < 17; y += 8) line(c, -21, y, 21, y, ink, 3);
  }
  if (id === "cat") {
    polygon(
      c,
      [
        [-9, -4],
        [-9, -12],
        [-3, -8],
        [3, -8],
        [9, -12],
        [9, -4],
      ],
      ink,
    );
    circle(c, 0, -2, 9, ink);
    circle(c, -4, -3, 1, ink === "#40634f" ? "#fff4df" : "#405747");
    circle(c, 4, -3, 1, ink === "#40634f" ? "#fff4df" : "#405747");
    polygon(
      c,
      [
        [-2, 1],
        [2, 1],
        [0, 3],
      ],
      "#be8291",
    );
  }
  if (id === "bolt")
    polygon(
      c,
      [
        [1, -13],
        [-9, 2],
        [-1, 2],
        [-3, 13],
        [10, -4],
        [2, -4],
      ],
      ink,
    );
  if (id === "dots") {
    for (let y = -15; y < 17; y += 10)
      for (let x = -17; x < 21; x += 11)
        circle(c, x + (y % 2 ? 0 : 4), y, 2, ink);
  }
  if (id === "bow") {
    polygon(
      c,
      [
        [-11, -9],
        [-11, 6],
        [0, -1],
      ],
      ink,
    );
    polygon(
      c,
      [
        [11, -9],
        [11, 6],
        [0, -1],
      ],
      ink,
    );
    circle(c, 0, -1, 3, "#f1d0d4");
    line(c, -1, 1, -4, 11, ink, 3);
    line(c, 1, 1, 4, 11, ink, 3);
  }
  if (id === "leopard") {
    for (let i = 0; i < 12; i++) {
      const x = -17 + ((i * 13) % 35),
        y = -14 + ((i * 9) % 29);
      c.strokeStyle = ink;
      c.beginPath();
      c.ellipse(x, y, 3, 2, i, 0, Math.PI * 1.5);
      c.stroke();
    }
  }
  c.restore();
}
export function drawWardrobe(canvas, outfit, mini = false) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const c = canvas.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, rect.width, rect.height);
  c.translate(rect.width / 2, rect.height / 2 + 8);
  const s = Math.min(rect.width / 110, rect.height / 110);
  c.scale(s, s);
  drawHero(
    c,
    { x: 0, y: 0, angle: -Math.PI / 2, feet: {}, anim: {}, outfit },
    0,
  );
}
export function drawClothing(canvas, outfit) {
  const r = canvas.getBoundingClientRect();
  if (!r.width || !r.height) return;
  canvas.width = r.width * 2;
  canvas.height = r.height * 2;
  const c = canvas.getContext("2d");
  c.scale(2, 2);
  c.translate(r.width / 2, r.height / 2 + 2);
  const s = Math.min(r.width / 67, r.height / 55);
  c.scale(s, s);
  drawShirt(c, outfit);
}
