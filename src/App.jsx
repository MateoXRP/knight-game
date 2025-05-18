import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { db, submitKnightScore, fetchKnightLeaderboard } from "./firebase";
import Battle from "./components/Battle";
import Shop from "./components/Shop";
import Inn from "./components/Inn";

const ENEMY_TABLE = {
  1: [{ name: "Goblin 👺", baseHP: 60 }, { name: "Rat 🐀", baseHP: 50 }, { name: "Slime 🟢", baseHP: 40 }],
  2: [{ name: "Wolf 🐺", baseHP: 70 }, { name: "Spider 🕷", baseHP: 60 }, { name: "Treant 🌲", baseHP: 80 }],
  3: [{ name: "Crab 🦀", baseHP: 90 }, { name: "Pirate ☠️", baseHP: 100 }, { name: "Parrot 🦜", baseHP: 85 }],
  4: [{ name: "Troll 🧌", baseHP: 110 }, { name: "Eagle 🦅", baseHP: 95 }, { name: "Rock Golem 🪨", baseHP: 120 }],
  5: [{ name: "Zombie 🧟", baseHP: 100 }, { name: "Crocodile 🐊", baseHP: 110 }, { name: "Witch 🧙", baseHP: 90 }],
};

const getRandomEnemy = (level) => {
  const enemies = ENEMY_TABLE[level] || ENEMY_TABLE[5];
  return enemies[Math.floor(Math.random() * enemies.length)];
};

const RUNE_EMOJIS = {
  red: "🔴",
  blue: "🔵",
  yellow: "🟡",
  purple: "🟣",
  green: "🟢",
};

