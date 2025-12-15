import React, { useState } from 'react';
import {
  QrCode,
  Printer,
  BedDouble,
  Utensils,
  Mic2,
  Rocket,
  ExternalLink,
} from 'lucide-react';
import { HotelRoom, KTVRoom } from '../types';

// 产品备注: 定义TabButton组件的props类型
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  label: string;
}

// 产品备注: 定义QRCodeCard组件的props类型
interface QRCodeCardProps {
  title: string;
  subTitle: string;
  value: string;
  getUrl: (data: string) => string;
  style: 'simple' | 'brand' | 'black';
}

interface QRCodeManagerProps {
  hotelRooms: HotelRoom[];
  ktvRooms: KTVRoom[];
}

type Tab = 'HOTEL' | 'LOBBY' | 'KTV' | 'TAKEOUT';
type QRStyle = 'simple' | 'brand' | 'black';

const QRCodeManager: React.FC<QRCodeManagerProps> = ({
  hotelRooms,
  ktvRooms,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('HOTEL');
  const [qrStyle, setQrStyle] = useState<QRStyle>('brand');

  // Generate QR Code URL with correct query parameters based on current location
  const getQRUrl = (data: string) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'customer');
      url.searchParams.set('id', data);

      const targetUrl = url.toString();
      return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(targetUrl)}&color=${qrStyle === 'black' ? '000000' : 'ea580c'}&bgcolor=ffffff`;
    } catch (error) {
      // 产品备注: 使用更具体的error类型而不是e
      console.error('Error generating QR code URL:', error);
      return '';
    }
  };

  const getCleanLink = (data: string) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'customer');
      url.searchParams.set('id', data);
      return url.toString();
    } catch (error) {
      // 产品备注: 使用更具体的error类型而不是e
      console.error('Error generating clean link:', error);
      return '#';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'HOTEL':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <span className="h-6 w-2 rounded-full bg-orange-500"></span>{' '}
                二楼客房 / 2nd Floor (Room Service)
              </h3>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6 print:grid-cols-4">
                {hotelRooms
                  .filter((r) => r.floor === 2)
                  .map((room) => (
                    <QRCodeCard
                      key={room.id}
                      title={`${room.number}`}
                      subTitle="客房点餐 Room Service"
                      value={room.number}
                      getUrl={getQRUrl}
                      style={qrStyle}
                    />
                  ))}
              </div>
            </div>
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
                <span className="h-6 w-2 rounded-full bg-orange-500"></span>{' '}
                三楼客房 / 3rd Floor (Room Service)
              </h3>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6 print:grid-cols-4">
                {hotelRooms
                  .filter((r) => r.floor === 3)
                  .map((room) => (
                    <QRCodeCard
                      key={room.id}
                      title={`${room.number}`}
                      subTitle="客房点餐 Room Service"
                      value={room.number}
                      getUrl={getQRUrl}
                      style={qrStyle}
                    />
                  ))}
              </div>
            </div>
          </div>
        );
      case 'LOBBY':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div
              className={`w-full max-w-lg rounded-2xl p-10 text-center shadow-lg print:border-4 print:shadow-none ${qrStyle === 'black' ? 'border-slate-800 bg-white' : 'border-orange-500 bg-orange-50'}`}
            >
              <h3 className="mb-2 text-3xl font-bold text-slate-800">
                大厅点餐 Lobby Dining
              </h3>
              <p className="mb-8 text-lg text-slate-500">
                扫码查看菜单下单 / Scan to Order
              </p>
              <div className="mb-6 inline-block rounded-xl border-2 border-dashed border-slate-200 bg-white p-6 shadow-sm">
                <img
                  src={getQRUrl('LOBBY')}
                  alt="Lobby QR"
                  className="h-64 w-64 mix-blend-multiply"
                />
              </div>
              <div className="mt-4 font-mono text-sm text-slate-400">
                ID: LOBBY
              </div>
            </div>
          </div>
        );
      case 'KTV':
        return (
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              <span className="h-6 w-2 rounded-full bg-purple-600"></span> KTV
              包厢 / VIP Room
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {ktvRooms.map((room) => (
                <QRCodeCard
                  key={room.id}
                  title={room.name}
                  subTitle="点歌/酒水 KTV Service"
                  value={room.id}
                  getUrl={getQRUrl}
                  style={qrStyle}
                />
              ))}
            </div>
          </div>
        );
      case 'TAKEOUT':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg print:border-2 print:shadow-none">
              <h3 className="mb-2 text-2xl font-bold text-slate-800">
                外卖专属码 Takeout
              </h3>
              <p className="mb-6 text-slate-500">
                印在宣传单或名片上 / For Flyers & Cards
              </p>
              <div className="mb-6 inline-block rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6">
                <img
                  src={getQRUrl('TAKEOUT')}
                  alt="Takeout QR"
                  className="h-48 w-48 mix-blend-multiply"
                />
              </div>
              <div className="flex items-center justify-center gap-2 break-all rounded-lg bg-blue-50 py-2 text-sm text-blue-600">
                <ExternalLink size={16} />
                <span>{getCleanLink('TAKEOUT')}</span>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="animate-fade-in space-y-6 pb-20">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center print:hidden">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
            <QrCode className="text-slate-900" /> 二维码生成中心 (QR Codes)
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            生成各区域点餐码 / Generate Order Codes
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            <button
              onClick={() => setQrStyle('simple')}
              className={`rounded-md px-3 py-1.5 text-xs font-bold ${qrStyle === 'simple' ? 'bg-slate-200 text-slate-800' : 'text-slate-500'}`}
            >
              Simple
            </button>
            <button
              onClick={() => setQrStyle('brand')}
              className={`rounded-md px-3 py-1.5 text-xs font-bold ${qrStyle === 'brand' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}
            >
              Brand
            </button>
            <button
              onClick={() => setQrStyle('black')}
              className={`rounded-md px-3 py-1.5 text-xs font-bold ${qrStyle === 'black' ? 'bg-black text-white' : 'text-slate-500'}`}
            >
              Ink-Saver
            </button>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800"
          >
            <Printer size={20} />
            <span>批量打印 / Print</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 print:hidden">
        <TabButton
          active={activeTab === 'HOTEL'}
          onClick={() => setActiveTab('HOTEL')}
          icon={BedDouble}
          label="客房 Rooms"
        />
        <TabButton
          active={activeTab === 'LOBBY'}
          onClick={() => setActiveTab('LOBBY')}
          icon={Utensils}
          label="大厅 Lobby"
        />
        <TabButton
          active={activeTab === 'KTV'}
          onClick={() => setActiveTab('KTV')}
          icon={Mic2}
          label="KTV"
        />
        <TabButton
          active={activeTab === 'TAKEOUT'}
          onClick={() => setActiveTab('TAKEOUT')}
          icon={Rocket}
          label="外卖 Takeout"
        />
      </div>

      <div className="min-h-[60vh] rounded-xl border border-slate-200 bg-slate-50/50 p-4 md:p-8 print:border-none print:bg-white print:p-0">
        {/* Print Instruction */}
        <div className="mb-8 hidden text-center print:block">
          <h1 className="text-3xl font-bold">江西酒店 Jiangxi Hotel</h1>
          <p className="text-slate-500">扫码下单 • 极速送达 / Scan to Order</p>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

