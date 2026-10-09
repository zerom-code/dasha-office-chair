export const COLORS = [
  { id: "black", name: "Чёрная", value: "#233e32", level: 0 },
  ...[
    ["rose", "Розовая", "#e6a2b4"],
    ["sand", "Кремовая", "#e9d6b4"],
    ["sage", "Мятная", "#91b69d"],
    ["sky", "Голубая", "#93bccb"],
    ["lilac", "Сиреневая", "#afa1cd"],
    ["cherry", "Вишнёвая", "#b96377"],
    ["peach", "Персиковая", "#efb087"],
    ["navy", "Тёмно-синяя", "#46597c"],
    ["lime", "Лаймовая", "#bad17f"],
    ["denim", "Джинсовая", "#6b9bb4"],
    ["fuchsia", "Фуксия", "#c970a9"],
    ["milk", "Молочная", "#faf0dd"],
  ].map(([id, name, value], i) => ({ id, name, value, level: i + 1 })),
];
export const PRINTS = [
  { id: "plain", name: "Без принта", level: 0 },
  ...[
    "Сердце",
    "Звезда",
    "Цветок",
    "Облако",
    "Луна",
    "Клетка",
    "Полоски",
    "Кот",
    "Молния",
    "Горошек",
    "Бант",
    "Леопард",
  ].map((name, i) => ({
    id: [
      "heart",
      "star",
      "flower",
      "cloud",
      "moon",
      "checker",
      "stripes",
      "cat",
      "bolt",
      "dots",
      "bow",
      "leopard",
    ][i],
    name,
    level: i + 1,
  })),
];
export const STYLES = [
  { id: "crew", name: "Футболка", level: 0 },
  { id: "hoodie", name: "Худи", level: 3 },
  { id: "zip", name: "Кардиган", level: 6 },
  { id: "tank", name: "Топ", level: 9 },
  { id: "collar", name: "Рубашка", level: 12 },
];
export const CATALOG = { color: COLORS, print: PRINTS, style: STYLES };
export const DEFAULT_OUTFIT = { color: "black", print: "plain", style: "crew" };
export function available(item, results) {
  return item.level === 0 || !!results[item.level - 1];
}
export function validateOutfit(outfit, results) {
  return Object.fromEntries(
    Object.entries(CATALOG).map(([key, items]) => [
      key,
      items.find((i) => i.id === outfit?.[key] && available(i, results))?.id ||
        DEFAULT_OUTFIT[key],
    ]),
  );
}
export function rewardFor(id) {
  return {
    color: COLORS[id + 1],
    print: PRINTS[id + 1],
    style: STYLES.find((s) => s.level === id + 1),
  };
}
export function outfitColor(outfit) {
  return COLORS.find((i) => i.id === outfit?.color)?.value || COLORS[0].value;
}
