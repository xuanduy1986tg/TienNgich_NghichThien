import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Artifact,
  Item,
  Monster,
  Mount,
  Quest,
  RealmInfo,
  RootData,
  RootType,
  Skill,
  SaveGameData,
} from './game/types';
import {
  ALL_SKILLS,
  ARTIFACTS,
  INITIAL_ITEMS,
  INITIAL_QUESTS,
  INITIAL_ROOTS,
  MAPS,
  MOUNTS,
  REALMS,
  MapConfig,
} from './game/data';
import {
  calculatePlayerStats,
  canBreakthrough,
  canUpgradeSkill,
  upgradeSkill,
  findBestEquipment,
} from './game/logic';
import { sound } from './game/audio';
import { TitleScreen } from './components/TitleScreen';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { BreakthroughModal } from './components/modals/BreakthroughModal';
import { InventoryModal } from './components/modals/InventoryModal';
import { SkillsModal } from './components/modals/SkillsModal';
import { RootsModal } from './components/modals/RootsModal';
import { ArtifactsModal } from './components/modals/ArtifactsModal';
import { MountsModal } from './components/modals/MountsModal';
import { QuestsModal } from './components/modals/QuestsModal';
import { GuildModal } from './components/modals/GuildModal';
import { CrossServerModal } from './components/modals/CrossServerModal';
import { WangLinMeshModal } from './components/modals/WangLinMeshModal';

type GameState = 'title' | 'playing' | 'gameover';
type ModalType =
  | 'breakthrough'
  | 'inventory'
  | 'skills'
  | 'roots'
  | 'artifacts'
  | 'mounts'
  | 'quests'
  | 'guild'
  | 'cross_server'
  | 'character_mesh'
  | null;

const SAVE_STORAGE_KEY = 'TIEN_NGHICH_SAVE_DATA_V1';

