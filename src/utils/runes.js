// utils/runes.js

export const RUNE_EMOJIS = {
  red: "🔴",
  blue: "🔵",
  yellow: "🟡",
  purple: "🟣",
  green: "🟢",
};

export function formatRunes(runes) {
  const counts = runes.reduce((acc, rune) => {
    acc[rune] = (acc[rune] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([rune, count]) => `${RUNE_EMOJIS[rune]} x${count}`)
    .join("  ");
}

export function getMaxHP(runes) {
  return 100 + 10 * runes.filter(r => r === "red").length;
}

export function getMaxMP(runes) {
  return 50 + 10 * runes.filter(r => r === "blue").length;
}

export function getRuneBoost(runes, type, perRuneBoost = 0.25, cap = Infinity) {
  const count = runes.filter(r => r === type).length;
  return 1 + perRuneBoost * Math.min(count, cap);
}

