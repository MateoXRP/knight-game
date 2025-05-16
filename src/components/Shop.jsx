export default function Shop({ player, setPlayer, setLog, setEncounterComplete, log }) {
  const { gold, health, magic, lives, level, runes } = player;

  const maxHP = 100 + 10 * (runes?.filter(r => r === "red").length || 0);
  const maxMP = 50 + 10 * (runes?.filter(r => r === "blue").length || 0);

  const buyHealthPotion = () => {
    if (gold < 5) {
      setLog(prev => ["❌ Not enough gold for a health potion!", ...prev]);
      return;
    }
    setPlayer(prev => ({
      ...prev,
      gold: gold - 5,
      health: Math.min(health + 30, maxHP),
    }));
    setLog(prev => ["🧪 You bought a Health Potion (+30 HP)", ...prev]);
  };

  const buyManaPotion = () => {
    if (gold < 5) {
      setLog(prev => ["❌ Not enough gold for a mana potion!", ...prev]);
      return;
    }
    setPlayer(prev => ({
      ...prev,
      gold: gold - 5,
      magic: Math.min(magic + 20, maxMP),
    }));
    setLog(prev => ["🔮 You bought a Mana Potion (+20 MP)", ...prev]);
  };

  const buyExtraLife = () => {
    if (gold < 25) {
      setLog(prev => ["❌ Not enough gold for an extra life!", ...prev]);
      return;
    }
    setPlayer(prev => ({
      ...prev,
      gold: gold - 25,
      lives: lives + 1,
    }));
    setLog(prev => ["💖 You bought an Extra Life!", ...prev]);
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <h2 className="text-xl my-4">🛒 Welcome to the Shop!</h2>

      <button onClick={buyHealthPotion} className="bg-green-800 px-4 py-2 rounded w-full mb-2">
        🧪 Buy Health Potion (+30 HP) - 5 Gold
      </button>

      <button onClick={buyManaPotion} className="bg-blue-800 px-4 py-2 rounded w-full mb-2">
        🔮 Buy Mana Potion (+20 MP) - 5 Gold
      </button>

      {(lives < 5 && level < 11) && (
        <button onClick={buyExtraLife} className="bg-pink-800 px-4 py-2 rounded w-full mb-2">
          💖 Buy Extra Life - 25 Gold
        </button>
      )}

      <button onClick={() => setEncounterComplete(true)} className="mt-4 bg-purple-700 px-4 py-2 rounded">
        ➡️ Leave Shop
      </button>

      <div className="bg-gray-800 p-2 mt-4 rounded h-24 overflow-y-auto text-left text-sm">
        {log.map((entry, idx) => <div key={idx}>{entry}</div>)}
      </div>
    </div>
  );
}

