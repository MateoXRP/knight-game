// App.jsx

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { submitKnightProgress, fetchKnightLeaderboard } from "./firebase";
import Battle from "./components/Battle";
import Shop from "./components/Shop";
import Inn from "./components/Inn";
import GameOver from "./components/GameOver";
import { getRandomEnemy } from "./utils/enemy";
import PlayerStats from "./components/PlayerStats";
import {
  RUNE_EMOJIS,
  getMaxHP,
  getMaxMP,
  getRuneBoost
} from "./utils/runes";

export default function App() {
  const [name, setName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [level, setLevel] = useState(1);
  const [encounterIndex, setEncounterIndex] = useState(0);
  const [encounterType, setEncounterType] = useState(null);
  const [previousEncounterType, setPreviousEncounterType] = useState(null);
  const [player, setPlayer] = useState({ health: 100, magic: 50, lives: 3, gold: 10, exp: 0, runes: [], kills: 0 });
  const [enemy, setEnemy] = useState({ name: "", health: 0, atk: 10, def: 2 });
  const [log, setLog] = useState([]);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [encounterComplete, setEncounterComplete] = useState(false);
  const [shouldStartFresh, setShouldStartFresh] = useState(false);
  const [rewardGiven, setRewardGiven] = useState(false);
  const [confirmingSwitch, setConfirmingSwitch] = useState(false);

  const [playerAnim, setPlayerAnim] = useState("");
  const [enemyAnim, setEnemyAnim] = useState("");

  useEffect(() => {
    const savedName = Cookies.get("knightPlayer");
    if (savedName && savedName.trim() !== "") {
      setName(savedName);
      setShouldStartFresh(true);
    } else {
      Cookies.remove("knightPlayer");
    }
    fetchKnightLeaderboard();
  }, []);

  useEffect(() => {
    if (shouldStartFresh) {
      setShouldStartFresh(false);
      startNextEncounter(true);
    }
  }, [shouldStartFresh]);

  const handleNameSubmit = () => {
    if (nameInput.trim() !== "") {
      Cookies.set("knightPlayer", nameInput.trim());
      setName(nameInput.trim());
      setShouldStartFresh(true);
    }
  };

  const handleSwitchUser = () => {
    Cookies.remove("knightPlayer");
    setName("");
    setNameInput("");
    setLevel(1);
    setEncounterIndex(0);
    setEncounterType(null);
    setPreviousEncounterType(null);
    setPlayer({ health: 100, magic: 50, lives: 3, gold: 10, exp: 0, runes: [], kills: 0 });
    setEnemy({ name: "", health: 0, atk: 10, def: 2 });
    setLog([]);
    setIsPlayerTurn(true);
    setGameOver(false);
    setGameEnded(false);
    setEncounterComplete(false);
    setRewardGiven(false);
    setConfirmingSwitch(false);
  };

  const restartGame = () => {
    setLevel(1);
    setEncounterIndex(0);
    setEncounterType(null);
    setPreviousEncounterType(null);
    setPlayer({ health: 100, magic: 50, lives: 3, gold: 10, exp: 0, runes: [], kills: 0 });
    setEnemy({ name: "", health: 0, atk: 10, def: 2 });
    setLog([]);
    setIsPlayerTurn(true);
    setGameOver(false);
    setGameEnded(false);
    setEncounterComplete(false);
    setShouldStartFresh(true);
    setRewardGiven(false);
    setConfirmingSwitch(false);
  };

  const getRandomEncounterType = (isFirstTurn = false, lvl = level, idx = encounterIndex) => {
    if (isFirstTurn && lvl === 1 && idx === 1) return "battle";
    if (lvl > 20) return "battle";
    let type;
    do {
      const roll = Math.random();
      if (roll < 0.7) type = "battle";
      else if (roll < 0.85) type = "shop";
      else type = "inn";
    } while ((type === previousEncounterType && (type === "shop" || type === "inn")));
    return type;
  };

  const startNextEncounter = (isFirstTurn = false) => {
    setRewardGiven(false);

    let nextLevel = level;
    let nextEncounter = encounterIndex;

    if (encounterIndex === 0) nextEncounter = 1;
    else if (encounterIndex >= 5) {
      nextLevel += 1;
      nextEncounter = 1;
    } else nextEncounter += 1;

    setLevel(nextLevel);
    setEncounterIndex(nextEncounter);

    const type = getRandomEncounterType(isFirstTurn, nextLevel, nextEncounter);
    setEncounterType(type);
    setPreviousEncounterType(type);
    setEncounterComplete(false);
    setGameOver(false);
    setIsPlayerTurn(true);
    setLog([]);

    if (type === "battle") {
      const chosen = getRandomEnemy(nextLevel, nextEncounter);
      setEnemy(chosen);
      setLog([`⚔️ A wild ${chosen.name} appears!`]);
    }
  };

  useEffect(() => {
    if (!isPlayerTurn && !gameOver && encounterType === "battle" && enemy.health > 0) {
      setTimeout(() => {
        setEnemyAnim("animate-shake glow-green");
        setTimeout(() => {
          setEnemyAnim("");
          setPlayerAnim("animate-shake glow-red");

          const greenCount = Math.min(player.runes.filter(r => r === "green").length, 4);
          const defenseFactor = 1 - 0.20 * greenCount;
          const base = Math.floor(Math.random() * (enemy.atk / 2)) + (enemy.atk / 2);
          const netDamage = Math.max(Math.floor(base * defenseFactor), 1);
          const newHealth = Math.max(player.health - netDamage, 0);

          if (newHealth <= 0) {
            const newLives = player.lives - 1;
            if (newLives <= 0) {
              submitKnightProgress(name, level, encounterIndex, []);
              setLog(prev => ["💀 You have died. Game over!", ...prev]);
              setGameOver(true);
              setGameEnded(true);
            } else {
              setPlayer(prev => ({
                ...prev,
                health: getMaxHP(prev.runes),
                magic: getMaxMP(prev.runes),
                lives: newLives
              }));
              setLog(prev => ["🩸 You lost a life! Revived with full health and magic.", ...prev]);
              setIsPlayerTurn(true);
            }
          } else {
            setPlayer(prev => ({ ...prev, health: newHealth }));
            setLog(prev => [`${enemy.name} hits you for ${netDamage} damage!`, ...prev]);
            setIsPlayerTurn(true);
          }

          setTimeout(() => setPlayerAnim(""), 250);
        }, 250);
      }, 200);
    }
  }, [isPlayerTurn, gameOver, encounterType, enemy, player]);

  useEffect(() => {
    if (!rewardGiven && !gameOver && encounterType === "battle" && enemy.health <= 0) {
      setRewardGiven(true);

      let foundRune = null;
      if (level <= 20 && Math.random() < 0.25) {
        const runeTypes = ["red", "blue", "yellow", "purple", "green"];
        foundRune = runeTypes[Math.floor(Math.random() * runeTypes.length)];
      }

      const nextLevel = encounterIndex >= 5 ? level + 1 : level;
      const nextEncounter = encounterIndex >= 5 ? 1 : encounterIndex + 1;

      setPlayer(prev => {
        const newRunes = foundRune ? [...prev.runes, foundRune] : prev.runes;
        return {
          ...prev,
          exp: prev.exp + 10,
          gold: prev.gold + 5,
          runes: newRunes,
          kills: prev.kills + 1,
          health: foundRune === "red" ? getMaxHP(newRunes) : prev.health,
          magic: foundRune === "blue" ? getMaxMP(newRunes) : prev.magic,
        };
      });

      setLog(prev => {
        const base = ["🏆 You defeated the enemy!"];
        if (foundRune) base.unshift(`✨ You found a ${RUNE_EMOJIS[foundRune]} rune!`);
        return [...base, ...prev];
      });

      setGameOver(true);
      setEncounterComplete(true);

      const runePayload = foundRune ? [foundRune] : [];
      submitKnightProgress(name, nextLevel, nextEncounter, runePayload);
    }
  }, [enemy.health, gameOver, encounterType, rewardGiven]);

  const maxHP = getMaxHP(player.runes);
  const maxMP = getMaxMP(player.runes);
  const yellowBoost = getRuneBoost(player.runes, "yellow");
  const purpleBoost = getRuneBoost(player.runes, "purple");

  if (!name || name.trim() === "") {
    return (
      <div className="text-white bg-black min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-3xl mb-4">🛡️ Knight Game</h1>
        <p className="mb-2">Enter your name to begin:</p>
        <input
          type="text"
          className="text-black p-2 rounded mb-2"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
        />
        <button onClick={handleNameSubmit} className="bg-green-700 px-4 py-2 rounded">
          Start Game
        </button>
      </div>
    );
  }

  if (gameEnded) {
    return (
      <GameOver
        name={name}
        level={level}
        encounterIndex={encounterIndex}
        restartGame={restartGame}
      />
    );
  }

  return (
    <div className="text-white bg-black min-h-screen p-4 flex flex-col items-center justify-center max-w-md mx-auto">
      <h1 className="text-2xl mb-1">🛡️ Knight Game</h1>
      <p className="mb-4">🌍 Level {level} — Encounter {encounterIndex}/5 ({encounterType})</p>

      <PlayerStats player={{ ...player, name }} maxHP={maxHP} maxMP={maxMP} />

      {encounterType === "battle" && (
        <Battle
          enemy={enemy}
          log={log}
          isPlayerTurn={isPlayerTurn}
          canCast={player.magic >= 10}
          disabled={gameOver}
          playerAnim={playerAnim}
          enemyAnim={enemyAnim}
          onAttack={() => {
            setPlayerAnim("animate-shake glow-green");
            setTimeout(() => {
              let damage = Math.floor(Math.random() * 15) + 5;
              damage = Math.floor(damage * yellowBoost);
              damage = Math.max(damage - enemy.def, 1);
              setEnemy(prev => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
              setLog(prev => [`🗡️ You attack for ${damage} damage!`, ...prev]);
              setPlayerAnim("");
              setEnemyAnim("animate-shake glow-red");
              setTimeout(() => {
                setEnemyAnim("");
                setTimeout(() => {
                  setIsPlayerTurn(false);
                }, 250);
              }, 250);
            }, 250);
          }}
          onCastSpell={() => {
            if (player.magic < 10) return;
            setPlayerAnim("animate-shake glow-blue");
            setTimeout(() => {
              let damage = Math.floor(Math.random() * 25) + 10;
              damage = Math.floor(damage * purpleBoost);
              damage = Math.max(damage - enemy.def, 1);
              setEnemy(prev => ({ ...prev, health: Math.max(prev.health - damage, 0) }));
              setPlayer(prev => ({ ...prev, magic: prev.magic - 10 }));
              setLog(prev => [`🔥 You cast a spell for ${damage} damage!`, ...prev]);
              setPlayerAnim("");
              setEnemyAnim("animate-shake glow-red");
              setTimeout(() => {
                setEnemyAnim("");
                setTimeout(() => {
                  setIsPlayerTurn(false);
                }, 250);
              }, 250);
            }, 250);
          }}
        />
      )}

      {encounterType === "shop" && (
        <Shop
          player={{ ...player, level }}
          setPlayer={setPlayer}
          setLog={setLog}
          setEncounterComplete={setEncounterComplete}
          log={log}
        />
      )}

      {encounterType === "inn" && (
        <Inn
          player={player}
          setPlayer={setPlayer}
          setLog={setLog}
          setEncounterComplete={setEncounterComplete}
          log={log}
        />
      )}

      {encounterComplete && (
        <button onClick={startNextEncounter} className="mt-6 bg-purple-700 px-4 py-2 rounded">
          ➡️ Continue
        </button>
      )}

      {confirmingSwitch ? (
        <div className="mt-4 text-center">
          <p className="mb-2">Are you sure you want to switch user?</p>
          <div className="space-x-2">
            <button onClick={handleSwitchUser} className="bg-red-700 px-3 py-1 rounded">✅ Yes</button>
            <button onClick={() => setConfirmingSwitch(false)} className="bg-gray-600 px-3 py-1 rounded">❌ No</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setConfirmingSwitch(true)}
          className="bg-red-700 px-2 py-1 rounded text-sm mt-4"
        >
          🔄 Switch User
        </button>
      )}
    </div>
  );
}
