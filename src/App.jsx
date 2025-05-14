import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { db, submitKnightScore, fetchKnightLeaderboard } from "./firebase";
import Battle from "./components/Battle";
import Shop from "./components/Shop";
import Inn from "./components/Inn";
import GameOver from "./components/GameOver";

const ENEMY_TABLE = {
  1: [{ name: "Goblin 👺", baseHP: 60 }, { name: "Rat 💀", baseHP: 50 }, { name: "Slime 🟢", baseHP: 40 }],
  2: [{ name: "Wolf 🐺", baseHP: 70 }, { name: "Spider 👷", baseHP: 60 }, { name: "Treant 🌲", baseHP: 80 }],
  3: [{ name: "Crab 🦀", baseHP: 90 }, { name: "Pirate ☠️", baseHP: 100 }, { name: "Parrot 🦜", baseHP: 85 }],
  4: [{ name: "Troll 🧌", baseHP: 110 }, { name: "Eagle 🦅", baseHP: 95 }, { name: "Rock Golem 🪨", baseHP: 120 }],
  5: [{ name: "Zombie 🧟", baseHP: 100 }, { name: "Crocodile 🐊", baseHP: 110 }, { name: "Witch 🧙", baseHP: 90 }],
};

const RUNE_EMOJIS = {
  red: "❤️",
  blue: "🔷",
  yellow: "🗡️",
  purple: "🔥",
  green: "🛡️",
};

const getRandomEnemy = (level) => {
  const enemies = ENEMY_TABLE[level] || ENEMY_TABLE[5];
  return enemies[Math.floor(Math.random() * enemies.length)];
};

const getRandomEncounterType = (forceBattle = false) => {
  if (forceBattle) return "battle";
  const roll = Math.random();
  if (roll < 0.7) return "battle";
  else if (roll < 0.85) return "shop";
  else return "inn";
};

