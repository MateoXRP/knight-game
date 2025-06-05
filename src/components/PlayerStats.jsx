// components/PlayerStats.jsx

import { formatRunes, getRuneBoost } from "../utils/runes";

export default function PlayerStats({ player, maxHP, maxMP }) {
  const atk = Math.floor(10 * getRuneBoost(player.runes, "yellow"));
  const magic = Math.floor(20 * getRuneBoost(player.runes, "purple"));

  const greenCount = Math.min(player.runes.filter(r => r === "green").length, 4);
  const def = 20 + greenCount * 20;

  return (
    <>
      <div className="mb-2">
        <strong>Player</strong><br />
        ❤️ {player.health} / {maxHP} | 🔮 {player.magic} / {maxMP} | 💰 {player.gold} | 💀 {player.kills} | 👤 x{player.lives}
      </div>
      <div className="mb-2">
        <strong>Stats:</strong> 🗡️ {atk} | 🛡️ {def} | 🔥 {magic}
      </div>
      <div className="mb-4">
        <strong>Runes:</strong> {formatRunes(player.runes)}
      </div>
    </>
  );
}