// Sub-components
// 产品备注: 为TabButton组件添加类型定义，避免使用any类型
const TabButton: React.FC<TabButtonProps> = ({
  active,
  onClick,
  icon: Icon,
  label,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 font-medium transition-all ${
      active
        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
        : 'text-slate-500 hover:bg-white/50 hover:text-slate-700'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

// 产品备注: 为QRCodeCard组件添加类型定义，避免使用any类型
const QRCodeCard: React.FC<QRCodeCardProps> = ({
  title,
  subTitle,
  value,
  getUrl,
  style,
}) => {
  const borderColor =
    style === 'brand'
      ? 'border-orange-500'
      : style === 'black'
        ? 'border-black'
        : 'border-slate-200';
  const bgColor = style === 'brand' ? 'bg-orange-50' : 'bg-white';
  const textColor = style === 'brand' ? 'text-orange-900' : 'text-slate-800';

  return (
    <div
      className={`rounded-xl border-2 p-4 ${borderColor} ${bgColor} flex flex-col items-center text-center shadow-sm print:break-inside-avoid print:shadow-none`}
    >
      <div className="relative mb-3 flex aspect-square w-full items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-white p-2">
        <img
          src={getUrl(value)}
          alt={title}
          className="h-full w-full object-contain mix-blend-multiply"
        />
      </div>
      <div className={`font-bold ${textColor} text-xl`}>{title}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
        {subTitle}
      </div>
      <div className="mt-1 font-mono text-xs text-slate-400">ID: {value}</div>
    </div>
  );
};

export default QRCodeManager;