export default function App() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [level, setLevel] = useState(1);
  const [encounterIndex, setEncounterIndex] = useState(0);
  const [encounterType, setEncounterType] = useState(null);
  const [previousEncounterType, setPreviousEncounterType] = useState(null);
  const [justStarted, setJustStarted] = useState(false);
  const [player, setPlayer] = useState({
    health: 100,
    magic: 50,
    lives: 3,
    gold: 10,
    exp: 0,
    runes: [],
  });
  const [enemy, setEnemy] = useState({ name: "", health: 0 });
  const [log, setLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [encounterComplete, setEncounterComplete] = useState(false);

  const redRunes = player.runes.filter(r => r === "red");
  const blueRunes = player.runes.filter(r => r === "blue");
  const yellowRunes = player.runes.filter(r => r === "yellow");
  const purpleRunes = player.runes.filter(r => r === "purple");
  const greenRunes = player.runes.filter(r => r === "green");

  const maxHP = 100 + 10 * redRunes.length;
  const maxMP = 50 + 10 * blueRunes.length;
  const displayedHealth = Math.min(player.health, maxHP);
  const displayedMagic = Math.min(player.magic, maxMP);

  useEffect(() => {
    const savedName = Cookies.get("knightPlayer");
    if (savedName && savedName.trim() !== "") {
      setName(savedName);
      setJustStarted(true);
    } else {
      Cookies.remove("knightPlayer");
    }
    fetchKnightLeaderboard().then(() => {});
  }, []);

  useEffect(() => {
    if (justStarted && name) {
      startNextEncounter();
    }
  }, [justStarted]);

  const handleNameSubmit = () => {
    if (nameInput.trim() !== "") {
      Cookies.set("knightPlayer", nameInput.trim());
      setName(nameInput.trim());
      setJustStarted(true);
    }
  };

  const handleSwitchUser = () => {
    Cookies.remove("knightPlayer");
    setName("");
    setNameInput("");
  };

  const startNextEncounter = () => {
    submitKnightScore(name, level, encounterIndex);

    if (!justStarted && encounterIndex >= 4) {
      setLevel(prev => prev + 1);
      setEncounterIndex(0);
    } else if (!justStarted) {
      setEncounterIndex(prev => prev + 1);
    }

    const type = getRandomEncounterType(justStarted);
    if (justStarted) setJustStarted(false);

    setLog([]);

    if (type === "battle") {
      const chosen = getRandomEnemy(level);
      setEnemy({ name: chosen.name, health: chosen.baseHP });
      setLog([`⚔️ A wild ${chosen.name} appears!`]);
    }

    setEncounterType(type);
    setPreviousEncounterType(type);
    setEncounterComplete(false);
    setGameOver(false);
    setIsPlayerTurn(true);
  };

  const restartGame = () => {
    setLevel(1);
    setEncounterIndex(0);
    setEncounterType(null);
    setPreviousEncounterType(null);
    setGameEnded(false);
    setPlayer({
      health: 100,
      magic: 50,
      lives: 3,
      gold: 10,
      exp: 0,
      runes: [],
    });
    setEnemy({ name: "", health: 0 });
    setLog([]);
    setIsPlayerTurn(true);
    setGameOver(false);
    setEncounterComplete(false);
    setJustStarted(true);
    fetchKnightLeaderboard().then(() => {});
  };

  useEffect(() => {
    if (!isPlayerTurn && !gameOver && encounterType === "battle" && enemy.health > 0) {
      const timer = setTimeout(() => {
        const base = Math.floor(Math.random() * 10) + 5;
        const reduction = greenRunes.length;
        const damage = Math.max(0, base - reduction);

        const newHealth = Math.max(player.health - damage, 0);

        if (newHealth <= 0) {
          const newLives = player.lives - 1;
          if (newLives <= 0) {
            setLog(prev => ["💀 You have died. Game over!", ...prev]);
            setGameOver(true);
            setGameEnded(true);
          } else {
            setPlayer(prev => ({ ...prev, health: maxHP, magic: maxMP, lives: newLives }));
            setLog(prev => ["🩸 You lost a life! Revived with full health and magic.", ...prev]);
            setIsPlayerTurn(true);
          }
        } else {
          setPlayer(prev => ({ ...prev, health: newHealth }));
          setLog(prev => [`${enemy.name.split(' ').pop()} hits you for ${damage} damage!`, ...prev]);
          setIsPlayerTurn(true);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, encounterType, enemy.health, player.health]);

  useEffect(() => {
    if (enemy.health <= 0 && !gameOver && encounterType === "battle") {
      const runeTypes = ["red", "blue", "yellow", "purple", "green"];
      const foundRune = Math.random() < 0.25 ? runeTypes[Math.floor(Math.random() * runeTypes.length)] : null;

      const newLog = ["🏆 You defeated the enemy!"];
      const updates = {
        exp: player.exp + 10,
        gold: player.gold + 5,
      };

      if (foundRune) {
        updates.runes = [...player.runes, foundRune];
        newLog.unshift(`🔮 You found a ${foundRune.toUpperCase()} Rune!`);
      }

      setPlayer(prev => ({ ...prev, ...updates }));
      setLog(prev => [...newLog, ...prev]);
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
      <GameOver
        name={name}
        level={level}
        encounterIndex={encounterIndex}
        restartGame={restartGame}
      />
    );
  }

  return (
    <div className="text-white bg-black min-h-screen p-4 flex flex-col items-center justify-center">
      <h1 className="text-2xl mb-1">🛡️ Knight Game</h1>
      <p className="mb-2">Welcome, {name}!</p>
      <p className="mb-4">🌍 Level {level} — Encounter {encounterIndex + 1}/5 ({encounterType})</p>
      <button onClick={handleSwitchUser} className="bg-red-700 px-2 py-1 rounded text-sm mb-4">🔄 Switch User</button>

      <div className="mb-4 text-center">
        <strong>Player</strong><br />
        ❤️ {displayedHealth} / {maxHP} | 🔮 {displayedMagic} / {maxMP} | 💰 {player.gold} | ⭐ {player.exp} | 👤 x{player.lives}
        {player.runes.length > 0 && (
          <div className="mt-1">
            🧣 Runes: {player.runes.map((rune, i) => (
              <span key={i}>{RUNE_EMOJIS[rune] || "❓"}</span>
            ))}
          </div>
        )}
      </div>

      {encounterType === "battle" && (
        <Battle
          enemy={enemy}
          log={log}
          isPlayerTurn={isPlayerTurn}
          canCast={player.magic >= 10}
          disabled={gameOver}
          onAttack={() => {
            const base = Math.floor(Math.random() * 15) + 5;
            const bonus = yellowRunes.length * 2;
            const damage = base + bonus;
            setEnemy(prev => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
            setLog(prev => ["🗡️ You attack!", ...prev]);
            setIsPlayerTurn(false);
          }}
          onCastSpell={() => {
            if (player.magic < 10) return;
            const base = Math.floor(Math.random() * 25) + 10;
            const bonus = purpleRunes.length * 4;
            const damage = base + bonus;
            setEnemy(prev => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
            setPlayer(prev => ({ ...prev, magic: prev.magic - 10 }));
            setLog(prev => ["🔥 You cast a spell!", ...prev]);
            setIsPlayerTurn(false);
          }}
        />
      )}

      {encounterType === "shop" && (
        <Shop
          player={player}
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

