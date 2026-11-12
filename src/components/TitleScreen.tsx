import React, { useEffect } from 'react';
import { Play, Sparkles, Shield, Compass, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { sound } from '../game/audio';
import { WangLinMeshCharacter } from './WangLinMeshCharacter';

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

      {/* Main Hero Section: Left Story & Actions | Right 2D Mesh Animated Vương Lâm */}
      <div className="my-auto z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-7xl mx-auto w-full">
        {/* Left Column: Title, Lore, Actions */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-400/40 bg-sky-950/60 text-sky-300 text-xs tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>2D MESH ANIMATION · BÁCH BIẾN CỰC CẢNH</span>
            </div>
            <div className="text-xs text-amber-300 font-serif font-bold">
              Vương Lâm · Tiên Nghịch Đạo Tôn
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-serif text-transparent bg-clip-text bg-gradient-to-r from-sky-200 via-amber-100 to-red-400 drop-shadow-[0_4px_25px_rgba(0,0,0,0.9)]">
              TIÊN NGHỊCH
            </h1>
            <p className="text-lg md:text-2xl text-amber-200/90 font-serif italic tracking-wide">
              Đạo tại nhân tâm, thuận vi phàm, nghịch vi tiên!
            </p>
          </div>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-xl font-light">
            Hóa thân thành Vương Lâm, thiếu niên bình phàm bước vào Hằng Nhạc Phái.
            Tình cờ đạt được Thạch Châu Thiên Nghịch, tu luyện sát phạt Cực Cảnh,
            chém phá số mệnh, hiệu lệnh vạn quỷ Tôn Hồn Phiên, xưng bá Tu Ma Hải và Cổ Thần Chi Địa.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 py-1 text-xs">
            <div className="p-3 rounded-xl border border-sky-500/20 bg-slate-950/70 backdrop-blur-sm">
              <div className="font-semibold text-sky-300 flex items-center gap-1.5 mb-1">
                <Shield className="w-3.5 h-3.5" /> 8 Cảnh Giới
              </div>
              <div className="text-[11px] text-slate-400">Ngưng Khí đến Cổ Thần 7 Tinh độ kiếp</div>
            </div>
            <div className="p-3 rounded-xl border border-red-500/20 bg-slate-950/70 backdrop-blur-sm">
              <div className="font-semibold text-red-300 flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" /> 7 Tiên Thuật
              </div>
              <div className="text-[11px] text-slate-400">Dẫn Lực, Hoàng Tuyền, Hô Phong Hoán Vũ</div>
            </div>
            <div className="p-3 rounded-xl border border-purple-500/20 bg-slate-950/70 backdrop-blur-sm col-span-2 sm:col-span-1">
              <div className="font-semibold text-purple-300 flex items-center gap-1.5 mb-1">
                <Compass className="w-3.5 h-3.5" /> Pháp Bảo & Thú
              </div>
              <div className="text-[11px] text-slate-400">Thiên Nghịch Châu, Văn Thú & Tôn Hồn Phiên</div>
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
              className="px-8 py-3.5 md:py-4 rounded-xl font-bold text-base md:text-lg tracking-wider text-black bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-yellow-200 active:scale-95 transition-all shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center justify-center gap-3 cursor-pointer group"
            >
              <Play className="w-5 h-5 fill-black group-hover:scale-110 transition-transform" />
              <span>BƯỚC VÀO CON ĐƯỜNG TU CHÂN</span>
            </button>

            <div className="text-xs text-slate-400 flex items-center gap-2 justify-center">
              <span className="px-2 py-1 rounded border border-slate-700 bg-slate-800 text-slate-200 font-mono">
                Enter / Space
              </span>
              <span>bắt đầu ngay</span>
            </div>
          </div>
        </div>

        {/* Right Column: 2D Mesh Animated Vương Lâm Character Canvas */}
        <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center relative">
          <div className="relative p-3 rounded-3xl border border-sky-500/30 bg-gradient-to-b from-sky-950/30 via-slate-950/70 to-black/80 backdrop-blur-md shadow-[0_0_50px_rgba(56,189,248,0.2)]">
            {/* Mesh Character Canvas */}
            <WangLinMeshCharacter
              width={380}
              height={470}
              interactive={true}
              config={{
                gridRes: 14,
                waveAmp: 16,
                waveSpeed: 1.25,
                waveFreq: 1.0,
                floatHeight: 18,
                breathScale: 0.016,
                tilt: 9,
                particleCount: 85,
                particleColor: '#7dd3fc',
              }}
            />

            {/* Subtitle badge under character */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-950/90 border border-sky-400/40 text-[11px] font-mono text-sky-200 shadow-lg text-center whitespace-nowrap flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Di chuột để tương tác thần thức & thị sai</span>
            </div>
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
