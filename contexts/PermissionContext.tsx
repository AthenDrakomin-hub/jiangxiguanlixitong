// contexts/PermissionContext.tsx
// 权限上下文管理

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User, Role, Permission } from '../types.js';
import { hasPermission, canAccessPage, getUserPermissions } from '../utils/permissions.js';

interface PermissionContextType {
  currentUser: User | null;
  userRoles: Role[];
  userPermissions: Permission[];
  hasPermission: (permission: string) => boolean;
  canAccessPage: (page: string) => boolean;
  setUser: (user: User | null) => void;
  refreshPermissions: () => void;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

interface PermissionProviderProps {
  children: ReactNode;
  initialUser?: User | null;
  initialRoles?: Role[];
  initialPermissions?: Permission[];
}

export const PermissionProvider: React.FC<PermissionProviderProps> = ({ 
  children, 
  initialUser = null, 
  initialRoles = [],
  initialPermissions = []
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [userRoles, setUserRoles] = useState<Role[]>(initialRoles);
  const [userPermissions, setUserPermissions] = useState<Permission[]>(initialPermissions);

  // 设置当前用户
  const setUser = (user: User | null) => {
    setCurrentUser(user);
  };

  // 检查权限
  const checkPermission = (permission: string): boolean => {
    if (!currentUser) {
      return false;
    }
    return hasPermission(currentUser, permission, userRoles, userPermissions);
  };

  // 检查页面访问权限
  const checkPageAccess = (page: string): boolean => {
    if (!currentUser) {
      return false;
    }
    return canAccessPage(currentUser, page, userRoles, userPermissions);
  };

  // 刷新权限（在用户登录/登出或权限更新时调用）
  const refreshPermissions = () => {
    // 这里可以实现权限刷新逻辑
    // 例如：从API获取最新的用户权限
  };

  const contextValue: PermissionContextType = {
    currentUser,
    userRoles,
    userPermissions,
    hasPermission: checkPermission,
    canAccessPage: checkPageAccess,
    setUser,
    refreshPermissions,
  };

  return (
    <PermissionContext.Provider value={contextValue}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
};