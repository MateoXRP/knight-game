// components/PlayerStats.jsx

import { formatRunes } from "../utils/runes";

export default function PlayerStats({ player, maxHP, maxMP }) {
  return (
    <>
      <div className="mb-2">
        <strong>Player</strong><br />
        ❤️ {player.health} / {maxHP} | 🔮 {player.magic} / {maxMP} | 💰 {player.gold} | ⭐ {player.exp} | 👤 x{player.lives}
      </div>
      <div className="mb-4">
        <strong>Runes:</strong> {formatRunes(player.runes)}
      </div>
    </>
  );
}

