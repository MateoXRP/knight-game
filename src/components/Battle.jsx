// components/Battle.jsx

import EnemyStats from "./EnemyStats";
import knightImage from "/KnightEmoji.jpg"; // Ensure the image is in /public or imported correctly

export default function Battle({
  enemy,
  log,
  onAttack,
  onCastSpell,
  isPlayerTurn,
  canCast,
  disabled,
}) {
  // Extract emoji and clean name
  const emojiMatch = enemy.name.match(/[\p{Emoji}]+/gu);
  const emoji = emojiMatch ? emojiMatch[0] : "❓";
  const cleanName = enemy.name.replace(/[\p{Emoji}]+/gu, "").trim();

  return (
    <div className="w-full text-center">
      {/* Character display area */}
      <div className="flex justify-between items-center mb-4">
        {/* Player Side */}
        <div className="flex flex-col items-center w-1/2">
          <img
            src={knightImage}
            alt="Knight"
            className="w-24 h-24 object-contain rounded-full border-2 border-white"
          />
        </div>

        {/* Enemy Side */}
        <div className="flex flex-col items-center w-1/2">
          <div className="text-7xl mb-2">{emoji}</div>
          <EnemyStats enemy={{ ...enemy, name: cleanName }} />
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-x-2 my-2">
        <button
          className="bg-green-700 px-4 py-2 rounded disabled:opacity-50"
          onClick={onAttack}
          disabled={!isPlayerTurn || disabled}
        >
          Attack
        </button>

        <button
          className="bg-blue-700 px-4 py-2 rounded disabled:opacity-50"
          onClick={onCastSpell}
          disabled={!isPlayerTurn || !canCast || disabled}
        >
          Cast Spell
        </button>
      </div>

      {/* Battle log */}
      <div className="bg-gray-800 p-2 mt-4 rounded h-40 overflow-y-auto text-left text-sm max-w-md mx-auto">
        {log.map((entry, idx) => (
          <div key={idx}>{entry}</div>
        ))}
      </div>
    </div>
  );
}

