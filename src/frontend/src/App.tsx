import CustomizeScreen from "@/components/CustomizeScreen";
import GameOverScreen from "@/components/GameOverScreen";
import GameScreen from "@/components/GameScreen";
import LootBoxScreen from "@/components/LootBoxScreen";
import MapBuilderScreen from "@/components/MapBuilderScreen";
import MapSelectScreen from "@/components/MapSelectScreen";
import MenuScreen from "@/components/MenuScreen";
import { loadUnlocked, saveUnlocked } from "@/game/lootbox";
import { DEFAULT_MAP } from "@/game/maps";
import type {
  GameMode,
  Hat,
  MapDefinition,
  Platform,
  PlayerCustomization,
  SpecialAbility,
} from "@/game/types";
import { useState } from "react";

type AppScreen =
  | "menu"
  | "customize"
  | "mapSelect"
  | "mapBuilder"
  | "game"
  | "lootbox"
  | "gameover";

const DEFAULT_P1: PlayerCustomization = {
  color: "red",
  hat: "none",
  special: "dash",
};
const DEFAULT_P2: PlayerCustomization = {
  color: "blue",
  hat: "crown",
  special: "energyBlast",
};

const initialUnlocked = loadUnlocked();

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("menu");
  const [mode, setMode] = useState<GameMode>("local");
  const [p1Custom, setP1Custom] = useState<PlayerCustomization>(DEFAULT_P1);
  const [p2Custom, setP2Custom] = useState<PlayerCustomization>(DEFAULT_P2);
  const [p1Wins, setP1Wins] = useState(0);
  const [p2Wins, setP2Wins] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [lootWinner, setLootWinner] = useState<1 | 2>(1);
  const [unlockedHats, setUnlockedHats] = useState<Hat[]>(initialUnlocked.hats);
  const [unlockedAbilities, setUnlockedAbilities] = useState<SpecialAbility[]>(
    initialUnlocked.abilities,
  );
  const [gameKey, setGameKey] = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(
    DEFAULT_MAP.platforms,
  );
  const [selectedBgColor, setSelectedBgColor] = useState<string>(
    DEFAULT_MAP.bgColor,
  );
  // Store customizations during map selection flow
  const [pendingP1, setPendingP1] = useState<PlayerCustomization>(DEFAULT_P1);
  const [pendingP2, setPendingP2] = useState<PlayerCustomization>(DEFAULT_P2);

  const handleMenuStart = (selectedMode: GameMode) => {
    setMode(selectedMode);
    setScreen("customize");
  };

  const handleCustomizeReady = (
    p1: PlayerCustomization,
    p2: PlayerCustomization,
  ) => {
    setPendingP1(p1);
    setPendingP2(p2);
    setScreen("mapSelect");
  };

  const handleMapSelect = (map: MapDefinition) => {
    setSelectedPlatforms(map.platforms);
    setSelectedBgColor(map.bgColor);
    setP1Custom(pendingP1);
    setP2Custom(pendingP2);
    setP1Wins(0);
    setP2Wins(0);
    setCurrentRound(1);
    setGameKey((k) => k + 1);
    setScreen("game");
  };

  const handleCustomMap = () => {
    setScreen("mapBuilder");
  };

  const handleMapBuilderPlay = (platforms: Platform[], bgColor: string) => {
    setSelectedPlatforms(platforms);
    setSelectedBgColor(bgColor);
    setP1Custom(pendingP1);
    setP2Custom(pendingP2);
    setP1Wins(0);
    setP2Wins(0);
    setCurrentRound(1);
    setGameKey((k) => k + 1);
    setScreen("game");
  };

  const handleRoundEnd = (
    winner: 0 | 1 | 2,
    newP1Wins: number,
    newP2Wins: number,
  ) => {
    setP1Wins(newP1Wins);
    setP2Wins(newP2Wins);
    setCurrentRound((r) => r + 1);
    if (winner === 1 || (winner === 2 && mode === "local")) {
      setLootWinner(winner as 1 | 2);
      setScreen("lootbox");
    }
  };

  const handleLootBoxDone = (
    newHats: Hat[],
    newAbilities: SpecialAbility[],
  ) => {
    setUnlockedHats(newHats);
    setUnlockedAbilities(newAbilities);
    saveUnlocked(newHats, newAbilities);
    setScreen("game");
  };

  const handleGameOver = (wins1: number, wins2: number) => {
    setP1Wins(wins1);
    setP2Wins(wins2);
    setScreen("gameover");
  };

  const handleRematch = () => {
    setP1Wins(0);
    setP2Wins(0);
    setCurrentRound(1);
    setGameKey((k) => k + 1);
    setScreen("game");
  };

  const handleMenu = () => {
    setScreen("menu");
  };

  return (
    <>
      {screen === "menu" && <MenuScreen onStart={handleMenuStart} />}
      {screen === "customize" && (
        <CustomizeScreen
          mode={mode}
          unlockedHats={unlockedHats}
          unlockedAbilities={unlockedAbilities}
          onReady={handleCustomizeReady}
          onBack={() => setScreen("menu")}
        />
      )}
      {screen === "mapSelect" && (
        <MapSelectScreen
          onSelect={handleMapSelect}
          onCustom={handleCustomMap}
          onBack={() => setScreen("customize")}
        />
      )}
      {screen === "mapBuilder" && (
        <MapBuilderScreen
          onPlay={handleMapBuilderPlay}
          onBack={() => setScreen("mapSelect")}
        />
      )}
      {(screen === "game" || screen === "lootbox") && (
        <div style={{ display: screen === "lootbox" ? "none" : "block" }}>
          <GameScreen
            key={gameKey}
            mode={mode}
            p1Custom={p1Custom}
            p2Custom={p2Custom}
            initialP1Wins={p1Wins}
            initialP2Wins={p2Wins}
            initialRound={currentRound}
            mapPlatforms={selectedPlatforms}
            mapBgColor={selectedBgColor}
            onGameOver={handleGameOver}
            onRoundEnd={handleRoundEnd}
          />
        </div>
      )}
      {screen === "lootbox" && (
        <LootBoxScreen
          winner={lootWinner}
          mode={mode}
          unlockedHats={unlockedHats}
          unlockedAbilities={unlockedAbilities}
          onDone={handleLootBoxDone}
        />
      )}
      {screen === "gameover" && (
        <GameOverScreen
          p1Wins={p1Wins}
          p2Wins={p2Wins}
          p1Custom={p1Custom}
          p2Custom={p2Custom}
          mode={mode}
          onRematch={handleRematch}
          onMenu={handleMenu}
        />
      )}
    </>
  );
}
