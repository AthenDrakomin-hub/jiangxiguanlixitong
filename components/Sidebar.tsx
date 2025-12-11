import React from 'react';
import { LayoutDashboard, Utensils, ClipboardList, DollarSign, Package, Settings, Mic2, FileSignature, BedDouble, QrCode, ChefHat, X, CreditCard, Bug, Shield } from 'lucide-react';
import { Page } from '../types';
import { t } from '../utils/i18n';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onClose }) => {
  interface MenuItem {
    id: Page;
    label: string;
    icon: React.ComponentType<any>;
  }

  const MenuButton: React.FC<MenuItem> = ({ id, label, icon: Icon }) => {
    const isActive = currentPage === id;
    return (
      <button
        onClick={() => onNavigate(id)}
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

  // Define menu items with translations
  const frontDeskItems: MenuItem[] = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'orders', label: t('orders'), icon: ClipboardList },
    { id: 'hotel', label: t('hotel'), icon: BedDouble },
    { id: 'ktv', label: t('ktv'), icon: Mic2 },
    { id: 'kitchen', label: t('kitchen'), icon: ChefHat },
  ];

  const backOfficeItems: MenuItem[] = [
    { id: 'qrcode', label: t('qrcode'), icon: QrCode },
    { id: 'menu', label: t('menu'), icon: Utensils },
    { id: 'inventory', label: t('inventory'), icon: Package },
    { id: 'signbill', label: t('signbill'), icon: FileSignature },
    { id: 'finance', label: t('finance'), icon: DollarSign },
    { id: 'payment', label: '支付方式', icon: CreditCard },
    { id: 'permissions', label: '权限管理', icon: Shield },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  // 添加测试工具菜单项（仅在开发环境中显示）
  const testItems: MenuItem[] = [
    { id: 'autodetect' as Page, label: '自动检测测试', icon: Bug },
  ];

  const isDevelopment = () => {
    if (typeof window !== 'undefined') {
      return window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1' ||
             window.location.port !== '';
    }
    return false;
  };

  return (
    <div className={`
      h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 shadow-xl z-50 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      <div className="p-6 flex items-center justify-between border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 rounded-lg">
             <Utensils size={24} className="text-white" />
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
          {frontDeskItems.map(item => (
            <MenuButton key={item.id} {...item} />
          ))}
        </div>

        {/* Group 2: Back Office Management */}
        <div>
          <div className="text-xs font-bold text-slate-500 uppercase px-4 mb-3 pt-4 border-t border-slate-800">后台管理 Admin</div>
          {backOfficeItems.map(item => (
            <MenuButton key={item.id} {...item} />
          ))}
        </div>

        {/* Test Tools Section - Only shown in development */}
        {isDevelopment() && (
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase px-4 mb-3 pt-4 border-t border-slate-800">测试工具</div>
            {testItems.map(item => (
              <MenuButton key={item.id} {...item} />
            ))}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p>江西酒店管理系统 v1.0</p>
        <p className="mt-1">© 2025 Jiangxi Hotel</p>
      </div>
    </div>
  );
};

export default Sidebar;