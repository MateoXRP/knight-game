// GameOver.jsx
import { useEffect, useState } from "react";
import { fetchKnightLeaderboard } from "../firebase";

export default function GameOver({ name, level, encounterIndex, restartGame }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [bestRun, setBestRun] = useState({ level: 0, encounter: 0 });
  const [totalRunes, setTotalRunes] = useState(0);
  const [kills, setKills] = useState(0);

  useEffect(() => {
    fetchKnightLeaderboard().then((entries) => {
      const userBest = entries.find(e => e.name === name);
      if (userBest) {
        const bestValue = userBest.level * 10 + userBest.encounter;
        setBestRun((level * 10 + encounterIndex) > bestValue
          ? { level, encounter: encounterIndex }
          : { level: userBest.level, encounter: userBest.encounter });

        setTotalRunes(typeof userBest.totalRunes === "number" ? userBest.totalRunes : 0);
        setKills(typeof userBest.kills === "number" ? userBest.kills : 0);
      } else {
        setBestRun({ level, encounter: encounterIndex });
        setTotalRunes(0);
        setKills(0);
      }

      setLeaderboard(
        entries
          .sort((a, b) => {
            const runA = a.level * 10 + a.encounter;
            const runB = b.level * 10 + b.encounter;

            if (runB !== runA) return runB - runA; // Primary: run progress
            if ((b.totalRunes || 0) !== (a.totalRunes || 0)) return (b.totalRunes || 0) - (a.totalRunes || 0); // Secondary: runes
            return (b.kills || 0) - (a.kills || 0); // Tertiary: kills
          })
          .slice(0, 10)
      );
    });
  }, [name, level, encounterIndex]);

  return (
    <div className="text-white bg-black min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl mb-4">💀 Game Over</h1>
      <p className="mb-2">You reached Level {level}, Encounter {encounterIndex}</p>
      <p className="mb-2">🏅 Best Run: Level {bestRun.level}, Encounter {bestRun.encounter}</p>
      <p className="mb-2">✨ Total Runes Collected: {totalRunes}</p>
      <p className="mb-4">⚔️ Total Kills: {kills}</p>

      <h2 className="text-xl mt-6 mb-2">🏆 Top 10 Runs</h2>
      <div className="bg-gray-800 p-2 rounded w-full max-w-md text-sm">
        <div className="flex justify-between font-bold border-b border-gray-600 pb-1 mb-1">
          <span>Name</span>
          <span>Run</span>
          <span>🧿 Runes</span>
          <span>⚔️ Kills</span>
        </div>
        {leaderboard.map((entry, idx) => (
          <div key={idx} className="flex justify-between">
            <span>{entry.name}</span>
            <span>Lvl {entry.level} - Enc {entry.encounter}</span>
            <span>{typeof entry.totalRunes === "number" ? entry.totalRunes : 0}</span>
            <span>{typeof entry.kills === "number" ? entry.kills : 0}</span>
          </div>
        ))}
      </div>

      <button
        onClick={restartGame}
        className="mt-6 bg-purple-700 px-6 py-3 rounded text-lg"
      >
        🔁 Restart Game
      </button>
    </div>
  );
}

