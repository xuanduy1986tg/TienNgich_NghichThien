import React, { useState } from 'react';
import { X, Users, Sparkles, Shield, Gift, BookOpen, Clock } from 'lucide-react';
import { sound } from '../../game/audio';

interface GuildModalProps {
  onClose: () => void;
  onReceiveDailyPills: () => void;
  receivedToday: boolean;
}

export const GuildModal: React.FC<GuildModalProps> = ({
  onClose,
  onReceiveDailyPills,
  receivedToday,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'alchemy' | 'members' | 'roadmap'>('info');
  const [selectedSect, setSelectedSect] = useState<'hang_nhac' | 'van_thien' | 'thi_hon'>('hang_nhac');

  const sects = [
    {
      id: 'hang_nhac',
      name: 'Hằng Nhạc Phái',
      title: 'Chính Đạo Triệu Quốc',
      desc: 'Sơn môn nơi Vương Lâm bắt đầu con đường tu chân. Chuyên tinh Dẫn Lực Thuật và Kiếm Quyết.',
      buff: '+15% Công Kích Phi Kiếm',
      leader: 'Đạo Hư Chân Nhân',
      level: 5,
    },
    {
      id: 'van_thien',
      name: 'Vân Thiên Tông',
      title: 'Đệ Nhất Luyện Đan Tông',
      desc: 'Tông môn đan đạo nổi tiếng Sở Quốc, nơi Lý Mộ Uyển luyện chế đan dược thiên hạ tranh đoạt.',
      buff: '+25% Hiệu Quả Đan Dược & Tu Vi',
      leader: 'Lý Mộ Uyển (Đan Sư)',
      level: 6,
    },
    {
      id: 'thi_hon',
      name: 'Thi Hồn Tông',
      title: 'Ma Đạo Luyện Khôi',
      desc: 'Ma tông thâm độc chuyên luyện hóa thi khôi viễn cổ và tế luyện quỷ hồn.',
      buff: '+20% Kháng Tính & Hút Máu',
      leader: 'Cổ Ma Lão Tổ',
      level: 4,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl rounded-2xl border border-indigo-500/40 bg-slate-950 p-5 md:p-6 shadow-2xl text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-indigo-200">
                Tông Môn Bang Hội · Tu Chân Môn Phái
              </h2>
              <p className="text-xs text-slate-400">
                Gia nhập tông môn tu tiên, nhận bổng lộc đan dược và chuẩn bị cho Bang Chiến
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng bảng tông môn"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Đại Điện Tông Môn
          </button>
          <button
            onClick={() => setActiveTab('alchemy')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'alchemy'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Luyện Đan Các (Nhận Đan)
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'roadmap'
                ? 'bg-indigo-600 text-white'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Lộ Trình Bang Chiến (Sắp Tới)</span>
          </button>
        </div>

        {/* Tab 1: Info / Select Sect */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-300">
              Chọn tông môn mà ngươi muốn kết duyên đệ tử:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {sects.map((s) => {
                const isSelected = selectedSect === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      sound.playSlash();
                      setSelectedSect(s.id as any);
                    }}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-950/40 shadow-lg scale-102'
                        : 'border-slate-800 bg-slate-900/40 hover:bg-slate-900'
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold font-serif text-indigo-200">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-amber-300 font-medium">{s.title}</div>
                      <p className="text-xs text-slate-400 mt-2 font-light leading-relaxed">
                        {s.desc}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-xs">
                      <div className="text-emerald-400 font-mono font-semibold">{s.buff}</div>
                      <div className="text-[10px] text-slate-500 mt-1">Chưởng môn: {s.leader}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Alchemy Room (Bổng lộc đan dược) */}
        {activeTab === 'alchemy' && (
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-950 border border-indigo-400/40 flex items-center justify-center text-3xl mx-auto shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              ⚗️
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-serif text-indigo-200">
                Luyện Đan Các · Bổng Lộc Hàng Ngày
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Nhờ ơn đức của Lý Mộ Uyển và đan sư tông môn, mỗi ngày đệ tử đều được nhận miễn phí đan dược tu vi và linh căn thạch!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-slate-800 max-w-sm mx-auto text-xs font-mono space-y-1 text-slate-300">
              <div className="text-emerald-400 font-bold">+2 Tụ Khí Đan (Tăng Tu Vi)</div>
              <div className="text-amber-400 font-bold">+3 Linh Căn Tinh Thạch</div>
              <div className="text-cyan-400 font-bold">+500 Linh Thạch</div>
            </div>

            <button
              disabled={receivedToday}
              onClick={() => {
                sound.playSuccessFanfare();
                onReceiveDailyPills();
              }}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 mx-auto transition-all cursor-pointer ${
                !receivedToday
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:opacity-95 shadow-lg active:scale-95 animate-pulse'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>{receivedToday ? 'ĐÃ NHẬN HÔM NAY' : 'LĨNH NHẬN BỔNG LỘC'}</span>
            </button>
          </div>
        )}

        {/* Tab 3: Roadmap Bang Chiến */}
        {activeTab === 'roadmap' && (
          <div className="space-y-3 p-4 rounded-xl border border-slate-800 bg-slate-900/40 text-xs">
            <div className="font-bold text-amber-300 flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span>Lộ Trình Tích Hợp Đa Người Chơi (Theo Yêu Cầu):</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-light">
              Dự án đang ưu tiên hoàn thiện trải nghiệm cốt truyện khám phá đơn với cơ chế tu tiên, săn quái rơi đồ, thăng cấp kỹ năng và thú cưỡi. Hệ thống Bang Hội sẽ được mở rộng trong bản cập nhật kế tiếp với:
            </p>
            <ul className="space-y-2 list-disc list-inside text-slate-400 pl-2">
              <li><strong>Tranh Đoạt Mỏ Linh Thạch</strong>: Các Tông Môn khai chiến chiếm giữ linh mạch.</li>
              <li><strong>Tông Môn Hộ Pháp Đại Trận</strong>: Đóng góp linh thạch xây dựng kết giới phòng thủ.</li>
              <li><strong>Khiêu Chiến Thần Thú Tông Môn</strong>: Hợp lực cùng các đạo hữu tiêu diệt Ma Đầu viễn cổ.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
