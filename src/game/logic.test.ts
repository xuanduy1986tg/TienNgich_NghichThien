import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculatePlayerStats,
  calculateDamage,
  canBreakthrough,
  canUpgradeRoot,
  clampDeltaTime,
  canUpgradeSkill,
  upgradeSkill,
  getSkillTierTitle,
  findBestEquipment,
} from './logic';
import { RealmInfo, RootData, Item } from './types';

const mockRealm: RealmInfo = {
  id: 'ngung_khi_1',
  index: 0,
  name: 'Ngưng Khí Tầng 1',
  subTitle: 'Nhập Đạo Sơ Kỳ',
  tuViRequired: 100,
  baseHp: 500,
  baseMp: 200,
  baseAtk: 45,
  baseDef: 15,
  baseCritRate: 0.05,
  breakthroughRate: 0.95,
  tribulationName: 'Ngưng Khí Tẩy Tủy',
  badgeColor: '#38bdf8',
};

const mockRoots: Record<string, RootData> = {
  kim: {
    type: 'kim',
    name: 'Kim Linh Căn',
    element: 'Kim',
    level: 2,
    maxLevel: 10,
    costMaterial: 'linh_can_thach',
    costCount: 5,
    statBonusText: '+Công Kích',
    color: '#fbbf24',
  },
  moc: {
    type: 'moc',
    name: 'Mộc Linh Căn',
    element: 'Mộc',
    level: 1,
    maxLevel: 10,
    costMaterial: 'linh_can_thach',
    costCount: 5,
    statBonusText: '+Khí Huyết',
    color: '#34d399',
  },
  thuy: {
    type: 'thuy',
    name: 'Thủy Linh Căn',
    element: 'Thủy',
    level: 0,
    maxLevel: 10,
    costMaterial: 'linh_can_thach',
    costCount: 5,
    statBonusText: '+Chân Khí',
    color: '#60a5fa',
  },
  hoa: {
    type: 'hoa',
    name: 'Hỏa Linh Căn',
    element: 'Hỏa',
    level: 0,
    maxLevel: 10,
    costMaterial: 'linh_can_thach',
    costCount: 5,
    statBonusText: '+Bạo Kích',
    color: '#f87171',
  },
  tho: {
    type: 'tho',
    name: 'Thổ Linh Căn',
    element: 'Thổ',
    level: 0,
    maxLevel: 10,
    costMaterial: 'linh_can_thach',
    costCount: 5,
    statBonusText: '+Phòng Ngự',
    color: '#d97706',
  },
  cuc_canh: {
    type: 'cuc_canh',
    name: 'Cực Cảnh Thần Niệm',
    element: 'Lôi',
    level: 0,
    maxLevel: 10,
    costMaterial: 'cuc_canh_tinh',
    costCount: 2,
    statBonusText: '+Sát Thương & Bạo Kích',
    color: '#ec4899',
  },
};

const mockWeapon: Item = {
  id: 'tram_tien_kiem',
  name: 'Trảm Tiên Cổ Kiếm',
  type: 'weapon',
  rarity: 'bao',
  levelReq: 1,
  description: 'Thanh kiếm chém đứt sinh tử.',
  iconName: 'sword',
  count: 1,
  price: 500,
  stats: {
    atk: 30,
    critRate: 0.1,
  },
};

test('calculatePlayerStats aggregates realm, equipment and spiritual root bonuses', () => {
  const stats = calculatePlayerStats(
    mockRealm,
    [mockWeapon],
    mockRoots,
    null,
    null,
    false
  );

  // baseAtk 45 + weapon 30 + kimLvl(2)*18 = 111
  assert.equal(stats.atk, 111);
  // baseHp 500 + mocLvl(1)*120 = 620
  assert.equal(stats.maxHp, 620);
  // critRate: base 0.05 + weapon 0.10 = 0.15
  assert.equal(stats.critRate, 0.15);
});

