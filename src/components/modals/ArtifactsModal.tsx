import React from 'react';
import { X, Zap, Shield, Sparkles, Check, Droplets } from 'lucide-react';
import { Artifact } from '../../game/types';
import { sound } from '../../game/audio';

interface ArtifactsModalProps {
  artifacts: Artifact[];
  onClose: () => void;
  onToggleArtifact: (artifactId: string) => void;
  onCondenseDew: () => void;
  dewReady: boolean;
}

export const ArtifactsModal: React.FC<ArtifactsModalProps> = ({
  artifacts,
  onClose,
  onToggleArtifact,
  onCondenseDew,
  dewReady,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl border border-purple-500/40 bg-slate-950 p-5 md:p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-purple-200">
                Chí Bảo Viễn Cổ · Thiên Nghịch & Tôn Hồn Phiên
              </h2>
              <p className="text-xs text-slate-400">
                Các dị bảo nghịch thiên đã cùng Vương Lâm trấn áp chư thiên vạn giới
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bảng pháp bảo"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tư Đồ Nam Dialog Box inside Thiên Nghịch Bead */}
        <div className="p-4 rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-950/40 to-slate-900/60 flex items-start gap-3.5 shadow-lg">
          <div className="w-12 h-12 rounded-xl border border-sky-400 bg-sky-950 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(56,189,248,0.3)] shrink-0">
            🧙‍♂️
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-sky-300 font-serif">
                Tư Đồ Nam (Tàn Hồn Trong Thiên Nghịch Châu):
              </div>
              <button
                disabled={!dewReady}
                onClick={() => {
                  sound.playDrinkPill();
                  onCondenseDew();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  dewReady
                    ? 'bg-gradient-to-r from-cyan-500 to-sky-400 text-black hover:opacity-95 shadow-md animate-pulse'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>{dewReady ? 'Hứng Linh Dịch (+500 Tu Vi)' : 'Đang Ngưng Tụ...'}</span>
              </button>
            </div>
            <p className="text-xs text-slate-300 italic">
              "Tiểu tử Vương Lâm, ngươi tư chất tuy kém, nhưng có Thạch Châu này trong tay, cùng sát tính của ngươi, tương lai nhất định thành đại đạo ma tôn!"
            </p>
          </div>
        </div>

        {/* Artifacts List */}
        <div className="space-y-3.5">
          {artifacts.map((art) => (
            <div
              key={art.id}
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                art.active
                  ? 'border-purple-500/60 bg-purple-950/20 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                  : 'border-slate-800 bg-slate-900/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-xl border border-purple-400/50 bg-purple-950/50 flex items-center justify-center text-2xl shrink-0">
                  {art.avatarChar}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-serif text-purple-200">
                      {art.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 border border-purple-400/30 text-purple-300 font-mono">
                      Cấp {art.level}
                    </span>
                  </div>
                  <div className="text-xs text-amber-300 font-medium">{art.title}</div>
                  <p className="text-xs text-slate-300 max-w-xl font-light">
                    {art.description}
                  </p>
                  <div className="text-xs font-mono text-cyan-300 pt-1">
                    Gia tăng: +{art.bonusAtkPercent}% Công Kích · +{art.bonusDefPercent}% Phòng Ngự
                  </div>
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <button
                  onClick={() => {
                    sound.playSoulWail();
                    onToggleArtifact(art.id);
                  }}
                  className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    art.active
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                      : 'border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {art.active ? <Check className="w-4 h-4" /> : null}
                  <span>{art.active ? 'ĐANG KÍCH HOẠT' : 'KÍCH HOẠT'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
