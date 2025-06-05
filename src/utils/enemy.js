// utils/enemy.js

const ENEMY_TABLE = {
  1: [{ name: "Goblin 👺", baseHP: 60 }, { name: "Rat 🐀", baseHP: 50 }, { name: "Slime 🟢", baseHP: 40 }],
  2: [{ name: "Wolf 🐺", baseHP: 70 }, { name: "Spider 🕷", baseHP: 60 }, { name: "Treant 🌲", baseHP: 80 }],
  3: [{ name: "Crab 🦀", baseHP: 90 }, { name: "Pirate ☠️", baseHP: 100 }, { name: "Parrot 🦜", baseHP: 85 }],
  4: [{ name: "Troll 🧌", baseHP: 110 }, { name: "Eagle 🦅", baseHP: 95 }, { name: "Rock Golem 🪨", baseHP: 120 }],
  5: [{ name: "Zombie 🧟", baseHP: 100 }, { name: "Crocodile 🐊", baseHP: 110 }, { name: "Witch 🧙", baseHP: 90 }],
};

export function getRandomEnemy(level, encounter) {
  const baseList = ENEMY_TABLE[level] || ENEMY_TABLE[5];
  const chosen = baseList[Math.floor(Math.random() * baseList.length)];

  const scaleFactor = 1 + (level - 1) * 0.075 + (encounter - 1) * 0.025;

  return {
    name: chosen.name,
    health: Math.floor(chosen.baseHP * scaleFactor),
    atk: Math.floor(10 * scaleFactor),
    def: Math.floor(2 * scaleFactor)
  };
}

