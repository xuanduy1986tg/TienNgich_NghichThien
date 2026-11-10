import {
  Item,
  MonsterDrop,
  PlayerStats,
  RealmInfo,
  RootData,
  RootType,
  Mount,
  Artifact,
} from './types';

/**
 * Calculates complete player stats aggregated from realm base, equipped items,
 * spiritual roots, mounts, and active artifacts.
 */
export function calculatePlayerStats(
  currentRealm: RealmInfo,
  equippedItems: (Item | null | undefined)[],
  roots: Record<RootType, RootData>,
  activeMount: Mount | null,
  activeArtifact: Artifact | null,
  thienNghichDewActive: boolean = false
): PlayerStats {
  let hp = currentRealm.baseHp;
  let mp = currentRealm.baseMp;
  let atk = currentRealm.baseAtk;
  let def = currentRealm.baseDef;
  let critRate = currentRealm.baseCritRate;
  let lifesteal = 0.05; // 5% default
  let speed = 230; // base movement velocity

  // 1. Equipped items bonuses
  for (const item of equippedItems) {
    if (!item || !item.stats) continue;
    if (item.stats.hp) hp += item.stats.hp;
    if (item.stats.mp) mp += item.stats.mp;
    if (item.stats.atk) atk += item.stats.atk;
    if (item.stats.def) def += item.stats.def;
    if (item.stats.critRate) critRate += item.stats.critRate;
    if (item.stats.lifesteal) lifesteal += item.stats.lifesteal;
    if (item.stats.moveSpeed) speed += item.stats.moveSpeed;
  }

  // 2. Spiritual Roots bonus
  // Kim: +atk, Thuy: +mp, Hoa: +critRate, Tho: +def, Moc: +hp, Cuc Canh: +atk & +crit
  const kimLvl = roots.kim?.level || 0;
  const mocLvl = roots.moc?.level || 0;
  const thuyLvl = roots.thuy?.level || 0;
  const hoaLvl = roots.hoa?.level || 0;
  const thoLvl = roots.tho?.level || 0;
  const cucCanhLvl = roots.cuc_canh?.level || 0;

  atk += kimLvl * 18 + cucCanhLvl * 35;
  hp += mocLvl * 120;
  mp += thuyLvl * 50;
  critRate += hoaLvl * 0.02 + cucCanhLvl * 0.03;
  def += thoLvl * 12;

  // 3. Mount bonus
  if (activeMount && activeMount.active) {
    speed += activeMount.speedBonus;
    atk += activeMount.atkBonus;
    hp += activeMount.hpBonus;
  }

  // 4. Artifact bonus (e.g. Thiên Nghịch Châu, Tôn Hồn Phiên)
  if (activeArtifact && activeArtifact.active) {
    atk = Math.round(atk * (1 + activeArtifact.bonusAtkPercent / 100));
    def = Math.round(def * (1 + activeArtifact.bonusDefPercent / 100));
  }

  // 5. Special buff from Thiên Nghịch Lộ (Dew)
  if (thienNghichDewActive) {
    atk = Math.round(atk * 1.5);
    speed += 50;
  }

  return {
    maxHp: Math.max(100, Math.round(hp)),
    maxMp: Math.max(50, Math.round(mp)),
    atk: Math.max(10, Math.round(atk)),
    def: Math.max(0, Math.round(def)),
    critRate: Math.min(0.85, Math.max(0.05, Number(critRate.toFixed(2)))),
    lifesteal: Math.min(0.6, Math.max(0, Number(lifesteal.toFixed(2)))),
    speed: Math.round(speed),
  };
}

/**
 * Combat damage calculation with armor mitigation, skill power, and critical hit.
 */
export function calculateDamage(
  attackerAtk: number,
  defenderDef: number,
  skillMultiplier: number = 1.0,
  isCrit: boolean = false
): { damage: number; isCrit: boolean } {
  // Classic RPG formula with armor reduction percentage
  const damageReduction = defenderDef / (defenderDef + 300);
  const baseDamage = Math.max(1, attackerAtk * (1 - damageReduction));
  let finalDamage = baseDamage * skillMultiplier;

  if (isCrit) {
    finalDamage *= 1.8; // 180% crit damage
  }

  // Variance ± 6%
  const variance = 0.94 + Math.random() * 0.12;
  const total = Math.max(1, Math.round(finalDamage * variance));

  return {
    damage: total,
    isCrit,
  };
}

/**
 * Checks if player has sufficient Tu Vi to attempt realm breakthrough.
 */
export function canBreakthrough(
  currentTuVi: number,
  currentRealmIndex: number,
  realmList: RealmInfo[]
): boolean {
  if (currentRealmIndex >= realmList.length - 1) {
    return false; // Reached maximum cultivation realm (Cổ Thần Thất Tinh)
  }
  const currentRealm = realmList[currentRealmIndex];
  return currentTuVi >= currentRealm.tuViRequired;
}

/**
 * Simulates breakthrough tribulation. Can succeed or fail with partial tu vi refund.
 */
export function processBreakthrough(
  currentRealm: RealmInfo,
  pillBonusPercent: number = 0
): { success: boolean; message: string; remainingTuViRatio: number } {
  const successChance = Math.min(1.0, currentRealm.breakthroughRate + pillBonusPercent / 100);
  const roll = Math.random();

  if (roll <= successChance) {
    return {
      success: true,
      message: `Độ kiếp thành công! Vượt qua ${currentRealm.tribulationName}, đột phá tầng thứ mới!`,
      remainingTuViRatio: 0,
    };
  } else {
    return {
      success: false,
      message: `Đột phá thất bại! ${currentRealm.tribulationName} chấn thương kinh mạch, tu vi bị hao tổn 20%!`,
      remainingTuViRatio: 0.8,
    };
  }
}

/**
 * Generates drop loot from defeated monsters based on dropTable and luck.
 */
export function generateMonsterDrop(
  dropTable: MonsterDrop[],
  luckModifier: number = 1.0
): { drops: Array<{ item: Item; count: number }>; spiritStonesGain: number } {
  const drops: Array<{ item: Item; count: number }> = [];

  for (const entry of dropTable) {
    const rolledChance = entry.chance * luckModifier;
    if (Math.random() <= rolledChance) {
      const count = Math.floor(
        Math.random() * (entry.maxCount - entry.minCount + 1) + entry.minCount
      );
      if (count > 0) {
        drops.push({
          item: {
            id: entry.itemId,
            name: entry.name,
            type: entry.type,
            rarity: entry.rarity,
            levelReq: 1,
            description: `Nguyên liệu thu thập từ thần thú / ma thú Tiên Nghịch.`,
            iconName: 'sparkles',
            count,
            price: 50,
          },
          count,
        });
      }
    }
  }

  return {
    drops,
    spiritStonesGain: 0,
  };
}

/**
 * Root upgrade check and execution.
 */
export function canUpgradeRoot(
  root: RootData,
  availableMaterials: number
): boolean {
  return root.level < root.maxLevel && availableMaterials >= root.costCount;
}

/**
 * Clamps simulation delta time to avoid entity tunneling on lag.
 */
export function clampDeltaTime(rawDtSeconds: number, maxDt: number = 0.05): number {
  return Math.min(Math.max(0, rawDtSeconds), maxDt);
}
