export default function Inn({ player, setPlayer, setLog, setEncounterComplete, log }) {
  const redRunes = player.runes.filter(r => r === "red");
  const blueRunes = player.runes.filter(r => r === "blue");

  const maxHP = 100 + 10 * redRunes.length;
  const maxMP = 50 + 10 * blueRunes.length;

  const rest = () => {
    if (player.gold < 5) {
      setLog(prev => ["❌ Not enough gold to rest at the inn!", ...prev]);
      return;
    }

    setPlayer(prev => ({
      ...prev,
      gold: prev.gold - 5,
      health: maxHP,
      magic: maxMP,
    }));

    setLog(prev => ["🏨 You rested at the inn and feel fully restored! (-5 Gold)", ...prev]);
  };

  return (
    <div className="text-center w-full max-w-md mx-auto">
      <h2 className="text-xl my-4">🏨 Welcome to the Inn!</h2>

      <button onClick={rest} className="bg-blue-700 px-4 py-2 rounded w-full mb-2">
        💤 Rest and Restore HP/MP (-5 Gold)
      </button>

      <button onClick={() => setEncounterComplete(true)} className="bg-purple-700 px-4 py-2 rounded w-full">
        ➡️ Leave Inn
      </button>

      <div className="bg-gray-800 p-2 mt-4 rounded h-24 overflow-y-auto text-left text-sm">
        {log.map((entry, idx) => (
          <div key={idx}>{entry}</div>
        ))}
      </div>
    </div>
  );
}