test('calculateDamage handles defense and critical multiplier properly', () => {
  const normalResult = calculateDamage(100, 50, 1.0, false);
  assert.ok(normalResult.damage > 0);
  assert.equal(normalResult.isCrit, false);

  const critResult = calculateDamage(100, 50, 1.0, true);
  assert.ok(critResult.damage > normalResult.damage * 1.5);
  assert.equal(critResult.isCrit, true);
});

test('canBreakthrough gates realm advancement correctly', () => {
  const realms: RealmInfo[] = [
    mockRealm,
    { ...mockRealm, id: 'ngung_khi_5', index: 1, tuViRequired: 300 },
  ];

  assert.equal(canBreakthrough(50, 0, realms), false);
  assert.equal(canBreakthrough(100, 0, realms), true);
  assert.equal(canBreakthrough(150, 0, realms), true);
  // Max realm cannot breakthrough further
  assert.equal(canBreakthrough(9999, 1, realms), false);
});

test('canUpgradeRoot checks level and material requirements', () => {
  const root = mockRoots.kim;
  assert.equal(canUpgradeRoot(root, 3), false);
  assert.equal(canUpgradeRoot(root, 5), true);
  assert.equal(canUpgradeRoot(root, 10), true);

  const maxedRoot = { ...root, level: 10 };
  assert.equal(canUpgradeRoot(maxedRoot, 20), false);
});

test('clampDeltaTime limits maximum delta to prevent physics glitches', () => {
  assert.equal(clampDeltaTime(0.016), 0.016);
  assert.equal(clampDeltaTime(0.5, 0.05), 0.05);
  assert.equal(clampDeltaTime(-0.1), 0);
});

test('canUpgradeSkill validates tu vi and spirit stone requirements', () => {
  const mockSkill = {
    id: 'dan_luc_thuat',
    name: 'Dẫn Lực Thuật',
    vietnameseName: 'Dẫn Lực',
    lore: '',
    realmReqIndex: 0,
    level: 1,
    maxLevel: 10,
    upgradeCostTuVi: 120,
    upgradeCostStones: 50,
    cooldown: 2.5,
    currentCooldown: 0,
    mpCost: 20,
    damageMultiplier: 1.8,
    radius: 130,
    effectType: 'gravity',
    color: '#38bdf8',
    keyBind: '1',
    description: '',
  };

  assert.equal(canUpgradeSkill(mockSkill, 100, 50), false);
  assert.equal(canUpgradeSkill(mockSkill, 120, 40), false);
  assert.equal(canUpgradeSkill(mockSkill, 120, 50), true);

  const upgraded = upgradeSkill(mockSkill);
  assert.equal(upgraded.level, 2);
  assert.ok(upgraded.damageMultiplier > mockSkill.damageMultiplier);
  assert.ok(upgraded.cooldown < mockSkill.cooldown);
  assert.ok(upgraded.radius > mockSkill.radius);
  assert.equal(getSkillTierTitle(1), 'Sơ Nhập Tiên Thuật');
  assert.equal(getSkillTierTitle(10), 'Hóa Cảnh Đăng Phong (Cực Hạn)');
});

test('findBestEquipment identifies highest combat score gear from inventory', () => {
  const currentWeapon = mockWeapon; // atk 30, crit 0.1
  const betterWeapon = {
    ...mockWeapon,
    id: 'huyet_kiem',
    name: 'Huyết Lôi Cổ Kiếm',
    stats: { atk: 120, critRate: 0.25 },
  };
  const armor = {
    id: 'bach_y',
    name: 'Bạch Y Đạo Bào',
    type: 'armor' as const,
    rarity: 'linh' as const,
    levelReq: 1,
    description: '',
    iconName: 'shield',
    count: 1,
    price: 300,
    stats: { def: 40, hp: 300 },
  };

  const result = findBestEquipment([betterWeapon, armor], currentWeapon, null, null);
  assert.equal(result.hasUpgrades, true);
  assert.equal(result.bestWeapon?.id, 'huyet_kiem');
  assert.equal(result.bestArmor?.id, 'bach_y');
});
