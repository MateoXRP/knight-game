export default function Shop({ player, setPlayer, setLog, setEncounterComplete, log }) {
  const buyHealthPotion = () => {
    if (player.gold < 5) {
      setLog(prev => ["❌ Not enough gold for a health potion!", ...prev]);
      return;
    }
    setPlayer(prev => ({
      ...prev,
      gold: prev.gold - 5,
      health: Math.min(prev.health + 30, 100),
    }));
    setLog(prev => ["🧪 You bought a Health Potion (+30 HP)", ...prev]);
  };

  const buyManaPotion = () => {
    if (player.gold < 5) {
      setLog(prev => ["❌ Not enough gold for a mana potion!", ...prev]);
      return;
    }
    setPlayer(prev => ({
      ...prev,
      gold: prev.gold - 5,
      magic: Math.min(prev.magic + 20, 50),
    }));
    setLog(prev => ["🔮 You bought a Mana Potion (+20 MP)", ...prev]);
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <h2 className="text-xl my-4">🛒 Welcome to the Shop!</h2>
      <button onClick={buyHealthPotion} className="bg-green-800 px-4 py-2 rounded w-full mb-2">
        🧪 Buy Health Potion (+30 HP) - 5 Gold
      </button>
      <button onClick={buyManaPotion} className="bg-blue-800 px-4 py-2 rounded w-full">
        🔮 Buy Mana Potion (+20 MP) - 5 Gold
      </button>
      <button onClick={() => setEncounterComplete(true)} className="mt-4 bg-purple-700 px-4 py-2 rounded">
        ➡️ Leave Shop
      </button>
      <div className="bg-gray-800 p-2 mt-4 rounded h-24 overflow-y-auto text-left text-sm">
        {log.map((entry, idx) => <div key={idx}>{entry}</div>)}
      </div>
    </div>
  );
}

