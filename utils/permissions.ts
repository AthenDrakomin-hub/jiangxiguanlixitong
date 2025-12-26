// utils/permissions.ts
// 权限管理工具函数

import { User, Role, Permission } from '../types.js';

// 定义页面权限映射
export const PAGE_PERMISSIONS: Record<string, string> = {
  // 前台页面权限
  'cashier': 'cashier_access',
  'orders': 'order_view',
  'hotel': 'hotel_order_access',
  'kitchen': 'kitchen_view',
  
  // 后台管理页面权限
  'qrcode': 'qrcode_manage',
  'menu': 'menu_manage',
  'inventory': 'inventory_manage',
  'partner_accounts': 'partner_account_manage',
  'payment': 'payment_manage',
  'permissions': 'user_manage',
  'settings': 'settings_manage',
  'dataviewer': 'data_view',
  'dictionary': 'dictionary_manage',
};

// 检查用户是否有特定权限
export const hasPermission = (user: User | null, permission: string, userRoles: Role[] = [], userPermissions: Permission[] = []): boolean => {
  if (!user) {
    return false;
  }

  // admin用户拥有所有权限
  if (user.role === 'admin') {
    return true;
  }

  // manager用户拥有大部分权限，但不包括用户管理
  if (user.role === 'manager' && permission !== 'user_manage') {
    return true;
  }

  // staff用户权限有限
  if (user.role === 'staff') {
    // 定义staff用户的基本权限
    const staffPermissions = [
      'cashier_access',
      'order_view',
      'hotel_order_access',
      'kitchen_view',
      'menu_view',
      'finance_view',
      'data_view'
    ];
    
    return staffPermissions.includes(permission);
  }

  return false;
};

// 检查用户是否有访问特定页面的权限
export const canAccessPage = (user: User | null, page: string, userRoles: Role[] = [], userPermissions: Permission[] = []): boolean => {
  const requiredPermission = PAGE_PERMISSIONS[page];
  if (!requiredPermission) {
    // 如果没有定义特定权限，则默认允许访问（如dashboard）
    return true;
  }
  
  return hasPermission(user, requiredPermission, userRoles, userPermissions);
};

// 获取用户角色的权限列表
export const getUserPermissions = (user: User | null, roles: Role[], permissions: Permission[]): string[] => {
  if (!user) {
    return [];
  }

  // admin用户拥有所有权限
  if (user.role === 'admin') {
    return permissions.map(p => p.id);
  }

  // manager用户拥有大部分权限
  if (user.role === 'manager') {
    return permissions
      .filter(p => p.id !== 'user_manage') // manager不能管理用户
      .map(p => p.id);
  }

  // staff用户只有基本权限
  if (user.role === 'staff') {
    return [
      'cashier_access',
      'order_view',
      'hotel_order_access',
      'kitchen_view',
      'menu_view',
      'finance_view',
      'data_view'
    ];
  }

  return [];
};