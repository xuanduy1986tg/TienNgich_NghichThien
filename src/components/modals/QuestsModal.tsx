import React from 'react';
import { X, ScrollText, CheckCircle, Gift } from 'lucide-react';
import { Quest } from '../../game/types';
import { sound } from '../../game/audio';

interface QuestsModalProps {
  quests: Quest[];
  onClose: () => void;
  onClaimQuest: (questId: string) => void;
}

export const QuestsModal: React.FC<QuestsModalProps> = ({
  quests,
  onClose,
  onClaimQuest,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl border border-yellow-500/40 bg-slate-950 p-5 md:p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-yellow-200">
                Cốt Truyện Tiên Nghịch · Truyền Kỳ Vương Lâm
              </h2>
              <p className="text-xs text-slate-400">
                Hoàn thành nhiệm vụ cốt truyện để nhận đan dược, linh thạch và pháp bảo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bảng nhiệm vụ"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quests List */}
        <div className="space-y-3.5">
          {quests.map((q) => {
            const isFinished = q.currentCount >= q.targetCount;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  q.claimed
                    ? 'border-slate-800/60 bg-slate-950/40 opacity-60'
                    : isFinished
                    ? 'border-yellow-500/60 bg-yellow-950/20 shadow-md'
                    : 'border-slate-800 bg-slate-900/50'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-yellow-950 border border-yellow-500/40 text-yellow-400 font-mono">
                      {q.chapter}
                    </span>
                    <span className="text-sm font-bold font-serif text-slate-200">
                      {q.title}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {q.description}
                  </p>

                  {/* Progress bar */}
                  <div className="space-y-1 pt-1 max-w-sm">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>Tiến độ:</span>
                      <span>
                        {Math.min(q.currentCount, q.targetCount)} / {q.targetCount}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-300"
                        style={{
                          width: `${Math.min(100, (q.currentCount / q.targetCount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Rewards summary */}
                  <div className="flex items-center gap-3 text-xs font-mono text-cyan-300 pt-1">
                    <span>+{q.rewardTuVi} Tu Vi</span>
                    <span>+{q.rewardStones} Linh Thạch</span>
                    {q.rewardItem && <span className="text-amber-300">+{q.rewardItem.name}</span>}
                  </div>
                </div>

                {/* Claim CTA */}
                <div>
                  {q.claimed ? (
                    <span className="text-xs text-slate-500 flex items-center gap-1 font-semibold">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Đã Nhận
                    </span>
                  ) : (
                    <button
                      disabled={!isFinished}
                      onClick={() => {
                        sound.playSuccessFanfare();
                        onClaimQuest(q.id);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                        isFinished
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:opacity-95 shadow-lg active:scale-95 animate-pulse'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Gift className="w-4 h-4" />
                      <span>{isFinished ? 'NHẬN THƯỞNG' : 'CHƯA HOÀN THÀNH'}</span>
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
