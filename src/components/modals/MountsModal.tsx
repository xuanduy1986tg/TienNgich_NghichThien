import React from 'react';
import { X, Flame, Check, Zap, Sparkles } from 'lucide-react';
import { Mount } from '../../game/types';
import { sound } from '../../game/audio';

interface MountsModalProps {
  mounts: Mount[];
  onClose: () => void;
  onSelectMount: (mountId: string) => void;
  onUnlockMount: (mountId: string) => void;
  spiritStones: number;
}

export const MountsModal: React.FC<MountsModalProps> = ({
  mounts,
  onClose,
  onSelectMount,
  onUnlockMount,
  spiritStones,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl border border-pink-500/40 bg-slate-950 p-5 md:p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-pink-200">
                Thú Cưỡi & Linh Thú Bản Mệnh
              </h2>
              <p className="text-xs text-slate-400">
                Cưỡi thần thú tăng tốc độ hành tẩu, hút máu và gia tăng uy lực chiến đấu
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bảng thú cưỡi"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mounts List */}
        <div className="space-y-4">
          {mounts.map((mount) => {
            const unlockCost = mount.id === 'loi_oa' ? 1200 : 3500;
            const canUnlock = spiritStones >= unlockCost;

            return (
              <div
                key={mount.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  mount.active
                    ? 'border-pink-500/60 bg-pink-950/20 shadow-[0_0_20px_rgba(236,72,153,0.15)]'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl border border-pink-500/40 bg-pink-950/40 flex items-center justify-center text-3xl shadow-md shrink-0">
                    {mount.avatarChar}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold font-serif text-pink-200">
                        {mount.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-pink-900/60 border border-pink-400/30 text-pink-300">
                        {mount.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 max-w-xl font-light leading-relaxed">
                      {mount.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs font-mono pt-1 text-slate-400">
                      <span className="text-emerald-400 font-bold">+{mount.speedBonus} Tốc Chạy</span>
                      <span className="text-amber-400 font-bold">+{mount.atkBonus} Công Kích</span>
                      <span className="text-cyan-400 font-bold">+{mount.hpBonus} Sinh Lực</span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                  {mount.unlocked ? (
                    <button
                      onClick={() => {
                        sound.playSuccessFanfare();
                        onSelectMount(mount.id);
                      }}
                      className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        mount.active
                          ? 'bg-pink-600 hover:bg-pink-500 text-white shadow-md'
                          : 'border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {mount.active ? <Check className="w-4 h-4" /> : null}
                      <span>{mount.active ? 'ĐANG CƯỠI' : 'CƯỠI THẦN THÚ'}</span>
                    </button>
                  ) : (
                    <button
                      disabled={!canUnlock}
                      onClick={() => {
                        sound.playSuccessFanfare();
                        onUnlockMount(mount.id);
                      }}
                      className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        canUnlock
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:opacity-95 shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                      <span>Thuần Phục ({unlockCost.toLocaleString()} Linh Thạch)</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