const formatRunes = (runes) => {
  const counts = runes.reduce((acc, rune) => {
    acc[rune] = (acc[rune] || 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .map(([rune, count]) => `${RUNE_EMOJIS[rune]} x${count}`)
    .join("  ");
};

const getMaxHP = (runes) => 100 + 10 * runes.filter(r => r === "red").length;
const getMaxMP = (runes) => 50 + 10 * runes.filter(r => r === "blue").length;

export default function App() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [level, setLevel] = useState(1);
  const [encounterIndex, setEncounterIndex] = useState(0);
  const [encounterType, setEncounterType] = useState(null);
  const [previousEncounterType, setPreviousEncounterType] = useState(null);
  const [player, setPlayer] = useState({ health: 100, magic: 50, lives: 3, gold: 10, exp: 0, runes: [] });
  const [enemy, setEnemy] = useState({ name: "", health: 0 });
  const [log, setLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [encounterComplete, setEncounterComplete] = useState(false);

  useEffect(() => {
    const savedName = Cookies.get("knightPlayer");
    if (savedName && savedName.trim() !== "") {
      setName(savedName);
      startNextEncounter(true);
    } else {
      Cookies.remove("knightPlayer");
    }
    fetchKnightLeaderboard().then(() => {});
  }, []);

  const handleNameSubmit = () => {
    if (nameInput.trim() !== "") {
      Cookies.set("knightPlayer", nameInput.trim());
      setName(nameInput.trim());
      startNextEncounter(true);
    }
  };

  const handleSwitchUser = () => {
    Cookies.remove("knightPlayer");
    setName("");
    setNameInput("");
  };

  const getRandomEncounterType = (isFirstTurn = false) => {
    if (isFirstTurn && level === 1 && encounterIndex === 0) return "battle";
    let type;
    do {
      const roll = Math.random();
      if (roll < 0.7) type = "battle";
      else if (roll < 0.85) type = "shop";
      else type = "inn";
    } while ((type === previousEncounterType && (type === "shop" || type === "inn")));
    return type;
  };

  const startNextEncounter = (isFirstTurn = false) => {
    submitKnightScore(name, level, encounterIndex);
    if (encounterIndex >= 5) {
      setLevel((prev) => prev + 1);
      setEncounterIndex(0);
    } else {
      setEncounterIndex((prev) => prev + 1);
    }
    const type = getRandomEncounterType(isFirstTurn);
    setEncounterType(type);
    setPreviousEncounterType(type);
    setEncounterComplete(false);
    setGameOver(false);
    setIsPlayerTurn(true);
    setLog([]);
    if (type === "battle") {
      const chosen = getRandomEnemy(level);
      setEnemy({ name: chosen.name, health: chosen.baseHP });
      setLog([`⚔️ A wild ${chosen.name} appears!`]);
    }
  };

  const restartGame = () => {
    setLevel(1);
    setEncounterIndex(0);
    setEncounterType(null);
    setPreviousEncounterType(null);
    setGameEnded(false);
    setPlayer({ health: 100, magic: 50, lives: 3, gold: 10, exp: 0, runes: [] });
    setEnemy({ name: "", health: 0 });
    setLog([]);
    setIsPlayerTurn(true);
    setGameOver(false);
    setEncounterComplete(false);
    fetchKnightLeaderboard().then(() => {});
    startNextEncounter(true);
  };

  useEffect(() => {
    if (!isPlayerTurn && !gameOver && encounterType === "battle" && enemy.health > 0) {
      const timer = setTimeout(() => {
        const damage = Math.floor(Math.random() * 10) + 5;
        const newHealth = Math.max(player.health - damage, 0);

        if (newHealth <= 0) {
          const newLives = player.lives - 1;
          if (newLives <= 0) {
            setLog(prev => ["💀 You have died. Game over!", ...prev]);
            setGameOver(true);
            setGameEnded(true);
          } else {
            setPlayer(prev => ({ ...prev, health: getMaxHP(prev.runes), magic: getMaxMP(prev.runes), lives: newLives }));
            setLog(prev => ["🩸 You lost a life! Revived with full health and magic.", ...prev]);
            setIsPlayerTurn(true);
          }
        } else {
          setPlayer(prev => ({ ...prev, health: newHealth }));
          setLog(prev => [`${enemy.name} hits you for ${damage} damage!`, ...prev]);
          setIsPlayerTurn(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, encounterType, enemy.health, player.health]);

  useEffect(() => {
    if (enemy.health <= 0 && !gameOver && encounterType === "battle") {
      setLog((prev) => ["🏆 You defeated the enemy!", ...prev]);
      setPlayer((prev) => {
        const updated = { ...prev, exp: prev.exp + 10, gold: prev.gold + 5 };
        if (Math.random() < 0.25) {
          const runeTypes = ["red", "blue", "yellow", "purple", "green"];
          const found = runeTypes[Math.floor(Math.random() * runeTypes.length)];
          updated.runes = [...(prev.runes || []), found];
          setLog(prevLog => [`✨ You found a ${RUNE_EMOJIS[found]} rune!`, ...prevLog]);
        }
        return updated;
      });
      setGameOver(true);
      setEncounterComplete(true);
    }
  }, [enemy.health, gameOver, encounterType]);

  if (!name || name.trim() === "") {
    return (
      <div className="text-white bg-black min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl mb-4">🛡️ Knight Game</h1>
        <p className="mb-2">Enter your name to begin:</p>
        <input
          type="text"
          className="text-black p-2 rounded mb-2"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button onClick={handleNameSubmit} className="bg-green-700 px-4 py-2 rounded">
          Start Game
        </button>
      </div>
    );
  }

  if (gameEnded) {
    return (
      <div className="text-white bg-black min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl mb-4">💀 Game Over</h1>
        <p className="mb-4">You fought bravely, {name}.</p>
        <button onClick={restartGame} className="bg-purple-700 px-6 py-3 rounded text-lg">
          🔁 Restart Game
        </button>
      </div>
    );
  }

  const maxHP = getMaxHP(player.runes || []);
  const maxMP = getMaxMP(player.runes || []);

  return (
    <div className="text-white bg-black min-h-screen p-4 flex flex-col items-center justify-center max-w-md mx-auto">
      <h1 className="text-2xl mb-1">🛡️ Knight Game</h1>
      <p className="mb-2">Welcome, {name}!</p>
      <p className="mb-4">🌍 Level {level} — Encounter {encounterIndex}/5 ({encounterType})</p>
      <button onClick={handleSwitchUser} className="bg-red-700 px-2 py-1 rounded text-sm mb-4">🔄 Switch User</button>

      <div className="mb-2">
        <strong>Player</strong><br />
        ❤️ {player.health} / {maxHP} | 🔮 {player.magic} / {maxMP} | 💰 {player.gold} | ⭐ {player.exp} | 👤 x{player.lives}
      </div>
      <div className="mb-4">
        <strong>Runes:</strong> {formatRunes(player.runes || [])}
      </div>

      {encounterType === "battle" && (
        <Battle
          enemy={enemy}
          log={log}
          isPlayerTurn={isPlayerTurn}
          canCast={player.magic >= 10}
          disabled={gameOver}
          onAttack={() => {
            const damage = Math.floor(Math.random() * 15) + 5;
            setEnemy(prev => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
            setLog(prev => [`🗡️ You attack for ${damage} damage!`, ...prev]);
            setIsPlayerTurn(false);
          }}
          onCastSpell={() => {
            if (player.magic < 10) return;
            const damage = Math.floor(Math.random() * 25) + 10;
            setEnemy(prev => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
            setPlayer(prev => ({ ...prev, magic: prev.magic - 10 }));
            setLog(prev => [`🔥 You cast a spell for ${damage} damage!`, ...prev]);
            setIsPlayerTurn(false);
          }}
        />
      )}

      {encounterType === "shop" && (
        <Shop
          player={{ ...player, level }}
          setPlayer={setPlayer}
          setLog={setLog}
          setEncounterComplete={setEncounterComplete}
          log={log}
        />
      )}

      {encounterType === "inn" && (
        <Inn
          player={player}
          setPlayer={setPlayer}
          setLog={setLog}
          setEncounterComplete={setEncounterComplete}
          log={log}
        />
      )}

      {encounterComplete && (
        <button onClick={startNextEncounter} className="mt-6 bg-purple-700 px-4 py-2 rounded">
          ➡️ Continue
        </button>
      )}
    </div>
  );
}

