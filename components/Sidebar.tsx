import React from 'react';
import {
  LayoutDashboard,
  Utensils,
  ClipboardList,
  DollarSign,
  Package,
  Settings,
  Mic2,
  FileSignature,
  BedDouble,
  QrCode,
  ChefHat,
  X,
  CreditCard,
  Shield,
  Database,
} from 'lucide-react';
import { Page } from '../types.js';
import { t } from '../utils/i18n.js';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen: boolean;
  onClose: () => void;
  userRole?: string; // 添加用户角色属性
}

// 定义图标组件的类型
interface IconType {
  size?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onClose,
  userRole = 'staff', // 默认为普通员工角色
}) => {
  interface MenuItem {
    id: Page;
    label: string;
    icon: React.ComponentType<IconType>;
  }

  const MenuButton: React.FC<MenuItem> = ({ id, label, icon: Icon }) => {
    const isActive = currentPage === id;
    return (
      <button
        onClick={() => {
          onNavigate(id);
          onClose(); // 移动端点击后自动关闭
        }}
        className={`mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
          isActive
            ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Icon size={18} />
        <span className="text-sm font-medium tracking-wide">{label}</span>
      </button>
    );
  };

  // Define menu items with translations
  const frontDeskItems: MenuItem[] = [
    { id: 'cashier', label: t('cashier'), icon: DollarSign },
    { id: 'orders', label: t('orders'), icon: ClipboardList },
    { id: 'hotel', label: '客房点餐', icon: BedDouble },
    { id: 'ktv', label: t('ktv'), icon: Mic2 },
    { id: 'kitchen', label: t('kitchen'), icon: ChefHat },
  ];

  // 后台管理菜单项 - 仅对管理员或经理开放
  const backOfficeItems: MenuItem[] = [
    { id: 'qrcode', label: t('qrcode'), icon: QrCode },
    { id: 'menu', label: t('menu'), icon: Utensils },
    { id: 'inventory', label: t('inventory'), icon: Package },
    { id: 'partner_accounts', label: t('signbill'), icon: FileSignature },
    { id: 'payment', label: '支付方式', icon: CreditCard },
    { id: 'permissions', label: '用户管理', icon: Shield },
    { id: 'settings', label: t('settings'), icon: Settings },
    { id: 'dataviewer', label: t('dataviewer'), icon: Database },
    { id: 'dictionary', label: t('dictionary'), icon: Database },
  ];

  // 根据用户角色决定是否显示后台管理菜单
  const shouldShowBackOffice = userRole === 'admin' || userRole === 'manager';

  return (
    <>
      {/* 移动端遮罩层 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`
        fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-slate-900 text-white shadow-xl transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
      <div className="flex items-center justify-between border-b border-slate-700 p-6">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-600 p-2">
            <Utensils size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wider">后端管理</h1>
            <p className="text-xs text-slate-400">Backend System</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white md:hidden"
        >
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        {/* Group 1: Front Desk Operations - Always visible */}
        <div className="mb-6">
          <div className="mb-3 px-4 text-xs font-bold uppercase text-slate-500">
            前台营业 Front Desk
          </div>
          {frontDeskItems.map((item) => (
            <MenuButton key={item.id} {...item} />
          ))}
        </div>

        {/* Group 2: Back Office Management - Only for admin/manager */}
        {shouldShowBackOffice && (
          <div>
            <div className="mb-3 border-t border-slate-800 px-4 pt-4 text-xs font-bold uppercase text-slate-500">
              后台管理 Admin
            </div>
            {backOfficeItems.map((item) => (
              <MenuButton key={item.id} {...item} />
            ))}
          </div>
        )}
      </nav>

      <div className="border-t border-slate-800 p-4 text-xs text-slate-500">
        <p>江西酒店管理系统 v1.0</p>
        <p className="mt-1">© 2025 Jiangxi Hotel</p>
      </div>
    </div>
    </>
  );
};

export default Sidebar;