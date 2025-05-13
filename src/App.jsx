import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function App() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");

  const [level, setLevel] = useState(1);
  const [encounterIndex, setEncounterIndex] = useState(0);
  const [encounterType, setEncounterType] = useState(null);

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
  const [encounterComplete, setEncounterComplete] = useState(false);

  useEffect(() => {
    const savedName = Cookies.get("knightPlayer");
    if (savedName) setName(savedName);
  }, []);

  const handleNameSubmit = () => {
    if (nameInput.trim() !== "") {
      Cookies.set("knightPlayer", nameInput.trim());
      setName(nameInput.trim());
      startNextEncounter();
    }
  };

  const handleSwitchUser = () => {
    Cookies.remove("knightPlayer");
    setName("");
    setNameInput("");
  };

  const getRandomEncounterType = () => {
    const roll = Math.random();
    if (roll < 0.7) return "battle";
    if (roll < 0.85) return "shop";
    return "inn";
  };

  const startNextEncounter = () => {
    if (encounterIndex >= 5) {
      setLevel((prev) => prev + 1);
      setEncounterIndex(0);
    } else {
      setEncounterIndex((prev) => prev + 1);
    }

    const type = getRandomEncounterType();
    setEncounterType(type);
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

  // --- Battle Logic ---
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
        setEncounterComplete(true);
      } else {
        setPlayer((prev) => ({
          ...prev,
          health: 100,
          lives: newLives,
        }));
        setLog((prev) => ["🩸 You lost a life! Revived with full health.", ...prev]);
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

  return (
    <div className="max-w-md w-full p-4 text-center">
      <h1 className="text-2xl mb-1">🛡️ Knight Game</h1>
      <p className="mb-2">Welcome, {name}!</p>
      <p className="mb-4">🌍 Level {level} — Encounter {encounterIndex}/5 ({encounterType})</p>
      <button onClick={handleSwitchUser} className="bg-red-700 px-2 py-1 rounded text-sm mb-4">
        🔄 Switch User
      </button>

      {encounterType === "battle" && (
        <>
          <div className="mb-2">
            <strong>Player</strong><br />
            ❤️ {player.health} | 🔮 {player.magic} | 💰 {player.gold} | ⭐ {player.exp} | 👤 x{player.lives}
          </div>
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
        <div className="my-10 text-lg">🛒 You find a shop... (coming soon!)</div>
      )}

      {encounterType === "inn" && (
        <div className="my-10 text-lg">🛏️ You rest at an inn and regain strength... (coming soon!)</div>
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

