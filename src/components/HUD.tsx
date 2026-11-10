import React from 'react';
import {
  Shield,
  Volume2,
  VolumeX,
  Backpack,
  Sparkles,
  Zap,
  Flame,
  Award,
  Users,
  Swords,
  ScrollText,
  MapPin,
  ChevronDown,
} from 'lucide-react';
import { PlayerStats, RealmInfo, Skill, Mount, Artifact } from '../game/types';
import { MAPS, MapConfig } from '../game/data';

interface HUDProps {
  currentRealm: RealmInfo;
  playerStats: PlayerStats;
  playerHp: number;
  playerMp: number;
  currentTuVi: number;
  spiritStones: number;
  rootStones: number;
  cucCanhStones: number;
  skills: Skill[];
  currentMap: MapConfig;
  activeMount: Mount | null;
  activeArtifact: Artifact | null;
  canBreakthroughNow: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onSelectMap: (map: MapConfig) => void;
  onOpenModal: (
    modalType:
      | 'breakthrough'
      | 'inventory'
      | 'roots'
      | 'artifacts'
      | 'mounts'
      | 'quests'
      | 'guild'
      | 'cross_server'
  ) => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentRealm,
  playerStats,
  playerHp,
  playerMp,
  currentTuVi,
  spiritStones,
  rootStones,
  cucCanhStones,
  skills,
  currentMap,
  activeMount,
  activeArtifact,
  canBreakthroughNow,
  isMuted,
  onToggleMute,
  onSelectMap,
  onOpenModal,
}) => {
  const [mapDropdownOpen, setMapDropdownOpen] = React.useState(false);

  const hpRatio = Math.max(0, Math.min(1, playerHp / playerStats.maxHp));
  const mpRatio = Math.max(0, Math.min(1, playerMp / playerStats.maxMp));
  const tuViRatio = Math.max(0, Math.min(1, currentTuVi / currentRealm.tuViRequired));

  return (
    <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 md:p-5 select-none text-white font-sans">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        {/* Left: Player Profile & Vitals */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-950/85 border border-slate-800 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md max-w-sm sm:max-w-md">
          {/* Avatar frame */}
          <div className="relative">
            <div className="w-14 h-14 rounded-xl border-2 border-amber-400/60 bg-gradient-to-b from-sky-900 to-slate-950 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <img
                src="/assets/aistudio/images__6__73922a53.jpg"
                alt="Vương Lâm"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Active Mount Icon badge */}
            {activeMount && activeMount.active && (
              <div
                title={activeMount.name}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-purple-950 border border-purple-400 flex items-center justify-center text-xs shadow-md"
              >
                {activeMount.avatarChar}
              </div>
            )}
          </div>

          {/* Player stats bars */}
          <div className="flex-1 space-y-1.5 min-w-[170px] sm:min-w-[210px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-200 tracking-wide font-serif">
                Vương Lâm
              </span>
              <span
                style={{ color: currentRealm.badgeColor }}
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-current bg-black/40"
              >
                {currentRealm.name}
              </span>
            </div>

            {/* HP Bar */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span className="text-red-400 font-bold">HP</span>
                <span>
                  {Math.round(playerHp)} / {playerStats.maxHp}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 transition-all duration-150"
                  style={{ width: `${hpRatio * 100}%` }}
                />
              </div>
            </div>

            {/* MP Bar */}
            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px] text-slate-300 font-mono">
                <span className="text-sky-400 font-bold">CHÂN KHÍ</span>
                <span>
                  {Math.round(playerMp)} / {playerStats.maxMp}
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
                <div
                  className="h-full bg-gradient-to-r from-sky-600 to-cyan-400 transition-all duration-150"
                  style={{ width: `${mpRatio * 100}%` }}
                />
              </div>
            </div>

            {/* Tu Vi Bar with Breakthrough button */}
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex-1">
                <div className="flex justify-between text-[9px] text-amber-300/80 font-mono">
                  <span>TU VI</span>
                  <span>
                    {currentTuVi} / {currentRealm.tuViRequired}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden border border-amber-500/30">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-200"
                    style={{ width: `${tuViRatio * 100}%` }}
                  />
                </div>
              </div>

              {canBreakthroughNow && (
                <button
                  onClick={() => onOpenModal('breakthrough')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-500 to-yellow-400 text-black animate-bounce shadow-[0_0_12px_rgba(245,158,11,0.8)] cursor-pointer"
                >
                  ĐỘT PHÁ!
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Center: Current Map Switcher */}
        <div className="pointer-events-auto relative">
          <button
            onClick={() => setMapDropdownOpen(!mapDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-sky-500/30 bg-slate-950/80 hover:bg-slate-900 text-xs backdrop-blur-md shadow-lg transition-colors cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <div className="text-left">
              <div className="font-bold text-sky-200">{currentMap.name}</div>
              <div className="text-[10px] text-slate-400">Đổi bản đồ</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {mapDropdownOpen && (
            <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-64 bg-slate-950 border border-slate-800 rounded-xl p-1.5 shadow-2xl z-40 space-y-1">
              {MAPS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectMap(m);
                    setMapDropdownOpen(false);
                  }}
                  className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    m.id === currentMap.id
                      ? 'bg-sky-950/80 border border-sky-500/40 text-sky-300'
                      : 'hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-[10px] text-slate-400">{m.recommendedRealm}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Currencies & Quick Utility */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Currencies Bar */}
          <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/80 backdrop-blur-md text-xs font-mono">
            <div className="flex items-center gap-1.5" title="Linh Thạch">
              <span className="text-sm">💎</span>
              <span className="text-cyan-300 font-bold">{spiritStones.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Linh Căn Thạch">
              <span className="text-sm">✨</span>
              <span className="text-amber-300 font-bold">{rootStones}</span>
            </div>
            <div className="flex items-center gap-1.5" title="Cực Cảnh Lôi Tinh">
              <span className="text-sm">⚡</span>
              <span className="text-red-400 font-bold">{cucCanhStones}</span>
            </div>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="p-2 rounded-xl border border-slate-800 bg-slate-950/80 hover:bg-slate-900 text-slate-300 backdrop-blur-md cursor-pointer transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Bottom Center: Skill Bar & Controls */}
      <div className="flex flex-col items-center gap-2">
        {/* Tiên Thuật Skill Bar */}
        <div className="pointer-events-auto flex items-center gap-2 p-2 rounded-2xl border border-slate-800/90 bg-slate-950/90 shadow-2xl backdrop-blur-md">
          {skills.slice(0, 5).map((skill) => {
            const isUnlocked = currentRealm.index >= skill.realmReqIndex;
            const cdPercent = skill.currentCooldown / skill.cooldown;

            return (
              <div
                key={skill.id}
                title={`${skill.vietnameseName} [Phím ${skill.keyBind}]: ${skill.description}`}
                className="relative group cursor-pointer"
              >
                <div
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-xl border-2 flex flex-col items-center justify-between p-1 transition-all ${
                    isUnlocked
                      ? 'border-slate-700 bg-slate-900 hover:border-amber-400 hover:scale-105 active:scale-95'
                      : 'border-slate-800/60 bg-slate-950/80 opacity-50 grayscale'
                  }`}
                  style={{
                    borderColor: isUnlocked && skill.currentCooldown <= 0 ? skill.color : undefined,
                  }}
                >
                  {/* Skill icon representation */}
                  <div className="text-base md:text-lg">
                    {skill.effectType === 'gravity' && '🌀'}
                    {skill.effectType === 'lightning' && '⚡'}
                    {skill.effectType === 'finger' && '👆'}
                    {skill.effectType === 'soul' && '👻'}
                    {skill.effectType === 'domain' && '☯️'}
                    {skill.effectType === 'wind_rain' && '🐉'}
                    {skill.effectType === 'mountain' && '🌋'}
                  </div>

                  <span className="text-[9px] md:text-[10px] font-bold truncate max-w-full text-center">
                    {skill.name}
                  </span>

                  {/* Keybind badge */}
                  <div className="absolute -top-1.5 -right-1 px-1.5 py-0.2 rounded bg-black/90 border border-slate-700 text-[9px] font-mono font-bold text-amber-300">
                    {skill.keyBind}
                  </div>

                  {/* Cooldown overlay */}
                  {skill.currentCooldown > 0 && (
                    <div className="absolute inset-0 rounded-xl bg-black/75 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
                      {skill.currentCooldown.toFixed(1)}s
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Dock Buttons */}
        <div className="pointer-events-auto flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={() => onOpenModal('breakthrough')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 text-xs font-semibold backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>[C] Đột Phá</span>
          </button>

          <button
            onClick={() => onOpenModal('inventory')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-sky-500/40 bg-sky-950/60 hover:bg-sky-900/80 text-sky-200 text-xs font-semibold backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Backpack className="w-3.5 h-3.5 text-sky-400" />
            <span>[B] Túi Đồ</span>
          </button>

          <button
            onClick={() => onOpenModal('roots')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 text-xs font-semibold backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>[L] Linh Căn</span>
          </button>

          <button
            onClick={() => onOpenModal('artifacts')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 text-xs font-semibold backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>[P] Pháp Bảo</span>
          </button>

          <button
            onClick={() => onOpenModal('mounts')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-pink-500/40 bg-pink-950/60 hover:bg-pink-900/80 text-pink-200 text-xs font-semibold backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 text-pink-400" />
            <span>[T] Thú Cưỡi</span>
          </button>

          <button
            onClick={() => onOpenModal('quests')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-yellow-500/40 bg-yellow-950/60 hover:bg-yellow-900/80 text-yellow-200 text-xs font-semibold backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <ScrollText className="w-3.5 h-3.5 text-yellow-400" />
            <span>[Q] Nhiệm Vụ</span>
          </button>

          <button
            onClick={() => onOpenModal('guild')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/40 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 text-xs font-semibold backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tông Môn</span>
          </button>

          <button
            onClick={() => onOpenModal('cross_server')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/40 bg-red-950/60 hover:bg-red-900/80 text-red-200 text-xs font-semibold backdrop-blur-md shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Swords className="w-3.5 h-3.5 text-red-400" />
            <span>Vực Ngoại (Liên Server)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
