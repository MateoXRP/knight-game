export default function Battle({
  enemy,
  log,
  onAttack,
  onCastSpell,
  isPlayerTurn,
  canCast,
  disabled,
}) {
  return (
    <div className="w-full text-center">
      <div className="mb-2">
        <strong>{enemy.name}</strong>
        <br />
        ❤️ {enemy.health}
      </div>

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

      <div className="bg-gray-800 p-2 mt-4 rounded h-40 overflow-y-auto text-left text-sm">
        {log.map((entry, idx) => (
          <div key={idx}>{entry}</div>
        ))}
      </div>
    </div>
  );
}

