import { useState } from "react";

export default function App() {
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
    setIsPlayerTurn(true);

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
    }
  };

  if (!isPlayerTurn && !gameOver && enemy.health > 0) {
    setTimeout(enemyAttack, 1000);
  }

  if (enemy.health <= 0 && !gameOver) {
    setLog((prev) => ["🏆 You defeated the enemy!", ...prev]);
    setPlayer((prev) => ({
      ...prev,
      exp: prev.exp + 10,
      gold: prev.gold + 5,
    }));
    setGameOver(true);
  }

  return (
    <div className="max-w-md w-full p-4 text-center">
      <h1 className="text-2xl mb-4">🛡️ Knight Game - Battle</h1>
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

