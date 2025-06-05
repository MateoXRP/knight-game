// components/EnemyStats.jsx

export default function EnemyStats({ enemy }) {
  return (
    <div className="mb-2">
      <strong>{enemy.name}</strong><br />
      ❤️ {enemy.health} | 🗡️ {enemy.atk} | 🛡️ {Math.round(enemy.def * 10)}
    </div>
  );
}