function getInitialSave(): Partial<SaveGameData> | null {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SAVE_STORAGE_KEY) : null;
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function App() {
  // Check for ?autostart=1
  const isAutostart = typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [gameState, setGameState] = useState<GameState>(isAutostart ? 'playing' : 'title');
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const initialSave = useMemo(() => getInitialSave(), []);

  // Player Core Cultivation State
  const [currentRealm, setCurrentRealm] = useState<RealmInfo>(() => {
    if (initialSave?.currentRealmId) {
      return REALMS.find((r) => r.id === initialSave.currentRealmId) || REALMS[0];
    }
    return REALMS[0];
  });
  const [currentTuVi, setCurrentTuVi] = useState<number>(initialSave?.currentTuVi ?? 85);
  const [spiritStones, setSpiritStones] = useState<number>(initialSave?.spiritStones ?? 350);
  const [rootStones, setRootStones] = useState<number>(initialSave?.rootStones ?? 8);
  const [cucCanhStones, setCucCanhStones] = useState<number>(initialSave?.cucCanhStones ?? 3);

  // Vitals
  const [playerHp, setPlayerHp] = useState<number>(initialSave?.playerHp ?? REALMS[0].baseHp);
  const [playerMp, setPlayerMp] = useState<number>(initialSave?.playerMp ?? REALMS[0].baseMp);

  // Entities & Collections
  const [roots, setRoots] = useState<Record<RootType, RootData>>(initialSave?.roots ?? INITIAL_ROOTS);
  const [inventory, setInventory] = useState<Item[]>(initialSave?.inventory ?? INITIAL_ITEMS);
  const [equippedWeapon, setEquippedWeapon] = useState<Item | null>(() => {
    if (initialSave !== null && initialSave.equippedWeapon !== undefined) return initialSave.equippedWeapon;
    return INITIAL_ITEMS[2];
  });
  const [equippedArmor, setEquippedArmor] = useState<Item | null>(() => {
    if (initialSave !== null && initialSave.equippedArmor !== undefined) return initialSave.equippedArmor;
    return INITIAL_ITEMS[3];
  });
  const [equippedAccessory, setEquippedAccessory] = useState<Item | null>(() => {
    if (initialSave !== null && initialSave.equippedAccessory !== undefined) return initialSave.equippedAccessory;
    return null;
  });

  const [skills, setSkills] = useState<Skill[]>(() => {
    if (initialSave?.skills && Array.isArray(initialSave.skills)) {
      return ALL_SKILLS.map((defSkill) => {
        const saved = initialSave.skills!.find((s) => s.id === defSkill.id);
        if (saved) {
          return {
            ...defSkill,
            level: saved.level || defSkill.level,
            damageMultiplier: saved.damageMultiplier || defSkill.damageMultiplier,
            cooldown: saved.cooldown || defSkill.cooldown,
            radius: saved.radius || defSkill.radius,
            upgradeCostTuVi: saved.upgradeCostTuVi || defSkill.upgradeCostTuVi,
            upgradeCostStones: saved.upgradeCostStones || defSkill.upgradeCostStones,
          };
        }
        return defSkill;
      });
    }
    return ALL_SKILLS;
  });

  const [mounts, setMounts] = useState<Mount[]>(initialSave?.mounts ?? MOUNTS);
  const [artifacts, setArtifacts] = useState<Artifact[]>(initialSave?.artifacts ?? ARTIFACTS);
  const [quests, setQuests] = useState<Quest[]>(initialSave?.quests ?? INITIAL_QUESTS);
  const [currentMap, setCurrentMap] = useState<MapConfig>(() => {
    if (initialSave?.currentMapId) {
      return MAPS.find((m) => m.id === initialSave.currentMapId) || MAPS[0];
    }
    return MAPS[0];
  });

  // Save notification toast
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Special Timers & Dew
  const [dewReady, setDewReady] = useState<boolean>(true);
  const [thienNghichDewActive, setThienNghichDewActive] = useState<boolean>(false);
  const [receivedGuildPillsToday, setReceivedGuildPillsToday] = useState<boolean>(false);

  // Active Mount & Artifact
  const activeMount = useMemo(() => mounts.find((m) => m.active) || null, [mounts]);
  const activeArtifact = useMemo(() => artifacts.find((a) => a.active) || null, [artifacts]);

  // Player aggregate stats
  const playerStats = useMemo(() => {
    return calculatePlayerStats(
      currentRealm,
      [equippedWeapon, equippedArmor, equippedAccessory],
      roots,
      activeMount,
      activeArtifact,
      thienNghichDewActive
    );
  }, [
    currentRealm,
    equippedWeapon,
    equippedArmor,
    equippedAccessory,
    roots,
    activeMount,
    activeArtifact,
    thienNghichDewActive,
  ]);

  // Mirror game state to document.body.dataset.state
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  // Passive HP / MP natural regeneration loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setPlayerHp((prev) => Math.min(playerStats.maxHp, prev + Math.round(playerStats.maxHp * 0.04)));
      setPlayerMp((prev) => Math.min(playerStats.maxMp, prev + Math.round(playerStats.maxMp * 0.08)));

      // Decrement skill cooldowns
      setSkills((prevSkills) =>
        prevSkills.map((s) => {
          if (s.currentCooldown > 0) {
            return {
              ...s,
              currentCooldown: Math.max(0, s.currentCooldown - 0.2),
            };
          }
          return s;
        })
      );
    }, 200);

    return () => clearInterval(interval);
  }, [gameState, playerStats.maxHp, playerStats.maxMp]);

  // Global hotkeys (B: Bag, C: Cultivation, L: Roots, P: Artifacts, T: Mounts, Q: Quests, M: Mute, Esc: Close modal)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        }
      } else if (e.key === 'b' || e.key === 'B') {
        setActiveModal((prev) => (prev === 'inventory' ? null : 'inventory'));
      } else if (e.key === 'c' || e.key === 'C') {
        setActiveModal((prev) => (prev === 'breakthrough' ? null : 'breakthrough'));
      } else if (e.key === 'l' || e.key === 'L') {
        setActiveModal((prev) => (prev === 'roots' ? null : 'roots'));
      } else if (e.key === 'p' || e.key === 'P') {
        setActiveModal((prev) => (prev === 'artifacts' ? null : 'artifacts'));
      } else if (e.key === 't' || e.key === 'T') {
        setActiveModal((prev) => (prev === 'mounts' ? null : 'mounts'));
      } else if (e.key === 'q' || e.key === 'Q') {
        setActiveModal((prev) => (prev === 'quests' ? null : 'quests'));
      } else if (e.key === 'k' || e.key === 'K') {
        setActiveModal((prev) => (prev === 'skills' ? null : 'skills'));
      } else if (e.key === 'm' || e.key === 'M') {
        const nextMute = sound.toggleMute();
        setIsMuted(nextMute);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [activeModal]);

  // Sound mute toggle
  const handleToggleMute = useCallback(() => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
  }, []);

  // Damage handling
  const handleTakeDamage = useCallback((dmg: number) => {
    setPlayerHp((prev) => {
      const nextHp = prev - dmg;
      if (nextHp <= 0) {
        sound.playTribulationThunder();
        setGameState('gameover');
        return 0;
      }
      return nextHp;
    });
  }, []);

  // Healing handling
  const handleHeal = useCallback((hp: number, mp: number) => {
    setPlayerHp((prev) => Math.min(playerStats.maxHp, prev + hp));
    if (mp > 0) {
      setPlayerMp((prev) => Math.min(playerStats.maxMp, prev + mp));
    }
  }, [playerStats.maxHp, playerStats.maxMp]);

  // Gains Tu Vi & Spirit Stones
  const handleGainTuViAndStones = useCallback((tuVi: number, stones: number) => {
    setCurrentTuVi((prev) => prev + tuVi);
    setSpiritStones((prev) => prev + stones);

    // Update quest progress for collect_stones
    setQuests((prev) =>
      prev.map((q) => {
        if (q.targetType === 'collect_stones' && !q.completed) {
          const nextCount = q.currentCount + stones;
          return {
            ...q,
            currentCount: nextCount,
            completed: nextCount >= q.targetCount,
          };
        }
        return q;
      })
    );
  }, []);

  // Looting item
  const handleLootItem = useCallback((item: Item, count: number) => {
    if (item.id === 'linh_can_thach' || item.name.includes('Linh Căn')) {
      setRootStones((prev) => prev + count);
    } else if (item.id === 'cuc_canh_tinh' || item.name.includes('Cực Cảnh')) {
      setCucCanhStones((prev) => prev + count);
    } else {
      setInventory((prev) => {
        const existingIdx = prev.findIndex((i) => i.id === item.id);
        if (existingIdx >= 0) {
          const copy = [...prev];
          copy[existingIdx].count += count;
          return copy;
        } else {
          return [...prev, { ...item, count }];
        }
      });
    }
  }, []);

  // Monster killed event
  const handleMonsterKilled = useCallback((monster: Monster) => {
    setQuests((prev) =>
      prev.map((q) => {
        if (q.targetType === 'kill' && !q.completed) {
          const nextCount = q.currentCount + 1;
          return {
            ...q,
            currentCount: nextCount,
            completed: nextCount >= q.targetCount,
          };
        }
        return q;
      })
    );
  }, []);

  // Skill casting trigger
  const handleCastSkillTrigger = useCallback(
    (skillId: string): boolean => {
      const skillIdx = skills.findIndex((s) => s.id === skillId);
      if (skillIdx < 0) return false;
      const skill = skills[skillIdx];

      if (skill.currentCooldown > 0 || playerMp < skill.mpCost) {
        return false;
      }

      // Deduct MP
      setPlayerMp((prev) => Math.max(0, prev - skill.mpCost));

      // Put skill on cooldown
      setSkills((prev) => {
        const copy = [...prev];
        copy[skillIdx] = {
          ...copy[skillIdx],
          currentCooldown: copy[skillIdx].cooldown,
        };
        return copy;
      });

      return true;
    },
    [skills, playerMp]
  );

  // Breakthrough handlers
  const handleBreakthroughSuccess = useCallback((newRealm: RealmInfo) => {
    setCurrentRealm(newRealm);
    setCurrentTuVi(0);
    setPlayerHp(newRealm.baseHp);
    setPlayerMp(newRealm.baseMp);

    // Update quest progress for realm
    setQuests((prev) =>
      prev.map((q) => {
        if (q.targetType === 'realm' && !q.completed) {
          return {
            ...q,
            currentCount: newRealm.index,
            completed: newRealm.index >= q.targetCount,
          };
        }
        return q;
      })
    );
  }, []);

  const handleBreakthroughFailed = useCallback((remainingTuVi: number) => {
    setCurrentTuVi(remainingTuVi);
  }, []);

  // Equip / Unequip with Bag inventory swapping
  const handleEquipItem = useCallback(
    (item: Item) => {
      let replacedItem: Item | null = null;
      if (item.type === 'weapon') {
        replacedItem = equippedWeapon;
        setEquippedWeapon({ ...item, count: 1 });
      } else if (item.type === 'armor') {
        replacedItem = equippedArmor;
        setEquippedArmor({ ...item, count: 1 });
      } else if (item.type === 'accessory') {
        replacedItem = equippedAccessory;
        setEquippedAccessory({ ...item, count: 1 });
      } else {
        return;
      }

      // Remove 1 copy of item from inventory, and put replaced item back if any
      setInventory((prev) => {
        let nextInv = prev
          .map((invItem) => (invItem.id === item.id ? { ...invItem, count: invItem.count - 1 } : invItem))
          .filter((invItem) => invItem.count > 0);

        if (replacedItem) {
          const existingIdx = nextInv.findIndex((i) => i.id === replacedItem!.id);
          if (existingIdx >= 0) {
            nextInv = nextInv.map((i, idx) => (idx === existingIdx ? { ...i, count: i.count + 1 } : i));
          } else {
            nextInv = [...nextInv, { ...replacedItem, count: 1 }];
          }
        }
        return nextInv;
      });

      sound.playEquip();
    },
    [equippedWeapon, equippedArmor, equippedAccessory]
  );

  const handleUnequipItem = useCallback(
    (type: 'weapon' | 'armor' | 'accessory') => {
      let unequippedItem: Item | null = null;
      if (type === 'weapon') {
        unequippedItem = equippedWeapon;
        setEquippedWeapon(null);
      } else if (type === 'armor') {
        unequippedItem = equippedArmor;
        setEquippedArmor(null);
      } else if (type === 'accessory') {
        unequippedItem = equippedAccessory;
        setEquippedAccessory(null);
      }

      if (unequippedItem) {
        setInventory((prev) => {
          const existingIdx = prev.findIndex((i) => i.id === unequippedItem!.id);
          if (existingIdx >= 0) {
            return prev.map((i, idx) => (idx === existingIdx ? { ...i, count: i.count + 1 } : i));
          } else {
            return [...prev, { ...unequippedItem!, count: 1 }];
          }
        });
        sound.playEquip();
      }
    },
    [equippedWeapon, equippedArmor, equippedAccessory]
  );

  // Auto-equip best items across all slots
  const handleAutoEquipBest = useCallback(() => {
    const { bestWeapon, bestArmor, bestAccessory } = findBestEquipment(
      inventory,
      equippedWeapon,
      equippedArmor,
      equippedAccessory
    );

    let changed = false;
    let nextInv = [...inventory];

    if (bestWeapon && bestWeapon.id !== equippedWeapon?.id) {
      changed = true;
      if (equippedWeapon) nextInv.push({ ...equippedWeapon, count: 1 });
      nextInv = nextInv
        .map((i) => (i.id === bestWeapon.id ? { ...i, count: i.count - 1 } : i))
        .filter((i) => i.count > 0);
      setEquippedWeapon({ ...bestWeapon, count: 1 });
    }

    if (bestArmor && bestArmor.id !== equippedArmor?.id) {
      changed = true;
      if (equippedArmor) nextInv.push({ ...equippedArmor, count: 1 });
      nextInv = nextInv
        .map((i) => (i.id === bestArmor.id ? { ...i, count: i.count - 1 } : i))
        .filter((i) => i.count > 0);
      setEquippedArmor({ ...bestArmor, count: 1 });
    }

    if (bestAccessory && bestAccessory.id !== equippedAccessory?.id) {
      changed = true;
      if (equippedAccessory) nextInv.push({ ...equippedAccessory, count: 1 });
      nextInv = nextInv
        .map((i) => (i.id === bestAccessory.id ? { ...i, count: i.count - 1 } : i))
        .filter((i) => i.count > 0);
      setEquippedAccessory({ ...bestAccessory, count: 1 });
    }

    if (changed) {
      setInventory(nextInv);
      sound.playEquip();
      setSaveNotice('Đã tự động gắn trang bị mạnh nhất vào các ô!');
      setTimeout(() => setSaveNotice(null), 3000);
    } else {
      setSaveNotice('Các ô hiện tại đã gắn trang bị tối ưu nhất!');
      setTimeout(() => setSaveNotice(null), 3000);
    }
  }, [inventory, equippedWeapon, equippedArmor, equippedAccessory]);

  // Upgrade Skill
  const handleUpgradeSkill = useCallback(
    (skillId: string) => {
      const targetSkill = skills.find((s) => s.id === skillId);
      if (!targetSkill) return;

      if (!canUpgradeSkill(targetSkill, currentTuVi, spiritStones)) return;

      setCurrentTuVi((prev) => prev - targetSkill.upgradeCostTuVi);
      setSpiritStones((prev) => prev - targetSkill.upgradeCostStones);

      setSkills((prev) =>
        prev.map((s) => {
          if (s.id === skillId) {
            return upgradeSkill(s);
          }
          return s;
        })
      );

      sound.playBreakthroughFanfare();
      setSaveNotice(`Tiên Thuật [${targetSkill.vietnameseName}] đã thăng cấp thành công!`);
      setTimeout(() => setSaveNotice(null), 3000);
    },
    [skills, currentTuVi, spiritStones]
  );

  // Manual & Auto Save Game
  const handleSaveGame = useCallback(
    (showToast: boolean = true) => {
      try {
        const saveData: SaveGameData = {
          version: 1,
          timestamp: Date.now(),
          currentRealmId: currentRealm.id,
          currentTuVi,
          spiritStones,
          rootStones,
          cucCanhStones,
          playerHp,
          playerMp,
          roots,
          inventory,
          equippedWeapon,
          equippedArmor,
          equippedAccessory,
          skills,
          mounts,
          artifacts,
          quests,
          currentMapId: currentMap.id,
        };
        localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(saveData));
        if (showToast) {
          sound.playEquip();
          setSaveNotice(`Đã lưu thần thức lúc ${new Date().toLocaleTimeString()}!`);
          setTimeout(() => setSaveNotice(null), 3000);
        }
      } catch (err) {
        console.error('Lỗi khi lưu game:', err);
      }
    },
    [
      currentRealm.id,
      currentTuVi,
      spiritStones,
      rootStones,
      cucCanhStones,
      playerHp,
      playerMp,
      roots,
      inventory,
      equippedWeapon,
      equippedArmor,
      equippedAccessory,
      skills,
      mounts,
      artifacts,
      quests,
      currentMap.id,
    ]
  );

  // Autosave interval every 12 seconds when playing
  useEffect(() => {
    if (gameState !== 'playing') return;
    const interval = setInterval(() => {
      handleSaveGame(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [gameState, handleSaveGame]);

  // Consumable Pill Use
  const handleUseConsumable = useCallback(
    (item: Item) => {
      if (!item.consumableEffect) return;

      if (item.consumableEffect.type === 'gain_tuvi') {
        setCurrentTuVi((prev) => prev + item.consumableEffect!.value);
      } else if (item.consumableEffect.type === 'thien_nghich_drop') {
        setPlayerHp(playerStats.maxHp);
        setPlayerMp(playerStats.maxMp);
        setThienNghichDewActive(true);
        setTimeout(() => setThienNghichDewActive(false), (item.consumableEffect.duration || 60) * 1000);
      }

      // Decrement item count
      setInventory((prev) =>
        prev
          .map((i) => (i.id === item.id ? { ...i, count: i.count - 1 } : i))
          .filter((i) => i.count > 0)
      );
    },
    [playerStats.maxHp, playerStats.maxMp]
  );

  // Sell item
  const handleSellItem = useCallback((item: Item, count: number = 1) => {
    setSpiritStones((prev) => prev + item.price * count);
    setInventory((prev) =>
      prev
        .map((i) => (i.id === item.id ? { ...i, count: i.count - count } : i))
        .filter((i) => i.count > 0)
    );
  }, []);

  // Root upgrade
  const handleUpgradeRoot = useCallback((rootType: RootType) => {
    const root = roots[rootType];
    const isCucCanh = rootType === 'cuc_canh';
    const mats = isCucCanh ? cucCanhStones : rootStones;

    if (root.level >= root.maxLevel || mats < root.costCount) return;

    if (isCucCanh) {
      setCucCanhStones((prev) => prev - root.costCount);
    } else {
      setRootStones((prev) => prev - root.costCount);
    }

    setRoots((prev) => ({
      ...prev,
      [rootType]: {
        ...prev[rootType],
        level: prev[rootType].level + 1,
        costCount: prev[rootType].costCount + (isCucCanh ? 2 : 3),
      },
    }));

    // Update quest progress for upgrade_root
    setQuests((prev) =>
      prev.map((q) => {
        if (q.targetType === 'upgrade_root' && !q.completed) {
          const nextCount = q.currentCount + 1;
          return {
            ...q,
            currentCount: nextCount,
            completed: nextCount >= q.targetCount,
          };
        }
        return q;
      })
    );
  }, [roots, cucCanhStones, rootStones]);

  // Artifact toggle
  const handleToggleArtifact = useCallback((artifactId: string) => {
    setArtifacts((prev) =>
      prev.map((a) => ({
        ...a,
        active: a.id === artifactId ? !a.active : a.active,
      }))
    );
  }, []);

  // Condense Dew from Thiên Nghịch Châu
  const handleCondenseDew = useCallback(() => {
    if (!dewReady) return;
    setCurrentTuVi((prev) => prev + 500);
    setDewReady(false);
    setTimeout(() => setDewReady(true), 30000); // Ready again in 30s
  }, [dewReady]);

  // Mount selection
  const handleSelectMount = useCallback((mountId: string) => {
    setMounts((prev) =>
      prev.map((m) => ({
        ...m,
        active: m.id === mountId ? !m.active : false,
      }))
    );
  }, []);

  const handleUnlockMount = useCallback((mountId: string) => {
    const cost = mountId === 'loi_oa' ? 1200 : 3500;
    if (spiritStones < cost) return;

    setSpiritStones((prev) => prev - cost);
    setMounts((prev) =>
      prev.map((m) =>
        m.id === mountId ? { ...m, unlocked: true, active: true } : { ...m, active: false }
      )
    );
  }, [spiritStones]);

  // Claim Quest
  const handleClaimQuest = useCallback((questId: string) => {
    const q = quests.find((item) => item.id === questId);
    if (!q || !q.completed || q.claimed) return;

    setCurrentTuVi((prev) => prev + q.rewardTuVi);
    setSpiritStones((prev) => prev + q.rewardStones);

    if (q.rewardItem) {
      setInventory((prev) => [...prev, q.rewardItem!]);
    }

    setQuests((prev) =>
      prev.map((item) => (item.id === questId ? { ...item, claimed: true } : item))
    );
  }, [quests]);

  // Daily sect pills
  const handleReceiveDailyPills = useCallback(() => {
    if (receivedGuildPillsToday) return;
    setReceivedGuildPillsToday(true);
    setSpiritStones((prev) => prev + 500);
    setRootStones((prev) => prev + 3);
    setInventory((prev) => [
      ...prev,
      {
        id: `tu_khi_dan_guild_${Date.now()}`,
        name: 'Tụ Khí Đan (Tông Môn)',
        type: 'pill',
        rarity: 'linh',
        levelReq: 1,
        description: 'Đan dược do Lý Mộ Uyển luyện chế, tăng 250 Tu Vi.',
        iconName: 'sparkles',
        count: 2,
        price: 60,
        consumableEffect: {
          type: 'gain_tuvi',
          value: 250,
        },
      },
    ]);
  }, [receivedGuildPillsToday]);

  const canBreakthroughNow = canBreakthrough(currentTuVi, currentRealm.index, REALMS);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 1. Title Screen */}
      {gameState === 'title' && (
        <TitleScreen
          onStart={() => setGameState('playing')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 2. Main Game Simulation */}
      {gameState !== 'title' && (
        <>
          <GameCanvas
            currentRealm={currentRealm}
            playerStats={playerStats}
            currentMap={currentMap}
            playerHp={playerHp}
            playerMp={playerMp}
            equippedWeapon={equippedWeapon}
            activeMount={activeMount}
            activeArtifact={activeArtifact}
            skills={skills}
            onTakeDamage={handleTakeDamage}
            onHeal={handleHeal}
            onGainTuViAndStones={handleGainTuViAndStones}
            onLootItem={handleLootItem}
            onMonsterKilled={handleMonsterKilled}
            onCastSkillTrigger={handleCastSkillTrigger}
          />

          <HUD
            currentRealm={currentRealm}
            playerStats={playerStats}
            playerHp={playerHp}
            playerMp={playerMp}
            currentTuVi={currentTuVi}
            spiritStones={spiritStones}
            rootStones={rootStones}
            cucCanhStones={cucCanhStones}
            skills={skills}
            currentMap={currentMap}
            activeMount={activeMount}
            activeArtifact={activeArtifact}
            canBreakthroughNow={canBreakthroughNow}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onSelectMap={(map) => setCurrentMap(map)}
            onSaveGame={() => handleSaveGame(true)}
            saveNotice={saveNotice}
            onOpenModal={(m) => setActiveModal(m)}
          />
        </>
      )}

      {/* 3. Defeat / Game Over Overlay Modal */}
      {gameState === 'gameover' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl border border-red-500/60 bg-slate-950 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-950/80 border border-red-500/80 flex items-center justify-center text-3xl mx-auto shadow-[0_0_25px_rgba(239,68,68,0.5)]">
              💀
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold font-serif text-red-400">
                THÂN THỂ ĐÃ BỊ TỔN HẠI!
              </h2>
              <p className="text-xs text-slate-300">
                Nguyên thần được Thiên Nghịch Châu bảo hộ, tránh khỏi cái chết vĩnh viễn!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-slate-800 text-xs text-slate-400 font-mono">
              <div>Cảnh giới: <span className="text-amber-300">{currentRealm.name}</span></div>
              <div>Bản đồ ngã xuống: <span className="text-sky-300">{currentMap.name}</span></div>
            </div>

            <button
              data-start="true"
              onClick={() => {
                sound.playSuccessFanfare();
                setPlayerHp(playerStats.maxHp);
                setPlayerMp(playerStats.maxMp);
                setGameState('playing');
              }}
              className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 text-white hover:opacity-95 shadow-lg active:scale-95 cursor-pointer"
            >
              HỒI SINH TRÙNG TU (THIÊN NGHỊCH CHÂU)
            </button>
          </div>
        </div>
      )}

      {/* 4. Modals */}
      {activeModal === 'breakthrough' && (
        <BreakthroughModal
          currentRealm={currentRealm}
          currentTuVi={currentTuVi}
          inventory={inventory}
          onClose={() => setActiveModal(null)}
          onBreakthroughSuccess={handleBreakthroughSuccess}
          onBreakthroughFailed={handleBreakthroughFailed}
        />
      )}

      {activeModal === 'inventory' && (
        <InventoryModal
          inventory={inventory}
          equippedWeapon={equippedWeapon}
          equippedArmor={equippedArmor}
          equippedAccessory={equippedAccessory}
          playerStats={playerStats}
          spiritStones={spiritStones}
          onClose={() => setActiveModal(null)}
          onEquipItem={handleEquipItem}
          onUnequipItem={handleUnequipItem}
          onAutoEquipBest={handleAutoEquipBest}
          onInspectCharacter={() => setActiveModal('character_mesh')}
          onUseConsumable={handleUseConsumable}
          onSellItem={handleSellItem}
        />
      )}

      {activeModal === 'character_mesh' && (
        <WangLinMeshModal
          currentRealm={currentRealm}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'skills' && (
        <SkillsModal
          skills={skills}
          currentRealm={currentRealm}
          currentTuVi={currentTuVi}
          spiritStones={spiritStones}
          onClose={() => setActiveModal(null)}
          onUpgradeSkill={handleUpgradeSkill}
        />
      )}

      {activeModal === 'roots' && (
        <RootsModal
          roots={roots}
          rootStones={rootStones}
          cucCanhStones={cucCanhStones}
          onClose={() => setActiveModal(null)}
          onUpgradeRoot={handleUpgradeRoot}
        />
      )}

      {activeModal === 'artifacts' && (
        <ArtifactsModal
          artifacts={artifacts}
          onClose={() => setActiveModal(null)}
          onToggleArtifact={handleToggleArtifact}
          onCondenseDew={handleCondenseDew}
          dewReady={dewReady}
        />
      )}

      {activeModal === 'mounts' && (
        <MountsModal
          mounts={mounts}
          onClose={() => setActiveModal(null)}
          onSelectMount={handleSelectMount}
          onUnlockMount={handleUnlockMount}
          spiritStones={spiritStones}
        />
      )}

      {activeModal === 'quests' && (
        <QuestsModal
          quests={quests}
          onClose={() => setActiveModal(null)}
          onClaimQuest={handleClaimQuest}
        />
      )}

      {activeModal === 'guild' && (
        <GuildModal
          onClose={() => setActiveModal(null)}
          onReceiveDailyPills={handleReceiveDailyPills}
          receivedToday={receivedGuildPillsToday}
        />
      )}

      {activeModal === 'cross_server' && (
        <CrossServerModal
          onClose={() => setActiveModal(null)}
          onEnterAncientGodTrial={() => {
            const ancientMap = MAPS.find((m) => m.id === 'co_than_chi_dia') || MAPS[0];
            setCurrentMap(ancientMap);
          }}
        />
      )}
    </div>
  );
}
