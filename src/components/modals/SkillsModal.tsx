import React, { useState } from 'react';
import { X, Sparkles, Zap, ArrowUpCircle, Flame, Shield, Compass, BookOpen } from 'lucide-react';
import { Skill, RealmInfo } from '../../game/types';
import { canUpgradeSkill, upgradeSkill, getSkillTierTitle } from '../../game/logic';
import { sound } from '../../game/audio';

interface SkillsModalProps {
  skills: Skill[];
  currentRealm: RealmInfo;
  currentTuVi: number;
  spiritStones: number;
  onClose: () => void;
  onUpgradeSkill: (skillId: string) => void;
}

export const SkillsModal: React.FC<SkillsModalProps> = ({
  skills,
  currentRealm,
  currentTuVi,
  spiritStones,
  onClose,
  onUpgradeSkill,
}) => {
  const [selectedSkillId, setSelectedSkillId] = useState<string>(skills[0]?.id || 'dan_luc_thuat');

  const selectedSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];
  const isUnlocked = currentRealm.index >= selectedSkill.realmReqIndex;
  const canUpgrade = isUnlocked && canUpgradeSkill(selectedSkill, currentTuVi, spiritStones);
  const isMaxLevel = selectedSkill.level >= (selectedSkill.maxLevel || 10);

  // Preview next level stats
  const nextMultiplier = Number((selectedSkill.damageMultiplier + 0.35).toFixed(2));
  const nextCooldown = Number(Math.max(1.2, selectedSkill.cooldown - 0.25).toFixed(1));
  const nextRadius = selectedSkill.radius + 15;

  const getSkillIcon = (effectType: Skill['effectType']) => {
    switch (effectType) {
      case 'gravity':
        return '🌀';
      case 'lightning':
        return '⚡';
      case 'finger':
        return '👆';
      case 'soul':
        return '👻';
      case 'domain':
        return '☯️';
      case 'wind_rain':
        return '🐉';
      case 'mountain':
        return '⛰️';
      default:
        return '✨';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-2xl border border-sky-500/40 bg-slate-950 p-5 md:p-6 shadow-2xl text-white space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-sky-200">
                Tiên Thuật Bản Mệnh · Lĩnh Ngộ & Thăng Cấp
              </h2>
              <p className="text-xs text-slate-400">
                Tăng tầng thứ Tiên Thuật để khuếch đại uy lực, giảm thời gian hồi chiêu và mở rộng phạm vi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 text-xs font-mono">
              <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-amber-300">
                ⭐ Tu Vi: <span className="font-bold">{currentTuVi.toLocaleString()}</span>
              </div>
              <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-cyan-300">
                💎 Linh Thạch: <span className="font-bold">{spiritStones.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Đóng bảng tiên thuật"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content: Left Skill List | Right Skill Details & Upgrade Panel */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-y-auto pr-1">
          {/* Left Column: Skill list */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="text-xs font-semibold text-slate-400 flex items-center justify-between">
              <span>Danh Sách 7 Tiên Thuật:</span>
              <span className="text-[10px] text-sky-400">Phím tắt nhanh: [1-4, Space, R, E]</span>
            </div>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {skills.map((skill) => {
                const unlocked = currentRealm.index >= skill.realmReqIndex;
                const isSelected = selectedSkill.id === skill.id;
                const canUp = unlocked && canUpgradeSkill(skill, currentTuVi, spiritStones);

                return (
                  <div
                    key={skill.id}
                    onClick={() => {
                      sound.playSlash();
                      setSelectedSkillId(skill.id);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'border-sky-400 bg-sky-950/40 shadow-lg scale-[1.01]'
                        : unlocked
                        ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-850 hover:border-slate-700'
                        : 'border-slate-900 bg-slate-950/40 opacity-55'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border shadow-inner shrink-0"
                        style={{
                          backgroundColor: `${skill.color}15`,
                          borderColor: `${skill.color}50`,
                        }}
                      >
                        {getSkillIcon(skill.effectType)}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-serif text-slate-100">
                            {skill.name}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/50 border border-slate-700 text-amber-300 font-mono">
                            Cấp {skill.level}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {skill.vietnameseName} · Phím [{skill.keyBind}]
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {canUp && (
                        <span className="animate-pulse text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                          Tăng Cấp
                        </span>
                      )}
                      {!unlocked && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/40">
                          Khóa
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Skill Details & Upgrade Panel */}
          <div className="md:col-span-7 flex flex-col justify-between p-4 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
            <div className="space-y-4">
              {/* Skill Top Header */}
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border shadow-xl shrink-0"
                    style={{
                      backgroundColor: `${selectedSkill.color}22`,
                      borderColor: selectedSkill.color,
                    }}
                  >
                    {getSkillIcon(selectedSkill.effectType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold font-serif text-white">
                        {selectedSkill.name}
                      </h3>
                      <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-mono font-bold">
                        Cấp {selectedSkill.level} / {selectedSkill.maxLevel || 10}
                      </span>
                    </div>
                    <div className="text-xs text-amber-300/90 font-medium mt-0.5">
                      Cảnh Giới Tiên Thuật: {getSkillTierTitle(selectedSkill.level)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 font-mono">
                    Phím Kích Hoạt: <strong className="text-sky-300">[{selectedSkill.keyBind}]</strong>
                  </div>
                </div>
              </div>

              {/* Lore & description */}
              <div className="space-y-2">
                <div className="text-xs italic text-amber-200/80 bg-amber-950/20 p-2.5 rounded-lg border border-amber-900/30">
                  "{selectedSkill.lore}"
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedSkill.description}
                </p>
              </div>

              {/* Progress bar to max level */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>Tiến Độ Lĩnh Ngộ Tiên Thuật:</span>
                  <span>Cấp {selectedSkill.level} / {selectedSkill.maxLevel || 10}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-500 to-amber-400 transition-all duration-300"
                    style={{
                      width: `${(selectedSkill.level / (selectedSkill.maxLevel || 10)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Stats Comparison Card: Current vs Next Level */}
              <div className="p-3.5 rounded-xl border border-slate-800 bg-black/40 space-y-2.5">
                <div className="text-xs font-semibold text-sky-300 flex items-center justify-between">
                  <span>Chỉ Số Uy Lực Tiên Thuật:</span>
                  {!isMaxLevel && isUnlocked && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <ArrowUpCircle className="w-3.5 h-3.5" /> Thăng Cấp Để Gia Tăng
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {/* Damage multiplier */}
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                    <div className="text-slate-400 text-[10px]">Hệ Số Sát Thương:</div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-300 font-bold">
                        {Math.round(selectedSkill.damageMultiplier * 100)}%
                      </span>
                      {!isMaxLevel && (
                        <>
                          <span className="text-slate-500">→</span>
                          <span className="text-emerald-400 font-bold">
                            {Math.round(nextMultiplier * 100)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Cooldown */}
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                    <div className="text-slate-400 text-[10px]">Thời Gian Hồi Chiêu:</div>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-300 font-bold">{selectedSkill.cooldown}s</span>
                      {!isMaxLevel && (
                        <>
                          <span className="text-slate-500">→</span>
                          <span className="text-emerald-400 font-bold">{nextCooldown}s</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Radius */}
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                    <div className="text-slate-400 text-[10px]">Phạm Vi Tác Dụng:</div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-300 font-bold">{selectedSkill.radius}px</span>
                      {!isMaxLevel && (
                        <>
                          <span className="text-slate-500">→</span>
                          <span className="text-emerald-400 font-bold">{nextRadius}px</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mana cost */}
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1">
                    <div className="text-slate-400 text-[10px]">Tiêu Hao Chân Khí:</div>
                    <div className="text-sky-300 font-bold">{selectedSkill.mpCost} MP</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Action Section: Upgrade Button */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              {!isUnlocked ? (
                <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/40 text-center text-xs text-red-300">
                  🔒 Cần đạt cảnh giới cao hơn để mở khóa Tiên Thuật này.
                </div>
              ) : isMaxLevel ? (
                <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-900/40 text-center text-xs text-amber-300 font-semibold">
                  👑 Tiên Thuật đã đạt tầng thứ Đăng Phong Tạo Cực (Cấp Tối Đa)!
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
                    <div>
                      Chi phí: <strong className="text-amber-300">{selectedSkill.upgradeCostTuVi.toLocaleString()} Tu Vi</strong>
                    </div>
                    <div>+</div>
                    <div>
                      <strong className="text-cyan-300">{selectedSkill.upgradeCostStones.toLocaleString()} Linh Thạch</strong>
                    </div>
                  </div>

                  <button
                    disabled={!canUpgrade}
                    onClick={() => {
                      sound.playBreakthroughFanfare();
                      onUpgradeSkill(selectedSkill.id);
                    }}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      canUpgrade
                        ? 'bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white shadow-lg shadow-sky-500/25 scale-[1.02]'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    Thăng Cấp Tiên Thuật
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
