import React, { useEffect } from 'react';
import { Play, Sparkles, Shield, Compass, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../game/audio';

interface TitleScreenProps {
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  isMuted,
  onToggleMute,
}) => {
  // Key listener: Enter or Space starts game immediately
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 md:p-10 text-white select-none overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(6, 9, 18, 0.92) 0%, rgba(6, 9, 18, 0.75) 45%, rgba(6, 9, 18, 0.35) 100%), url(/src/assets/images/tien_nghich_bg_1793754367079.jpg)`,
      }}
    >
      {/* Top Bar with brand and audio controls */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-sky-400/40 bg-sky-950/80 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            <span className="text-xl">🔮</span>
          </div>
          <div>
            <div className="text-xs font-semibold tracking-widest text-sky-400 uppercase">
              Renegade Immortal RPG
            </div>
            <div className="text-sm text-slate-300 font-serif">
              Google AI Studio Edition
            </div>
          </div>
        </div>

        <button
          onClick={onToggleMute}
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          className="p-2.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-2 text-xs"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span>{isMuted ? 'Âm thanh: Tắt' : 'Âm thanh: Bật'}</span>
        </button>
      </div>

      {/* Main Hero Section: Title & Call to Action */}
      <div className="max-w-2xl my-auto z-10 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl border-2 border-amber-400/80 bg-slate-950 overflow-hidden shadow-[0_0_20px_rgba(245,158,11,0.4)] shrink-0">
            <img
              src="/assets/aistudio/images__6__73922a53.jpg"
              alt="Vương Lâm"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-950/40 text-red-300 text-xs tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>BÁCH BIẾN CỰC CẢNH · NGHỊCH THIÊN TU TIÊN</span>
            </div>
            <div className="text-xs text-amber-300 font-serif font-bold mt-1">
              Đạo Hiệu: Vương Lâm · Tiên Nghịch Đạo Tôn
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-serif text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-amber-100 to-red-400 drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
            TIÊN NGHỊCH
          </h1>
          <p className="text-xl md:text-2xl text-amber-200/90 font-serif italic tracking-wide">
            Đạo tại nhân tâm, thuận vi phàm, nghịch vi tiên!
          </p>
        </div>

        <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl font-light">
          Hóa thân thành Vương Lâm, thiếu niên bình phàm bước vào Hằng Nhạc Phái.
          Tình cờ đạt được Thạch Châu Thiên Nghịch, tu luyện sát phạt Cực Cảnh,
          chém phá số mệnh, hiệu lệnh vạn quỷ Tôn Hồn Phiên, xưng bá Tu Ma Hải và Cổ Thần Chi Địa.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-2 text-xs">
          <div className="p-3 rounded-lg border border-sky-500/20 bg-slate-950/60 backdrop-blur-sm">
            <div className="font-semibold text-sky-300 flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5" /> 8 Đại Cảnh Giới
            </div>
            <div className="text-slate-400">Ngưng Khí đến Cổ Thần 7 Tinh độ kiếp</div>
          </div>
          <div className="p-3 rounded-lg border border-red-500/20 bg-slate-950/60 backdrop-blur-sm">
            <div className="font-semibold text-red-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Cực Cảnh & Tiên Thuật
            </div>
            <div className="text-slate-400">Dẫn Lực, Hoàng Tuyền, Hô Phong Hoán Vũ</div>
          </div>
          <div className="p-3 rounded-lg border border-purple-500/20 bg-slate-950/60 backdrop-blur-sm col-span-2 sm:col-span-1">
            <div className="font-semibold text-purple-300 flex items-center gap-1.5 mb-1">
              <Compass className="w-3.5 h-3.5" /> Thú Cưỡi Văn Thú
            </div>
            <div className="text-slate-400">Thiên Nghịch Châu & Tôn Hồn Phiên</div>
          </div>
        </div>

        {/* Start Game Action */}
        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <button
            data-start="true"
            onClick={() => {
              sound.playSuccessFanfare();
              sound.startAmbientCultivation();
              onStart();
            }}
            className="px-8 py-4 rounded-xl font-bold text-base md:text-lg tracking-wider text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 active:scale-95 transition-all shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3 cursor-pointer group"
          >
            <Play className="w-5 h-5 fill-black group-hover:scale-110 transition-transform" />
            <span>BƯỚC VÀO CON ĐƯỜNG TU CHÂN</span>
          </button>

          <div className="text-xs text-slate-400 flex items-center gap-2 justify-center">
            <span className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-200 font-mono">
              Enter / Space
            </span>
            <span>để bắt đầu ngay</span>
          </div>
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="z-10 border-t border-slate-800/80 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-400" />
          <span>Điều khiển: <strong>WASD / Mũi tên</strong> di chuyển · <strong>1, 2, 3, 4, Space</strong> thi triển Tiên Thuật</span>
        </div>
        <div className="text-slate-500">
          Chế độ khám phá đơn nhân vật · Lộ trình Bang Hội & Liên Server
        </div>
      </div>
    </div>
  );
};
