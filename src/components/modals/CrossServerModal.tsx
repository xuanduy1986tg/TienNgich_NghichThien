import React from 'react';
import { X, Swords, Trophy, Sparkles, Shield, Flame, AlertCircle } from 'lucide-react';
import { sound } from '../../game/audio';

interface CrossServerModalProps {
  onClose: () => void;
  onEnterAncientGodTrial: () => void;
}

export const CrossServerModal: React.FC<CrossServerModalProps> = ({
  onClose,
  onEnterAncientGodTrial,
}) => {
  const leaderboard = [
    { rank: 1, name: 'Vương Lâm (Ma Tôn)', realm: 'Cổ Thần Thất Tinh', power: 980000, title: 'Nghịch Thiên Chí Tôn', star: '⭐⭐⭐⭐⭐⭐⭐' },
    { rank: 2, name: 'Cổ Thần Đồ Tư', realm: 'Cổ Thần Bát Tinh', power: 850000, title: 'Hoang Cổ Thần Tộc', star: '⭐⭐⭐⭐⭐⭐' },
    { rank: 3, name: 'Chu Tước Tử', realm: 'Vấn Đỉnh Hậu Kỳ', power: 640000, title: 'Chu Tước Tinh Chủ', star: '⭐⭐⭐⭐⭐' },
    { rank: 4, name: 'Tư Đồ Nam (Đỉnh Phong)', realm: 'Anh Biến Viên Mãn', power: 510000, title: 'Ma Đạo Tà Tôn', star: '⭐⭐⭐⭐' },
    { rank: 5, name: 'Đằng Hóa Nguyên', realm: 'Nguyên Anh Hậu Kỳ', power: 220000, title: 'Triệu Quốc Đằng Gia', star: '⭐⭐⭐' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl border border-red-500/40 bg-slate-950 p-5 md:p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-red-200">
                Vực Ngoại Chiến Trường · Khiêu Chiến Liên Server
              </h2>
              <p className="text-xs text-slate-400">
                Đỉnh cao tỷ thí giữa tu sĩ các đại tinh vực (Chu Tước Tinh, Thiên Vận Tinh, La Thiên)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bảng liên server"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Notice */}
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Giai đoạn thử nghiệm khám phá đơn</strong>: Trước khi kích hoạt đấu trường liên server đa người chơi thời gian thực, đạo hữu có thể rèn luyện bằng cách khiêu chiến Thí Luyện Cổ Thần Chi Địa và ghi danh vào Bảng Phong Thần!
          </div>
        </div>

        {/* Ancient God Solo Trial Challenge Card */}
        <div className="p-4 rounded-xl border border-red-500/50 bg-gradient-to-r from-red-950/40 via-slate-900 to-amber-950/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-serif text-amber-300">
                Thí Luyện Cổ Thần Chi Địa (Bản Đồ Boss Chí Tôn)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/60 border border-red-500/40 text-red-300 font-mono">
                Độ Khó: Vấn Đỉnh
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-xl font-light">
              Dịch chuyển tức thời vào Cổ Thần Tinh Vực để giao chiến trực tiếp với Ý Chí Cổ Thần Đồ Tư, rơi rớt Cổ Thần Tinh Hạch và Cổ Khai Thiên Phủ.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playTribulationThunder();
              onEnterAncientGodTrial();
              onClose();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:opacity-95 text-white shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Flame className="w-4 h-4" />
            <span>KHIÊU CHIẾN NGAY</span>
          </button>
        </div>

        {/* Bảng Phong Thần Leaderboard */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" /> Bảng Phong Thần 9 Đại Tinh Vực
            </span>
            <span className="font-mono text-[11px]">Cập nhật liên server</span>
          </div>

          <div className="space-y-2">
            {leaderboard.map((user) => (
              <div
                key={user.rank}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all ${
                  user.rank === 1
                    ? 'border-amber-500/50 bg-amber-950/20 shadow-md'
                    : 'border-slate-800 bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs ${
                      user.rank === 1
                        ? 'bg-amber-400 text-black'
                        : user.rank === 2
                        ? 'bg-slate-300 text-black'
                        : user.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {user.rank}
                  </div>

                  <div>
                    <div className="font-bold text-slate-200 flex items-center gap-1.5">
                      <span>{user.name}</span>
                      <span className="text-[10px] text-amber-300 font-mono">{user.star}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {user.realm} · {user.title}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-amber-400 font-bold">{user.power.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500">Lực Chiến</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
