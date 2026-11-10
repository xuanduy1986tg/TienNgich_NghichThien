import React from 'react';
import { X, Sparkles, Zap, ArrowUpCircle } from 'lucide-react';
import { RootData, RootType } from '../../game/types';
import { sound } from '../../game/audio';

interface RootsModalProps {
  roots: Record<RootType, RootData>;
  rootStones: number;
  cucCanhStones: number;
  onClose: () => void;
  onUpgradeRoot: (rootType: RootType) => void;
}

export const RootsModal: React.FC<RootsModalProps> = ({
  roots,
  rootStones,
  cucCanhStones,
  onClose,
  onUpgradeRoot,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl border border-emerald-500/40 bg-slate-950 p-5 md:p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-emerald-200">
                Ngũ Hành Linh Căn & Cực Cảnh Tẩy Tủy
              </h2>
              <p className="text-xs text-slate-400">
                Dùng linh căn thạch tẩy luyện kinh mạch, cường hóa thuộc tính vĩnh viễn
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span>✨</span>
              <span className="text-amber-300 font-bold">{rootStones} Linh Căn Thạch</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
              <span>⚡</span>
              <span className="text-red-400 font-bold">{cucCanhStones} Cực Cảnh Tinh</span>
            </div>

            <button
              onClick={onClose}
              aria-label="Đóng bảng linh căn"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Root List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {(Object.keys(roots) as RootType[]).map((key) => {
            const root = roots[key];
            const isCucCanh = key === 'cuc_canh';
            const availableMats = isCucCanh ? cucCanhStones : rootStones;
            const canUpgrade = root.level < root.maxLevel && availableMats >= root.costCount;

            return (
              <div
                key={key}
                className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                  isCucCanh
                    ? 'border-red-500/50 bg-gradient-to-br from-red-950/40 via-slate-950 to-pink-950/20'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-md"
                      style={{
                        backgroundColor: `${root.color}20`,
                        border: `1.5px solid ${root.color}`,
                        color: root.color,
                      }}
                    >
                      {isCucCanh ? '⚡' : key === 'kim' ? '🪙' : key === 'moc' ? '🌿' : key === 'thuy' ? '💧' : key === 'hoa' ? '🔥' : '⛰️'}
                    </div>

                    <div>
                      <div className="text-sm font-bold font-serif" style={{ color: root.color }}>
                        {root.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{root.element}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      Cấp {root.level} / {root.maxLevel}
                    </span>
                    <div className="text-[10px] text-amber-300/80 font-mono mt-0.5">
                      {root.statBonusText}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full transition-all duration-300"
                    style={{
                      width: `${(root.level / root.maxLevel) * 100}%`,
                      backgroundColor: root.color,
                    }}
                  />
                </div>

                {/* Cost & Upgrade CTA */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-slate-400 font-mono">
                    Cần:{' '}
                    <span className={availableMats >= root.costCount ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                      {root.costCount} {isCucCanh ? 'Cực Cảnh Lôi Tinh' : 'Linh Căn Thạch'}
                    </span>
                  </div>

                  <button
                    disabled={!canUpgrade}
                    onClick={() => {
                      if (isCucCanh) sound.playLightning();
                      else sound.playSuccessFanfare();
                      onUpgradeRoot(key);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      canUpgrade
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-90 active:scale-95 shadow-md'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <ArrowUpCircle className="w-3.5 h-3.5" />
                    <span>{root.level >= root.maxLevel ? 'ĐÃ ĐẠT ĐỈNH' : 'TẨY TỦY'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
