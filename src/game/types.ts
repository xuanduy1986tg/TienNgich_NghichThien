export type RealmTier = 
  | 'ngung_khi_1' | 'ngung_khi_5' | 'ngung_khi_10' | 'ngung_khi_15'
  | 'truc_co_so' | 'truc_co_vien_man'
  | 'ket_dan_so' | 'ket_dan_vien_man'
  | 'nguyen_anh_so' | 'nguyen_anh_vien_man'
  | 'hoa_than_so' | 'hoa_than_vien_man'
  | 'anh_bien'
  | 'van_dinh'
  | 'co_than_1_tinh' | 'co_than_3_tinh' | 'co_than_7_tinh';

export interface RealmInfo {
  id: RealmTier;
  index: number;
  name: string;
  subTitle: string;
  tuViRequired: number;
  baseHp: number;
  baseMp: number;
  baseAtk: number;
  baseDef: number;
  baseCritRate: number;
  breakthroughRate: number;
  tribulationName: string;
  unlockedSkillId?: string;
  badgeColor: string;
}

export type RootType = 'kim' | 'moc' | 'thuy' | 'hoa' | 'tho' | 'cuc_canh';

export interface RootData {
  type: RootType;
  name: string;
  element: string;
  level: number;
  maxLevel: number;
  costMaterial: string;
  costCount: number;
  statBonusText: string;
  color: string;
}

export type ItemRarity = 'pham' | 'linh' | 'bao' | 'tien' | 'co_bao' | 'than_khi';

export type ItemType = 'weapon' | 'armor' | 'artifact' | 'accessory' | 'pill' | 'material';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  levelReq: number;
  description: string;
  iconName: string;
  count: number;
  price: number;
  stats?: {
    atk?: number;
    def?: number;
    hp?: number;
    mp?: number;
    critRate?: number;
    lifesteal?: number;
    moveSpeed?: number;
  };
  consumableEffect?: {
    type: 'heal_hp' | 'heal_mp' | 'gain_tuvi' | 'breakthrough_buff' | 'thien_nghich_drop';
    value: number;
    duration?: number;
  };
}

export interface Skill {
  id: string;
  name: string;
  vietnameseName: string;
  lore: string;
  realmReqIndex: number;
  level: number;
  maxLevel: number;
  upgradeCostTuVi: number;
  upgradeCostStones: number;
  cooldown: number; // in seconds
  currentCooldown: number;
  mpCost: number;
  damageMultiplier: number;
  radius: number;
  effectType: 'gravity' | 'lightning' | 'finger' | 'domain' | 'soul' | 'wind_rain' | 'mountain';
  color: string;
  keyBind: string;
  description: string;
}

export interface SaveGameData {
  version: number;
  timestamp: number;
  currentRealmId: string;
  currentTuVi: number;
  spiritStones: number;
  rootStones: number;
  cucCanhStones: number;
  playerHp: number;
  playerMp: number;
  inventory: Item[];
  equippedWeapon: Item | null;
  equippedArmor: Item | null;
  equippedAccessory: Item | null;
  roots: Record<RootType, RootData>;
  skills: Skill[];
  mounts: Mount[];
  artifacts: Artifact[];
  quests: Quest[];
  currentMapId: string;
}

export interface Mount {
  id: string;
  name: string;
  title: string;
  description: string;
  speedBonus: number;
  atkBonus: number;
  hpBonus: number;
  unlocked: boolean;
  active: boolean;
  rarity: ItemRarity;
  iconColor: string;
  avatarChar: string;
}

export interface Artifact {
  id: string;
  name: string;
  title: string;
  description: string;
  unlocked: boolean;
  active: boolean;
  level: number;
  bonusAtkPercent: number;
  bonusDefPercent: number;
  specialAura: string;
  avatarChar: string;
}

export interface MonsterDrop {
  itemId: string;
  name: string;
  rarity: ItemRarity;
  type: ItemType;
  chance: number; // 0 to 1
  minCount: number;
  maxCount: number;
}

export interface Monster {
  id: string;
  templateId: string;
  name: string;
  title?: string;
  isBoss: boolean;
  isElite: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  expTuVi: number;
  spiritStones: number;
  behavior: 'chaser' | 'charger' | 'ranged' | 'flanker';
  color: string;
  size: number;
  speed: number;
  telegraphTimer: number; // 0 to >0 during windup
  telegraphDuration: number;
  attackCooldown: number;
  koTimer: number; // 0 normal, > 0 dissolving on death
  hitFlashTimer?: number;
  dropTable: MonsterDrop[];
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  life: number;
  maxLife: number;
  fromPlayer: boolean;
  skillType?: Skill['effectType'];
  pierce?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  text?: string;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  text: string;
  color: string;
  fontSize: number;
  life: number;
  maxLife: number;
}

export interface Quest {
  id: string;
  title: string;
  chapter: string;
  description: string;
  targetType: 'kill' | 'realm' | 'upgrade_root' | 'collect_stones';
  targetCount: number;
  currentCount: number;
  completed: boolean;
  claimed: boolean;
  rewardStones: number;
  rewardTuVi: number;
  rewardItem?: Item;
}

export interface PlayerStats {
  maxHp: number;
  maxMp: number;
  atk: number;
  def: number;
  critRate: number;
  lifesteal: number;
  speed: number;
}
