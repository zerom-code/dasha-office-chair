import { OBSTACLES, target, POINTS } from "./engine-3.0.2.js";
import { outfitColor } from "./customization.js";
import { PROJECTION_Y, footprintsFor } from "./geometry.js";
import { STREET, nearbyVisitor } from "./workday.js";
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
  c.save();
  c.globalAlpha = 0.1;
  c.fillStyle = "#405b36";
  c.beginPath();
  c.ellipse(x + w / 2 + 3, y + 5, w * 0.56, 8, 0, 0, Math.PI * 2);
  c.fill();
  c.restore();
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
      rr(c, x + 113, y - 12, 27, 16, 4, "#3e554b");
      rr(c, x + 111, y - 16, 32, 7, 4, "#2e443b");
      for (let j = 0; j < 6; j++)
        circle(
          c,
          x + 123 + (j % 3) * 5,
          y - 6 + Math.floor(j / 3) * 4,
          1,
          "#becbbc",
        );
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
    case "basket":
      rr(c, x, y, w, h, 7, "#a899ae", "#7d7890");
      for (let i = 0; i < 4; i++)
        line(c, x + 6 + i * 5, y + 5, x + 6 + i * 5, y + h - 5, "#d0c3d5", 1.5);
      break;
  }
}
// The local +Y axis points toward Dasha's toes; head, hips and feet share one heading.
function drawPlayerChair(c) {
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5 + 0.2;
    line(c, 0, 9, Math.cos(a) * 27, 9 + Math.sin(a) * 21, "#43584b", 4);
    circle(c, Math.cos(a) * 27, 9 + Math.sin(a) * 21, 4, "#233c34");
  }
  rr(c, -24, -5, 48, 35, 9, "#2f4540", "#243b34");
  rr(c, -25, -27, 50, 22, 6, "#43564d", "#293f36");
  for (let i = 0; i < 4; i++)
    line(c, -20, -23 + i * 5, 20, -23 + i * 5, "#82907d", 1.4);
  line(c, -29, -8, -29, 14, "#314c3c", 4);
  line(c, 29, -8, 29, 14, "#314c3c", 4);
}
function drawPerson(c, g, time, reduced, fallen = false) {
  const walking = g.mode === "walk" && Math.hypot(g.vx || 0, g.vy || 0) > 5;
  // Facing local +Y, Dasha's left is +X and her right is -X.
  for (const [foot, side] of [
    ["left", 1],
    ["right", -1],
  ]) {
    const push = g.feet?.[foot] || g.anim?.[foot] > 0;
    const stride =
      walking && !reduced
        ? Math.sin(time * 11 + (side > 0 ? Math.PI : 0)) * 7
        : 0;
    const length = fallen ? 21 + side * 4 : (push ? 39 : 31) + stride;
    rr(c, side * 10 - 5, 8, 10, length - 1, 5, "#2d3030");
    rr(c, side * 10 - 7, length + 5, 14, 18, 5, "#252b2b");
    for (let j = 0; j < 3; j++)
      line(
        c,
        side * 10 - 4,
        length + 10 + j * 3,
        side * 10 + 4,
        length + 10 + j * 3,
        "#e6e5dc",
        1.4,
      );
  }
  // Hair behind the shoulders, then torso, neck and face.
  rr(c, -20, -29, 40, 34, 13, "#624435");
  drawShirt(c, g.outfit);
  const sway = walking && !reduced ? Math.sin(time * 11) * 5 : 0;
  for (const side of [-1, 1]) {
    line(c, side * 20, -9, side * 25, 9 + side * sway, "#e2ae94", 6);
    circle(c, side * 25, 9 + side * sway, 4, "#e8bba0");
  }
  rr(c, -5, -27, 10, 12, 4, "#e8b89c");
  circle(c, 0, -33, 19, "#5b3c31");
  circle(c, 0, -31, 13, "#efc2a3");
  polygon(
    c,
    [
      [-17, -31],
      [-13, -46],
      [4, -50],
      [17, -39],
      [15, -18],
      [9, -27],
      [7, -40],
      [-9, -34],
      [-13, -22],
    ],
    "#624335",
  );
  line(c, -14, -34, -17, -7, "#825947", 2);
  line(c, 15, -33, 18, -6, "#825947", 2);
  line(c, -8, -33, -3, -34, "#76513e", 1.5);
  line(c, 3, -34, 8, -33, "#76513e", 1.5);
  circle(c, -5, -30, 1.5, "#474238");
  circle(c, 5, -30, 1.5, "#474238");
  line(c, -3, -24, 3, -24, "#b57773", 1.6);
  if (g.carrying === "coffee") mug(c, 25, 1, 0.66);
  if (g.carrying === "pen") line(c, 23, -8, 31, 8, "#ca7759", 4);
  if (g.carrying === "paper") paper(c, 14, -10);
  if (g.carrying === "letter") {
    rr(c, 12, -9, 28, 20, 3, "#fcf1da", "#a48b70");
    line(c, 12, -9, 26, 3, "#a48b70", 1);
    line(c, 40, -9, 26, 3, "#a48b70", 1);
    circle(c, 26, 3, 3, "#ce9387");
  }
  if (g.interaction?.type === "call") {
    rr(c, 16, -33, 7, 17, 3, "#344f46");
    line(c, 25, 9, 20, -19, "#e8bba0", 6);
  }
  if (g.interaction?.type === "smoke") {
    line(c, 25, 6, 38, 6, "#f6f2e7", 3);
    circle(c, 39, 6, 1.6, "#c79b72");
    if (!reduced) {
      c.globalAlpha = 0.3;
      circle(c, 42, -3 - Math.sin(time * 2) * 3, 4, "#9faba0");
      c.globalAlpha = 1;
    }
  }
}
function drawHero(c, g, time, menu = false, reduced = false) {
  c.save();
  c.translate(g.x, g.y * PROJECTION_Y);
  c.fillStyle = "#405b3620";
  c.beginPath();
  c.ellipse(3, 19, 29, 13, 0, 0, Math.PI * 2);
  c.fill();
  c.rotate(
    Math.atan2(Math.sin(g.angle) * PROJECTION_Y, Math.cos(g.angle)) -
      Math.PI / 2,
  );
  if (g.fall && ["falling", "lost"].includes(g.phase)) {
    const p = reduced ? 1 : Math.min(1, g.fall.age / 0.9);
    const ease = 1 - (1 - p) ** 3;
    c.save();
    c.translate(-ease * 16, -ease * 7);
    c.rotate(-ease * 1.1);
    c.scale(1, 1 - ease * 0.4);
    drawPlayerChair(c);
    c.restore();
    c.translate(ease * 47, ease * 14);
    c.rotate(ease * 1.45);
    drawPerson(c, g, time, reduced, true);
  } else {
    if (g.mode !== "walk") drawPlayerChair(c);
    drawPerson(c, g, time, reduced);
  }
  c.restore();
}
function drawVisitor(c, visitor, time, police = false) {
  c.save();
  c.translate(visitor.x, visitor.y * PROJECTION_Y);
  c.fillStyle = "#405b3620";
  c.beginPath();
  c.ellipse(0, 16, 20, 9, 0, 0, Math.PI * 2);
  c.fill();
  rr(c, -12, 7, 9, 22, 4, "#4b5150");
  rr(c, 3, 7, 9, 22, 4, "#4b5150");
  rr(c, -16, -16, 32, 32, 9, police ? "#4b6375" : visitor.color);
  line(c, -18, -7, -20, 14, "#c9a48c", 5);
  line(c, 18, -7, 20, 14, "#c9a48c", 5);
  circle(c, 0, -27, 12, "#ddb497");
  rr(c, -13, -40, 26, 10, 5, police ? "#3c5368" : "#625449");
  circle(c, -4, -26, 1, "#48453d");
  circle(c, 4, -26, 1, "#48453d");
  if (police) {
    rr(c, -17, -31, 34, 4, 2, "#3c5368");
    circle(c, 7, -9, 3, "#c6b77e");
  }
  c.restore();
}
function drawBubble(c, visitor) {
  const lines = visitor.phrase.includes("рассказывайте")
    ? ["Ну рассказывайте,", "чем вы тут занимаетесь"]
    : visitor.phrase.includes("только")
      ? ["Я только спросить.", "А что у вас тут такое?"]
      : ["А что у вас тут такое?"];
  const x = Math.max(180, Math.min(725, visitor.x)),
    y = visitor.y * PROJECTION_Y - 79;
  rr(
    c,
    x - 143,
    y - (lines.length - 1) * 16,
    286,
    33 + (lines.length - 1) * 16,
    10,
    "#fffdf5",
    "#d1d9c8",
  );
  polygon(
    c,
    [
      [x - 6, y + 32],
      [x + 6, y + 32],
      [x, y + 41],
    ],
    "#fffdf5",
  );
  lines.forEach((label, i) =>
    text(
      c,
      label,
      x,
      y + 21 - (lines.length - 1 - i) * 16,
      13,
      C.ink,
      "center",
    ),
  );
}
function drawPoliceCar(c, x, y, time, scale = 1) {
  c.save();
  c.translate(x, y);
  c.scale(scale, scale);
  shadow(c, -42, -19, 84, 39);
  rr(c, -42, -19, 84, 39, 12, "#f8f8ef", "#80928e");
  rr(c, -24, -14, 30, 29, 7, "#88a8aa");
  rr(c, -7, -19, 21, 39, 2, "#557589");
  rr(c, -5, -8, 16, 5, 2, Math.sin(time * 6) > 0 ? "#92bad1" : "#bd8080");
  text(c, "ПОЛІЦІЯ", 18, 5, 7, "#537287", "center");
  for (const xx of [-28, 27]) {
    rr(c, xx, -23, 14, 6, 2, "#394b48");
    rr(c, xx, 17, 14, 6, 2, "#394b48");
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
function drawTree(c, x, y, size = 28) {
  y *= PROJECTION_Y;
  c.save();
  c.globalAlpha = 0.12;
  circle(c, x + 8, y + 6, size, "#46634b");
  c.restore();
  line(c, x, y, x, y - 15, "#98806a", 5);
  circle(c, x - size * 0.3, y - 25, size * 0.75, "#a4b48a");
  circle(c, x + size * 0.35, y - 22, size * 0.75, "#8fa777");
  circle(c, x, y - 38, size * 0.75, "#b3be96");
}
function drawBuilding(c, building) {
  const { x, w, type } = building,
    y = building.y * PROJECTION_Y,
    h = building.h * PROJECTION_Y;
  const rise = type === "landmark" ? 42 : 29;
  shadow(c, x, y, w, h);
  rr(c, x, y, w, h, 3, type === "landmark" ? "#b5b5a7" : "#d5c6b3", "#a8ad9e");
  rr(
    c,
    x,
    y - rise,
    w,
    h,
    3,
    type === "landmark" ? "#e0dfd1" : "#e9d8c1",
    "#babaa9",
  );
  for (let row = 0; row < 2; row++)
    for (let column = 0; column < Math.floor(w / 30); column++)
      rr(
        c,
        x + 12 + column * 30,
        y + h - rise + 7 + row * 17,
        14,
        11,
        1,
        "#839b99",
      );
  if (type === "landmark") {
    // Three monumental masses, light courtyards and elevated connecting bridges.
    rr(c, x + 35, y + 45 - rise, w - 70, h - 95, 1, "#a5b2a0", "#c4c7b7");
    rr(c, x + 15, y + 14 - rise, w - 30, 39, 1, "#ededdf", "#c0c2b1");
    rr(c, x + 18, y + h - 60 - rise, w - 36, 40, 1, "#e9e9db", "#c0c2b1");
    const towerWidth = w > 300 ? 87 : 58;
    rr(
      c,
      x + w / 2 - towerWidth / 2,
      y - 73,
      towerWidth,
      128,
      2,
      "#f0f0e4",
      "#b7bba9",
    );
    for (let row = 0; row < 5; row++)
      line(
        c,
        x + w / 2 - towerWidth / 2 + 8,
        y - 64 + row * 23,
        x + w / 2 + towerWidth / 2 - 8,
        y - 64 + row * 23,
        "#9aa8a2",
        4,
      );
    for (let side = 0; side < 2; side++)
      for (let row = 0; row < 8; row++)
        rr(
          c,
          x + (side ? w - 27 : 12),
          y + 57 + row * 20 - rise,
          13,
          10,
          1,
          "#9da9a1",
        );
  } else if (type === "office") {
    rr(c, x + 22, y + 12 - rise, w - 44, h - 45, 2, "#d7c7b2", "#baa98f");
    rr(c, x + 40, y + 37 - rise, w - 80, h - 96, 2, "#a6b391");
    for (let j = 0; j < 7; j++)
      rr(c, x - 1, y + 19 + j * 24, 9, 14, 1, "#819f9b");
    rr(
      c,
      x - 6,
      STREET.points.entrance.y * PROJECTION_Y - 18,
      13,
      36,
      2,
      "#8b735a",
    );
    rr(c, x + w / 2 - 64, y + h - 55, 128, 32, 7, "#fff9eb");
    text(c, "ОФИС", x + w / 2, y + h - 33, 23, C.ink, "center");
  } else rr(c, x + 30, y + 30 - rise, w - 60, h - 85, 2, "#b4bca6");
}
function drawStreet(c, g, time, w, h, reduced, debug) {
  const scale = Math.min(w / 1360, h / 1130);
  c.translate(
    (w - STREET.width * scale) / 2,
    (h - STREET.height * PROJECTION_Y * scale) / 2 + 24 * scale,
  );
  c.scale(scale, scale);
  rr(c, 25, -15, 1250, 990, 18, "#e6e5d8");
  rr(c, 65, 417, 1170, 108, 45, "#c3cbae");
  rr(c, 70, 628, 1160, 82, 30, "#b8c6a1");
  // Pavements connect the landmark forecourt, the break area and the office.
  rr(c, 497, 404, 82, 276, 0, "#f0ecde");
  rr(c, 447, 638, 278, 38, 0, "#f0ecde");
  rr(c, 447, 663, 134, 280, 2, "#f0ecde");
  rr(c, 694, 638, 31, 292, 0, "#f0ecde");
  rr(c, 607, 590, 65, 353, 2, "#c1c5bb");
  c.save();
  c.strokeStyle = "#bcc1b8";
  c.lineWidth = 103;
  c.beginPath();
  c.moveTo(45, 501);
  c.quadraticCurveTo(660, 642, 1255, 501);
  c.stroke();
  c.strokeStyle = "#edeede";
  c.lineWidth = 2;
  c.setLineDash([22, 18]);
  c.stroke();
  c.restore();
  for (let i = 0; i < 7; i++) rr(c, 503 + i * 11, 521, 7, 97, 0, "#f5f2e7");
  for (let i = 0; i < 3; i++) rr(c, 610, 643 + i * 11, 59, 6, 0, "#f5f2e7");
  for (let i = 0; i < 10; i++) {
    if (i !== 4) drawTree(c, 100 + i * 119, 618, 27);
    if (i !== 4 && i !== 5) drawTree(c, 108 + i * 116, 860, 24);
  }
  for (const building of STREET.buildings) drawBuilding(c, building);
  for (const x of [370, 825])
    for (const y of [190, 315]) {
      rr(c, x, y, 105, 34, 1, "#e5e6d9", "#b5baaa");
      for (let j = 0; j < 4; j++)
        rr(c, x + 12 + j * 23, y + 23, 13, 8, 1, "#8ea1a0");
    }
  rr(c, 504, 388, 292, 43, 12, "#faf8eccc");
  text(c, "ДЕРЖПРОМ", 650, 417, 30, C.ink, "center");
  rr(c, 478, 671, 72, 15, 3, "#b18d6d");
  line(c, 485, 679, 485, 694, "#789078", 4);
  line(c, 544, 679, 544, 694, "#789078", 4);
  rr(c, 576, 714, 17, 21, 3, "#899c7a");
  if (g.work.police) {
    const arrival = reduced
      ? 1
      : Math.min(1, (g.time - g.work.policeSince) / 3);
    drawPoliceCar(c, -80 + arrival * 750, 856, reduced ? 0 : time, 1.15);
    if (arrival >= 1) {
      drawVisitor(c, { x: 697, y: 930 }, time, true);
      drawVisitor(c, { x: 697, y: 976 }, time, true);
    }
  }
  const t = target(g);
  if (t) {
    c.save();
    c.translate(t.x, t.y * PROJECTION_Y);
    c.scale(1, PROJECTION_Y);
    circle(c, 0, 0, t.radius, "#9eb78725", "#438d72");
    circle(c, 0, 0, 5, "#589d7f");
    c.restore();
  }
  drawHero(c, g, time, false, reduced);
  if (debug) {
    c.save();
    c.globalAlpha = 0.3;
    for (const solid of STREET.buildings)
      rr(
        c,
        solid.x,
        solid.y * PROJECTION_Y,
        solid.w,
        solid.h * PROJECTION_Y,
        0,
        "#c96750",
      );
    c.restore();
  }
}
export function drawScene(
  canvas,
  g,
  time = 0,
  { menu = false, reduced = false, labels = false, debug = false } = {},
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
  if (g?.area === "street") {
    drawStreet(c, g, time, w, h, reduced, debug);
    return;
  }
  const s = Math.min(w / 960, h / 850),
    ox = (w - 900 * s) / 2,
    oy = (h - 750 * s) / 2 + 35 * s;
  c.translate(ox, oy);
  c.scale(s, s);
  if (g?.work?.police) {
    c.save();
    c.translate(6, 475);
    c.rotate(-Math.PI / 2);
    drawPoliceCar(c, 0, 0, reduced ? 0 : time, 0.6);
    c.restore();
    drawVisitor(c, { x: 15, y: 395 }, time, true);
    drawVisitor(c, { x: 15, y: 495 }, time, true);
  }
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
          -Math.PI / 2 + (Math.PI * 2 * g.dwell) / (g.work ? 0.8 : 0.65),
        );
        c.stroke();
      }
      circle(c, 0, 0, 5, t.pickup ? "#c58e58" : "#589d7f");
      c.restore();
    }
  }
  const things = (g?.layout?.obstacles || OBSTACLES).map((o) => ({
    y: Math.max(...footprintsFor(o).map((p) => p.y + (p.h || p.radius))),
    draw: () => drawObject(c, o, time),
  }));
  if (g?.work) {
    for (const visitor of g.work.visitors)
      things.push({
        y: visitor.y + 14,
        draw: () => drawVisitor(c, visitor, time),
      });
    if (g.mode === "walk")
      things.push({
        y: g.parkedChair.y + 14,
        draw: () => {
          c.save();
          c.translate(g.parkedChair.x, g.parkedChair.y * PROJECTION_Y);
          c.rotate(
            Math.atan2(
              Math.sin(g.parkedChair.angle) * PROJECTION_Y,
              Math.cos(g.parkedChair.angle),
            ) -
              Math.PI / 2,
          );
          drawPlayerChair(c);
          c.restore();
        },
      });
  }
  if (g)
    things.push({
      y: g.y + 14,
      draw: () => drawHero(c, g, time, menu, reduced),
    });
  things.sort((a, b) => a.y - b.y).forEach((t) => t.draw());
  if (g?.work) {
    const visitor =
      nearbyVisitor(g) || g.work.visitors.find((v) => !v.leaving && v.y > 540);
    if (visitor) drawBubble(c, visitor);
  }
  if (debug) {
    c.save();
    c.globalAlpha = 0.3;
    for (const object of g.layout.obstacles)
      for (const solid of footprintsFor(object)) {
        if (solid.radius)
          circle(c, solid.x, solid.y * PROJECTION_Y, solid.radius, "#c96750");
        else
          rr(
            c,
            solid.x,
            solid.y * PROJECTION_Y,
            solid.w,
            solid.h * PROJECTION_Y,
            0,
            "#c96750",
          );
      }
    c.restore();
  }
  // Wall socket above the door.
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
  if (style === "sweater") {
    for (let y = -10; y < 13; y += 5) line(c, -17, y, 17, y, "#ffffff22", 1);
    line(c, -18, 13, 18, 13, "#ffffff50", 2);
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
  if (id === "sparkles") {
    star(-7, -4, 6);
    star(8, 4, 4);
    star(9, -10, 3);
  }
  if (id === "phone") {
    c.beginPath();
    c.moveTo(-8, -9);
    c.bezierCurveTo(-12, 2, 0, 12, 10, 6);
    c.stroke();
    rr(c, -10, -11, 7, 8, 2, ink);
    rr(c, 5, 3, 7, 8, 2, ink);
  }
  if (id === "city") {
    for (let i = 0; i < 3; i++)
      rr(c, -13 + i * 10, -10 + (i === 1 ? -3 : 0), 8, 22, 1, ink);
    line(c, -8, -5, 8, -5, ink, 2);
    line(c, -8, 2, 8, 2, ink, 2);
  }
  if (id === "sun") {
    circle(c, 0, -1, 6, ink);
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      line(
        c,
        Math.cos(a) * 9,
        -1 + Math.sin(a) * 9,
        Math.cos(a) * 13,
        -1 + Math.sin(a) * 13,
        ink,
        2,
      );
    }
  }
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
    { x: 0, y: 0, angle: Math.PI / 2, feet: {}, anim: {}, outfit },
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
