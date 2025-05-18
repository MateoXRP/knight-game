export default function Inn({ player, setPlayer, setLog, setEncounterComplete, log }) {
  const maxHP = 100 + 10 * (player.runes?.filter(r => r === "red").length || 0);
  const maxMP = 50 + 10 * (player.runes?.filter(r => r === "blue").length || 0);

  const rest = () => {
    if (player.gold < 10) {
      setLog(prev => ["❌ Not enough gold to rest at the inn!", ...prev]);
      return;
    }
    setPlayer(prev => ({
      ...prev,
      gold: prev.gold - 10,
      health: maxHP,
      magic: maxMP,
    }));
    setLog(prev => ["🛏️ You rested at the inn. Fully healed!", ...prev]);
    setEncounterComplete(true);
  };

  return (
    <div className="w-full max-w-md mx-auto text-center">
      <h2 className="text-xl my-4">🛏️ Welcome to the Inn</h2>
      <p className="mb-4">Rest to fully recover for 10 Gold</p>
      <button onClick={rest} className="bg-yellow-700 px-4 py-2 rounded mb-2">🌙 Rest Now</button>
      <button onClick={() => setEncounterComplete(true)} className="bg-gray-700 px-4 py-2 rounded">🚪 Leave Inn</button>
      <div className="bg-gray-800 p-2 mt-4 rounded h-24 overflow-y-auto text-left text-sm">
        {log.map((entry, idx) => <div key={idx}>{entry}</div>)}
      </div>
    </div>
  );
}

