import { useEffect, useState } from "react";
import { fetchKnightLeaderboard, submitKnightScore } from "../firebase";

export default function GameOver({ name, level, encounterIndex, restartGame }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [bestRun, setBestRun] = useState({ level: 0, encounter: 0 });

  useEffect(() => {
    const currentValue = level * 10 + encounterIndex;

    submitKnightScore(name, level, encounterIndex); // always write the current run

    fetchKnightLeaderboard().then((entries) => {
      const userBest = entries.find(e => e.name === name);
      if (userBest) {
        const bestValue = userBest.level * 10 + userBest.encounter;
        setBestRun(currentValue > bestValue
          ? { level, encounter: encounterIndex }
          : { level: userBest.level, encounter: userBest.encounter });
      } else {
        setBestRun({ level, encounter: encounterIndex });
      }

      setLeaderboard(
        entries
          .sort((a, b) => (b.level * 10 + b.encounter) - (a.level * 10 + a.encounter))
          .slice(0, 10)
      );
    });
  }, [name, level, encounterIndex]);

  return (
    <div className="text-white bg-black min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl mb-4">💀 Game Over</h1>
      <p className="mb-2">You reached Level {level}, Encounter {encounterIndex}</p>
      <p className="mb-4">🏅 Best Run: Level {bestRun.level}, Encounter {bestRun.encounter}</p>

      <h2 className="text-xl mt-6 mb-2">🏆 Top 10 Runs</h2>
      <div className="bg-gray-800 p-2 rounded w-full max-w-md text-sm">
        {leaderboard.map((entry, idx) => (
          <div key={idx} className="flex justify-between">
            <span>{entry.name}</span>
            <span>Lvl {entry.level} - Enc {entry.encounter}</span>
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

