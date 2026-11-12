import React, { useState } from 'react';
import { X, Sparkles, Sliders, RefreshCw, Eye, Wind, Activity } from 'lucide-react';
import { WangLinMeshCharacter, WangLinMeshConfig } from '../WangLinMeshCharacter';
import { RealmInfo } from '../../game/types';
import { sound } from '../../game/audio';

interface WangLinMeshModalProps {
  currentRealm: RealmInfo;
  onClose: () => void;
}

const DEFAULT_CONFIG: WangLinMeshConfig = {
  gridRes: 14,
  maskY: 0.35,
  maskRadius: 0.28,
  waveAmp: 15,
  waveSpeed: 1.2,
  waveFreq: 1.0,
  floatHeight: 16,
  breathScale: 0.015,
  tilt: 9,
  particleCount: 80,
  particleColor: '#7dd3fc',
};

export const WangLinMeshModal: React.FC<WangLinMeshModalProps> = ({
  currentRealm,
  onClose,
}) => {
  const [meshConfig, setMeshConfig] = useState<WangLinMeshConfig>(DEFAULT_CONFIG);
  const [activeTab, setActiveTab] = useState<'view' | 'tune'>('view');

  const colorPresets = [
    { name: 'Thiên Thanh (Linh Khí)', color: '#7dd3fc' },
    { name: 'Huyết Lôi (Cực Cảnh)', color: '#ef4444' },
    { name: 'Hoàng Kim (Hoàng Tuyền)', color: '#f59e0b' },
    { name: 'U Minh (Tôn Hồn Phiên)', color: '#c084fc' },
    { name: 'Bạch Ngân (Sinh Tử)', color: '#f8fafc' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl rounded-2xl border border-sky-500/40 bg-slate-950 p-5 md:p-6 shadow-2xl text-white space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-sky-200">
                Thần Thái Động Thái 2D Mesh · Vương Lâm
              </h2>
              <p className="text-xs text-slate-400">
                Mô hình biến dạng lưới 2D (Mesh Deformation) & Thị sai tương tác chuột (Parallax Tilt)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs font-medium">
              <button
                onClick={() => setActiveTab('view')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'view'
                    ? 'bg-sky-500/30 text-sky-200 border border-sky-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" /> Chiêm Ngưỡng
              </button>
              <button
                onClick={() => setActiveTab('tune')}
                className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'tune'
                    ? 'bg-sky-500/30 text-sky-200 border border-sky-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" /> Tinh Chỉnh Mesh
              </button>
            </div>

            <button
              onClick={onClose}
              aria-label="Đóng bảng nhân vật"
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left Canvas Preview | Right Info or Tuning Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 overflow-y-auto pr-1 items-center">
          {/* Left / Center: Interactive 2D Mesh Canvas */}
          <div className="md:col-span-7 flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-sky-950/20 via-slate-950 to-black/80 border border-slate-800 relative">
            <WangLinMeshCharacter
              width={360}
              height={460}
              interactive={true}
              config={meshConfig}
            />

            <div className="mt-2 px-3 py-1 rounded-full bg-slate-900/90 border border-sky-500/30 text-[11px] font-mono text-sky-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
              <span>Di chuyển chuột để xoay chuyển thần niệm & góc nhìn</span>
            </div>
          </div>

          {/* Right Column: Information or Tuning Panel */}
          <div className="md:col-span-5 space-y-3.5">
            {activeTab === 'view' ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-sky-500/30 bg-sky-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold font-serif text-amber-200">
                      Vương Lâm (Thiên Nghịch Tử)
                    </span>
                    <span
                      style={{ color: currentRealm.badgeColor }}
                      className="text-xs px-2 py-0.5 rounded-full border border-current bg-black/60 font-semibold"
                    >
                      {currentRealm.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic font-serif">
                    "Thuận vi phàm, nghịch vi tiên, chỉ tại một niệm giữa sinh và tử!"
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2.5 text-xs">
                  <div className="font-semibold text-sky-300 flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5" /> Đặc tính chuyển động 2D Mesh:
                  </div>
                  <ul className="space-y-1.5 text-slate-400 list-disc list-inside">
                    <li>
                      <strong className="text-slate-200">Bảo tồn ngũ quan:</strong> Mặt và đầu được cố định nguyên bản, không bị méo mó.
                    </li>
                    <li>
                      <strong className="text-slate-200">Sóng tà áo & tóc:</strong> Tà bạch y và mái tóc bạc phấp phới tự nhiên theo hàm sóng điều hòa.
                    </li>
                    <li>
                      <strong className="text-slate-200">Lơ lửng & Nhịp thở:</strong> Thân thể dao động ngự không êm ái cùng lồng ngực thở chân khí.
                    </li>
                    <li>
                      <strong className="text-slate-200">Linh khí bốc lên:</strong> {meshConfig.particleCount} hạt quang điểm linh lực thiên địa bao quanh.
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    sound.playSlash();
                    setActiveTab('tune');
                  }}
                  className="w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-amber-300" />
                  Tùy Chỉnh Biên Độ & Tốc Độ Sóng
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-4 rounded-xl border border-slate-800 bg-slate-900/70 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-sky-300 uppercase">Thông Số 2D Mesh Engine</span>
                  <button
                    onClick={() => {
                      sound.playDrinkPill();
                      setMeshConfig(DEFAULT_CONFIG);
                    }}
                    className="text-[10px] text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Mặc định
                  </button>
                </div>

                {/* Wave Amplitude */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Biên độ sóng áo (waveAmp):</span>
                    <span className="text-amber-300 font-bold">{meshConfig.waveAmp}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="30"
                    step="1"
                    value={meshConfig.waveAmp}
                    onChange={(e) =>
                      setMeshConfig((c) => ({ ...c, waveAmp: Number(e.target.value) }))
                    }
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                {/* Float Height */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Độ cao lơ lửng (floatHeight):</span>
                    <span className="text-cyan-300 font-bold">{meshConfig.floatHeight}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="35"
                    step="1"
                    value={meshConfig.floatHeight}
                    onChange={(e) =>
                      setMeshConfig((c) => ({ ...c, floatHeight: Number(e.target.value) }))
                    }
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                {/* Wave Speed */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Tốc độ bay sóng (waveSpeed):</span>
                    <span className="text-emerald-300 font-bold">{meshConfig.waveSpeed}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.4"
                    max="2.5"
                    step="0.1"
                    value={meshConfig.waveSpeed}
                    onChange={(e) =>
                      setMeshConfig((c) => ({ ...c, waveSpeed: Number(e.target.value) }))
                    }
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>

                {/* Tilt Parallax */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Góc nghiêng chuột (tilt):</span>
                    <span className="text-purple-300 font-bold">{meshConfig.tilt}°</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="18"
                    step="1"
                    value={meshConfig.tilt}
                    onChange={(e) =>
                      setMeshConfig((c) => ({ ...c, tilt: Number(e.target.value) }))
                    }
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                </div>

                {/* Particles count */}
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Số hạt linh khí (particleCount):</span>
                    <span className="text-sky-300 font-bold">{meshConfig.particleCount}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="150"
                    step="5"
                    value={meshConfig.particleCount}
                    onChange={(e) =>
                      setMeshConfig((c) => ({ ...c, particleCount: Number(e.target.value) }))
                    }
                    className="w-full accent-sky-400 cursor-pointer"
                  />
                </div>

                {/* Particle Aura Presets */}
                <div className="space-y-1 pt-1">
                  <div className="text-[11px] text-slate-400">Sắc Màu Chân Khí:</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {colorPresets.map((preset) => (
                      <button
                        key={preset.color}
                        onClick={() => {
                          sound.playDrinkPill();
                          setMeshConfig((c) => ({ ...c, particleColor: preset.color }));
                        }}
                        style={{ borderColor: preset.color }}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-all cursor-pointer ${
                          meshConfig.particleColor === preset.color
                            ? 'bg-white/20 font-bold scale-105'
                            : 'bg-black/40 text-slate-300 opacity-70 hover:opacity-100'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
