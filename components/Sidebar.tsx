
import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Menu as MenuIcon, ClipboardList, Settings, LogOut, UtensilsCrossed, CircleDollarSign, Package, Mic2, FileSignature, X, BedDouble, QrCode, ChefHat, Cloud, HardDrive, Car } from 'lucide-react';
import { Page } from '../types';
import { getStorageSettings } from '../services/storage';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean; // Control visibility on mobile
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onClose }) => {
  const [connectionType, setConnectionType] = useState<'local' | 'cloud'>('local');
  
  // Check connection type on mount
  useEffect(() => {
    const settings = getStorageSettings();
    setConnectionType(settings.type === 'local' ? 'local' : 'cloud');
  }, []);

  const handleOpenCustomerH5 = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('page', 'customer');
      window.open(url.toString(), '_blank');
    } catch (e) {
      console.error("URL Generation failed", e);
      window.open('?page=customer', '_blank');
    }
  };

  const MenuButton = ({ id, label, icon: Icon }: any) => {
    const isActive = currentPage === id;
    return (
      <button
        onClick={() => onNavigate(id as Page)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 mb-1 ${
          isActive 
            ? 'bg-red-600 text-white shadow-lg shadow-red-900/20' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon size={18} />
        <span className="font-medium text-sm tracking-wide">{label}</span>
      </button>
    );
  };

  return (
    <div className={`
      h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 shadow-xl z-50 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="p-6 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg">
             <UtensilsCrossed size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider">后端管理</h1>
            <p className="text-xs text-slate-400">Backend System</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="md:hidden p-1 text-slate-400 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        
        {/* Group 1: Front Desk Operations */}
        <div className="mb-6">
          <div className="text-xs font-bold text-slate-500 uppercase px-4 mb-3">前台营业 Front Desk</div>
          <MenuButton id="dashboard" label="仪表盘" icon={LayoutDashboard} />
          <MenuButton id="orders" label="订单中心" icon={ClipboardList} />
          <MenuButton id="hotel" label="客房送餐" icon={BedDouble} />
          <MenuButton id="ktv" label="KTV 包厢" icon={Mic2} />
          <MenuButton id="kitchen" label="后厨显示 KDS" icon={ChefHat} />
        </div>

        {/* Group 2: Back Office Management */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase px-4 mb-3 pt-4 border-t border-slate-800">后台管理 Admin</div>
          <MenuButton id="qrcode" label="二维码 QR (H5)" icon={QrCode} />
          <MenuButton id="menu" label="菜单管理" icon={MenuIcon} />
          <MenuButton id="inventory" label="库存管理" icon={Package} />
          <MenuButton id="signbill" label="签单挂账" icon={FileSignature} />
          <MenuButton id="car" label="用车服务" icon={Car} />
          <MenuButton id="finance" label="财务报表" icon={CircleDollarSign} />
          <MenuButton id="settings" label="系统设置" icon={Settings} />
        </div>

      </nav>

      {/* Connection Status Indicator */}
      <div className="px-4 pb-2">
         <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border ${
            connectionType === 'cloud' ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
         }`}>
            {connectionType === 'cloud' ? <Cloud size={14} /> : <HardDrive size={14} />}
            <span className="flex-1">
               {connectionType === 'cloud' ? 'Data Synced' : 'Local Storage'}
            </span>
            {connectionType === 'cloud' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
         </div>
      </div>

      <div className="p-4 border-t border-slate-700 space-y-2">
        <button 
          onClick={handleOpenCustomerH5}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-emerald-400 hover:bg-slate-800 hover:text-emerald-300 transition-colors border border-dashed border-slate-600"
        >
          <div className="text-xl">📱</div>
          <span className="font-medium text-sm">H5 顾客端 (View)</span>
        </button>
        
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors">
          <LogOut size={18} />
          <span className="font-medium text-sm">退出登录</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
