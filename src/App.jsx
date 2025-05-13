import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function App() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");

  const [level, setLevel] = useState(1);
  const [encounterIndex, setEncounterIndex] = useState(0);
  const [encounterType, setEncounterType] = useState(null);
  const [previousEncounterType, setPreviousEncounterType] = useState(null);

  const [player, setPlayer] = useState({
    health: 100,
    magic: 50,
    lives: 3,
    gold: 10,
    exp: 0,
  });

  const [enemy, setEnemy] = useState({ name: "", health: 0 });
  const [log, setLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [encounterComplete, setEncounterComplete] = useState(false);

  useEffect(() => {
    const savedName = Cookies.get("knightPlayer");
    if (savedName) setName(savedName);
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
    } while (
      (type === previousEncounterType && (type === "shop" || type === "inn"))
    );

    return type;
  };

  const startNextEncounter = (isFirstTurn = false) => {
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
      setEnemy({
        name: "Goblin 👺",
        health: 60 + level * 10,
      });
      setLog(["⚔️ A wild Goblin appears!"]);
    }
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
    });
    setEnemy({ name: "", health: 0 });
    setLog([]);
    setIsPlayerTurn(true);
    setGameOver(false);
    setEncounterComplete(false);
    startNextEncounter(true);
  };

  const attack = () => {
    if (!isPlayerTurn || gameOver || encounterType !== "battle") return;
    const damage = Math.floor(Math.random() * 15) + 5;
    setEnemy((prev) => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
    setLog((prev) => [`🗡️ You attack for ${damage} damage!`, ...prev]);
    setIsPlayerTurn(false);
  };

  const castSpell = () => {
    if (!isPlayerTurn || gameOver || player.magic < 10 || encounterType !== "battle") return;
    const damage = Math.floor(Math.random() * 25) + 10;
    setEnemy((prev) => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
    setPlayer((prev) => ({ ...prev, magic: prev.magic - 10 }));
    setLog((prev) => [`🔥 You cast a spell for ${damage} damage!`, ...prev]);
    setIsPlayerTurn(false);
  };

  const enemyAttack = () => {
    const damage = Math.floor(Math.random() * 10) + 5;
    const newHealth = Math.max(player.health - damage, 0);
    setPlayer((prev) => ({ ...prev, health: newHealth }));
    setLog((prev) => [`👺 Enemy hits you for ${damage} damage!`, ...prev]);

    if (newHealth <= 0) {
      const newLives = player.lives - 1;
      if (newLives <= 0) {
        setLog((prev) => ["💀 You have died. Game over!", ...prev]);
        setGameOver(true);
        setGameEnded(true);
      } else {
        setPlayer((prev) => ({
          ...prev,
          health: 100,
          magic: 50, // ✅ Restore magic on life loss
          lives: newLives,
        }));
        setLog((prev) => ["🩸 You lost a life! Revived with full health and magic.", ...prev]);
        setIsPlayerTurn(true);
      }
    } else {
      setIsPlayerTurn(true);
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && !gameOver && encounterType === "battle" && enemy.health > 0) {
      const timer = setTimeout(enemyAttack, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, enemy.health, encounterType]);

  useEffect(() => {
    if (enemy.health <= 0 && !gameOver && encounterType === "battle") {
      setLog((prev) => ["🏆 You defeated the enemy!", ...prev]);
      setPlayer((prev) => ({
        ...prev,
        exp: prev.exp + 10,
        gold: prev.gold + 5,
      }));
      setGameOver(true);
      setEncounterComplete(true);
    }
  }, [enemy.health, gameOver, encounterType]);

  const buyHealthPotion = () => {
    if (player.gold < 5) {
      setLog((prev) => ["❌ Not enough gold for a health potion!", ...prev]);
      return;
    }
    setPlayer((prev) => ({
      ...prev,
      gold: prev.gold - 5,
      health: Math.min(prev.health + 30, 100),
    }));
    setLog((prev) => ["🧪 You bought a Health Potion (+30 HP)", ...prev]);
  };

  const buyManaPotion = () => {
    if (player.gold < 5) {
      setLog((prev) => ["❌ Not enough gold for a mana potion!", ...prev]);
      return;
    }
    setPlayer((prev) => ({
      ...prev,
      gold: prev.gold - 5,
      magic: Math.min(prev.magic + 20, 50),
    }));
    setLog((prev) => ["🔮 You bought a Mana Potion (+20 MP)", ...prev]);
  };

  const restAtInn = () => {
    if (player.gold < 10) {
      setLog((prev) => ["❌ Not enough gold to rest at the inn!", ...prev]);
      return;
    }
    setPlayer((prev) => ({
      ...prev,
      gold: prev.gold - 10,
      health: 100,
      magic: 50,
    }));
    setLog((prev) => ["🛏️ You rested at the inn. Fully healed!", ...prev]);
    setEncounterComplete(true);
  };

  if (!name) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white text-center p-4">
        <h1 className="text-3xl mb-4">💀 Game Over</h1>
        <p className="mb-4">You fought bravely, {name}.</p>
        <button onClick={restartGame} className="bg-purple-700 px-6 py-3 rounded text-lg">
          🔁 Restart Game
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full p-4 text-center">
      <h1 className="text-2xl mb-1">🛡️ Knight Game</h1>
      <p className="mb-2">Welcome, {name}!</p>
      <p className="mb-4">🌍 Level {level} — Encounter {encounterIndex}/5 ({encounterType})</p>
      <button onClick={handleSwitchUser} className="bg-red-700 px-2 py-1 rounded text-sm mb-4">
        🔄 Switch User
      </button>

      <div className="mb-4">
        <strong>Player</strong><br />
        ❤️ {player.health} | 🔮 {player.magic} | 💰 {player.gold} | ⭐ {player.exp} | 👤 x{player.lives}
      </div>

      {encounterType === "battle" && (
        <>
          <div className="mb-2">
            <strong>{enemy.name}</strong><br />
            ❤️ {enemy.health}
          </div>
          <div className="space-x-2 my-2">
            <button
              className="bg-green-700 px-4 py-2 rounded disabled:opacity-50"
              onClick={attack}
              disabled={!isPlayerTurn || gameOver}
            >
              Attack
            </button>
            <button
              className="bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
              onClick={castSpell}
              disabled={!isPlayerTurn || player.magic < 10 || gameOver}
            >
              Cast Spell
            </button>
          </div>
          <div className="bg-gray-800 p-2 mt-4 rounded h-40 overflow-y-auto text-left text-sm">
            {log.map((entry, idx) => (
              <div key={idx}>{entry}</div>
            ))}
          </div>
        </>
      )}

      {encounterType === "shop" && (
        <>
          <h2 className="text-xl my-4">🛒 Welcome to the Shop!</h2>
          <div className="space-y-2 mb-4">
            <button onClick={buyHealthPotion} className="bg-green-800 px-4 py-2 rounded w-full">
              🧪 Buy Health Potion (+30 HP) - 5 Gold
            </button>
            <button onClick={buyManaPotion} className="bg-blue-800 px-4 py-2 rounded w-full">
              🔮 Buy Mana Potion (+20 MP) - 5 Gold
            </button>
          </div>
          <div className="bg-gray-800 p-2 mt-4 rounded h-24 overflow-y-auto text-left text-sm">
            {log.map((entry, idx) => (
              <div key={idx}>{entry}</div>
            ))}
          </div>
          <button
            onClick={() => setEncounterComplete(true)}
            className="mt-4 bg-purple-700 px-4 py-2 rounded"
          >
            ➡️ Leave Shop
          </button>
        </>
      )}

      {encounterType === "inn" && (
        <>
          <h2 className="text-xl my-4">🛏️ Welcome to the Inn</h2>
          <p className="mb-4">Rest to fully recover for 10 Gold</p>
          <button onClick={restAtInn} className="bg-yellow-700 px-4 py-2 rounded mb-2">
            🌙 Rest Now
          </button>
          <button
            onClick={() => setEncounterComplete(true)}
            className="bg-gray-700 px-4 py-2 rounded"
          >
            🚪 Leave Inn
          </button>
          <div className="bg-gray-800 p-2 mt-4 rounded h-24 overflow-y-auto text-left text-sm">
            {log.map((entry, idx) => (
              <div key={idx}>{entry}</div>
            ))}
          </div>
        </>
      )}

      {encounterComplete && (
        <button
          onClick={startNextEncounter}
          className="mt-6 bg-purple-700 px-4 py-2 rounded"
        >
          ➡️ Continue
        </button>
      )}
    </div>
  );
}

