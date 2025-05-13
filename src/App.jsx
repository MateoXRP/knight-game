import { useState, useEffect } from "react";
import Cookies from "js-cookie";

export default function App() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");

  const [player, setPlayer] = useState({
    health: 100,
    magic: 50,
    lives: 3,
    gold: 10,
    exp: 0,
  });

  const [enemy, setEnemy] = useState({
    name: "Goblin 👺",
    health: 60,
  });

  const [log, setLog] = useState(["⚔️ A wild Goblin appears!"]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const savedName = Cookies.get("knightPlayer");
    if (savedName) {
      setName(savedName);
    }
  }, []);

  const handleNameSubmit = () => {
    if (nameInput.trim() !== "") {
      Cookies.set("knightPlayer", nameInput.trim());
      setName(nameInput.trim());
    }
  };

  const handleSwitchUser = () => {
    Cookies.remove("knightPlayer");
    setName("");
    setNameInput("");
  };

  const attack = () => {
    if (!isPlayerTurn || gameOver) return;
    const damage = Math.floor(Math.random() * 15) + 5;
    const newHealth = Math.max(enemy.health - damage, 0);
    setEnemy((prev) => ({ ...prev, health: newHealth }));
    setLog((prev) => [`🗡️ You attack for ${damage} damage!`, ...prev]);
    setIsPlayerTurn(false);
  };

  const castSpell = () => {
    if (!isPlayerTurn || gameOver || player.magic < 10) return;
    const damage = Math.floor(Math.random() * 25) + 10;
    const newHealth = Math.max(enemy.health - damage, 0);
    setEnemy((prev) => ({ ...prev, health: newHealth }));
    setPlayer((prev) => ({ ...prev, magic: prev.magic - 10 }));
    setLog((prev) => [`🔥 You cast a spell for ${damage} damage!`, ...prev]);
    setIsPlayerTurn(false);
  };

  const enemyAttack = () => {
    if (enemy.health <= 0) return;
    const damage = Math.floor(Math.random() * 10) + 5;
    const newHealth = Math.max(player.health - damage, 0);
    setPlayer((prev) => ({ ...prev, health: newHealth }));
    setLog((prev) => [`👺 Enemy hits you for ${damage} damage!`, ...prev]);

    if (newHealth <= 0) {
      const newLives = player.lives - 1;
      if (newLives <= 0) {
        setLog((prev) => ["💀 You have died. Game over!", ...prev]);
        setGameOver(true);
      } else {
        setPlayer((prev) => ({
          ...prev,
          health: 100,
          lives: newLives,
        }));
        setLog((prev) => ["🩸 You lost a life! Revived with full health.", ...prev]);
      }
    } else {
      setIsPlayerTurn(true);
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && !gameOver && enemy.health > 0) {
      const timer = setTimeout(enemyAttack, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, enemy.health]);

  useEffect(() => {
    if (enemy.health <= 0 && !gameOver) {
      setLog((prev) => ["🏆 You defeated the enemy!", ...prev]);
      setPlayer((prev) => ({
        ...prev,
        exp: prev.exp + 10,
        gold: prev.gold + 5,
      }));
      setGameOver(true);
    }
  }, [enemy.health, gameOver]);

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
        <button
          onClick={handleNameSubmit}
          className="bg-green-700 px-4 py-2 rounded"
        >
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full p-4 text-center">
      <h1 className="text-2xl mb-2">🛡️ Knight Game - Battle</h1>
      <p className="mb-4">Welcome, {name}!</p>
      <button
        onClick={handleSwitchUser}
        className="bg-red-700 px-2 py-1 rounded text-sm mb-4"
      >
        🔄 Switch User
      </button>

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
    </div>
  );
}

