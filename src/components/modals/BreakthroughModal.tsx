import React, { useState } from 'react';
import { X, Zap, Shield, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Item, RealmInfo } from '../../game/types';
import { REALMS } from '../../game/data';
import { sound } from '../../game/audio';
import { processBreakthrough } from '../../game/logic';

interface BreakthroughModalProps {
  currentRealm: RealmInfo;
  currentTuVi: number;
  inventory: Item[];
  onClose: () => void;
  onBreakthroughSuccess: (newRealm: RealmInfo) => void;
  onBreakthroughFailed: (remainingTuVi: number) => void;
}

export const BreakthroughModal: React.FC<BreakthroughModalProps> = ({
  currentRealm,
  currentTuVi,
  inventory,
  onClose,
  onBreakthroughSuccess,
  onBreakthroughFailed,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [tribulationAnim, setTribulationAnim] = useState(false);
  const [usePill, setUsePill] = useState(true);
  const [resultMsg, setResultMsg] = useState<{ text: string; success: boolean } | null>(null);

  const nextRealm = REALMS[currentRealm.index + 1];
  const isMaxRealm = !nextRealm;
  const canAttempt = !isMaxRealm && currentTuVi >= currentRealm.tuViRequired;

  // Check if player has pills to boost rate
  const breakthroughPills = inventory.filter(
    (i) => i.id.includes('dan') || i.name.includes('Đan')
  );
  const pillBonus = usePill && breakthroughPills.length > 0 ? 25 : 0;
  const totalChance = Math.min(100, Math.round((currentRealm.breakthroughRate + pillBonus / 100) * 100));

  const handleBreakthrough = () => {
    if (!canAttempt || isProcessing) return;

    setIsProcessing(true);
    setTribulationAnim(true);
    sound.playTribulationThunder();

    setTimeout(() => {
      const outcome = processBreakthrough(currentRealm, pillBonus);
      setTribulationAnim(false);
      setIsProcessing(false);

      if (outcome.success && nextRealm) {
        sound.playSuccessFanfare();
        setResultMsg({ text: outcome.message, success: true });
        setTimeout(() => {
          onBreakthroughSuccess(nextRealm);
          onClose();
        }, 1200);
      } else {
        setResultMsg({ text: outcome.message, success: false });
        onBreakthroughFailed(Math.round(currentTuVi * outcome.remainingTuViRatio));
      }
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-500/40 bg-slate-950 p-6 shadow-2xl text-white space-y-5 overflow-hidden">
        {/* Tribulation Thunder Animation Overlay */}
        {tribulationAnim && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 animate-pulse">
            <Zap className="w-24 h-24 text-amber-400 animate-bounce" />
            <div className="text-xl font-bold font-serif text-amber-200 mt-3 animate-pulse">
              {currentRealm.tribulationName} ĐANG GIÁNG LÂM!
            </div>
            <div className="text-sm text-slate-400 mt-1">Độ kiếp phá vỡ cảnh giới...</div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-amber-200">
                Tu Vi Cảnh Giới & Đột Phá
              </h2>
              <p className="text-xs text-slate-400">
                Vượt qua thiên kiếp, nghịch thiên cải mệnh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Đóng bảng đột phá"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current vs Next Realm */}
        <div className="grid grid-cols-2 gap-3 items-center">
          {/* Current */}
          <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-center space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Cảnh giới hiện tại
            </div>
            <div
              className="text-base font-bold font-serif"
              style={{ color: currentRealm.badgeColor }}
            >
              {currentRealm.name}
            </div>
            <div className="text-xs text-slate-300">{currentRealm.subTitle}</div>
          </div>

          {/* Next */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 text-center space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-amber-400">
              Cảnh giới kế tiếp
            </div>
            <div
              className="text-base font-bold font-serif"
              style={{ color: nextRealm ? nextRealm.badgeColor : '#94a3b8' }}
            >
              {nextRealm ? nextRealm.name : 'Đỉnh Cao Cổ Thần'}
            </div>
            <div className="text-xs text-amber-200/80">
              {nextRealm ? nextRealm.subTitle : 'Viên Mãn Vô Thượng'}
            </div>
          </div>
        </div>

        {/* Stat Growth Preview */}
        {nextRealm && (
          <div className="p-3 rounded-xl border border-slate-800 bg-slate-900/40 space-y-2 text-xs">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gia tăng thuộc tính sau khi độ kiếp:</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400 font-mono">
              <div className="flex justify-between">
                <span>Khí Huyết (HP):</span>
                <span className="text-emerald-400 font-bold">
                  +{nextRealm.baseHp - currentRealm.baseHp}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Chân Khí (MP):</span>
                <span className="text-sky-400 font-bold">
                  +{nextRealm.baseMp - currentRealm.baseMp}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Công Kích (ATK):</span>
                <span className="text-amber-400 font-bold">
                  +{nextRealm.baseAtk - currentRealm.baseAtk}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Phòng Ngự (DEF):</span>
                <span className="text-cyan-400 font-bold">
                  +{nextRealm.baseDef - currentRealm.baseDef}
                </span>
              </div>
            </div>

            {nextRealm.unlockedSkillId && (
              <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-amber-300 text-xs">
                <CheckCircle2 className="w-4 h-4 text-amber-400" />
                <span>Mở khóa Tiên Thuật mới: <strong>{nextRealm.name}</strong></span>
              </div>
            )}
          </div>
        )}

        {/* Tribulation Info & Pill boost */}
        {nextRealm && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>Thiên Kiếp: <strong className="text-amber-300">{currentRealm.tribulationName}</strong></span>
              <span>Tỉ lệ thành công: <strong className="text-emerald-400">{totalChance}%</strong></span>
            </div>

            {breakthroughPills.length > 0 && (
              <label className="flex items-center gap-2 text-xs text-slate-300 p-2 rounded-lg bg-slate-900 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePill}
                  onChange={(e) => setUsePill(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span>Sử dụng Đan Dược bảo hộ kinh mạch (+25% tỉ lệ độ kiếp)</span>
              </label>
            )}

            {/* Tu Vi Requirement bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>Tu vi tích lũy:</span>
                <span className={currentTuVi >= currentRealm.tuViRequired ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                  {currentTuVi} / {currentRealm.tuViRequired}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                  style={{
                    width: `${Math.min(100, (currentTuVi / currentRealm.tuViRequired) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Result Message */}
        {resultMsg && (
          <div
            className={`p-3 rounded-xl border text-xs text-center font-medium ${
              resultMsg.success
                ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                : 'border-red-500/40 bg-red-950/40 text-red-300'
            }`}
          >
            {resultMsg.text}
          </div>
        )}

        {/* Action Button */}
        <button
          disabled={!canAttempt || isProcessing}
          onClick={handleBreakthrough}
          className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            canAttempt && !isProcessing
              ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black hover:opacity-95 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-98'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <span>{canAttempt ? 'TIẾN HÀNH ĐỘ KIẾP ĐỘT PHÁ' : 'CHƯA ĐỦ TU VI ĐỘT PHÁ'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
