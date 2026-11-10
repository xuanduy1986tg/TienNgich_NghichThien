import React, { useState } from 'react';
import { X, Shield, Sword, Sparkles, Gem, ArrowUpCircle } from 'lucide-react';
import { Item, PlayerStats } from '../../game/types';
import { sound } from '../../game/audio';

interface InventoryModalProps {
  inventory: Item[];
  equippedWeapon: Item | null;
  equippedArmor: Item | null;
  equippedAccessory: Item | null;
  playerStats: PlayerStats;
  spiritStones: number;
  onClose: () => void;
  onEquipItem: (item: Item) => void;
  onUnequipItem: (type: 'weapon' | 'armor' | 'accessory') => void;
  onUseConsumable: (item: Item) => void;
  onSellItem: (item: Item, count: number) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  inventory,
  equippedWeapon,
  equippedArmor,
  equippedAccessory,
  playerStats,
  spiritStones,
  onClose,
  onEquipItem,
  onUnequipItem,
  onUseConsumable,
  onSellItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(
    inventory[0] || equippedWeapon || null
  );

  const getRarityBadge = (rarity: Item['rarity']) => {
    switch (rarity) {
      case 'than_khi':
        return { text: 'Thần Khí Chí Tôn', color: '#eab308', border: 'border-yellow-500' };
      case 'co_bao':
        return { text: 'Cổ Bảo Viễn Cổ', color: '#ea580c', border: 'border-orange-500' };
      case 'tien':
        return { text: 'Tiên Khí Hiếm', color: '#a855f7', border: 'border-purple-500' };
      case 'bao':
        return { text: 'Bảo Khí', color: '#3b82f6', border: 'border-blue-500' };
      case 'linh':
        return { text: 'Linh Khí', color: '#10b981', border: 'border-emerald-500' };
      default:
        return { text: 'Phàm Phẩm', color: '#94a3b8', border: 'border-slate-500' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-2xl border border-sky-500/40 bg-slate-950 p-5 md:p-6 shadow-2xl text-white space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Sword className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-sky-200">
                Tu Di Giới · Túi Đồ & Trang Bị
              </h2>
              <p className="text-xs text-slate-400">
                Quản lý bảo vật, linh đan và nguyên liệu tu luyện
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span>💎</span>
              <span className="text-cyan-300 font-bold">{spiritStones.toLocaleString()} Linh Thạch</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Đóng túi đồ"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Equip & Stats | Center Grid | Right Details */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-y-auto pr-1">
          {/* Left Column: Equipment Slots & Attribute totals */}
          <div className="md:col-span-4 space-y-4">
            {/* Character Profile Card */}
            <div className="p-3 rounded-xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 to-slate-900/60 flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border-2 border-amber-400/60 overflow-hidden bg-slate-950 shadow-md shrink-0">
                <img
                  src="/assets/aistudio/images__6__73922a53.jpg"
                  alt="Vương Lâm"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div>
                <div className="text-sm font-bold font-serif text-amber-200">Vương Lâm</div>
                <div className="text-[11px] text-sky-300">Tiên Nghịch Đạo Tôn</div>
                <div className="text-[10px] text-slate-400">Cực Cảnh · Thạch Châu Bản Mệnh</div>
              </div>
            </div>

            {/* Equipment Slots */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
              <div className="text-xs font-semibold text-sky-300 uppercase tracking-wider">
                Trang Bị Bản Mệnh
              </div>

              <div className="grid grid-cols-3 gap-2">
                {/* Weapon */}
                <div
                  onClick={() => equippedWeapon && setSelectedItem(equippedWeapon)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer min-h-[70px] ${
                    equippedWeapon
                      ? 'border-amber-500/60 bg-amber-950/20'
                      : 'border-slate-800 bg-slate-950/50 text-slate-500'
                  }`}
                >
                  <Sword className="w-5 h-5 mb-1 text-amber-400" />
                  <div className="text-[10px] font-bold truncate max-w-full">
                    {equippedWeapon ? equippedWeapon.name : 'Vũ Khí'}
                  </div>
                </div>

                {/* Armor */}
                <div
                  onClick={() => equippedArmor && setSelectedItem(equippedArmor)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer min-h-[70px] ${
                    equippedArmor
                      ? 'border-sky-500/60 bg-sky-950/20'
                      : 'border-slate-800 bg-slate-950/50 text-slate-500'
                  }`}
                >
                  <Shield className="w-5 h-5 mb-1 text-sky-400" />
                  <div className="text-[10px] font-bold truncate max-w-full">
                    {equippedArmor ? equippedArmor.name : 'Đạo Bào'}
                  </div>
                </div>

                {/* Accessory */}
                <div
                  onClick={() => equippedAccessory && setSelectedItem(equippedAccessory)}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer min-h-[70px] ${
                    equippedAccessory
                      ? 'border-purple-500/60 bg-purple-950/20'
                      : 'border-slate-800 bg-slate-950/50 text-slate-500'
                  }`}
                >
                  <Gem className="w-5 h-5 mb-1 text-purple-400" />
                  <div className="text-[10px] font-bold truncate max-w-full">
                    {equippedAccessory ? equippedAccessory.name : 'Pháp Bảo'}
                  </div>
                </div>
              </div>
            </div>

            {/* Total Combat Attributes */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2 text-xs">
              <div className="font-semibold text-slate-300">Tổng Lực Chiến Tu Tiên:</div>
              <div className="space-y-1 font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>Công Kích:</span>
                  <span className="text-amber-400 font-bold">{playerStats.atk}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phòng Ngự:</span>
                  <span className="text-cyan-400 font-bold">{playerStats.def}</span>
                </div>
                <div className="flex justify-between">
                  <span>Khí Huyết Tối Đa:</span>
                  <span className="text-emerald-400 font-bold">{playerStats.maxHp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Chân Khí Tối Đa:</span>
                  <span className="text-sky-400 font-bold">{playerStats.maxMp}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tỉ Lệ Bạo Kích:</span>
                  <span className="text-red-400 font-bold">{Math.round(playerStats.critRate * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Hút Máu:</span>
                  <span className="text-purple-400 font-bold">{Math.round(playerStats.lifesteal * 100)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tốc Độ Di Chuyển:</span>
                  <span className="text-slate-200 font-bold">{playerStats.speed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column: Inventory Grid */}
          <div className="md:col-span-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Kho chứa đồ ({inventory.length} vật phẩm):</span>
              <span className="text-[10px]">Nhấp chọn để thao tác</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-[360px] overflow-y-auto p-1 bg-slate-950/60 rounded-xl border border-slate-800">
              {inventory.map((item) => {
                const r = getRarityBadge(item.rarity);
                const isSelected = selectedItem?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`relative p-2 rounded-xl border flex flex-col items-center justify-between aspect-square cursor-pointer transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/30 scale-105 shadow-md'
                        : `${r.border} bg-slate-900/80 hover:bg-slate-800`
                    }`}
                  >
                    <div className="text-xl">
                      {item.type === 'weapon' && '⚔️'}
                      {item.type === 'armor' && '🥋'}
                      {item.type === 'pill' && '💊'}
                      {item.type === 'material' && '💎'}
                      {item.type === 'accessory' && '💍'}
                      {item.type === 'artifact' && '🔮'}
                    </div>

                    <div className="text-[9px] font-semibold text-center truncate max-w-full text-slate-200">
                      {item.name}
                    </div>

                    {item.count > 1 && (
                      <div className="absolute top-1 right-1 px-1 rounded bg-black/80 text-[9px] font-mono font-bold text-amber-300">
                        x{item.count}
                      </div>
                    )}
                  </div>
                );
              })}

              {inventory.length === 0 && (
                <div className="col-span-5 py-12 text-center text-xs text-slate-500">
                  Túi đồ hiện đang trống. Đi đánh quái để thu thập vật phẩm!
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Selected Item Details & Action Buttons */}
          <div className="md:col-span-3">
            {selectedItem ? (
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3.5 h-full flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div
                        className="text-sm font-bold font-serif"
                        style={{ color: getRarityBadge(selectedItem.rarity).color }}
                      >
                        {selectedItem.name}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {getRarityBadge(selectedItem.rarity).text} · Số lượng: {selectedItem.count}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {selectedItem.description}
                  </p>

                  {/* Stats list */}
                  {selectedItem.stats && (
                    <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-xs font-mono space-y-1">
                      {selectedItem.stats.atk && (
                        <div className="text-amber-400">+ {selectedItem.stats.atk} Công Kích</div>
                      )}
                      {selectedItem.stats.def && (
                        <div className="text-cyan-400">+ {selectedItem.stats.def} Phòng Ngự</div>
                      )}
                      {selectedItem.stats.hp && (
                        <div className="text-emerald-400">+ {selectedItem.stats.hp} Sinh Lực (HP)</div>
                      )}
                      {selectedItem.stats.critRate && (
                        <div className="text-red-400">+ {Math.round(selectedItem.stats.critRate * 100)}% Bạo Kích</div>
                      )}
                    </div>
                  )}

                  {/* Consumable effect */}
                  {selectedItem.consumableEffect && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300">
                      {selectedItem.consumableEffect.type === 'gain_tuvi' && (
                        <div>Tăng ngay <strong>+{selectedItem.consumableEffect.value} Tu Vi</strong>!</div>
                      )}
                      {selectedItem.consumableEffect.type === 'thien_nghich_drop' && (
                        <div>Hồi phục đầy Khí Huyết và tăng 150% lực chiến trong 60s!</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  {/* Equip button */}
                  {['weapon', 'armor', 'accessory'].includes(selectedItem.type) && (
                    <button
                      onClick={() => {
                        sound.playDrinkPill();
                        onEquipItem(selectedItem);
                      }}
                      className="w-full py-2 rounded-lg font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white transition-colors cursor-pointer"
                    >
                      Trang Bị Vào Thân
                    </button>
                  )}

                  {/* Consume pill */}
                  {selectedItem.type === 'pill' && (
                    <button
                      onClick={() => {
                        sound.playDrinkPill();
                        onUseConsumable(selectedItem);
                      }}
                      className="w-full py-2 rounded-lg font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
                    >
                      Sử Dụng Đan Dược
                    </button>
                  )}

                  {/* Sell for Spirit Stones */}
                  <button
                    onClick={() => {
                      sound.playLootChime();
                      onSellItem(selectedItem, 1);
                    }}
                    className="w-full py-1.5 rounded-lg text-[11px] border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  >
                    Bán (+{selectedItem.price} Linh Thạch)
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center text-xs text-slate-500 border border-slate-800/60 rounded-xl">
                Chọn một vật phẩm trong túi đồ để xem chi tiết
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
