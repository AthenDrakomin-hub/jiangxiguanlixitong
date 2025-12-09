
import React, { useState } from 'react';
import { QrCode, Printer, BedDouble, Utensils, Mic2, Rocket, ExternalLink } from 'lucide-react';
import { HotelRoom, KTVRoom } from '../types';

interface QRCodeManagerProps {
  hotelRooms: HotelRoom[];
  ktvRooms: KTVRoom[];
}

type Tab = 'HOTEL' | 'LOBBY' | 'KTV' | 'TAKEOUT';
type QRStyle = 'simple' | 'brand' | 'black';

const QRCodeManager: React.FC<QRCodeManagerProps> = ({ hotelRooms, ktvRooms }) => {
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
    } catch (e) {
      return '';
    }
  };

  const getCleanLink = (data: string) => {
     try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'customer');
      url.searchParams.set('id', data);
      return url.toString();
     } catch (e) {
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
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full"></span> 二楼客房 / 2nd Floor (Room Service)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 print:grid-cols-4">
                {hotelRooms.filter(r => r.floor === 2).map(room => (
                  <QRCodeCard key={room.id} title={`${room.number}`} subTitle="客房点餐 Room Service" value={room.number} getUrl={getQRUrl} style={qrStyle} />
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full"></span> 三楼客房 / 3rd Floor (Room Service)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 print:grid-cols-4">
                {hotelRooms.filter(r => r.floor === 3).map(room => (
                  <QRCodeCard key={room.id} title={`${room.number}`} subTitle="客房点餐 Room Service" value={room.number} getUrl={getQRUrl} style={qrStyle} />
                ))}
              </div>
            </div>
          </div>
        );
      case 'LOBBY':
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className={`p-10 rounded-2xl shadow-lg text-center max-w-lg w-full print:shadow-none print:border-4 ${qrStyle === 'black' ? 'border-slate-800 bg-white' : 'border-orange-500 bg-orange-50'}`}>
               <h3 className="text-3xl font-bold text-slate-800 mb-2">大厅点餐 Lobby Dining</h3>
               <p className="text-slate-500 mb-8 text-lg">扫码查看菜单下单 / Scan to Order</p>
               <div className="bg-white p-6 rounded-xl inline-block mb-6 shadow-sm border-2 border-dashed border-slate-200">
                  <img src={getQRUrl('LOBBY')} alt="Lobby QR" className="w-64 h-64 mix-blend-multiply" />
               </div>
               <div className="mt-4 text-slate-400 font-mono text-sm">ID: LOBBY</div>
            </div>
          </div>
        );
      case 'KTV':
        return (
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
               <span className="w-2 h-6 bg-purple-600 rounded-full"></span> KTV 包厢 / VIP Room
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ktvRooms.map(room => (
                <QRCodeCard key={room.id} title={room.name} subTitle="点歌/酒水 KTV Service" value={room.id} getUrl={getQRUrl} style={qrStyle} />
              ))}
            </div>
          </div>
        );
      case 'TAKEOUT':
        return (
           <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center max-w-md w-full print:shadow-none print:border-2">
                 <h3 className="text-2xl font-bold text-slate-800 mb-2">外卖专属码 Takeout</h3>
                 <p className="text-slate-500 mb-6">印在宣传单或名片上 / For Flyers & Cards</p>
                 <div className="bg-slate-50 p-6 rounded-xl inline-block mb-6 border-2 border-dashed border-slate-200">
                    <img src={getQRUrl('TAKEOUT')} alt="Takeout QR" className="w-48 h-48 mix-blend-multiply" />
                 </div>
                 <div className="flex items-center justify-center gap-2 text-sm text-blue-600 bg-blue-50 py-2 rounded-lg break-all">
                    <ExternalLink size={16} />
                    <span>{getCleanLink('TAKEOUT')}</span>
                 </div>
              </div>
           </div>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <div>
           <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <QrCode className="text-slate-900" /> 二维码生成中心 (QR Codes)
           </h2>
           <p className="text-slate-500 text-sm mt-1">生成各区域点餐码 / Generate Order Codes</p>
        </div>
        <div className="flex gap-3">
             <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                <button onClick={() => setQrStyle('simple')} className={`px-3 py-1.5 text-xs rounded-md font-bold ${qrStyle === 'simple' ? 'bg-slate-200 text-slate-800' : 'text-slate-500'}`}>Simple</button>
                <button onClick={() => setQrStyle('brand')} className={`px-3 py-1.5 text-xs rounded-md font-bold ${qrStyle === 'brand' ? 'bg-orange-500 text-white' : 'text-slate-500'}`}>Brand</button>
                <button onClick={() => setQrStyle('black')} className={`px-3 py-1.5 text-xs rounded-md font-bold ${qrStyle === 'black' ? 'bg-black text-white' : 'text-slate-500'}`}>Ink-Saver</button>
             </div>
             <button 
               onClick={handlePrint}
               className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-900/20"
             >
               <Printer size={20} />
               <span>批量打印 / Print</span>
             </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 print:hidden">
        <TabButton active={activeTab === 'HOTEL'} onClick={() => setActiveTab('HOTEL')} icon={BedDouble} label="客房 Rooms" />
        <TabButton active={activeTab === 'LOBBY'} onClick={() => setActiveTab('LOBBY')} icon={Utensils} label="大厅 Lobby" />
        <TabButton active={activeTab === 'KTV'} onClick={() => setActiveTab('KTV')} icon={Mic2} label="KTV" />
        <TabButton active={activeTab === 'TAKEOUT'} onClick={() => setActiveTab('TAKEOUT')} icon={Rocket} label="外卖 Takeout" />
      </div>

      <div className="bg-slate-50/50 rounded-xl p-4 md:p-8 min-h-[60vh] border border-slate-200 print:bg-white print:border-none print:p-0">
         {/* Print Instruction */}
         <div className="hidden print:block text-center mb-8">
            <h1 className="text-3xl font-bold">江西饭店 Jiangxi Hotel</h1>
            <p className="text-slate-500">扫码下单 • 极速送达 / Scan to Order</p>
         </div>

         {renderContent()}
      </div>
    </div>
  );
};

// Sub-components
const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
      active 
        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
        : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);

const QRCodeCard = ({ title, subTitle, value, getUrl, style }: any) => {
    const borderColor = style === 'brand' ? 'border-orange-500' : (style === 'black' ? 'border-black' : 'border-slate-200');
    const bgColor = style === 'brand' ? 'bg-orange-50' : 'bg-white';
    const textColor = style === 'brand' ? 'text-orange-900' : 'text-slate-800';

    return (
      <div className={`p-4 rounded-xl border-2 ${borderColor} ${bgColor} shadow-sm flex flex-col items-center text-center print:shadow-none print:break-inside-avoid`}>
        <div className="w-full aspect-square bg-white rounded-lg mb-3 overflow-hidden flex items-center justify-center relative p-2 border border-slate-100">
           <img src={getUrl(value)} alt={title} className="w-full h-full object-contain mix-blend-multiply" />
        </div>
        <div className={`font-bold ${textColor} text-xl`}>{title}</div>
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">{subTitle}</div>
        <div className="text-xs text-slate-400 font-mono mt-1">ID: {value}</div>
      </div>
    );
};

export default QRCodeManager;
